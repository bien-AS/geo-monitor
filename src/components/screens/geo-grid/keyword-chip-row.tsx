"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronDown, Plus, Radar } from "lucide-react";
import { cn } from "@/lib/utils";
import { rankBand, RANK_BAND_COLOR } from "@/lib/format";
import type { TrackedKeyword } from "@/lib/data/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserStore } from "@/store/user";
import type { KeywordGrid } from "./helpers";

const VISIBLE_SLOTS = 4;

function ScoreBubble({ avg }: { avg: number }) {
  return (
    <span
      className="num rounded-full px-1.5 py-0.5 text-[11px] font-bold text-white"
      style={{ background: RANK_BAND_COLOR[rankBand(Math.round(avg))] }}
    >
      {avg.toFixed(1)}
    </span>
  );
}

export function KeywordChipRow({
  grids,
  keywordIdx,
  onPick,
  trackedKeywords,
  slug,
  center,
}: {
  grids: KeywordGrid[];
  keywordIdx: number;
  onPick: (gridIndex: number) => void;
  trackedKeywords: TrackedKeyword[];
  slug: string;
  center: { lat: number; lng: number };
}) {
  const role = useUserStore((s) => s.user?.role ?? "client-viewer");
  const [visible, setVisible] = React.useState<string[]>(() =>
    grids.slice(0, VISIBLE_SLOTS).map((g) => g.keyword),
  );

  const byKeyword = React.useMemo(
    () => new Map(grids.map((g, i) => [g.keyword, i] as const)),
    [grids],
  );
  const activeKeyword = grids[keywordIdx]?.keyword;

  const swapIn = React.useCallback(
    (kw: string) => {
      setVisible((v) => {
        if (v.includes(kw)) return v;
        if (v.length < VISIBLE_SLOTS) return [...v, kw];
        return [...v.slice(0, VISIBLE_SLOTS - 1), kw];
      });
      const idx = byKeyword.get(kw);
      if (idx != null) onPick(idx);
    },
    [byKeyword, onPick],
  );

  const visibleGrids = visible.map((kw) => byKeyword.get(kw)).filter((i): i is number => i != null);

  const scannedOverflow = grids.filter((g) => !visible.includes(g.keyword));
  const scannedNames = new Set(grids.map((g) => g.keyword));
  const unscanned = trackedKeywords.filter((k) => !scannedNames.has(k.keyword));
  const overflowCount = scannedOverflow.length + unscanned.length;

  return (
    <div
      role="tablist"
      aria-label="Tracked keywords"
      className="flex flex-wrap items-center gap-2"
    >
      {visibleGrids.map((i) => {
        const g = grids[i];
        const kLatest = g.snapshots[g.snapshots.length - 1];
        const active = g.keyword === activeKeyword;
        return (
          <button
            key={g.keyword}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onPick(i)}
            className={cn(
              "flex h-9 items-center gap-2 rounded-md border px-3 text-[13px] font-medium",
              active
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground hover:bg-secondary/60",
            )}
          >
            {g.keyword}
            {kLatest && kLatest.avg_rank != null && kLatest.avg_rank > 0 && (
              <ScoreBubble avg={kLatest.avg_rank} />
            )}
          </button>
        );
      })}

      {overflowCount > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger className="border-border text-muted-foreground hover:bg-secondary/60 flex h-9 items-center gap-1.5 rounded-md border border-dashed px-3 text-[13px] font-medium">
            <span className="num">{overflowCount}</span> more
            <ChevronDown className="size-3.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="max-h-96 w-72 overflow-y-auto"
          >
            {scannedOverflow.length > 0 && (
              <>
                <DropdownMenuLabel>Scanned</DropdownMenuLabel>
                {scannedOverflow.map((g) => {
                  const kLatest = g.snapshots[g.snapshots.length - 1];
                  return (
                    <DropdownMenuItem
                      key={g.keyword}
                      onSelect={() => swapIn(g.keyword)}
                    >
                      <span className="min-w-0 flex-1 truncate">{g.keyword}</span>
                      {kLatest && kLatest.avg_rank != null && kLatest.avg_rank > 0 ? (
                        <ScoreBubble avg={kLatest.avg_rank} />
                      ) : (
                        <span className="text-muted-foreground text-[11px]">—</span>
                      )}
                    </DropdownMenuItem>
                  );
                })}
              </>
            )}
            {unscanned.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Tracked · not scanned yet</DropdownMenuLabel>
                {unscanned.map((k) => (
                  <DropdownMenuItem
                    key={k.keyword}
                    disabled={role !== "operator"}
                    onSelect={() => {
                      /* TODO: Scan modal integration */
                    }}
                  >
                    <span className="text-muted-foreground min-w-0 flex-1 truncate">
                      {k.keyword}
                    </span>
                    {role === "operator" && (
                      <span className="text-primary flex items-center gap-1 text-[11px] font-semibold">
                        <Radar className="size-3" />
                        Scan
                      </span>
                    )}
                  </DropdownMenuItem>
                ))}
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/locations/${slug}/keywords`}>Manage all keywords →</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {role === "operator" && (
        <button
          type="button"
          onClick={() => {
            /* TODO: Scan modal integration */
          }}
          className="border-border text-primary hover:bg-primary/10 flex h-9 items-center gap-1.5 rounded-md border border-dashed px-3 text-[13px] font-medium"
        >
          <Plus className="size-3.5" />
          Scan new keyword
        </button>
      )}
    </div>
  );
}
