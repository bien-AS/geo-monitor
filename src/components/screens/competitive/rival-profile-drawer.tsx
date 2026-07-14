"use client";

import Link from "next/link";
import { ArrowUpRight, ExternalLink, MapPin, Sparkles, Star } from "lucide-react";
import { fmtDateShort, fmtInt, rankBand, RANK_BAND_COLOR } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { SourceBadge } from "@/components/local/source-badge";
import type { RivalRecord } from "@/lib/competitive-derive";
import { YouPill } from "./you-pill";

function CompareBar({
  label,
  you,
  rival,
  max,
  youLabel,
  rivalLabel,
}: {
  label: string;
  you: number;
  rival: number;
  max: number;
  youLabel: string;
  rivalLabel: string;
}) {
  const denom = Math.max(1, max);
  return (
    <div>
      <p className="eyebrow text-text-tertiary">{label}</p>
      <div className="mt-1.5 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="flex w-10 shrink-0 items-center">
            <YouPill />
          </span>
          <span className="bg-secondary h-2 flex-1 overflow-hidden rounded-full">
            <span
              className="bg-primary-500 block h-full rounded-full"
              style={{ width: `${(you / denom) * 100}%` }}
            />
          </span>
          <span className="num w-16 shrink-0 text-right text-[12px] font-bold">{youLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-text-tertiary w-10 shrink-0 text-[10px] font-semibold tracking-[0.05em] uppercase">
            Rival
          </span>
          <span className="bg-secondary h-2 flex-1 overflow-hidden rounded-full">
            <span
              className="block h-full rounded-full bg-neutral-400 dark:bg-neutral-500"
              style={{ width: `${(rival / denom) * 100}%` }}
            />
          </span>
          <span className="num w-16 shrink-0 text-right text-[12px] font-bold">{rivalLabel}</span>
        </div>
      </div>
    </div>
  );
}

export function RivalProfileDrawer({
  open,
  onOpenChange,
  rival,
  you,
  slug,
  allKeywords,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rival: RivalRecord | null;
  you: RivalRecord;
  slug: string;
  allKeywords: string[];
}) {
  if (!rival) return null;

  const youTop3 = you.gridPresence.reduce((s, k) => s + k.top3, 0);
  const rivalTop3 = rival.gridPresence.reduce((s, k) => s + k.top3, 0);
  const keywords = [
    ...new Set([
      ...allKeywords,
      ...you.gridPresence.map((k) => k.keyword),
      ...rival.gridPresence.map((k) => k.keyword),
    ]),
  ];

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
    >
      <SheetContent
        side="right"
        className="w-full gap-0 overflow-y-auto sm:max-w-[420px]"
      >
        <SheetHeader className="border-border border-b pb-4">
          <SheetTitle className="pr-8 text-base">{rival.name}</SheetTitle>
          <SheetDescription asChild>
            <div className="flex flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px]">
                {rival.category && <span>{rival.category}</span>}
                {rival.rating != null && (
                  <span className="flex items-center gap-1">
                    <span className="num text-foreground font-semibold">
                      {rival.rating.toFixed(1)}
                    </span>
                    <Star
                      className="fill-warning-500 text-warning-500 size-3"
                      aria-hidden
                    />
                    {rival.votes != null && (
                      <span className="num">&times;{fmtInt(rival.votes)}</span>
                    )}
                  </span>
                )}
                {rival.distanceMi != null && rival.distanceMi > 0 && (
                  <span className="flex items-center gap-1">
                    <MapPin
                      className="size-3"
                      aria-hidden
                    />
                    <span className="num">{rival.distanceMi.toFixed(1)} mi</span>
                    &nbsp;away
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {rival.rosterSource && (
                  <SourceBadge
                    source={rival.rosterSource}
                    note={
                      rival.rosterSource === "dataforseo"
                        ? "Real Google 'people also search' seed — name, CID, rating and review count are live-snapshotted"
                        : "Synthetic system rival — distance and tracker counters are demo data"
                    }
                  />
                )}
                {!rival.rosterSource && rival.gridPresence[0] && (
                  <SourceBadge
                    source={rival.gridPresence[0].gridSource}
                    note="Surfaced by the geo-grid competitor aggregates"
                  />
                )}
              </div>
            </div>
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 px-4 py-4">
          <section className="border-border rounded-lg border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="eyebrow text-text-tertiary">Map-pack presence by keyword</p>
              {rival.gridPresence[0] && <SourceBadge source={rival.gridPresence[0].gridSource} />}
            </div>
            {keywords.length === 0 ? (
              <p className="text-text-secondary mt-2 text-[12px]">
                No grid aggregates stored yet — run a geo-grid scan to see where this rival ranks
                around you.
              </p>
            ) : (
              <ul className="divide-border-subtle mt-2 flex flex-col divide-y">
                {keywords.map((kw) => {
                  const p = rival.gridPresence.find((k) => k.keyword === kw);
                  return (
                    <li
                      key={kw}
                      className="py-2"
                    >
                      <p className="text-foreground text-[12px] font-medium">{kw}</p>
                      {p ? (
                        <div className="text-text-tertiary mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px]">
                          <span>
                            Avg position{" "}
                            <span
                              className="num font-bold"
                              style={{
                                color:
                                  RANK_BAND_COLOR[rankBand(Math.max(1, Math.round(p.avgPosition)))],
                              }}
                            >
                              {p.avgPosition.toFixed(1)}
                            </span>
                          </span>
                          <span>
                            Appears in{" "}
                            <span className="num text-foreground font-semibold">
                              {fmtInt(p.appearances)}
                            </span>
                            /<span className="num">{fmtInt(p.totalPins)}</span> cells
                          </span>
                          <span>
                            Top-3 in{" "}
                            <span className="num text-foreground font-semibold">
                              {fmtInt(p.top3)}
                            </span>{" "}
                            cells
                          </span>
                          <span>
                            Scanned <span className="num">{fmtDateShort(p.date)}</span>
                          </span>
                        </div>
                      ) : (
                        <p className="text-text-tertiary mt-1 text-[11px]">
                          Not in the tracked pack on this keyword&apos;s grid.
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="border-border rounded-lg border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="eyebrow text-text-tertiary">AI answers</p>
              <Sparkles
                className="text-text-tertiary size-3.5"
                aria-hidden
              />
            </div>
            <div className="mt-2 flex flex-col gap-2">
              {rival.aiAnswerWins ? (
                <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
                  <p className="text-text-secondary">
                    <span className="num text-foreground font-semibold">
                      {rival.aiAnswerWins.domain}
                    </span>{" "}
                    cited in{" "}
                    <span className="num text-foreground font-semibold">
                      {fmtInt(rival.aiAnswerWins.count)}
                    </span>{" "}
                    of <span className="num">{fmtInt(rival.aiAnswerWins.totalChecks)}</span> AI
                    answer checks
                  </p>
                  <SourceBadge
                    source="dataforseo"
                    note="Matched from the local AI prompt checks' cited sources"
                  />
                </div>
              ) : null}
              {rival.aiCitations != null && (
                <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
                  <p className="text-text-secondary">
                    Tracked AI citations:{" "}
                    <span className="num text-foreground font-semibold">
                      {fmtInt(rival.aiCitations)}
                    </span>
                  </p>
                  <SourceBadge
                    source="synthetic"
                    note="Synthetic tracker counter on the demo roster"
                  />
                </div>
              )}
              {!rival.aiAnswerWins && rival.aiCitations == null && (
                <p className="text-text-secondary text-[12px]">
                  This rival isn&apos;t a cited source in the tracked AI answers yet.
                </p>
              )}
            </div>
          </section>

          <section className="border-border flex flex-col gap-4 rounded-lg border p-4">
            <p className="eyebrow text-text-tertiary">Head-to-head vs you</p>
            {you.rating != null && rival.rating != null && (
              <CompareBar
                label="Google rating"
                you={you.rating}
                rival={rival.rating}
                max={5}
                youLabel={`${you.rating.toFixed(1)} ×${fmtInt(you.votes ?? 0)}`}
                rivalLabel={`${rival.rating.toFixed(1)} ×${fmtInt(rival.votes ?? 0)}`}
              />
            )}
            {(youTop3 > 0 || rivalTop3 > 0) && (
              <CompareBar
                label="Top-3 grid cells (all keywords)"
                you={youTop3}
                rival={rivalTop3}
                max={Math.max(youTop3, rivalTop3)}
                youLabel={fmtInt(youTop3)}
                rivalLabel={fmtInt(rivalTop3)}
              />
            )}
            {you.rating == null && youTop3 === 0 && rivalTop3 === 0 && (
              <p className="text-text-secondary text-[12px]">
                Not enough shared data for a head-to-head yet.
              </p>
            )}
          </section>
        </div>

        <div className="border-border bg-background sticky bottom-0 mt-auto flex flex-wrap items-center gap-2 border-t px-4 py-3">
          <Button
            size="sm"
            asChild
          >
            <Link href={`/locations/${slug}/geo-grid`}>See them on the grid</Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <Link href={`/locations/${slug}/local-ai`}>See the AI answers</Link>
          </Button>
          {rival.googleCid && (
            <Button
              variant="outline"
              size="sm"
              asChild
            >
              <a
                href={`https://www.google.com/maps?cid=${rival.googleCid}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`View ${rival.name} on Google Maps (opens in a new tab)`}
              >
                <ExternalLink
                  className="size-3.5"
                  aria-hidden
                />
                View on Google
              </a>
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
