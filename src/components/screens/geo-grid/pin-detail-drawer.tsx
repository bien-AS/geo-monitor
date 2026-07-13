"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight, ExternalLink, MapPin, Star, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { fmtDateShort, fmtInt, rankBand, RANK_BAND_COLOR, RANK_BAND_LABEL } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Sparkline } from "@/components/local/sparkline";
import { SourceBadge } from "@/components/local/source-badge";
import { SurfaceListRows } from "./surface-row";
import {
  bearingLabel,
  distanceMiles,
  nonBaptistRivals,
  hasDerivedRanks,
  RANK_FIELD_LABEL,
  type GeoLocationSlim,
  type KeywordGrid,
  type LocalAISummary,
  type PaaQuestion,
  type RankField,
  type SnapshotData,
} from "./helpers";

export interface PinSelection {
  index: number;
  cellLabel: string;
}

export interface PinDetailProps {
  selection: PinSelection;
  grid: KeywordGrid;
  snapshot: SnapshotData;
  prevSnapshot: SnapshotData | null;
  location: GeoLocationSlim;
  localAI: LocalAISummary | null;
  paas: PaaQuestion[];
  onPaaClick: (paa: PaaQuestion) => void;
  onViewSerp: () => void;
  onClose: () => void;
}

function RankStackRow({
  label,
  value,
  pending,
}: {
  label: string;
  value: number | null;
  pending?: boolean;
}) {
  if (pending) {
    return (
      <div className="border-border mb-1.5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 rounded-md border border-dashed px-3 py-2">
        <span className="text-muted-foreground text-[11px] font-semibold">{label}</span>
        <span className="text-muted-foreground text-[10px]">next live scan cycle</span>
      </div>
    );
  }
  const band = rankBand(value);
  const color = RANK_BAND_COLOR[band];
  return (
    <div
      className="mb-1.5 grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-x-2.5 rounded-md px-3 py-2"
      style={{
        background: `${color}12`,
        borderLeft: `3px solid ${color}`,
      }}
    >
      <span className="text-foreground text-[11px] font-semibold">{label}</span>
      <span
        className="text-[9.5px] font-semibold tracking-wider uppercase"
        style={{ color }}
      >
        {RANK_BAND_LABEL[band]}
      </span>
      <span className="num text-foreground min-w-8 text-right text-[19px] leading-none font-bold">
        {value == null ? "NR" : value}
      </span>
    </div>
  );
}

