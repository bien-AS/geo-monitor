"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { fmtInt, fmtPct } from "@/lib/format";
import type { DataSource } from "@/lib/data/types";
import { Card } from "@/components/ui/card";
import { SourceBadge } from "@/components/local/source-badge";
import type { RivalRecord } from "@/lib/competitive-derive";
import { YouPill, YOU_NAME_CLS } from "./you-pill";

export function RatingStrip({
  you,
  rivals,
  responseRate,
  responseRateSource,
  onSelect,
}: {
  you: RivalRecord;
  rivals: RivalRecord[];
  responseRate: number | null;
  responseRateSource: DataSource | null;
  onSelect: (rivalId: string) => void;
}) {
  const rated = [you, ...rivals.filter((r) => r.rating != null)].filter((r) => r.rating != null);
  rated.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || (b.votes ?? 0) - (a.votes ?? 0));

  const sources: DataSource[] = [];
  for (const r of rated) {
    if (r.ratingSource && !sources.includes(r.ratingSource)) {
      sources.push(r.ratingSource);
    }
  }

  return (
    <Card className="gap-0 self-start p-0">
      <div className="border-border flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
        <div>
          <p className="eyebrow text-text-tertiary">Reputation</p>
          <h2 className="text-foreground mt-0.5 flex items-center gap-1.5 text-[15px] font-semibold">
            <Star
              className="text-text-tertiary size-4"
              aria-hidden
            />
            Rating comparison
          </h2>
        </div>
        <div className="flex items-center gap-1.5">
          {sources.map((s) => (
            <SourceBadge
              key={s}
              source={s}
              note="Real Google star ratings and review counts"
            />
          ))}
        </div>
      </div>

      {rated.length === 0 ? (
        <p className="text-text-secondary p-4 text-[12px]">
          No Google ratings on file for this competitive set yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-2.5 p-4">
          {rated.map((r) => {
            const row = (
              <>
                <span className="flex min-w-0 flex-1 items-center gap-1.5">
                  <span
                    className={cn(
                      "truncate text-[12px]",
                      r.isYou ? YOU_NAME_CLS : "text-text-secondary",
                    )}
                  >
                    {r.name}
                  </span>
                  {r.isYou && <YouPill />}
                </span>
                <span className="flex w-40 shrink-0 items-center gap-2">
                  <span className="bg-secondary h-2 flex-1 overflow-hidden rounded-full">
                    <span
                      className={cn(
                        "block h-full rounded-full",
                        r.isYou ? "bg-primary-500" : "bg-neutral-400 dark:bg-neutral-500",
                      )}
                      style={{ width: `${((r.rating ?? 0) / 5) * 100}%` }}
                    />
                  </span>
                  <span className="num w-7 text-right text-[12px] font-bold">
                    {(r.rating ?? 0).toFixed(1)}
                  </span>
                  <span className="num text-text-tertiary w-12 text-right text-[11px]">
                    &times;{fmtInt(r.votes ?? 0)}
                  </span>
                </span>
              </>
            );
            return (
              <li key={r.id}>
                {r.isYou ? (
                  <div className="border-primary-200 bg-primary-50 dark:border-primary-700 dark:bg-primary-500/15 flex min-h-8 items-center gap-2 rounded-md border px-2 py-1">
                    {row}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => onSelect(r.id)}
                    aria-label={`Open rival profile: ${r.name}`}
                    className="hover:bg-secondary/60 focus-visible:ring-ring flex min-h-8 w-full items-center gap-2 rounded-md px-2 py-1 text-left focus-visible:ring-2 focus-visible:outline-none"
                  >
                    {row}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {responseRate != null && (
        <div className="border-border flex flex-wrap items-center justify-between gap-2 border-t px-4 py-2.5">
          <p className="text-text-secondary text-[12px]">
            Your review response rate:{" "}
            <span className="num text-foreground font-semibold">{fmtPct(responseRate)}</span>
          </p>
          {responseRateSource && <SourceBadge source={responseRateSource} />}
        </div>
      )}
    </Card>
  );
}
