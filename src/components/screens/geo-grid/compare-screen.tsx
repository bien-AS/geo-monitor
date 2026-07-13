import * as React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Download, GitCompareArrows } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { fmtDateShort, fmtPct, rankBand, RANK_BAND_COLOR } from "@/lib/format";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ViewState, ViewStateChangeEvent } from "react-map-gl/mapbox";
import { GeoGridMapLazy } from "@/components/maps/geo-grid-map-lazy";
import { DeltaPill } from "@/components/local/delta-pill";
import { SourceBadge } from "@/components/local/source-badge";
import {
  bearingLabel,
  cellLabels,
  computeDeltas,
  DELTA_COLOR,
  diffMapFeed,
  distanceMiles,
  distributionCounts,
  isSquareGrid,
  outlineForPins,
  top3Pct,
  type GeoLocationSlim,
  type KeywordGrid,
  type PinDelta,
} from "./helpers";

type CompareMode = "absolute" | "delta";

export function GeoGridCompareScreen({
  location,
  grids,
  locations,
  initialKeyword,
  initialA,
  initialB,
}: {
  location: GeoLocationSlim;
  grids: KeywordGrid[];
  locations: Array<{ slug: string; name: string; shortName?: string }>;
  initialKeyword?: string;
  initialA?: string;
  initialB?: string;
}) {
  const initialKwIdx = Math.max(
    0,
    grids.findIndex((g) => g.keyword === initialKeyword),
  );
  const [keywordIdx, setKeywordIdx] = React.useState(initialKwIdx);
  const grid = grids[Math.min(keywordIdx, Math.max(0, grids.length - 1))];
  const snapshots = grid?.snapshots ?? [];

  const [aDate, setADate] = React.useState<string | null>(initialA ?? null);
  const [bDate, setBDate] = React.useState<string | null>(initialB ?? null);
  const [mode, setMode] = React.useState<CompareMode>("delta");

  const [camera, setCamera] = React.useState<Partial<ViewState> | null>(null);
  const onMove = React.useCallback((e: ViewStateChangeEvent) => setCamera(e.viewState), []);

  const square = grid ? isSquareGrid(grid) : false;
  const latest = snapshots[snapshots.length - 1];
  const outlineInfo = square && latest ? outlineForPins(latest.pins) : null;
  const mapOutline = outlineInfo?.feature;
  const mapRadius = (s: { radius_miles: number }) =>
    outlineInfo ? outlineInfo.fitRadiusMiles : s.radius_miles;

  const a =
    snapshots.find((s) => s.date === aDate) ??
    (snapshots.length >= 2 ? snapshots[snapshots.length - 2] : null);
  const b =
    snapshots.find((s) => s.date === bDate) ??
    (snapshots.length >= 1 ? snapshots[snapshots.length - 1] : null);

  const canCompare = a != null && b != null && a.date !== b.date;
  const diff = React.useMemo(() => {
    if (!canCompare || !a || !b) return null;
    const deltas = computeDeltas(a, b);
    return { deltas, feed: diffMapFeed(deltas, b.pins) };
  }, [canCompare, a, b]);

  const header = (
    <>
      <div className="text-muted-foreground flex items-center gap-2 text-sm">
        <span className="text-foreground font-semibold">{location.name}</span>
        {snapshots.length > 0 && (
          <span>Last scan {fmtDateShort(snapshots[snapshots.length - 1].date)}</span>
        )}
        <span className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
          Geo-Grid
        </span>
      </div>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
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
            <BreadcrumbLink asChild>
              <Link href={`/locations/${location.slug}/geo-grid`}>Geo-Grid</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Compare A/B</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </>
  );

  if (!canCompare || !a || !b) {
    return (
      <div className="flex flex-col gap-6">
        {header}
        <div className="flex flex-wrap items-center gap-2.5">
          <GitCompareArrows
            className="text-primary size-5"
            aria-hidden
          />
          <h1 className="text-foreground text-2xl font-semibold">Cycle compare</h1>
        </div>
        <Card className="diamond-watermark items-center gap-3 p-12 text-center">
          <span
            aria-hidden
            className="bg-primary-200 size-10 rotate-45 rounded-sm"
          />
          <h3 className="text-base font-semibold">Second scan cycle pending</h3>
          <p className="text-muted-foreground max-w-md text-[13px]">
            {location.shortName} has <span className="num">{snapshots.length}</span> stored scan
            cycle
            {snapshots.length === 1 ? "" : "s"} for{" "}
            <span className="num">{grid?.keyword ?? "this keyword"}</span>. The A/B compare unlocks
            after the next weekly refresh writes a second cycle.
          </p>
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <Link href={`/locations/${location.slug}/geo-grid`}>
              <ArrowLeft className="size-3.5" />
              Back to scanner
            </Link>
          </Button>
        </Card>
      </div>
    );
  }

  const avgOf = (s: { avg_rank: number | null }) => s.avg_rank ?? 21;
  const fmtAvg = (s: { avg_rank: number | null }) =>
    s.avg_rank == null ? "20+" : s.avg_rank.toFixed(1);
  const deltas = {
    avg: Number((avgOf(b) - avgOf(a)).toFixed(1)),
    top3: Math.round(top3Pct(b) - top3Pct(a)),
    top3Cells: (b.position_distribution["1-3"] ?? 0) - (a.position_distribution["1-3"] ?? 0),
    best:
      a.best_position != null && b.best_position != null ? b.best_position - a.best_position : null,
  };
  const counts = diff?.feed.counts ?? {
    improved: 0,
    declined: 0,
    unchanged: 0,
  };

  const narrative = `Between ${fmtDateShort(a.date)} and ${fmtDateShort(b.date)}, average local-pack rank ${
    deltas.avg < 0
      ? `improved ${Math.abs(deltas.avg).toFixed(1)} positions`
      : deltas.avg > 0
        ? `declined ${deltas.avg.toFixed(1)} positions`
        : "held steady"
  } for "${grid.keyword}" (${fmtAvg(a)} → ${fmtAvg(b)}). Top-3 coverage ${
    deltas.top3Cells >= 0 ? "gained" : "lost"
  } ${Math.abs(deltas.top3Cells)} cell${Math.abs(deltas.top3Cells) === 1 ? "" : "s"} (now ${fmtPct(top3Pct(b))} of the grid). ${counts.improved} cells improved, ${counts.declined} declined, ${counts.unchanged} held their position.`;

  const handleExportClick = () => {
    toast.info("Export diff — coming soon");
  };

  const mapB = mode === "delta" && diff ? { pins: diff.feed.pins } : { pins: b.pins };

  const pinDeltas: PinDelta[] = diff?.deltas ?? [];
  const bLabels = cellLabels(b.pins);
  const rankedDelta =
    b.pins.filter((p) => p.rank != null).length - a.pins.filter((p) => p.rank != null).length;

  const maxDist = b.pins.reduce(
    (m, p) => Math.max(m, distanceMiles(location.lat, location.lng, p.lat, p.lng)),
    0,
  );
  const posLabel = (pin: { lat: number; lng: number }): string => {
    const d = distanceMiles(location.lat, location.lng, pin.lat, pin.lng);
    const ratio = maxDist > 0 ? d / maxDist : 0;
    if (ratio < 0.2) return "center";
    const ring = ratio <= 0.5 ? "core" : ratio <= 0.8 ? "mid" : "edge";
    return `${bearingLabel(location.lat, location.lng, pin.lat, pin.lng)} ${ring}`;
  };

  const improvedMovers = pinDeltas
    .filter((d) => d.change === "improved" && d.gained != null)
    .sort((x, y) => (y.gained ?? 0) - (x.gained ?? 0))
    .slice(0, 5);
  const declinedMovers = pinDeltas
    .filter((d) => d.change === "declined" && d.gained != null)
    .sort((x, y) => (x.gained ?? 0) - (y.gained ?? 0))
    .slice(0, 5);

  const migration = pinDeltas.reduce(
    (acc, d) => {
      if ((d.a == null || d.a > 3) && d.b != null && d.b <= 3) acc.enteredTop3 += 1;
      if (d.a != null && d.a <= 3 && (d.b == null || d.b > 3)) acc.leftTop3 += 1;
      if (d.a == null && d.b != null) acc.newlyRanked += 1;
      if (d.a != null && d.b == null) acc.droppedOff += 1;
      return acc;
    },
    { enteredTop3: 0, leftTop3: 0, newlyRanked: 0, droppedOff: 0 },
  );

  const quadDeclines = new Map<string, number>();
  pinDeltas.forEach((d) => {
    if (d.change !== "declined") return;
    const p = b.pins[d.index];
    const q = (p.lat >= location.lat ? "N" : "S") + (p.lng >= location.lng ? "E" : "W");
    quadDeclines.set(q, (quadDeclines.get(q) ?? 0) + 1);
  });
  const worstQuad = [...quadDeclines.entries()].sort((x, y) => y[1] - x[1])[0] ?? null;

  const recs: React.ReactNode[] = [];
  if (worstQuad && worstQuad[1] >= 3) {
    recs.push(
      <>
        The <span className="font-semibold">{worstQuad[0]}</span> quadrant slipped{" "}
        <span className="num font-semibold">{worstQuad[1]}</span> cells — prioritize review velocity
        and citation coverage on that side of the service area.
      </>,
    );
  }
  if (migration.droppedOff > 0) {
    recs.push(
      <>
        <span className="num font-semibold">{migration.droppedOff}</span> cell
        {migration.droppedOff === 1 ? "" : "s"} dropped out of the local pack entirely — verify NAP
        consistency and the service-area settings before the next cycle.
      </>,
    );
  }
  if (deltas.top3Cells > 0) {
    recs.push(
      <>
        Top-3 coverage grew by <span className="num font-semibold">{deltas.top3Cells}</span> cell
        {deltas.top3Cells === 1 ? "" : "s"} — consolidate the gains: schedule the next scan cycle
        and keep post cadence weekly.
      </>,
    );
  } else if (deltas.top3Cells < 0) {
    recs.push(
      <>
        Top-3 coverage contracted by{" "}
        <span className="num font-semibold">{Math.abs(deltas.top3Cells)}</span> cell
        {Math.abs(deltas.top3Cells) === 1 ? "" : "s"} — audit the GBP primary category and review
        response rate before the next weekly refresh.
      </>,
    );
  }
  if (recs.length < 2 && deltas.avg < 0) {
    recs.push(
      <>
        Average rank improved{" "}
        <span className="num font-semibold">{Math.abs(deltas.avg).toFixed(1)}</span> positions —
        hold the current posting cadence and re-scan on schedule to confirm the trend.
      </>,
    );
  }
  if (recs.length < 2) {
    recs.push(
      <>
        Movement was mostly flat across this window — hold the weekly cadence and compare again
        after the next refresh writes a new cycle.
      </>,
    );
  }
  const recommendations = recs.slice(0, 3);

  const moverRow = (d: PinDelta) => {
    const p = b.pins[d.index];
    const gained = d.gained ?? 0;
    return (
      <li
        key={d.index}
        className="flex items-center justify-between gap-2 py-1.5 text-[12.5px]"
      >
        <span className="flex min-w-0 items-center gap-1.5">
          <span
            aria-hidden
            className="size-2 shrink-0 rounded-full"
            style={{
              background: gained > 0 ? DELTA_COLOR.improved : DELTA_COLOR.declined,
            }}
          />
          <span className="num text-foreground shrink-0 font-semibold">
            {bLabels[d.index] ?? `#${d.index + 1}`}
          </span>
          <span className="text-muted-foreground truncate">{posLabel(p)}</span>
        </span>
        <span className="num text-muted-foreground shrink-0 font-semibold">
          {d.a ?? "NR"} → {d.b ?? "NR"}{" "}
          <span
            className={
              gained > 0
                ? "text-success-700 dark:text-success-100"
                : "text-error-700 dark:text-error-100"
            }
          >
            {gained > 0 ? `+${gained}` : `−${Math.abs(gained)}`}
          </span>
        </span>
      </li>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {header}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <GitCompareArrows
              className="text-primary size-5"
              aria-hidden
            />
            <h1 className="text-foreground text-2xl font-semibold">
              Cycle compare — <span className="num">{fmtDateShort(a.date)}</span>
              <ArrowRight
                className="text-muted-foreground mx-1 inline size-4"
                aria-hidden
              />
              <span className="num">{fmtDateShort(b.date)}</span>
            </h1>
            <DeltaPill
              delta={deltas.avg}
              label="avg rank"
              goodDirection="down"
            />
            <DeltaPill
              delta={deltas.top3}
              label="top-3 %"
              goodDirection="up"
              suffix="%"
            />
          </div>
          <p className="text-muted-foreground mt-1 text-[13px]">
            {location.shortName} · keyword{" "}
            <span className="num text-muted-foreground">{grid.keyword}</span> ·{" "}
            <span className="num">{b.total_pins}</span> cells
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={a.date}
            onValueChange={(v) => setADate(v)}
          >
            <SelectTrigger
              size="sm"
              aria-label="Cycle A"
              className="num min-w-32"
            >
              <span className="text-muted-foreground mr-1 text-[10px] font-semibold tracking-wider uppercase">
                A
              </span>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {snapshots.map((s) => (
                <SelectItem
                  key={s.date}
                  value={s.date}
                  disabled={s.date === b.date}
                >
                  {fmtDateShort(s.date)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={b.date}
            onValueChange={(v) => setBDate(v)}
          >
            <SelectTrigger
              size="sm"
              aria-label="Cycle B"
              className="num min-w-32"
            >
              <span className="text-muted-foreground mr-1 text-[10px] font-semibold tracking-wider uppercase">
                B
              </span>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {snapshots.map((s) => (
                <SelectItem
                  key={s.date}
                  value={s.date}
                  disabled={s.date === a.date}
                >
                  {fmtDateShort(s.date)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportClick}
          >
            <Download className="size-3.5" />
            Export diff
          </Button>
          <Button
            variant="ghost"
            size="sm"
            asChild
          >
            <Link href={`/locations/${location.slug}/geo-grid`}>
              <ArrowLeft className="size-3.5" />
              Back to scanner
            </Link>
          </Button>
        </div>
      </div>

      {grids.length > 1 && (
        <div
          role="tablist"
          aria-label="Tracked keywords"
          className="flex flex-wrap gap-2"
        >
          {grids.map((g, i) => (
            <button
              key={g.keyword}
              type="button"
              role="tab"
              aria-selected={i === keywordIdx}
              onClick={() => {
                setKeywordIdx(i);
                setADate(null);
                setBDate(null);
              }}
              className={cn(
                "flex h-9 items-center gap-2 rounded-md border px-3 text-[13px] font-medium",
                i === keywordIdx
                  ? "border-primary bg-primary-50/70 text-primary-700 dark:bg-primary-700/20 dark:text-primary-100"
                  : "border-border bg-card text-muted-foreground hover:bg-secondary/60",
              )}
            >
              {g.keyword}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <Card className="gap-0 overflow-hidden p-0 xl:col-span-9">
          <div className="border-border flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                Mode
              </span>
              {[
                { id: "absolute" as const, label: "Absolute ranks" },
                { id: "delta" as const, label: "Δ overlay on B" },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  aria-pressed={mode === m.id}
                  onClick={() => setMode(m.id)}
                  className={cn(
                    "h-8 rounded-md border px-3 text-[12px] font-medium",
                    mode === m.id
                      ? "border-primary bg-primary-50/70 text-primary-700 dark:bg-primary-700/20 dark:text-primary-100"
                      : "border-border text-muted-foreground hover:bg-secondary/60",
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
              {mode === "delta" ? (
                <>
                  <span className="flex items-center gap-1">
                    <span
                      aria-hidden
                      className="size-2.5 rounded-full"
                      style={{ background: DELTA_COLOR.improved }}
                    />
                    improved · <span className="num">{counts.improved}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span
                      aria-hidden
                      className="size-2.5 rounded-full"
                      style={{ background: DELTA_COLOR.declined }}
                    />
                    declined · <span className="num">{counts.declined}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span
                      aria-hidden
                      className="size-2.5 rounded-full"
                      style={{ background: DELTA_COLOR.unchanged }}
                    />
                    unchanged · <span className="num">{counts.unchanged}</span>
                  </span>
                  <span>pin label = signed Δ (+2 / −3 / =)</span>
                </>
              ) : (
                <span>Pins show each cycle&apos;s absolute rank bands</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-2">
            <div>
              <p className="mb-2 flex items-center justify-between text-[12px]">
                <span className="text-foreground font-semibold">
                  A · <span className="num">{fmtDateShort(a.date)}</span>
                </span>
                <span className="text-muted-foreground">
                  avg{" "}
                  <span
                    className="num font-bold"
                    style={{
                      color:
                        RANK_BAND_COLOR[
                          rankBand(a.avg_rank == null ? null : Math.round(a.avg_rank))
                        ],
                    }}
                  >
                    {fmtAvg(a)}
                  </span>
                </span>
              </p>
              <GeoGridMapLazy
                center={{ lat: location.lat, lng: location.lng }}
                pins={a.pins}
                radiusMiles={mapRadius(a)}
                outline={mapOutline}
                height={440}
                viewState={camera ?? undefined}
                onMove={onMove}
              />
            </div>
            <div>
              <p className="mb-2 flex items-center justify-between text-[12px]">
                <span className="text-foreground font-semibold">
                  B · <span className="num">{fmtDateShort(b.date)}</span>
                  {mode === "delta" && (
                    <span className="text-muted-foreground ml-1.5 font-normal">(Δ vs A)</span>
                  )}
                </span>
                <span className="text-muted-foreground">
                  avg{" "}
                  <span
                    className="num font-bold"
                    style={{
                      color:
                        RANK_BAND_COLOR[
                          rankBand(b.avg_rank == null ? null : Math.round(b.avg_rank))
                        ],
                    }}
                  >
                    {fmtAvg(b)}
                  </span>
                </span>
              </p>
              <GeoGridMapLazy
                center={{ lat: location.lat, lng: location.lng }}
                pins={mapB.pins}
                radiusMiles={mapRadius(b)}
                outline={mapOutline}
                height={440}
                viewState={camera ?? undefined}
                onMove={onMove}
              />
            </div>
          </div>
          <p className="border-border text-muted-foreground border-t px-3 py-1 text-[10.5px] leading-tight">
            Synced camera — pan or zoom either side.
          </p>
        </Card>

        <div className="flex flex-col gap-6 xl:col-span-3">
          <Card className="gap-4 p-5">
            <div className="flex items-start justify-between gap-2">
              <p className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                A → B numerics
              </p>
              <SourceBadge source={grid.source} />
            </div>
            <ul className="flex flex-col gap-3">
              <li>
                <p className="text-muted-foreground text-[12px]">Avg local-pack rank</p>
                <p className="mt-0.5 flex items-center gap-2 text-[15px]">
                  <span className="num font-bold">{fmtAvg(a)}</span>
                  <ArrowRight
                    className="text-muted-foreground size-3.5"
                    aria-hidden
                  />
                  <span className="num font-bold">{fmtAvg(b)}</span>
                </p>
                <DeltaPill
                  delta={deltas.avg}
                  label="lower = better"
                  goodDirection="down"
                  className="mt-1"
                />
              </li>
              <li>
                <p className="text-muted-foreground text-[12px]">Top-3 coverage</p>
                <p className="mt-0.5 flex items-center gap-2 text-[15px]">
                  <span className="num font-bold">{fmtPct(top3Pct(a))}</span>
                  <ArrowRight
                    className="text-muted-foreground size-3.5"
                    aria-hidden
                  />
                  <span className="num font-bold">{fmtPct(top3Pct(b))}</span>
                </p>
                <DeltaPill
                  delta={deltas.top3Cells}
                  label="top-3 cells"
                  goodDirection="up"
                  className="mt-1"
                />
              </li>
              {deltas.best != null && (
                <li>
                  <p className="text-muted-foreground text-[12px]">Best position</p>
                  <p className="mt-0.5 flex items-center gap-2 text-[15px]">
                    <span className="num font-bold">#{a.best_position}</span>
                    <ArrowRight
                      className="text-muted-foreground size-3.5"
                      aria-hidden
                    />
                    <span className="num font-bold">#{b.best_position}</span>
                  </p>
                </li>
              )}
            </ul>
            <div className="border-border-subtle grid grid-cols-3 gap-2 border-t pt-3 text-center">
              <div>
                <p
                  className="num text-[17px] font-bold"
                  style={{ color: RANK_BAND_COLOR.top }}
                >
                  {counts.improved}
                </p>
                <p className="text-muted-foreground text-[11px]">improved</p>
              </div>
              <div>
                <p
                  className="num text-[17px] font-bold"
                  style={{ color: RANK_BAND_COLOR.out }}
                >
                  {counts.declined}
                </p>
                <p className="text-muted-foreground text-[11px]">declined</p>
              </div>
              <div>
                <p className="num text-muted-foreground text-[17px] font-bold">
                  {counts.unchanged}
                </p>
                <p className="text-muted-foreground text-[11px]">stable</p>
              </div>
            </div>
          </Card>

          <Card className="gap-3 p-5">
            <p className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
              Distribution A vs B
            </p>
            {[
              { label: "A", snap: a },
              { label: "B", snap: b },
            ].map(({ label, snap }) => (
              <div key={label}>
                <p className="text-muted-foreground mb-1 text-[11px]">
                  {label} · <span className="num">{fmtDateShort(snap.date)}</span>
                </p>
                <div
                  className="flex h-2.5 w-full overflow-hidden rounded-full"
                  role="img"
                  aria-label={`Cycle ${label} rank distribution`}
                >
                  {distributionCounts(snap).map((bkt) => (
                    <span
                      key={bkt.key}
                      style={{ width: `${bkt.pct}%`, background: bkt.color }}
                      title={`${bkt.label}: ${bkt.count}`}
                    />
                  ))}
                </div>
              </div>
            ))}
            <div className="text-muted-foreground flex flex-wrap gap-x-3 gap-y-1 text-[11px]">
              {distributionCounts(b).map((bkt) => (
                <span
                  key={bkt.key}
                  className="flex items-center gap-1"
                >
                  <span
                    aria-hidden
                    className="size-2 rounded-sm"
                    style={{ background: bkt.color }}
                  />
                  {bkt.label}
                </span>
              ))}
            </div>
          </Card>

          <Card className="border-l-primary gap-3 border-l-[3px] p-5">
            <div className="flex items-start justify-between gap-2">
              <p className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                Cycle narrative
              </p>
              <SourceBadge
                source="synthetic"
                note="Narrative composed from the real cycle deltas"
              />
            </div>
            <p className="text-muted-foreground text-[13px] leading-relaxed">{narrative}</p>
          </Card>
        </div>
      </div>

      <Card className="gap-5 p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-foreground text-[15px] font-bold">What changed &amp; what to do</p>
            <p className="text-muted-foreground text-[11.5px]">
              Cell-by-cell diff of <span className="num">{fmtDateShort(a.date)}</span> →{" "}
              <span className="num">{fmtDateShort(b.date)}</span> ·{" "}
              <span className="num">{b.total_pins}</span> matched cells
            </p>
          </div>
          <SourceBadge
            source="synthetic"
            note="Derived entirely from the two selected scan cycles — no external data"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <DeltaPill
            delta={deltas.avg}
            label="avg rank"
            goodDirection="down"
          />
          {deltas.best != null && (
            <DeltaPill
              delta={deltas.best}
              label="best rank"
              goodDirection="down"
            />
          )}
          <DeltaPill
            delta={deltas.top3Cells}
            label="top-3 cells"
            goodDirection="up"
          />
          <DeltaPill
            delta={rankedDelta}
            label="ranked cells"
            goodDirection="up"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div>
            <p className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
              Biggest movers · improved
            </p>
            {improvedMovers.length > 0 ? (
              <ul className="divide-border-subtle mt-1.5 flex flex-col divide-y">
                {improvedMovers.map(moverRow)}
              </ul>
            ) : (
              <p className="text-muted-foreground mt-2 text-[12px]">
                No cells improved in this window.
              </p>
            )}
          </div>

          <div>
            <p className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
              Biggest movers · declined
            </p>
            {declinedMovers.length > 0 ? (
              <ul className="divide-border-subtle mt-1.5 flex flex-col divide-y">
                {declinedMovers.map(moverRow)}
              </ul>
            ) : (
              <p className="text-muted-foreground mt-2 text-[12px]">
                No cells declined in this window.
              </p>
            )}
          </div>

          <div>
            <p className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
              Band migration
            </p>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              {[
                {
                  label: "Entered top-3",
                  value: migration.enteredTop3,
                  good: true,
                },
                { label: "Left top-3", value: migration.leftTop3, good: false },
                {
                  label: "Newly ranked",
                  value: migration.newlyRanked,
                  good: true,
                },
                {
                  label: "Dropped off",
                  value: migration.droppedOff,
                  good: false,
                },
              ].map((m) => (
                <div
                  key={m.label}
                  className="border-border rounded-md border p-2.5"
                >
                  <p
                    className={cn(
                      "num text-[17px] font-bold",
                      m.value === 0
                        ? "text-muted-foreground"
                        : m.good
                          ? "text-success-700 dark:text-success-100"
                          : "text-error-700 dark:text-error-100",
                    )}
                  >
                    {m.value}
                  </p>
                  <p className="text-muted-foreground text-[11px]">{m.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-l-primary bg-secondary/40 rounded-md border-l-[3px] p-4">
          <p className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
            What to do next
          </p>
          <ul className="mt-1.5 flex flex-col gap-1.5">
            {recommendations.map((rec, i) => (
              <li
                key={i}
                className="text-muted-foreground flex items-start gap-2 text-[13px] leading-relaxed"
              >
                <span
                  aria-hidden
                  className="bg-primary mt-[7px] size-1.5 shrink-0 rounded-full"
                />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </Card>
    </div>
  );
}