export function PinDetailPanel({
  selection,
  grid,
  snapshot,
  location,
  localAI,
  paas,
  onPaaClick,
  onViewSerp,
  onClose,
}: PinDetailProps) {
  const pin = snapshot.pins[selection.index];
  if (!pin) return null;

  const dist = distanceMiles(location.lat, location.lng, pin.lat, pin.lng);
  const dir = bearingLabel(location.lat, location.lng, pin.lat, pin.lng);
  const rivals = nonBaptistRivals(snapshot, location).slice(0, 3);
  const derived = hasDerivedRanks(snapshot);

  const pinKey = `${pin.lat.toFixed(4)},${pin.lng.toFixed(4)}`;
  const history = grid.snapshots
    .map((s) => {
      const match =
        s.pins.find((p) => `${p.lat.toFixed(4)},${p.lng.toFixed(4)}` === pinKey) ??
        s.pins[selection.index];
      return match?.rank != null ? { date: s.date, rank: match.rank } : null;
    })
    .filter((h): h is { date: string; rank: number } => h !== null);
  const sparkData = history.length >= 2 ? history.map((h) => -h.rank) : null;

  const rankRows: { field: RankField; value: number | null; pending: boolean }[] = [
    { field: "rank", value: pin.rank, pending: false },
    { field: "local_finder_rank", value: pin.local_finder_rank, pending: !derived },
    { field: "organic_rank", value: pin.organic_rank, pending: !derived },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-border shrink-0 border-b px-4 pt-4 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
              Geo-grid cell
            </p>
            <p className="mt-0.5 flex flex-wrap items-baseline gap-2">
              <span className="num text-foreground text-[22px] leading-none font-bold">
                {selection.cellLabel}
              </span>
              <span className="text-muted-foreground text-[12px]">
                <span className="num font-semibold">{dist.toFixed(1)} mi</span> {dir} of business
              </span>
            </p>
            <p className="text-muted-foreground mt-1 flex items-center gap-1 text-[11px]">
              <MapPin
                className="size-3"
                aria-hidden
              />
              <span className="num">
                {pin.lat.toFixed(4)}, {pin.lng.toFixed(4)}
              </span>
            </p>
          </div>
          <button
            type="button"
            aria-label="Close cell detail"
            onClick={onClose}
            className="text-muted-foreground hover:bg-secondary hover:text-foreground rounded-md p-1.5"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="flex flex-col gap-4">
          <section>
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                Ranks at this point
              </p>
              <SourceBadge
                source={grid.source}
                note={
                  grid.pinsSource === "dataforseo"
                    ? "All three surfaces measured per pin — every value is a real geo-located query (GeoScan engine)"
                    : derived
                      ? "Map-pack rank is the scan value; Local Finder / Organic are derived demo offsets"
                      : undefined
                }
              />
            </div>
            {rankRows.map((r) => (
              <RankStackRow
                key={r.field}
                label={RANK_FIELD_LABEL[r.field]}
                value={r.value}
                pending={r.field !== "rank" && r.pending}
              />
            ))}
            <p className="text-muted-foreground text-[11px]">
              Keyword <span className="num">{grid.keyword}</span> · scanned{" "}
              <span className="num">{fmtDateShort(snapshot.date)}</span>
            </p>
            {pin.rank == null && (
              <p className="bg-secondary text-muted-foreground mt-2 rounded-md p-2 text-[12px]">
                This point isn&apos;t ranking in the top 20 — a strong content-gap candidate.
              </p>
            )}
          </section>

          <section className="border-border rounded-lg border p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                Rank across cycles
              </p>
              {history.length >= 2 && (
                <span className="num text-muted-foreground text-[10px]">
                  {history.length} cycles
                </span>
              )}
            </div>
            {sparkData ? (
              <>
                <Sparkline
                  data={sparkData}
                  height={44}
                  ariaLabel={`Rank across ${history.length} cycles, from ${history[0].rank} to ${history[history.length - 1].rank} (up is better)`}
                  className="mt-2"
                />
                <div className="text-muted-foreground mt-1 flex items-center justify-between text-[11px]">
                  <span>
                    <span className="num">{fmtDateShort(history[0].date)}</span> · rank{" "}
                    <span className="num">{history[0].rank}</span>
                  </span>
                  <span aria-hidden>↑ better</span>
                  <span>
                    <span className="num">{fmtDateShort(history[history.length - 1].date)}</span> ·
                    rank <span className="num">{history[history.length - 1].rank}</span>
                  </span>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground mt-2 text-[12px]">
                Second scan cycle pending — the per-cell trend appears after the next weekly
                refresh.
              </p>
            )}
          </section>

          <section className="border-border rounded-lg border p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                Top competitors near this cell
              </p>
              <SourceBadge source={grid.source} />
            </div>
            {rivals.length > 0 ? (
              <ul className="divide-border mt-1 flex flex-col divide-y">
                {rivals.map((c, i) => (
                  <li
                    key={c.title}
                    className="py-2"
                  >
                    <Link
                      href={`/locations/${location.slug}/competitive`}
                      className="group flex items-center gap-2.5 rounded-md focus-visible:outline-none"
                    >
                      <span className="num text-muted-foreground w-5 shrink-0 text-[10px] font-bold">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="text-foreground group-hover:text-primary block truncate text-[12.5px] font-medium">
                          {c.title}
                        </span>
                        <span className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
                          {c.rating != null && (
                            <>
                              <span className="num">{c.rating.toFixed(1)}</span>
                              <Star
                                className="size-2.5 fill-yellow-500 text-yellow-500"
                                aria-hidden
                              />
                            </>
                          )}
                          {c.reviews != null && <span className="num">({fmtInt(c.reviews)})</span>}
                          <span>
                            · top-3 in <span className="num">{c.top3_count}</span> cells
                          </span>
                        </span>
                      </span>
                      <span className="flex shrink-0 items-center gap-1">
                        <span
                          className="num flex size-6 items-center justify-center rounded-full text-[11px] font-bold text-white"
                          style={{
                            background: RANK_BAND_COLOR[rankBand(Math.round(c.avg_position))],
                          }}
                        >
                          {Math.round(c.avg_position)}
                        </span>
                        <ChevronRight
                          className="text-muted-foreground size-4"
                          aria-hidden
                        />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground mt-2 text-[12px]">
                No rival aggregates stored for this cycle.
              </p>
            )}
          </section>

          {localAI && (
            <section className="border-border rounded-lg border p-3">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <p className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                  Local AI · this location
                </p>
                <SourceBadge source={localAI.source} />
              </div>
              <SurfaceListRows surfaces={localAI.surfaces} />
              <p className="text-muted-foreground mt-2 text-[11px]">
                Location-level presence (per-cell AI sampling is a Phase 2 overlay)
              </p>
            </section>
          )}

          <section className="border-border rounded-lg border p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                Patients also ask ({paas.length})
              </p>
              <SourceBadge
                source="synthetic"
                note="Questions composed from the keyword + facility type + city"
              />
            </div>
            <ul className="mt-2 flex flex-col gap-1.5">
              {paas.map((paa, i) => (
                <li key={paa.id}>
                  <button
                    type="button"
                    onClick={() => onPaaClick(paa)}
                    className={cn(
                      "border-border bg-card flex w-full items-start gap-2 rounded-md border px-2.5 py-2 text-left",
                      "hover:border-primary/30 hover:bg-primary/5",
                    )}
                  >
                    <span className="num text-muted-foreground mt-0.5 shrink-0 text-[10px] font-bold">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0">
                      <span className="text-foreground block text-[12px] leading-snug">
                        {paa.question}
                      </span>
                      <span className="text-primary mt-0.5 block text-[11px] font-semibold">
                        Inspect question
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <div className="border-border bg-muted/30 flex shrink-0 items-center gap-2 border-t px-4 py-3">
        <Button
          size="sm"
          onClick={onViewSerp}
        >
          <ExternalLink className="size-3.5" />
          View live SERP
        </Button>
        <Button
          variant="outline"
          size="sm"
          asChild
        >
          <Link href={`/locations/${location.slug}/local-ai`}>Local AI detail</Link>
        </Button>
      </div>
    </div>
  );
}

export function PinDetailDrawer({
  open,
  onOpenChange,
  ...panel
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
} & PinDetailProps) {
  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
    >
      <SheetContent
        side="right"
        className="w-full gap-0 p-0 sm:max-w-[400px]"
      >
        <SheetTitle className="sr-only">Cell {panel.selection.cellLabel} detail</SheetTitle>
        <PinDetailPanel {...panel} />
      </SheetContent>
    </Sheet>
  );
}
