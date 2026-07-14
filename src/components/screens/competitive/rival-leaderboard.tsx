"use client";

import Link from "next/link";
import { ArrowUpRight, Map, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { fmtDateShort, fmtInt, rankBand, RANK_BAND_COLOR } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SourceBadge } from "@/components/local/source-badge";
import type { KeywordBoard } from "@/lib/competitive-derive";
import { YouPill, YOU_NAME_CLS, YOU_ROW_CLS } from "./you-pill";

function AvgPositionChip({ value }: { value: number }) {
  const band = rankBand(Math.max(1, Math.round(value)));
  return (
    <span
      className="num inline-flex min-w-9 items-center justify-center rounded-full border px-1.5 py-0.5 text-[12px] font-bold"
      style={{
        borderColor: `${RANK_BAND_COLOR[band]}55`,
        color: RANK_BAND_COLOR[band],
        background: `${RANK_BAND_COLOR[band]}14`,
      }}
    >
      {value.toFixed(1)}
    </span>
  );
}

export function RivalLeaderboard({
  slug,
  boards,
  onSelect,
}: {
  slug: string;
  boards: KeywordBoard[];
  onSelect: (rivalId: string) => void;
}) {
  return (
    <Card className="gap-0 overflow-hidden p-0">
      <div className="border-border flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
        <div>
          <p className="eyebrow text-text-tertiary">Battle 1 &middot; Local map pack</p>
          <h2 className="text-foreground mt-0.5 flex items-center gap-1.5 text-[15px] font-semibold">
            <Map
              className="text-text-tertiary size-4"
              aria-hidden
            />
            Map-pack battle &mdash; who wins the grid
          </h2>
        </div>
        <Link
          href={`/locations/${slug}/geo-grid`}
          className="text-text-link hover:bg-secondary flex items-center gap-1 rounded-md px-2 py-1 text-[13px] font-medium"
        >
          Open geo-grid scanner
          <ArrowUpRight
            className="size-3.5"
            aria-hidden
          />
        </Link>
      </div>

      {boards.length === 0 ? (
        <div className="flex flex-col items-center gap-2 p-8 text-center">
          <span
            aria-hidden
            className="flex items-center gap-1.5"
          >
            <span className="bg-primary-200 size-3.5 rotate-45" />
            <span className="size-3.5 rotate-45 bg-cyan-200" />
          </span>
          <h3 className="text-sm font-semibold">No grid scans yet</h3>
          <p className="text-text-secondary max-w-sm text-[12px]">
            The map-pack leaderboard is built from geo-grid competitor aggregates. Run the first
            grid scan to see who wins each cell.
          </p>
          <Link
            href={`/locations/${slug}/geo-grid`}
            className="text-text-link mt-1 text-[13px] font-medium hover:underline"
          >
            Go to the geo-grid scanner &rarr;
          </Link>
        </div>
      ) : (
        <Tabs
          defaultValue={boards[0].keyword}
          className="gap-0"
        >
          <div className="border-border border-b px-4 pt-3">
            <TabsList className="h-auto flex-wrap justify-start bg-transparent p-0">
              {boards.map((b) => (
                <TabsTrigger
                  key={b.keyword}
                  value={b.keyword}
                  className="data-[state=active]:border-cta-500 rounded-b-none border-b-2 border-transparent px-3 py-2 text-[13px] data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  {b.keyword}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {boards.map((b) => (
            <TabsContent
              key={b.keyword}
              value={b.keyword}
              className="mt-0"
            >
              <div className="text-text-tertiary flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-[12px]">
                <p>
                  Scanned <span className="num">{fmtDateShort(b.date)}</span> &middot;{" "}
                  <span className="num">{fmtInt(b.totalPins)}</span> grid points &middot;{" "}
                  <span className="num">{b.radiusMiles}</span>-mi radius
                </p>
                <SourceBadge source={b.source} />
              </div>
              <div className="overflow-x-auto">
                <Table className="min-w-[640px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10 pl-4">#</TableHead>
                      <TableHead>Competitor</TableHead>
                      <TableHead className="tnum text-right">Appearances</TableHead>
                      <TableHead className="text-right">Avg position</TableHead>
                      <TableHead className="tnum text-right">Top-3 cells</TableHead>
                      <TableHead className="tnum pr-4 text-right">Rating</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {b.rows.map((row, i) => {
                      const clickable = !row.isYou && row.rivalId != null;
                      return (
                        <TableRow
                          key={`${row.name}-${i}`}
                          tabIndex={clickable ? 0 : undefined}
                          role={clickable ? "button" : undefined}
                          aria-label={clickable ? `Open rival profile: ${row.name}` : undefined}
                          onClick={clickable ? () => onSelect(row.rivalId as string) : undefined}
                          onKeyDown={
                            clickable
                              ? (e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    onSelect(row.rivalId as string);
                                  }
                                }
                              : undefined
                          }
                          className={cn(
                            "h-11",
                            clickable &&
                              "focus-visible:ring-ring cursor-pointer focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset",
                            row.isYou && YOU_ROW_CLS,
                          )}
                        >
                          <TableCell className="num text-text-tertiary pl-4 text-[12px] font-bold">
                            {i + 1}
                          </TableCell>
                          <TableCell>
                            <span className="flex items-center gap-1.5">
                              <span
                                className={cn(
                                  "max-w-[260px] truncate text-[13px]",
                                  row.isYou ? YOU_NAME_CLS : "text-foreground font-medium",
                                )}
                              >
                                {row.name}
                              </span>
                              {row.isYou && <YouPill />}
                            </span>
                            {row.category && (
                              <span className="text-text-tertiary block text-[11px]">
                                {row.category}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="tnum text-right text-[13px]">
                            <span className="num">{fmtInt(row.appearances)}</span>
                            <span className="text-text-tertiary">
                              /<span className="num">{fmtInt(row.totalPins)}</span>
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <AvgPositionChip value={row.avgPosition} />
                          </TableCell>
                          <TableCell className="tnum num text-right text-[13px] font-semibold">
                            {fmtInt(row.top3)}
                          </TableCell>
                          <TableCell className="tnum pr-4 text-right text-[13px]">
                            {row.rating != null ? (
                              <span className="inline-flex items-center gap-1">
                                <span className="num font-semibold">{row.rating.toFixed(1)}</span>
                                <Star
                                  className="fill-warning-500 text-warning-500 size-3"
                                  aria-hidden
                                />
                                {row.reviews != null && (
                                  <span className="num text-text-tertiary text-[11px]">
                                    ×{fmtInt(row.reviews)}
                                  </span>
                                )}
                              </span>
                            ) : (
                              <span className="text-text-disabled">&mdash;</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </Card>
  );
}
