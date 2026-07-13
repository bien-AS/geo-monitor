"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { gsap } from "gsap";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusPill } from "@/components/local/status-pill";
import { drawIn, useGsapReveal } from "@/components/local/use-gsap-reveal";
import { useRole } from "@/components/shell/role-store";
import { useAuditLog } from "@/components/local/audit-log-store";
import { useKeywords as useKeywordsStore } from "@/store/keywords";
import { fmtDateShort, rankBand, RANK_BAND_COLOR } from "@/lib/format";
import { Icons } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { TrackedKeyword } from "@/lib/data/types";
import type { TrackerRow, TrackerSnap } from "@/hooks/use-keywords";

function shiftDays(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function ordinal(n: number): string {
  const v = n % 100;
  if (v >= 11 && v <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}

function fmtMagnitude(n: number): string {
  const v = Math.round(Math.abs(n) * 10) / 10;
  return v % 1 === 0 ? String(Math.round(v)) : v.toFixed(1);
}

const IMPROVED = "#1D9E75";
const DECLINED = "#A32D2D";
const STAR_AMBER = "#EAB308";

type Preset = "7" | "30" | "90" | "all" | "custom";
type SortKey = "rank" | "change";

interface DerivedRow extends TrackerRow {
  inRange: TrackerSnap[];
  rank: number | null;
  delta: number | null;
  gRank: number | null;
  gDelta: number | null;
  bRank: number | null;
  bDelta: number | null;
}

export function KeywordsTracker({
  slug,
  locationName,
  locationLabel,
  maxKeywords,
  rows,
}: {
  slug: string;
  locationName: string;
  locationLabel: string;
  maxKeywords: number;
  rows: TrackerRow[];
}) {
  const role = useRole();
  const addEntry = useAuditLog((s) => s.addEntry);
  const addKeyword = useKeywordsStore((s) => s.addKeyword);
  const sessionAdded = useKeywordsStore((s) => s.added[slug]);
  const sessionRemoved = useKeywordsStore((s) => s.removed[slug]);
  const sessionScans = useKeywordsStore((s) => s.scans[slug]);

  const [preset, setPreset] = React.useState<Preset>("90");
  const [customFrom, setCustomFrom] = React.useState("");
  const [customTo, setCustomTo] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [sort, setSort] = React.useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "rank",
    dir: "asc",
  });
  const [starred, setStarred] = React.useState<Set<string>>(new Set());
  const [addOpen, setAddOpen] = React.useState(false);
  const [newKw, setNewKw] = React.useState("");

  const allRows = React.useMemo<TrackerRow[]>(() => {
    const removed = new Set(sessionRemoved ?? []);
    const scans = sessionScans ?? {};
    const base = rows.filter((r) => !removed.has(r.keyword));
    const extras: TrackerRow[] = (sessionAdded ?? [])
      .filter((k) => !removed.has(k.keyword) && !base.some((r) => r.keyword === k.keyword))
      .map((k) => ({
        keyword: k.keyword,
        scanned: false,
        addedAt: k.added_at ?? "2026-07-14",
        usage: { grid: false, ai: false, comp: false },
        snapshots: [],
        organic: [],
      }));
    return [...base, ...extras].map((r) => {
      const scan = scans[r.keyword];
      if (!scan) return r;
      const total = Math.max(1, scan.total_pins);
      const snap: TrackerSnap = {
        date: scan.scanned_at.slice(0, 10),
        avg: scan.avg_rank > 0 ? scan.avg_rank : null,
        best: scan.best_position > 0 ? scan.best_position : null,
        top3Pct: Math.round(((scan.position_distribution["1-3"] ?? 0) / total) * 100),
      };
      return {
        ...r,
        scanned: true,
        snapshots: [...r.snapshots.filter((s) => s.date !== snap.date), snap].sort((a, b) =>
          a.date.localeCompare(b.date),
        ),
      };
    });
  }, [rows, sessionAdded, sessionRemoved, sessionScans]);

  const anchor = React.useMemo(() => {
    let max: string | null = null;
    for (const r of allRows) for (const s of r.snapshots) if (!max || s.date > max) max = s.date;
    return max;
  }, [allRows]);

  const range = React.useMemo<{ from: string; to: string }>(() => {
    if (preset === "custom" && (customFrom || customTo))
      return {
        from: customFrom || "0000-01-01",
        to: customTo || "9999-12-31",
      };
    if (preset === "all" || !anchor) return { from: "0000-01-01", to: "9999-12-31" };
    const days = preset === "7" ? 7 : preset === "30" ? 30 : 90;
    return { from: shiftDays(anchor, -(days - 1)), to: anchor };
  }, [preset, customFrom, customTo, anchor]);

  const derived = React.useMemo<DerivedRow[]>(
    () =>
      allRows.map((r) => {
        const inRange = r.snapshots.filter((s) => s.date >= range.from && s.date <= range.to);
        const ranked = inRange.filter((s) => s.avg != null);
        const latest = inRange[inRange.length - 1] ?? null;
        const first = ranked[0] ?? null;
        const last = ranked[ranked.length - 1] ?? null;
        const delta =
          ranked.length >= 2 && first?.avg != null && last?.avg != null
            ? Math.round((first.avg - last.avg) * 10) / 10
            : null;
        const organicInRange = r.organic.filter((o) => o.date >= range.from && o.date <= range.to);
        const gRanked = organicInRange.filter((o) => o.g != null);
        const bRanked = organicInRange.filter((o) => o.b != null);
        const gLast = gRanked[gRanked.length - 1] ?? null;
        const bLast = bRanked[bRanked.length - 1] ?? null;
        return {
          ...r,
          inRange,
          rank: latest?.avg ?? null,
          delta,
          gRank: gLast?.g ?? null,
          gDelta:
            gRanked.length >= 2 && gRanked[0].g != null && gLast?.g != null
              ? gRanked[0].g - gLast.g
              : null,
          bRank: bLast?.b ?? null,
          bDelta:
            bRanked.length >= 2 && bRanked[0].b != null && bLast?.b != null
              ? bRanked[0].b - bLast.b
              : null,
        };
      }),
    [allRows, range],
  );

  const scannedCount = derived.filter((r) => r.scanned).length;
  const deltas = derived.map((r) => r.delta).filter((d): d is number => d != null);
  const netChange = deltas.length
    ? Math.round((deltas.reduce((s, v) => s + v, 0) / deltas.length) * 10) / 10
    : null;
  const top3Grids = derived.filter((r) => r.rank != null && Math.round(r.rank) <= 3).length;

  const chart = React.useMemo(() => {
    const byDate = new Map<string, number[]>();
    const contributors = new Set<string>();
    for (const r of derived)
      for (const s of r.inRange)
        if (s.avg != null) {
          byDate.set(s.date, [...(byDate.get(s.date) ?? []), s.avg]);
          contributors.add(r.keyword);
        }
    const points = [...byDate.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, vals]) => ({
        date,
        value: Math.round((vals.reduce((s, v) => s + v, 0) / vals.length) * 10) / 10,
      }));
    return { points, n: contributors.size };
  }, [derived]);

  const visible = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q ? derived.filter((r) => r.keyword.toLowerCase().includes(q)) : derived;
    const dirMul = sort.dir === "asc" ? 1 : -1;
    const keyVal = (r: DerivedRow): number | null => (sort.key === "rank" ? r.gRank : r.gDelta);
    return [...filtered].sort((a, b) => {
      const starA = starred.has(a.keyword) ? 0 : 1;
      const starB = starred.has(b.keyword) ? 0 : 1;
      if (starA !== starB) return starA - starB;
      const va = keyVal(a);
      const vb = keyVal(b);
      if (va == null && vb == null) return a.keyword.localeCompare(b.keyword);
      if (va == null) return 1;
      if (vb == null) return -1;
      if (va !== vb) return (va - vb) * dirMul;
      return a.keyword.localeCompare(b.keyword);
    });
  }, [derived, query, sort, starred]);

  const toggleSort = (key: SortKey) =>
    setSort((s) =>
      s.key === key
        ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
        : { key, dir: key === "change" ? "desc" : "asc" },
    );

  const toggleStar = (kw: string) =>
    setStarred((prev) => {
      const next = new Set(prev);
      if (next.has(kw)) next.delete(kw);
      else next.add(kw);
      return next;
    });

  const submitAdd = () => {
    const kw = newKw.trim().toLowerCase();
    if (!kw) return;
    if (allRows.length >= maxKeywords) {
      toast.error(`Keyword cap reached (${maxKeywords} per location)`);
      return;
    }
    if (allRows.some((r) => r.keyword === kw)) {
      toast.error("Already tracked for this location");
      return;
    }
    const entry: TrackedKeyword = {
      keyword: kw,
      status: "not_scanned",
      added_at: new Date().toISOString().slice(0, 10),
      in_geo_grid: false,
      in_local_ai: false,
      in_competitive: false,
      source: "synthetic",
    };
    addKeyword(slug, entry);
    addEntry({
      actor: "Agency Operator",
      role: "operator",
      verb: "create",
      action: `Added tracked keyword \u2014 "${kw}"`,
      resource: `keywords:${slug}`,
      location_slug: slug,
      detail: "Demo mode \u2014 write simulated",
    });
    setNewKw("");
    setAddOpen(false);
    toast.success(`"${kw}" added to tracking`, {
      description: "Tracked only \u2014 select and run a scan from the Geo-Grid",
    });
  };

  const openCustom = () => {
    if (!customFrom && !customTo) {
      setCustomFrom(range.from > "0001-01-01" ? range.from : "");
      setCustomTo(range.to < "9998-12-31" ? range.to : (anchor ?? ""));
    }
    setPreset("custom");
  };

  const presetChips: { id: Preset; label: string }[] = [
    { id: "7", label: "Last 7 days" },
    { id: "30", label: "Last 30" },
    { id: "90", label: "Last 90" },
    { id: "all", label: "All" },
  ];

  const em = <span className="text-muted-foreground">\u2014</span>;
  const notFound = <span className="text-muted-foreground/50 text-[11px] italic">not found</span>;
  const geoGridHref = `/locations/${slug}/geo-grid`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Keywords</h1>
          <p className="text-muted-foreground mt-1 text-[13px]">
            Rank tracking for {locationName} \u2014 add keywords here, run scans from the Geo-Grid
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {presetChips.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPreset(p.id)}
              aria-pressed={preset === p.id}
              className={cn(
                "rounded-md px-2.5 py-1 text-[12px]",
                preset === p.id
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "border-border text-muted-foreground hover:bg-secondary border font-medium",
              )}
            >
              {p.label}
            </button>
          ))}
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                onClick={openCustom}
                aria-pressed={preset === "custom"}
                className={cn(
                  "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[12px]",
                  preset === "custom"
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "border-border text-muted-foreground hover:bg-secondary border font-medium",
                )}
              >
                <Icons.calendarRange
                  className="size-3.5"
                  aria-hidden
                />
                Custom
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="w-auto p-3"
            >
              <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.05em] uppercase">
                Custom range
              </p>
              <div className="mt-2 flex items-center gap-2">
                <label className="text-muted-foreground flex flex-col gap-1 text-[11px] font-medium">
                  From
                  <Input
                    type="date"
                    value={customFrom}
                    onChange={(e) => {
                      setCustomFrom(e.target.value);
                      setPreset("custom");
                    }}
                    className="num h-8 w-36 text-[12px]"
                  />
                </label>
                <label className="text-muted-foreground flex flex-col gap-1 text-[11px] font-medium">
                  To
                  <Input
                    type="date"
                    value={customTo}
                    onChange={(e) => {
                      setCustomTo(e.target.value);
                      setPreset("custom");
                    }}
                    className="num h-8 w-36 text-[12px]"
                  />
                </label>
              </div>
              <p className="text-muted-foreground mt-2 text-[11px]">
                Filters which scan cycles count toward trend and change
              </p>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="gap-1 p-4">
          <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.05em] uppercase">
            Tracked keywords
          </p>
          <p className="num text-2xl font-bold">{derived.length}</p>
          <p className="text-muted-foreground text-[12px]">
            of <span className="num">{maxKeywords}</span> per location
          </p>
        </Card>
        <Card className="gap-1 p-4">
          <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.05em] uppercase">
            Scanned
          </p>
          <p className="num text-2xl font-bold">{scannedCount}</p>
          <p className="text-muted-foreground text-[12px]">
            with geo-grids \u00b7 <span className="num">{derived.length - scannedCount}</span>{" "}
            tracked only
          </p>
        </Card>
        <Card className="gap-1 p-4">
          <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.05em] uppercase">
            Net avg-rank change
          </p>
          {netChange == null ? (
            <p className="num text-muted-foreground text-2xl font-bold">\u2014</p>
          ) : Math.abs(netChange) < 0.05 ? (
            <p className="num text-muted-foreground text-2xl font-bold">0</p>
          ) : (
            <p
              className="num text-2xl font-bold"
              style={{ color: netChange > 0 ? IMPROVED : DECLINED }}
            >
              {netChange > 0 ? "\u25b2" : "\u25bc"} {fmtMagnitude(netChange)}
            </p>
          )}
          <p className="text-muted-foreground text-[12px]">
            positions vs first scan in range \u00b7 <span className="num">{deltas.length}</span>{" "}
            keywords
          </p>
        </Card>
        <Card className="gap-1 p-4">
          <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.05em] uppercase">
            Top-3 grids
          </p>
          <p
            className="num text-2xl font-bold"
            style={{ color: IMPROVED }}
          >
            {top3Grids}
          </p>
          <p className="text-muted-foreground text-[12px]">
            latest in-range avg rank \u2264 <span className="num">3</span>
          </p>
        </Card>
      </div>

      <Card className="gap-3 p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-base font-semibold">Average Map-Pack rank trend</h2>
          {chart.points.length > 0 && (
            <span className="num text-muted-foreground text-[12px]">
              {fmtDateShort(chart.points[0].date)} \u2013{" "}
              {fmtDateShort(chart.points[chart.points.length - 1].date)}
            </span>
          )}
        </div>
        {chart.points.length >= 2 ? (
          <TrendChart points={chart.points} />
        ) : (
          <div className="relative">
            <div className="absolute top-2 right-2 z-10 rounded-full border border-yellow-500/40 bg-yellow-500/10 px-2.5 py-0.5 text-[10.5px] font-bold tracking-wide text-yellow-700 uppercase dark:text-yellow-100">
              Demo preview
            </div>
            <div
              aria-hidden
              className="opacity-80"
            >
              <TrendChart points={DEMO_TREND_POINTS} />
            </div>
          </div>
        )}
        {chart.points.length >= 2 ? (
          <p className="text-muted-foreground text-[12px]">
            avg rank across <span className="num">{chart.n}</span> scanned keywords \u00b7 lower is
            better
          </p>
        ) : (
          <p className="text-muted-foreground text-[12px]">
            <span className="font-semibold text-yellow-700 dark:text-yellow-100">
              Demo data for illustration only
            </span>{" "}
            \u2014 this sample curve shows what the trend looks like once cycles accrue. Your real
            trend replaces it automatically after the next weekly scan.
          </p>
        )}
      </Card>

      <Card className="gap-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="relative">
            <Icons.search
              className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2"
              aria-hidden
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search keywords\u2026"
              aria-label="Search keywords"
              className="h-9 w-64 pl-8"
            />
          </div>
          <div className="flex items-center gap-3">
            <p className="text-muted-foreground text-[12px]">
              <span className="num">{visible.length}</span> of{" "}
              <span className="num">{derived.length}</span> keywords
            </p>
            {role === "operator" && (
              <Button
                size="sm"
                onClick={() => setAddOpen(true)}
              >
                <Icons.add className="size-4" />
                Add keyword
              </Button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="w-8"
                  aria-label="Starred"
                />
                <TableHead>Keyword</TableHead>
                <TableHead>Location</TableHead>
                <SortableHead
                  label="Google"
                  active={sort.key === "rank"}
                  dir={sort.dir}
                  onClick={() => toggleSort("rank")}
                />
                <SortableHead
                  label="Google Change"
                  active={sort.key === "change"}
                  dir={sort.dir}
                  onClick={() => toggleSort("change")}
                />
                <TableHead className="text-right">Bing</TableHead>
                <TableHead className="text-right">Bing Change</TableHead>
                <TableHead className="text-right">Google Local</TableHead>
                <TableHead>Trend</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((r) => {
                const isStarred = starred.has(r.keyword);
                const rounded = r.rank != null ? Math.round(r.rank) : null;
                return (
                  <TableRow key={r.keyword}>
                    <TableCell className="w-8">
                      <button
                        type="button"
                        onClick={() => toggleStar(r.keyword)}
                        aria-label={isStarred ? `Unstar ${r.keyword}` : `Star ${r.keyword}`}
                        aria-pressed={isStarred}
                        className="hover:bg-secondary flex items-center justify-center rounded p-0.5"
                      >
                        <Icons.star
                          className={cn("size-4", !isStarred && "text-muted-foreground")}
                          style={isStarred ? { fill: STAR_AMBER, color: STAR_AMBER } : undefined}
                          aria-hidden
                        />
                      </button>
                    </TableCell>
                    <TableCell className="font-medium">
                      <span className="flex flex-wrap items-center gap-1.5">
                        {r.scanned ? (
                          <Link
                            href={geoGridHref}
                            className="hover:text-blue-600 hover:underline"
                          >
                            {r.keyword}
                          </Link>
                        ) : (
                          r.keyword
                        )}
                        {r.usage.grid && <UsageChip label="Grid" />}
                        {r.usage.ai && <UsageChip label="AI" />}
                        {r.usage.comp && <UsageChip label="Comp" />}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-[12.5px] whitespace-nowrap">
                      {locationLabel}
                    </TableCell>
                    <TableCell className="text-right">
                      {r.gRank != null ? (
                        <span className="num font-semibold">{ordinal(r.gRank)}</span>
                      ) : (
                        notFound
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DeltaValue value={r.gDelta} />
                    </TableCell>
                    <TableCell className="text-right">
                      {r.bRank != null ? (
                        <span className="num font-semibold">{ordinal(r.bRank)}</span>
                      ) : (
                        notFound
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DeltaValue value={r.bDelta} />
                    </TableCell>
                    <TableCell className="text-right">
                      {r.scanned ? (
                        <span className="inline-flex items-center gap-1.5">
                          {rounded != null ? (
                            <span
                              className="num font-semibold"
                              style={{
                                color: RANK_BAND_COLOR[rankBand(rounded)],
                              }}
                            >
                              {ordinal(rounded)}
                            </span>
                          ) : (
                            em
                          )}
                          <StatusPill tone="success">Grid</StatusPill>
                        </span>
                      ) : (
                        <span className="text-muted-foreground/50 text-[11px] italic">
                          not in grid
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <MiniSpark
                        values={r.inRange.filter((s) => s.avg != null).map((s) => s.avg as number)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      {r.scanned ? (
                        <Link
                          href={geoGridHref}
                          className="text-[13px] font-medium whitespace-nowrap text-blue-600 hover:underline"
                        >
                          View grid \u2192
                        </Link>
                      ) : (
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                        >
                          <Link
                            href={geoGridHref}
                            className="whitespace-nowrap"
                          >
                            Add to grid \u2192
                          </Link>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {visible.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="text-muted-foreground py-8 text-center text-[13px]"
                  >
                    No keywords match &ldquo;{query}&rdquo;
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <p className="text-muted-foreground text-[11px]">
          Adding a keyword tracks it only \u2014 scans are selected and run from the Geo-Grid
          screen. Session adds are simulated (demo mode).
        </p>
        <p className="text-muted-foreground text-[11px]">
          Google &amp; Bing organic positions tracked weekly \u2014 DataForSEO serp/google/organic +
          serp/bing/organic in live mode. Google Local = this keyword&rsquo;s geo-grid average.
        </p>
      </Card>

      <Dialog
        open={addOpen}
        onOpenChange={setAddOpen}
      >
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Add tracked keyword</DialogTitle>
            <DialogDescription>
              Tracking only \u2014 adding never runs a scan. Select and run scans from the Geo-Grid
              screen.
            </DialogDescription>
          </DialogHeader>
          <Input
            autoFocus
            value={newKw}
            onChange={(e) => setNewKw(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitAdd()}
            placeholder="e.g. sinus specialist madison"
            className="h-10"
          />
          <p className="text-muted-foreground text-[11px]">
            Demo mode \u2014 keyword add simulated (session only) \u00b7{" "}
            <span className="num">{allRows.length}</span>/<span className="num">{maxKeywords}</span>{" "}
            used
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={submitAdd}
              disabled={!newKw.trim()}
            >
              <Icons.add className="size-4" />
              Add keyword
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DeltaValue({ value }: { value: number | null }) {
  if (value == null) return <span className="text-muted-foreground">\u2014</span>;
  if (Math.abs(value) < 0.05) return <span className="num text-muted-foreground">0</span>;
  return (
    <span
      className="num font-semibold"
      style={{ color: value > 0 ? IMPROVED : DECLINED }}
    >
      {value > 0 ? "\u25b2" : "\u25bc"}
      {fmtMagnitude(value)}
    </span>
  );
}

function UsageChip({ label }: { label: string }) {
  return (
    <span className="bg-secondary text-muted-foreground rounded px-1 py-px text-[10px] font-semibold tracking-wide uppercase">
      {label}
    </span>
  );
}

function SortableHead({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: "asc" | "desc";
  onClick: () => void;
}) {
  return (
    <TableHead
      className="text-right"
      aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : "none"}
    >
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "hover:text-foreground inline-flex items-center justify-end gap-1",
          active && "text-foreground",
        )}
      >
        {label}
        {active ? (
          dir === "asc" ? (
            <Icons.chevronRight
              className="size-3 rotate-90"
              aria-hidden
            />
          ) : (
            <Icons.chevronRight
              className="size-3 -rotate-90"
              aria-hidden
            />
          )
        ) : (
          <Icons.chevronsUpDown
            className="size-3 opacity-40"
            aria-hidden
          />
        )}
      </button>
    </TableHead>
  );
}

function MiniSpark({ values }: { values: number[] }) {
  if (values.length < 2) return <span className="text-muted-foreground">\u2014</span>;
  const w = 90;
  const h = 24;
  const pad = 3;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values
    .map((v, i) => {
      const x = pad + (i / (values.length - 1)) * (w - 2 * pad);
      const y = pad + ((v - min) / span) * (h - 2 * pad);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      role="img"
      aria-label={`Avg rank trend over ${values.length} in-range scans`}
      className="shrink-0"
    >
      <polyline
        points={pts}
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

const DEMO_TREND_POINTS: { date: string; value: number }[] = [
  { date: "2026-05-18", value: 9.6 },
  { date: "2026-05-25", value: 9.1 },
  { date: "2026-06-01", value: 8.2 },
  { date: "2026-06-08", value: 8.5 },
  { date: "2026-06-15", value: 7.1 },
  { date: "2026-06-22", value: 6.2 },
  { date: "2026-06-29", value: 5.5 },
  { date: "2026-07-06", value: 4.8 },
];

function TrendChart({ points }: { points: { date: string; value: number }[] }) {
  const svgRef = React.useRef<SVGSVGElement>(null);
  const lineRef = React.useRef<SVGPathElement>(null);
  const areaRef = React.useRef<SVGPathElement>(null);

  useGsapReveal(svgRef, () => {
    drawIn(lineRef.current, { duration: 1.1, ease: "power2.out" });
    if (areaRef.current)
      gsap.from(areaRef.current, {
        opacity: 0,
        duration: 0.6,
        delay: 0.6,
        ease: "power2.out",
      });
    gsap.from("circle", {
      opacity: 0,
      duration: 0.45,
      delay: 0.5,
      stagger: 0.04,
      ease: "power2.out",
    });
  });

  const W = 720;
  const H = 220;
  const padL = 34;
  const padR = 14;
  const padT = 12;
  const padB = 26;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const x = (i: number) =>
    padL + (points.length === 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
  const y = (r: number) => padT + ((Math.min(20, Math.max(1, r)) - 1) / 19) * innerH;
  const line = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`)
    .join(" ");
  const area = `${line} L${x(points.length - 1).toFixed(1)},${H - padB} L${x(0).toFixed(1)},${H - padB} Z`;
  const ticks = [1, 5, 10, 20];
  const labelStep = Math.max(1, Math.ceil(points.length / 8));
  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`Average Map-Pack rank across ${points.length} scan dates \u2014 rank 1 at top, lower is better`}
      className="block w-full"
    >
      {ticks.map((t) => (
        <g key={t}>
          <line
            x1={padL}
            y1={y(t)}
            x2={W - padR}
            y2={y(t)}
            stroke="var(--border)"
            strokeWidth="1"
            opacity="0.7"
          />
          <text
            x={padL - 8}
            y={y(t) + 3.5}
            textAnchor="end"
            fontSize="10"
            className="num text-muted-foreground fill-current"
          >
            {t}
          </text>
        </g>
      ))}
      <path
        ref={areaRef}
        d={area}
        fill="var(--color-primary)"
        opacity="0.08"
      />
      <path
        ref={lineRef}
        d={line}
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {points.map((p, i) => (
        <circle
          key={p.date}
          cx={x(i)}
          cy={y(p.value)}
          r="3"
          fill="var(--color-primary)"
          stroke="var(--card)"
          strokeWidth="1.5"
        >
          <title>{`${fmtDateShort(p.date)} \u00b7 avg ${p.value}`}</title>
        </circle>
      ))}
      {points.map((p, i) =>
        i % labelStep === 0 || i === points.length - 1 ? (
          <text
            key={`x-${p.date}`}
            x={x(i)}
            y={H - 8}
            textAnchor="middle"
            fontSize="10"
            className="num text-muted-foreground fill-current"
          >
            {fmtDateShort(p.date)}
          </text>
        ) : null,
      )}
    </svg>
  );
}
