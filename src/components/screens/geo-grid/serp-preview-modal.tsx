"use client";

import * as React from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { DataSource } from "@/lib/data/types";
import { fmtCostPerCall, fmtDate, fmtInt } from "@/lib/format";
import { Icons } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SourceBadge } from "@/components/local/source-badge";
import { StatusPill } from "@/components/local/status-pill";
import { useRole } from "@/components/shell/role-store";

export interface SerpBusiness {
  name: string;
  isYou?: boolean;
  rating?: number | null;
  reviews?: number | null;
  category?: string | null;
  address?: string | null;
  rank?: number | null;
}

export interface SerpPreviewData {
  query: string;
  coordinate?: {
    lat: number;
    lng: number;
    label?: string;
  };
  asOf?: string;
  aiOverview?: {
    present: boolean;
    answer?: string;
    sources?: { domain: string; isYou?: boolean }[];
    youCited?: boolean;
  } | null;
  mapPack: SerpBusiness[];
  yourMapPackRank?: number | null;
  localFinder?: SerpBusiness[];
  organic?: { title: string; url: string; isYou?: boolean }[];
  source: DataSource;
  sourceNote?: string;
  refreshCost?: number;
}

const AIO_BLUE = "#4285F4";

function RatingRow({ rating, reviews }: { rating?: number | null; reviews?: number | null }) {
  if (rating == null) return null;
  return (
    <span className="text-muted-foreground flex items-center gap-1 text-[12px]">
      <span className="num text-foreground font-semibold">{rating.toFixed(1)}</span>
      <Icons.star
        className="fill-warning-500 text-warning-500 size-3"
        aria-hidden
      />
      {reviews != null && <span className="num">({fmtInt(reviews)})</span>}
    </span>
  );
}

