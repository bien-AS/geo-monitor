"use client";

import * as React from "react";
import Link from "next/link";
import { Icons } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { fmtPct } from "@/lib/format";
import { surfaceById } from "@/lib/surfaces";
import { Card } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SurfacePill } from "@/components/local/surface-pill";
import type { AICheckRow, FragmentationFinding, SourceMixEntry } from "./helpers";

export function CitedSourceMix({
  mix,
  fragmentation,
  slug,
  totalChecks,
  onOpenCell,
}: {
  mix: SourceMixEntry[];
  fragmentation: FragmentationFinding | null;
  slug: string;
  totalChecks: number;
  onOpenCell: (row: AICheckRow) => void;
}) {
  const max = Math.max(1, ...mix.map((m) => m.count));
  const baptistShare =
    totalChecks > 0
      ? Math.round(
          (mix.filter((m) => m.isBaptist).reduce((sum, m) => sum + m.count, 0) / totalChecks) * 100,
        )
      : 0;

  return (
    <Card className="gap-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold">Cited-source mix</h2>
          <p className="text-muted-foreground text-[13px]">
            Who the engines cite when they answer this corpus — Baptist domains win{" "}
            <span className="num text-foreground font-semibold">{fmtPct(baptistShare)}</span> of{" "}
            <span className="num">{totalChecks}</span> checks
          </p>
        </div>
      </div>

      <ul className="flex flex-col gap-1">
        {mix.map((entry) => (
          <li key={entry.domain}>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  aria-label={`${entry.domain} — cited on ${entry.count} checks. View the prompts it won.`}
                  className={cn(
                    "hover:bg-muted/70 grid min-h-11 w-full grid-cols-[minmax(160px,1.2fr)_minmax(120px,2fr)_auto_auto] items-center gap-3 rounded-md px-2 py-1.5 text-left",
                  )}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      className={cn(
                        "truncate text-[13px]",
                        entry.isBaptist
                          ? "text-primary font-semibold"
                          : "text-foreground font-medium",
                      )}
                    >
                      {entry.domain}
                    </span>
                    {entry.isBaptist && (
                      <span className="eyebrow bg-primary/10 text-primary rounded px-1.5 text-[10px]">
                        Baptist
                      </span>
                    )}
                    {entry.isGbpListed && (
                      <span className="eyebrow bg-accent text-accent-foreground rounded px-1.5 text-[10px]">
                        GBP listed
                      </span>
                    )}
                  </span>
                  <span className="flex items-center gap-1.5 justify-self-end">
                    {/* Bar */}
                    <span className="bg-muted hidden h-1.5 w-24 rounded-full sm:block">
                      <span
                        className="bg-primary block h-full rounded-full"
                        style={{
                          width: `${Math.round((entry.count / max) * 100)}%`,
                        }}
                      />
                    </span>
                    <span className="num text-foreground min-w-[3ch] text-right text-[13px] font-semibold">
                      {entry.count}
                    </span>
                  </span>
                  <span className="flex flex-wrap gap-1 self-end text-right">
                    {entry.hits.slice(0, 4).map((h) => {
                      const s = surfaceById(h.surface);
                      return s ? (
                        <SurfacePill
                          key={`${h.surface}-${h.prompt}`}
                          surface={s}
                          size="sm"
                          showName={false}
                        />
                      ) : null;
                    })}
                  </span>
                  <span className="self-end text-right">
                    <Icons.chevronRight className="text-muted-foreground size-3.5" />
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="max-h-80 w-96 overflow-y-auto">
                <p className="text-[12px] font-semibold">
                  {entry.domain} — {entry.count} citation{entry.count === 1 ? "" : "s"}
                </p>
                <ul className="mt-2 flex flex-col gap-1.5">
                  {entry.hits.map((h) => {
                    const s = surfaceById(h.surface);
                    return (
                      <li key={`${h.prompt}-${h.surface}`}>
                        <button
                          type="button"
                          onClick={() => onOpenCell(h)}
                          className="hover:bg-muted w-full rounded-md px-2 py-1.5 text-left text-[12px]"
                        >
                          <span className="font-medium">&ldquo;{h.prompt}&rdquo;</span>
                          <span className="text-muted-foreground"> on {s?.name ?? h.surface}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </PopoverContent>
            </Popover>
          </li>
        ))}
        {mix.length === 0 && (
          <li className="text-muted-foreground py-2 text-center text-[12px]">
            No source domain data captured for this corpus.
          </li>
        )}
      </ul>

      {fragmentation && (
        <div className="border-warning-500/40 bg-warning-50 dark:bg-warning-700/15 rounded-md border px-4 py-3 text-[13px]">
          <p className="text-warning-700 dark:text-warning-100 flex items-center gap-1.5 font-semibold">
            <Icons.split
              className="size-4 shrink-0"
              aria-hidden
            />
            Domain fragmentation
          </p>
          <p className="text-muted-foreground mt-1">
            The engines cite{" "}
            <span className="num text-foreground font-semibold">
              {fragmentation.baptistDomains.length}
            </span>{" "}
            distinct Baptist domains —{" "}
            <span className="num text-foreground font-semibold">
              {fragmentation.offDomainChecks}
            </span>{" "}
            checks cite a Baptist domain that isn&apos;t the GBP-listed one
            {fragmentation.gbpDomain && (
              <>
                {" "}
                (<span className="font-medium">{fragmentation.gbpDomain}</span>)
              </>
            )}
            .
            {fragmentation.hasLiveEvidence && (
              <span className="mt-0.5 block">Evidence from live DataForSEO checks.</span>
            )}
          </p>
        </div>
      )}
    </Card>
  );
}
