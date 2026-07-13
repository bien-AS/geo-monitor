"use client";

import * as React from "react";
import Link from "next/link";
import { Download, GitCompareArrows, Layers, MapPin, Crosshair } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { surfaceById } from "@/lib/surfaces";
import { fmtDateShort, fmtPct, rankBand, RANK_BAND_COLOR, RANK_BAND_LABEL } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { GeoGridMapLazy } from "@/components/maps/geo-grid-map-lazy";
import { SourceBadge } from "@/components/local/source-badge";
import { StatusPill } from "@/components/local/status-pill";
import { SurfaceListRows } from "./surface-row";
import { TrendSpark } from "./trend-spark";
import { KeywordChipRow } from "./keyword-chip-row";
import { PinDetailDrawer, PinDetailPanel, type PinSelection } from "./pin-detail-drawer";
import {
  bearingLabel,
  cellLabels,
  composePaaQuestions,
  computeDeltas,
  DELTA_COLOR,
  diffMapFeed,
  distanceMiles,
  fieldMapPins,
  fieldStats,
  GRID_SIZES,
  gridSizeMeta,
  hasDerivedRanks,
  isSquareGrid,
  isYouCompetitor,
  outlineForPins,
  RANK_FIELD_LABEL,
  RANK_FIELDS,
  nonBaptistRivals,
  windowSnapshot,
  type GeoLocationSlim,
  type GridSize,
  type KeywordGrid,
  type LocalAISummary,
  type RankField,
  type ScanCostPreview,
  type SnapshotData,
  type SnapshotPin,
} from "./helpers";

type ViewMode = "latest" | "diff";

const INLINE_DRAWER_QUERY = "(min-width: 1480px)";

/* ------------------------------------------------------------------ */
/* Filmstrip mini-pin-grid thumbnail                                    */
/* ------------------------------------------------------------------ */

