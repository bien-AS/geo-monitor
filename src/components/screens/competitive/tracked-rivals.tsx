"use client";

import { ChevronRight, Star, Swords } from "lucide-react";
import { cn } from "@/lib/utils";
import { fmtInt } from "@/lib/format";
import type { DataSource } from "@/lib/data/types";
import { Card } from "@/components/ui/card";
import { SourceBadge } from "@/components/local/source-badge";
import { StatusPill } from "@/components/local/status-pill";
import type { RivalRecord } from "@/lib/competitive-derive";

export function TrackedRivals({
  rivals,
  rosterSource,
  onSelect,
}: {
  rivals: RivalRecord[];
  rosterSource: DataSource | null;
  onSelect: (rivalId: string) => void;
}) {
  const roster = rivals.filter((r) => r.rosterSource != null);

  return (
    <Card className="gap-0 overflow-hidden p-0">
      <div className="border-border flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
        <div>
          <p className="eyebrow text-text-tertiary">Rival roster</p>
          <h2 className="text-foreground mt-0.5 flex items-center gap-1.5 text-[15px] font-semibold">
            <Swords
              className="text-text-tertiary size-4"
              aria-hidden
            />
            Tracked rivals
          </h2>
        </div>
        {rosterSource && (
          <SourceBadge
            source={rosterSource}
            note="Roster mixes real Google 'people also search' seeds (DataForSEO) with synthetic system rivals — open a row for provenance"
          />
        )}
      </div>

      {roster.length === 0 ? (
        <div className="flex flex-col items-center gap-2 p-8 text-center">
          <span
            aria-hidden
            className="flex items-center gap-1.5"
          >
            <span className="bg-primary-200 size-3.5 rotate-45" />
            <span className="size-3.5 rotate-45 bg-cyan-200" />
          </span>
          <h3 className="text-sm font-semibold">No rivals tracked yet</h3>
          <p className="text-text-secondary max-w-sm text-[12px]">
            Run a competitive scan to seed the roster from Google&apos;s &ldquo;people also
            search&rdquo; data for this location.
          </p>
        </div>
      ) : (
        <ul className="divide-border-subtle flex flex-col divide-y">
          {roster.map((r, i) => {
            const gridTop3 = r.gridPresence.reduce((s, k) => s + k.top3, 0);
            return (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => onSelect(r.id)}
                  aria-label={`Open rival profile: ${r.name}`}
                  className={cn(
                    "group flex min-h-11 w-full items-center gap-3 px-4 py-2.5 text-left",
                    "hover:bg-secondary/60 focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset",
                  )}
                >
                  <span className="num text-text-tertiary w-5 shrink-0 text-[12px] font-bold">
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-1.5">
                      <span className="text-foreground group-hover:text-text-link truncate text-[13px] font-medium">
                        {r.name.replace(/_/g, " ")}
                      </span>
                      {i === 0 && (
                        <StatusPill
                          tone="warning"
                          icon={Swords}
                        >
                          Top rival
                        </StatusPill>
                      )}
                    </span>
                    <span className="text-text-tertiary mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px]">
                      {r.category && <span>{r.category}</span>}
                      {r.rating != null && (
                        <span className="flex items-center gap-0.5">
                          <span className="num text-foreground font-semibold">
                            {r.rating.toFixed(1)}
                          </span>
                          <Star
                            className="fill-warning-500 text-warning-500 size-2.5"
                            aria-hidden
                          />
                          {r.votes != null && <span className="num">×{fmtInt(r.votes)}</span>}
                        </span>
                      )}
                      {r.distanceMi != null && r.distanceMi > 0 && (
                        <span>
                          <span className="num">{r.distanceMi.toFixed(1)}</span> mi away
                        </span>
                      )}
                      {!r.category && r.rating == null && (
                        <span>
                          Google &ldquo;people also search&rdquo; seed — metrics land with the next
                          scan cycle
                        </span>
                      )}
                    </span>
                  </span>

                  <span className="hidden w-24 shrink-0 flex-col items-end sm:flex">
                    <span className="eyebrow text-text-tertiary">Map pack</span>
                    {gridTop3 > 0 ? (
                      <span className="num text-foreground text-[13px] font-semibold">
                        {fmtInt(gridTop3)}{" "}
                        <span className="text-text-tertiary text-[10px] font-normal">
                          top-3 cells
                        </span>
                      </span>
                    ) : r.mapPackWins != null ? (
                      <span className="num text-foreground text-[13px] font-semibold">
                        {fmtInt(r.mapPackWins)}{" "}
                        <span className="text-text-tertiary text-[10px] font-normal">wins</span>
                      </span>
                    ) : (
                      <span className="text-text-disabled text-[12px]">&mdash;</span>
                    )}
                  </span>

                  <span className="hidden w-24 shrink-0 flex-col items-end sm:flex">
                    <span className="eyebrow text-text-tertiary">AI answers</span>
                    {r.aiAnswerWins ? (
                      <span className="num text-foreground text-[13px] font-semibold">
                        {fmtInt(r.aiAnswerWins.count)}{" "}
                        <span className="text-text-tertiary text-[10px] font-normal">
                          citations
                        </span>
                      </span>
                    ) : r.aiCitations != null ? (
                      <span className="num text-foreground text-[13px] font-semibold">
                        {fmtInt(r.aiCitations)}{" "}
                        <span className="text-text-tertiary text-[10px] font-normal">tracked</span>
                      </span>
                    ) : (
                      <span className="text-text-disabled text-[12px]">&mdash;</span>
                    )}
                  </span>

                  <ChevronRight
                    className="text-text-tertiary size-4 shrink-0"
                    aria-hidden
                  />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