export function SerpPreviewModal({
  open,
  onOpenChange,
  data,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: SerpPreviewData | null;
}) {
  const role = useRole();
  const [device, setDevice] = React.useState<"mobile" | "desktop">("desktop");

  if (!data) return null;

  const refreshCost = data.refreshCost ?? 0.003;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-h-[88vh] gap-0 overflow-hidden p-0 sm:max-w-[960px]">
        <DialogHeader className="border-border border-b px-6 pt-6 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pr-8">
            <div className="min-w-0">
              <DialogTitle className="flex flex-wrap items-center gap-2 text-base">
                Live Local SERP preview
                <span className="num bg-secondary rounded px-1.5 py-0.5 text-[12px] font-semibold">
                  {data.query}
                </span>
              </DialogTitle>
              <DialogDescription asChild>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px]">
                  {data.coordinate && (
                    <span className="flex items-center gap-1">
                      <Icons.mapPin
                        className="size-3"
                        aria-hidden
                      />
                      {data.coordinate.label ?? "grid point"} ·{" "}
                      <span className="num">
                        {data.coordinate.lat.toFixed(4)}, {data.coordinate.lng.toFixed(4)}
                      </span>
                    </span>
                  )}
                  {data.asOf && (
                    <span>
                      as of <span className="num">{fmtDate(data.asOf)}</span>
                    </span>
                  )}
                  <SourceBadge
                    source={data.source}
                    note={
                      data.sourceNote ??
                      "Mock SERP composed from the stored scan + competitor aggregates"
                    }
                  />
                </div>
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <div
                role="group"
                aria-label="Device preview"
                className="border-border flex rounded-md border p-0.5"
              >
                {(
                  [
                    { id: "mobile", icon: Icons.smartphone, label: "Mobile" },
                    { id: "desktop", icon: Icons.monitor, label: "Desktop" },
                  ] as const
                ).map(({ id, icon: Icon, label }) => (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={device === id}
                    aria-label={`${label} preview`}
                    onClick={() => setDevice(id)}
                    className={cn(
                      "flex h-7 items-center gap-1 rounded px-2 text-[12px] font-medium",
                      device === id
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Icon
                      className="size-3.5"
                      aria-hidden
                    />
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                ))}
              </div>
              {role !== "client-viewer" && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        toast.info("Demo mode — live SERP refresh simulated", {
                          description: `1 SERP fetch × ${fmtCostPerCall(refreshCost)} (DataForSEO live @ coordinate) — no live call made`,
                        })
                      }
                    >
                      <Icons.search className="size-3.5" />
                      Refresh SERP
                      <span className="num text-muted-foreground text-[11px]">
                        {fmtCostPerCall(refreshCost)}
                      </span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Cost per refresh: <span className="num">{fmtCostPerCall(refreshCost)}</span> —
                      1 live SERP fetch at this coordinate
                    </p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto px-6 py-4">
          <div
            className={cn(
              "mx-auto flex flex-col gap-4",
              device === "mobile" ? "max-w-[390px]" : "max-w-full",
            )}
          >
            {data.aiOverview?.present ? (
              <section
                aria-label="AI Overview"
                className="rounded-lg border p-4"
                style={{
                  borderColor: `${AIO_BLUE}55`,
                  background: `${AIO_BLUE}0d`,
                }}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p
                    className="flex items-center gap-1.5 text-[12px] font-semibold"
                    style={{ color: AIO_BLUE }}
                  >
                    <Icons.sparkles
                      className="size-3.5"
                      aria-hidden
                    />
                    AI Overview
                  </p>
                  <StatusPill tone={data.aiOverview.youCited ? "success" : "neutral"}>
                    {data.aiOverview.youCited ? "Your site cited" : "Not cited"}
                  </StatusPill>
                </div>
                {data.aiOverview.answer && (
                  <p className="text-muted-foreground mt-2 text-[13px] leading-relaxed">
                    {data.aiOverview.answer}
                  </p>
                )}
                {data.aiOverview.sources && data.aiOverview.sources.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {data.aiOverview.sources.map((s) => (
                      <span
                        key={s.domain}
                        className={cn(
                          "rounded-full border px-2 py-0.5 text-[11px]",
                          s.isYou
                            ? "border-primary/40 bg-primary/10 text-primary dark:bg-primary/20 font-semibold"
                            : "border-border bg-card text-muted-foreground",
                        )}
                      >
                        {s.domain}
                        {s.isYou && " · YOU"}
                      </span>
                    ))}
                  </div>
                )}
              </section>
            ) : (
              <section
                aria-label="AI Overview"
                className="border-border text-muted-foreground rounded-lg border border-dashed p-3 text-[12px]"
              >
                No AI Overview shown for this query at this point.
              </section>
            )}

            <section
              aria-label="Map pack"
              className="border-border rounded-lg border"
            >
              <div className="bg-muted/60 text-muted-foreground flex h-16 items-center justify-center rounded-t-lg text-[12px]">
                Map header — static map preview
              </div>
              <div className="border-border flex items-center justify-between border-b px-4 py-2">
                <p className="text-foreground text-[12px] font-semibold">Places</p>
                <p className="text-muted-foreground text-[11px]">Local 3-pack at this point</p>
              </div>
              <ul className="divide-border divide-y">
                {data.mapPack.slice(0, 3).map((biz, i) => (
                  <li
                    key={`${biz.name}-${i}`}
                    className={cn(
                      "flex items-start gap-3 px-4 py-3",
                      biz.isYou &&
                        "border-l-primary bg-primary/10 dark:bg-primary/15 border-l-[3px]",
                    )}
                  >
                    <span className="num bg-secondary mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold">
                      {biz.rank === null ? "–" : (biz.rank ?? i + 1)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-foreground flex flex-wrap items-center gap-2 text-[13px] font-medium">
                        <span className="truncate">{biz.name}</span>
                        {biz.isYou && (
                          <span className="eyebrow bg-primary text-primary-foreground rounded px-1.5 py-0.5">
                            You
                          </span>
                        )}
                      </p>
                      <div className="text-muted-foreground mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px]">
                        <RatingRow
                          rating={biz.rating}
                          reviews={biz.reviews}
                        />
                        {biz.category && <span>· {biz.category}</span>}
                      </div>
                      {biz.address && (
                        <p className="text-muted-foreground mt-0.5 truncate text-[12px]">
                          {biz.address}
                        </p>
                      )}
                    </div>
                    <span className="text-muted-foreground flex shrink-0 gap-1.5">
                      <Icons.navigation
                        className="size-3.5"
                        aria-hidden
                      />
                      <Icons.phone
                        className="size-3.5"
                        aria-hidden
                      />
                    </span>
                  </li>
                ))}
              </ul>
              {(data.yourMapPackRank == null || data.yourMapPackRank > 3) && (
                <p className="border-border text-muted-foreground border-t px-4 py-2 text-[12px]">
                  You:{" "}
                  <span className="num font-semibold">
                    {data.yourMapPackRank == null ? "NR" : `#${data.yourMapPackRank}`}
                  </span>{" "}
                  in the expanded Local Finder below
                </p>
              )}
            </section>

            {data.localFinder && data.localFinder.length > 0 && (
              <section
                aria-label="Local Finder"
                className="border-border rounded-lg border"
              >
                <div className="border-border border-b px-4 py-2">
                  <p className="text-foreground text-[12px] font-semibold">
                    Local Finder — more places
                  </p>
                </div>
                <ul className="divide-border divide-y">
                  {data.localFinder.map((biz, i) => (
                    <li
                      key={`${biz.name}-${i}`}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2",
                        biz.isYou &&
                          "border-l-primary bg-primary/10 dark:bg-primary/15 border-l-[3px]",
                      )}
                    >
                      <span className="num text-muted-foreground w-6 shrink-0 text-right text-[12px] font-bold">
                        {biz.rank === null ? "–" : (biz.rank ?? i + 1)}
                      </span>
                      <span
                        className={cn(
                          "min-w-0 flex-1 truncate text-[13px]",
                          biz.isYou ? "text-primary font-semibold" : "text-foreground",
                        )}
                      >
                        {biz.name}
                        {biz.isYou && " — YOU"}
                      </span>
                      <RatingRow
                        rating={biz.rating}
                        reviews={biz.reviews}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {data.organic && data.organic.length > 0 && (
              <section
                aria-label="Organic results"
                className="border-border rounded-lg border p-4"
              >
                <p className="text-foreground mb-2 text-[12px] font-semibold">Organic results</p>
                <ul className="flex flex-col gap-3">
                  {data.organic.map((r, i) => (
                    <li
                      key={`${r.url}-${i}`}
                      className="min-w-0"
                    >
                      <p className="text-muted-foreground truncate text-[11px]">{r.url}</p>
                      <p
                        className={cn(
                          "truncate text-[13px]",
                          r.isYou ? "text-primary font-semibold" : "text-primary",
                        )}
                      >
                        {r.title}
                        {r.isYou && " · YOU"}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1">
                <span
                  className="bg-primary size-2 rounded-full"
                  aria-hidden
                />
                Your listing
              </span>
              <span className="flex items-center gap-1">
                <span
                  className="bg-muted-foreground/40 size-2 rounded-full"
                  aria-hidden
                />
                Competitor
              </span>
              <span className="flex items-center gap-1">
                <span
                  className="size-2 rounded-full"
                  style={{ background: AIO_BLUE }}
                  aria-hidden
                />
                AI Overview unit
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="border-border flex-row items-center justify-between gap-3 border-t px-6 py-3 sm:justify-between">
          <p className="text-muted-foreground text-[11px]">
            Preview assembled from stored scan data — no live SERP fetched
          </p>
          <span className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              asChild
            >
              <a
                href={`https://www.google.com/search?q=${encodeURIComponent(data.query)}`}
                target="_blank"
                rel="noreferrer"
              >
                <Icons.external className="size-3.5" />
                Open in Google
              </a>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </span>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