function MiniGridThumb({
  pins,
  center,
}: {
  pins: SnapshotPin[];
  center: { lat: number; lng: number };
}) {
  const w = 160;
  const h = 96;
  const pad = 10;
  const lats = pins.map((p) => p.lat);
  const lngs = pins.map((p) => p.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const px = (lng: number) => pad + ((lng - minLng) / (maxLng - minLng || 1)) * (w - 2 * pad);
  const py = (lat: number) => pad + ((maxLat - lat) / (maxLat - minLat || 1)) * (h - 2 * pad);
  let centerIdx = 0;
  let best = Infinity;
  pins.forEach((p, i) => {
    const d = (p.lat - center.lat) ** 2 + (p.lng - center.lng) ** 2;
    if (d < best) {
      best = d;
      centerIdx = i;
    }
  });

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="block h-[96px] w-full rounded-md"
      role="img"
      aria-label="Cycle pin-grid thumbnail"
    >
      <rect
        width={w}
        height={h}
        rx="6"
        fill="var(--color-neutral-100)"
        className="dark:opacity-20"
      />
      <path
        d={`M0 ${h * 0.62} H${w}`}
        stroke="var(--color-neutral-300)"
        strokeWidth="2"
        opacity="0.5"
      />
      <path
        d={`M${w * 0.3} 0 L${w * 0.55} ${h}`}
        stroke="var(--color-neutral-300)"
        strokeWidth="1.4"
        opacity="0.4"
      />
      {pins.map((p, i) => (
        <circle
          key={i}
          cx={px(p.lng)}
          cy={py(p.lat)}
          r={i === centerIdx ? 4.4 : 3.4}
          fill={RANK_BAND_COLOR[rankBand(p.rank)]}
          stroke={i === centerIdx ? "#ffffff" : "none"}
          strokeWidth={i === centerIdx ? 1.6 : 0}
        />
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Score delta pill                                                     */
/* ------------------------------------------------------------------ */

function ScoreDeltaPill({ delta }: { delta: number | null }) {
  if (delta == null) {
    return <p className="text-muted-foreground text-[12px]">Second scan cycle pending.</p>;
  }
  const improved = delta < -0.05;
  const declined = delta > 0.05;
  const cls = improved
    ? "bg-green-50 text-green-700 dark:bg-green-700/25 dark:text-green-100"
    : declined
      ? "bg-red-50 text-red-700 dark:bg-red-700/25 dark:text-red-100"
      : "bg-secondary text-muted-foreground";
  return (
    <div>
      <span
        className={cn(
          "num inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11.5px] font-bold",
          cls,
        )}
      >
        <span
          aria-hidden
          className="text-[10px]"
        >
          {improved ? "▲" : declined ? "▼" : "="}
        </span>
        {Math.abs(delta).toFixed(1)}
        <span className="font-sans font-medium">
          {improved ? "better" : declined ? "worse" : "flat"}
        </span>
      </span>
      <p className="text-muted-foreground mt-0.5 text-[10px]">vs prior scan</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Dominance card                                                       */
/* ------------------------------------------------------------------ */

function DominanceCard({
  snapshot,
  location,
  windowed,
}: {
  snapshot: SnapshotData;
  location: GeoLocationSlim;
  windowed: boolean;
}) {
  const rivals = nonBaptistRivals(snapshot, location).slice(0, 3);
  return (
    <Card className="gap-3 p-4">
      <p className="text-foreground text-[14px] font-bold">Dominance</p>
      <p className="text-muted-foreground text-[11.5px]">
        Top competitors by avg position
        {windowed && " (5×5 window)"}
      </p>
      {rivals.length > 0 ? (
        <ul className="flex flex-col">
          {rivals.map((c, i) => (
            <li
              key={c.title}
              className="border-border flex items-center gap-2.5 border-b py-2 last:border-b-0"
            >
              <span className="num text-muted-foreground w-5 shrink-0 text-[11px] font-bold">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-foreground min-w-0 flex-1 truncate text-[12px] font-medium">
                {c.title}
              </span>
              <span
                className="num flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                style={{ background: RANK_BAND_COLOR[rankBand(Math.round(c.avg_position))] }}
              >
                {Math.round(c.avg_position)}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground text-[12px]">No rival aggregates.</p>
      )}
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Main screen                                                          */
/* ------------------------------------------------------------------ */

export function GeoGridScreen({
  location,
  grids: fixtureGrids,
  preview,
  localAI,
  locations,
  trackedKeywords = [],
}: {
  location: GeoLocationSlim;
  grids: KeywordGrid[];
  preview: ScanCostPreview | null;
  localAI: LocalAISummary | null;
  locations: Array<{ slug: string; name: string; city: string }>;
  trackedKeywords?: Array<{ keyword: string; status: "scanned" | "not_scanned" }>;
}) {
  const grids = fixtureGrids;
  const [keywordIdx, setKeywordIdx] = React.useState(0);
  const [snapshotIdx, setSnapshotIdx] = React.useState<number | null>(null);
  const [rankField, setRankField] = React.useState<RankField>("rank");
  const [gridSize, setGridSize] = React.useState<GridSize>("10x10");
  const [viewMode, setViewMode] = React.useState<ViewMode>("latest");
  const [selection, setSelection] = React.useState<PinSelection | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [inlineDrawer, setInlineDrawer] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia(INLINE_DRAWER_QUERY);
    const sync = () => setInlineDrawer(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const grid = grids[Math.min(keywordIdx, Math.max(0, grids.length - 1))];
  const squareGrid = grid ? isSquareGrid(grid) : false;
  const sizeMeta = gridSizeMeta(gridSize);
  const windowed = squareGrid && gridSize === "5x5";
  const snapshots = React.useMemo(() => {
    const stored = grid?.snapshots ?? [];
    return windowed ? stored.map(windowSnapshot) : stored;
  }, [grid, windowed]);
  const activeSnapIdx =
    snapshotIdx == null ? snapshots.length - 1 : Math.min(snapshotIdx, snapshots.length - 1);
  const snapshot: SnapshotData | undefined = snapshots[activeSnapIdx];
  const prevSnapshot = activeSnapIdx > 0 ? snapshots[activeSnapIdx - 1] : null;
  const hasTwoCycles = snapshots.length >= 2;
  const derived = snapshot ? hasDerivedRanks(snapshot) : false;

  const labels = React.useMemo(() => (snapshot ? cellLabels(snapshot.pins) : []), [snapshot]);
  const paas = React.useMemo(
    () => (grid ? composePaaQuestions(grid.keyword, location) : []),
    [grid, location],
  );

  const stats = React.useMemo(
    () => (snapshot ? fieldStats(snapshot, rankField) : null),
    [snapshot, rankField],
  );
  const prevStats = React.useMemo(
    () => (prevSnapshot ? fieldStats(prevSnapshot, rankField) : null),
    [prevSnapshot, rankField],
  );

  const diff = React.useMemo(() => {
    if (!hasTwoCycles || !snapshot || !prevSnapshot) return null;
    const deltas = computeDeltas(prevSnapshot, snapshot, rankField);
    return { deltas, feed: diffMapFeed(deltas, snapshot.pins) };
  }, [hasTwoCycles, snapshot, prevSnapshot, rankField]);

  const effectiveMode: ViewMode = viewMode === "diff" && diff ? "diff" : "latest";

  const trendPoints = React.useMemo(
    () =>
      snapshots
        .map((s) => ({ date: s.date, value: fieldStats(s, rankField).avg }))
        .filter((p): p is { date: string; value: number } => p.value != null),
    [snapshots, rankField],
  );

  if (!grid || !snapshot || !stats) {
    return (
      <div className="flex flex-col gap-6">
        <Card className="items-center gap-3 p-12 text-center">
          <h3 className="text-base font-semibold">No geo-grid scans yet</h3>
          <p className="text-muted-foreground max-w-sm text-[13px]">
            Run the first grid scan for {location.shortName} to see local-pack rank across the
            catchment.
          </p>
        </Card>
      </div>
    );
  }

  const latest = snapshots[snapshots.length - 1];
  const nextCycle = new Date(new Date(latest.date).getTime() + 7 * 86_400_000).toISOString();
  const avgDelta =
    stats.avg != null && prevStats?.avg != null
      ? Number((stats.avg - prevStats.avg).toFixed(1))
      : null;
  const top3DeltaCells = prevStats != null ? stats.top3Count - prevStats.top3Count : null;

  const basePins =
    effectiveMode === "diff" && diff ? diff.feed.pins : fieldMapPins(snapshot, rankField);
  const realPinCount = basePins.length;

  const mapPins = basePins;
  const outlineInfo = squareGrid ? outlineForPins(snapshot.pins) : null;
  const mapOutline = outlineInfo?.feature;
  const mapRadius = outlineInfo ? outlineInfo.fitRadiusMiles : snapshot.radius_miles;
  const mapSelectedIndex = drawerOpen && selection ? selection.index : null;

  const kwCount = grids.length || preview?.keywordCount || 3;
  const refreshes = preview?.refreshesPerMonth ?? 4;

  const openPin = (index: number) => {
    setSelection({ index, cellLabel: labels[index] ?? `#${index + 1}` });
    setDrawerOpen(true);
  };

  const handleMapPinClick = (_pin: unknown, index: number) => {
    if (index >= realPinCount) return;
    openPin(effectiveMode === "diff" && diff ? (diff.feed.cellIndex[index] ?? index) : index);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelection(null);
  };

  const resetForKeyword = (i: number) => {
    setKeywordIdx(i);
    setSnapshotIdx(null);
    setRankField("rank");
    setViewMode("latest");
    closeDrawer();
  };

  const comparePair = snapshots.length >= 2 ? [0, snapshots.length - 1] : [];
  const canCompare = comparePair.length === 2;
  const compareHref = canCompare
    ? `/locations/${location.slug}/geo-grid/compare?kw=${encodeURIComponent(grid.keyword)}&a=${snapshots[comparePair[0]].date}&b=${snapshots[comparePair[1]].date}`
    : `/locations/${location.slug}/geo-grid/compare`;

  const drawerPanelProps = selection
    ? {
        selection,
        grid,
        snapshot,
        prevSnapshot,
        location,
        localAI,
        paas,
        onPaaClick: (_paa: { id: string }) => {
          toast.info("PAA drill coming soon — demo mode");
        },
        onViewSerp: () => {
          toast.info("Live SERP preview coming soon — demo mode");
        },
        onClose: closeDrawer,
      }
    : null;

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/local">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/locations/${location.slug}`}>{location.shortName}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Geo-Grid</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <MapPin
              className="text-primary size-5"
              aria-hidden
            />
            <h1 className="text-foreground text-2xl font-semibold">Geo-Grid Scanner</h1>
            <StatusPill tone="info">
              avg <span className="num">{stats.avg == null ? "—" : stats.avg.toFixed(1)}</span>
            </StatusPill>
            <StatusPill tone={stats.top3Pct >= 60 ? "success" : "warning"}>
              <span className="num">{fmtPct(stats.top3Pct)}</span>&nbsp;top-3
            </StatusPill>
          </div>
          <p className="text-muted-foreground mt-1 text-[13px]">
            {location.shortName} · keyword{" "}
            <span className="num text-foreground">{grid.keyword}</span> ·{" "}
            <span className="num">{snapshot.total_pins}</span> cells ·{" "}
            <span className="num">{sizeMeta.sqMi}</span> sq mi focus · scanned{" "}
            <span className="num">{fmtDateShort(snapshot.date)}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <Link href={compareHref}>
              <GitCompareArrows className="size-3.5" />
              Compare cycles
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              toast.info("Export coming soon — demo mode");
            }}
          >
            <Download className="size-3.5" />
            Export
          </Button>
        </div>
      </div>

      <KeywordChipRow
        grids={grids}
        keywordIdx={keywordIdx}
        onPick={resetForKeyword}
        trackedKeywords={trackedKeywords}
        slug={location.slug}
        center={{ lat: location.lat, lng: location.lng }}
      />

      <div className="flex flex-col gap-6 xl:flex-row xl:items-stretch">
        {/* LEFT RAIL */}
        <div className="grid gap-4 sm:grid-cols-2 xl:flex xl:w-[280px] xl:shrink-0 xl:flex-col">
          <Card className="gap-3 p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-foreground text-[14px] font-bold">Keyword score</p>
                <p className="text-muted-foreground text-[11.5px]">
                  {RANK_FIELD_LABEL[rankField]} · lower is better
                </p>
              </div>
              <SourceBadge source={grid.source} />
            </div>
            <div className="flex items-baseline gap-2.5">
              <span className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                avg
              </span>
              <span className="num text-foreground text-[34px] leading-none font-bold tracking-tight">
                {stats.avg == null ? "—" : stats.avg.toFixed(1)}
              </span>
              {stats.best != null && (
                <span className="text-muted-foreground text-[11px]">
                  best <span className="num font-semibold">#{stats.best}</span>
                </span>
              )}
            </div>
            <ScoreDeltaPill delta={avgDelta} />
            {trendPoints.length >= 2 ? (
              <TrendSpark
                points={trendPoints}
                height={104}
              />
            ) : (
              <div>
                <p className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                  Trend
                </p>
                <p className="text-muted-foreground mt-1 text-[12px]">
                  <span className="num font-bold">{trendPoints[0]?.value.toFixed(1) ?? "—"}</span> ·
                  trend builds as cycles accrue
                </p>
              </div>
            )}
          </Card>

          <Card className="gap-3 p-4">
            <div>
              <p className="text-foreground text-[14px] font-bold">Distribution</p>
              <p className="text-muted-foreground text-[11.5px]">
                By {RANK_FIELD_LABEL[rankField]} rank band
              </p>
            </div>
            <div
              className="border-border flex h-2 w-full overflow-hidden rounded-full border"
              role="img"
              aria-label="Rank distribution"
            >
              {stats.distribution.map((b) => (
                <span
                  key={b.key}
                  style={{ width: `${b.pct}%`, background: b.color }}
                />
              ))}
            </div>
            <ul className="flex flex-col">
              {stats.distribution.map((b) => (
                <li
                  key={b.key}
                  className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-x-2.5 py-1.5"
                >
                  <span
                    aria-hidden
                    className="size-2.5 rounded-sm"
                    style={{ background: b.color }}
                  />
                  <span className="text-foreground text-[12.5px] font-medium">{b.label}</span>
                  <span className="num text-muted-foreground text-right text-[13px] font-semibold">
                    {b.count}
                  </span>
                  <span
                    className="num min-w-9 text-right text-[12px] font-bold"
                    style={{ color: b.color }}
                  >
                    {fmtPct(b.pct)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="border-border grid grid-cols-2 gap-2 border-t pt-2.5">
              <div>
                <p
                  className={cn(
                    "num text-[13px] font-bold",
                    top3DeltaCells == null
                      ? "text-muted-foreground"
                      : top3DeltaCells >= 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400",
                  )}
                >
                  {top3DeltaCells == null
                    ? "—"
                    : `${top3DeltaCells >= 0 ? "+" : ""}${top3DeltaCells} top-3 cells`}
                </p>
                <p className="text-muted-foreground text-[10px]">vs last scan</p>
              </div>
              <div className="text-right">
                <p className="num text-foreground text-[13px] font-bold">{stats.total} cells</p>
                <p className="text-muted-foreground text-[10px]">total</p>
              </div>
            </div>
          </Card>

          <DominanceCard
            snapshot={grid.snapshots[activeSnapIdx] ?? snapshot}
            location={location}
            windowed={windowed}
          />

          {localAI && (
            <Card className="gap-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-foreground text-[14px] font-bold">Local AI summary</p>
                  <p className="text-muted-foreground text-[11.5px]">
                    6 AI surfaces · chatbot vs Google Search AI
                  </p>
                </div>
                <SourceBadge source={localAI.source} />
              </div>
              <SurfaceListRows surfaces={localAI.surfaces} />
              <Link
                href={`/locations/${location.slug}/local-ai`}
                className="text-primary text-[12px] font-medium hover:underline"
              >
                Local AI visibility
              </Link>
            </Card>
          )}

          <Card className="gap-2.5 p-4">
            <p className="text-foreground text-[14px] font-bold">Scan status</p>
            <dl className="flex flex-col gap-1.5 text-[12px]">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">Cadence</dt>
                <dd className="text-foreground font-medium">Weekly</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">Last cycle</dt>
                <dd className="num font-semibold">{fmtDateShort(latest.date)}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">Next cycle</dt>
                <dd className="num font-semibold">{fmtDateShort(nextCycle)}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">Focus area</dt>
                <dd className="num font-semibold">
                  {gridSize === "10x10" ? "10×10" : "5×5"} · {sizeMeta.sqMi} sq mi
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">Cycles stored</dt>
                <dd className="num font-semibold">{snapshots.length}</dd>
              </div>
            </dl>
            <StatusPill tone="success">Scanner healthy</StatusPill>
          </Card>
        </div>

        {/* CENTER */}
        <div className="flex min-w-0 flex-1 flex-col">
          <Card className="mb-3 gap-2 p-3">
            {squareGrid && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                  Scan area
                </span>
                <div
                  role="radiogroup"
                  aria-label="Scan focus area"
                  className="border-border flex rounded-md border p-0.5"
                >
                  {GRID_SIZES.map((gs) => {
                    const active = gridSize === gs.id;
                    return (
                      <Tooltip key={gs.id}>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            role="radio"
                            aria-checked={active}
                            onClick={() => {
                              setGridSize(gs.id);
                              closeDrawer();
                            }}
                            className={cn(
                              "flex h-8 items-center gap-1.5 rounded px-3 text-[12px] font-medium",
                              active
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:bg-secondary/60",
                            )}
                          >
                            <span className="num font-bold">
                              {gs.id === "10x10" ? "10×10" : "5×5"}
                            </span>
                            <span
                              className={cn(
                                "num text-[11px]",
                                active ? "text-primary-foreground/80" : "text-muted-foreground",
                              )}
                            >
                              · {gs.sqMi} sq mi
                            </span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>{gs.salesLine}</TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-muted-foreground flex items-center gap-1 text-[10px] font-semibold tracking-wider uppercase">
                <Crosshair
                  className="size-3.5"
                  aria-hidden
                />
                Rank type
              </span>
              {RANK_FIELDS.map((rf) => {
                const disabled = rf.id !== "rank" && !derived;
                const active = rankField === rf.id;
                return (
                  <Tooltip key={rf.id}>
                    <TooltipTrigger asChild>
                      <span>
                        <button
                          type="button"
                          role="radio"
                          aria-checked={active}
                          disabled={disabled}
                          onClick={() => setRankField(rf.id)}
                          className={cn(
                            "flex h-8 items-center gap-1.5 rounded-full border px-3 text-[12px] font-medium",
                            active
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-card text-muted-foreground hover:bg-secondary/60",
                            disabled && "cursor-not-allowed opacity-50",
                          )}
                        >
                          {active && (
                            <span
                              aria-hidden
                              className="size-1.5 rounded-full bg-white"
                            />
                          )}
                          {rf.label}
                        </button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      {disabled
                        ? "Multi-surface ranks arrive with the next live scan cycle"
                        : rf.desc}
                    </TooltipContent>
                  </Tooltip>
                );
              })}

              <span
                aria-hidden
                className="bg-border mx-1 hidden h-5 w-px sm:block"
              />

              <span className="text-muted-foreground flex items-center gap-1 text-[10px] font-semibold tracking-wider uppercase">
                <Layers
                  className="size-3.5"
                  aria-hidden
                />
                View
              </span>
              <button
                type="button"
                aria-pressed={effectiveMode === "latest"}
                onClick={() => setViewMode("latest")}
                className={cn(
                  "h-8 rounded-full border px-3 text-[12px] font-medium",
                  effectiveMode === "latest"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:bg-secondary/60",
                )}
              >
                Cycle ranks
              </button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <button
                      type="button"
                      aria-pressed={effectiveMode === "diff"}
                      disabled={!diff}
                      onClick={() => setViewMode("diff")}
                      className={cn(
                        "h-8 rounded-full border px-3 text-[12px] font-medium",
                        effectiveMode === "diff"
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card text-muted-foreground hover:bg-secondary/60",
                        !diff && "cursor-not-allowed opacity-50",
                      )}
                    >
                      Δ vs prior cycle
                    </button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  {diff
                    ? `Recolor pins by ${RANK_FIELD_LABEL[rankField]} change`
                    : "Second scan cycle pending"}
                </TooltipContent>
              </Tooltip>
            </div>
          </Card>

          <div className="border-border relative min-h-[520px] flex-1 overflow-hidden rounded-lg border">
            <GeoGridMapLazy
              key={`${grid.keyword}-${gridSize}`}
              center={{ lat: location.lat, lng: location.lng }}
              pins={mapPins}
              radiusMiles={mapRadius}
              outline={
                mapOutline
                  ? (mapOutline as ReturnType<typeof import("@turf/circle").default>)
                  : undefined
              }
              selectedIndex={mapSelectedIndex}
              onPinClick={handleMapPinClick as (pin: unknown, index: number) => void}
              height="100%"
              className="absolute inset-0 rounded-none border-0"
              business={
                location.address ? { name: location.name, address: location.address } : null
              }
            />
          </div>

          {/* Filmstrip */}
          {snapshots.length >= 2 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {snapshots.map((s, i) => {
                const active = i === activeSnapIdx;
                const fs = fieldStats(s, rankField);
                return (
                  <Tooltip key={i}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => setSnapshotIdx(i)}
                        className={cn(
                          "flex w-[140px] shrink-0 flex-col gap-1 rounded-md border p-2 text-left transition-colors",
                          active
                            ? "border-primary bg-primary/10"
                            : "border-border bg-card hover:bg-secondary/60",
                        )}
                      >
                        <MiniGridThumb
                          pins={s.pins}
                          center={{ lat: location.lat, lng: location.lng }}
                        />
                        <p className="num text-foreground text-[10.5px] font-bold">
                          {fmtDateShort(s.date)}
                        </p>
                        <p className="num text-muted-foreground text-[10px]">
                          avg {fs.avg == null ? "—" : fs.avg.toFixed(1)}
                        </p>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-medium">Cycle {fmtDateShort(s.date)}</p>
                      <p className="text-xs">
                        avg <span className="num">{fs.avg?.toFixed(1) ?? "—"}</span> ·{" "}
                        <span className="num">{fs.top3Count}</span> top-3 cells
                      </p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT — inline drawer (wide viewports) */}
        {inlineDrawer && drawerPanelProps && (
          <div className="border-border w-[400px] shrink-0 overflow-hidden rounded-lg border">
            <PinDetailPanel {...drawerPanelProps} />
          </div>
        )}
      </div>

      {/* RIGHT — Sheet overlay (narrow viewports) */}
      {drawerPanelProps && (
        <PinDetailDrawer
          open={!inlineDrawer && drawerOpen}
          onOpenChange={(open) => {
            if (!open) closeDrawer();
          }}
          {...drawerPanelProps}
        />
      )}
    </div>
  );
}
