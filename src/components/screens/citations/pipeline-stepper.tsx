"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Icons } from "@/lib/icons";
import type { CitationRow } from "@/lib/data/types";

export type StageKey = "checked" | "ordered" | "submitted" | "live" | "indexing" | "indexed";

export function furthestStage(r: CitationRow): StageKey {
  if (r.indexation === "indexed") return "indexed";
  if (
    r.pipeline_status === "indexing" ||
    r.pipeline_status === "index_checking" ||
    r.indexation === "checking"
  )
    return "indexing";
  if (r.pipeline_status === "live") return "live";
  if (r.pipeline_status === "submitted") return "submitted";
  if (r.pipeline_status === "queued" || r.pipeline_status === "ordered") return "ordered";
  return "checked";
}

export function computeStageCounts(rows: CitationRow[]): Record<StageKey, number> {
  const counts: Record<StageKey, number> = {
    checked: rows.length,
    ordered: 0,
    submitted: 0,
    live: 0,
    indexing: 0,
    indexed: 0,
  };
  for (const r of rows) {
    if (r.indexation === "indexed") counts.indexed += 1;
    else if (
      r.pipeline_status === "indexing" ||
      r.pipeline_status === "index_checking" ||
      r.indexation === "checking"
    )
      counts.indexing += 1;
    else if (r.pipeline_status === "live") counts.live += 1;
    else if (r.pipeline_status === "submitted") counts.submitted += 1;
    else if (r.pipeline_status === "queued" || r.pipeline_status === "ordered") counts.ordered += 1;
  }
  return counts;
}

export function PipelineStepper({
  rows,
  activeStage,
  onStageClick,
}: {
  rows: CitationRow[];
  activeStage?: StageKey | null;
  onStageClick?: (stage: StageKey) => void;
}) {
  const counts = React.useMemo(() => computeStageCounts(rows), [rows]);

  const stages: Array<{ label: string; count: number; desc: string }> = [
    {
      label: "Checked",
      count: counts.checked,
      desc: `${counts.checked} directories crawled against the canonical NAP`,
    },
    { label: "Ordered", count: counts.ordered, desc: "queued with Bright Local" },
    {
      label: "Submitted",
      count: counts.submitted,
      desc: "live submissions in the publisher queues",
    },
    { label: "Live", count: counts.live, desc: "listing published on the directory" },
    { label: "Indexing", count: counts.indexing, desc: "URL pushed to Omega Indexer" },
    { label: "Indexed", count: counts.indexed, desc: "verified in Google's index by IndexCheckr" },
  ];

  return (
    <Card className="gap-4 p-6">
      <div>
        <p className="eyebrow text-text-tertiary">Execution pipeline</p>
        <h2 className="mt-0.5 text-base font-semibold">Check, order, submit, index</h2>
        <p className="text-text-secondary mt-0.5 text-[13px]">
          Each directory counts once, at the furthest stage it has reached.
        </p>
      </div>
      <div
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6"
        role="list"
        aria-label="Citation execution pipeline stages"
      >
        {stages.map((stage, i) => {
          const active = stage.count > 0;
          const stageKey = stage.label.toLowerCase() as StageKey;
          const selected = activeStage === stageKey;
          const Tile: React.ElementType = onStageClick ? "button" : "div";
          return (
            <div
              key={stage.label}
              role="listitem"
              className="relative"
            >
              <Tile
                {...(onStageClick
                  ? {
                      type: "button" as const,
                      onClick: () => onStageClick(stageKey),
                      "aria-pressed": selected,
                      title: selected
                        ? "Clear the stage filter"
                        : `Show only ${stage.label.toLowerCase()} directories`,
                    }
                  : {})}
                className={cn(
                  "border-border bg-card flex h-full w-full flex-col rounded-md border border-l-[3px] px-3 py-2.5 text-left",
                  active ? "border-l-primary-500" : "border-l-border",
                  onStageClick && "hover:bg-secondary/50 transition-colors",
                  selected && "border-primary-500 bg-primary-50/50 dark:bg-primary-700/15",
                )}
              >
                <p
                  className={cn(
                    "num text-[17px] font-bold",
                    active ? "text-foreground" : "text-text-tertiary",
                  )}
                >
                  {stage.count}
                </p>
                <p
                  className={cn(
                    "text-[12px] font-medium",
                    active ? "text-foreground" : "text-text-tertiary",
                  )}
                >
                  {stage.label}
                </p>
                <p className="text-text-tertiary mt-0.5 text-[11px] leading-snug">{stage.desc}</p>
              </Tile>
              {i < stages.length - 1 && (
                <Icons.chevronRight
                  aria-hidden
                  className={cn(
                    "text-text-tertiary pointer-events-none absolute top-1/2 -right-[13px] size-3.5 -translate-y-1/2",
                    i % 2 === 1 && "hidden sm:block",
                    i === 2 && "sm:hidden xl:block",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
      <p className="border-border-subtle text-text-tertiary border-t pt-2.5 font-mono text-[11px]">
        Bright Local → Omega Indexer → IndexCheckr · every transition lands in Runs &amp;
        Notifications
      </p>
    </Card>
  );
}
