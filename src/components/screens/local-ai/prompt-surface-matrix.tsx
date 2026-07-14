"use client";

import * as React from "react";
import { Icons } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { CHATBOT_SURFACES, SEARCH_FEATURE_SURFACES, type AISurface } from "@/lib/surfaces";
import { fmtCostPerCall, fmtDate } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SourceBadge } from "@/components/local/source-badge";
import { promptWinRate, rowFor, type AICheckRow } from "./helpers";
import type { DataSource } from "@/lib/data/types";

function gridTemplate(): string {
  return [
    "minmax(230px, 1.6fr)",
    `repeat(${CHATBOT_SURFACES.length}, minmax(96px, 1fr))`,
    "12px",
    `repeat(${SEARCH_FEATURE_SURFACES.length}, minmax(96px, 1fr))`,
    "minmax(72px, 0.6fr)",
  ].join(" ");
}

function stateOf(row: AICheckRow | null) {
  if (!row) return "none" as const;
  if (row.cited === true) return "cited" as const;
  if (row.cited === "partial") return "partial" as const;
  return "missed" as const;
}

function cellAria(surface: AISurface, prompt: string, row: AICheckRow | null): string {
  const open =
    surface.category === "chatbot"
      ? `Open ${surface.name}'s response`
      : "Open the live SERP preview";
  if (!row) return `${surface.name} — no check recorded for "${prompt}"`;
  const state =
    row.cited === true
      ? `cited at position ${row.position ?? "unknown"}`
      : row.cited === "partial"
        ? `mentioned without a link${row.position != null ? ` at position ${row.position}` : ""}`
        : `not cited — ${row.sourceCited ?? "another source"} cited instead`;
  const live = row.source !== "synthetic" ? " Live provider check." : "";
  return `${surface.name} — ${state} for "${prompt}".${live} ${open}`;
}

function MatrixCell({
  surface,
  prompt,
  row,
  onOpen,
}: {
  surface: AISurface;
  prompt: string;
  row: AICheckRow | null;
  onOpen: (row: AICheckRow) => void;
}) {
  const state = stateOf(row);

  const body =
    state === "cited" ? (
      <span
        className="inline-flex h-7 items-center gap-1 rounded-full border px-2 text-[11px] font-semibold"
        style={{
          borderColor: `${surface.color}55`,
          background: `${surface.color}1a`,
          color: surface.dark,
        }}
      >
        <Icons.checkCircle
          className="size-3.5 shrink-0"
          aria-hidden
        />
        Cited{row?.position != null && <span className="num">#{row.position}</span>}
      </span>
    ) : state === "partial" ? (
      <span className="bg-warning-50 text-warning-700 dark:bg-warning-700/25 dark:text-warning-100 inline-flex h-7 items-center gap-1 rounded-full px-2 text-[11px] font-semibold">
        <Icons.warning
          className="size-3.5 shrink-0"
          aria-hidden
        />
        Partial{row?.position != null && <span className="num">#{row.position}</span>}
      </span>
    ) : state === "missed" ? (
      <span className="bg-secondary text-muted-foreground inline-flex h-7 items-center gap-1 rounded-full px-2 text-[11px] font-medium">
        <Icons.xCircle
          className="size-3.5 shrink-0"
          aria-hidden
        />
        Not cited
      </span>
    ) : (
      <span className="border-border text-muted-foreground inline-flex h-7 items-center gap-1 rounded-full border border-dashed px-2 text-[11px]">
        <Icons.circleDashed
          className="size-3.5 shrink-0"
          aria-hidden
        />
        No check
      </span>
    );

  if (!row) {
    return (
      <div
        role="cell"
        aria-label={cellAria(surface, prompt, null)}
        className="flex min-h-11 items-center justify-center px-1 py-1.5"
      >
        {body}
      </div>
    );
  }

  return (
    <div
      role="cell"
      className="min-h-11 px-1 py-1.5"
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={() => onOpen(row)}
            aria-label={cellAria(surface, prompt, row)}
            className="hover:bg-muted/70 relative flex min-h-11 w-full items-center justify-center rounded-md"
          >
            {body}
            {row.source !== "synthetic" && (
              <span
                aria-hidden
                className="bg-primary absolute top-1 right-1 size-1.5 rounded-full"
              />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-64">
          <p className="font-semibold">
            {surface.name} ·{" "}
            {state === "cited"
              ? `cited #${row.position ?? "—"}`
              : state === "partial"
                ? `mentioned, no link${row.position != null ? ` · #${row.position}` : ""}`
                : "not cited"}
          </p>
          {row.sourceCited && (
            <p className="mt-0.5">
              {state === "missed" ? "Cited instead: " : "Source: "}
              {row.sourceCited}
            </p>
          )}
          <p className="mt-0.5">
            <span className="num">{fmtDate(row.checkedAt)}</span> · cost{" "}
            <span className="num">{fmtCostPerCall(row.cost)}</span>
            {row.source !== "synthetic" && " · Live · DataForSEO"}
          </p>
          <p className="mt-0.5 text-[11px] opacity-80">
            {surface.category === "chatbot"
              ? `Click for ${surface.name}'s response`
              : "Click for the live SERP preview"}
          </p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

function ColumnHeader({ surface }: { surface: AISurface }) {
  return (
    <div
      role="columnheader"
      className="flex flex-col items-center gap-1 px-1 pb-2"
    >
      <span
        className="inline-flex h-6 items-center rounded-full px-2 font-mono text-[10px] font-bold text-white"
        style={{ background: surface.color }}
        title={`${surface.name} · ${surface.category === "chatbot" ? "Chatbot surface" : "Google Search AI feature"}`}
      >
        {surface.glyph}
      </span>
      <span className="text-muted-foreground text-[11px] font-medium">{surface.name}</span>
      <span className="num text-muted-foreground text-[10px]">
        {fmtCostPerCall(surface.cost)}/call
      </span>
    </div>
  );
}

function DividerCell() {
  return (
    <div
      aria-hidden
      className="flex w-3 justify-center"
    >
      <div className="bg-border w-px" />
    </div>
  );
}

export function PromptSurfaceMatrix({
  prompts,
  rows,
  source,
  liveCount,
  onOpenCell,
}: {
  prompts: string[];
  rows: AICheckRow[];
  source: DataSource;
  liveCount: number;
  onOpenCell: (row: AICheckRow) => void;
}) {
  const template = gridTemplate();

  return (
    <Card className="gap-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold">Prompt × surface matrix</h2>
          <p className="text-muted-foreground text-[13px]">
            <span className="num">{prompts.length}</span> local-intent prompts checked across{" "}
            <span className="num">{CHATBOT_SURFACES.length + SEARCH_FEATURE_SURFACES.length}</span>{" "}
            surfaces — click any cell for the underlying answer
          </p>
        </div>
        <div className="flex items-center gap-2">
          {liveCount > 0 && (
            <span className="text-muted-foreground text-[12px]">
              <span className="num font-semibold">{liveCount}</span> live DataForSEO checks
            </span>
          )}
          <SourceBadge
            source={source}
            note="Majority provenance across the matrix — live cells carry a blue corner dot"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <div
          role="table"
          aria-label="Prompt by surface citation matrix"
          className="min-w-[760px]"
        >
          <div
            role="row"
            className="border-border grid items-end border-b"
            style={{ gridTemplateColumns: template }}
          >
            <div
              role="columnheader"
              className="pr-2 pb-2"
            >
              <p className="eyebrow text-muted-foreground">Local-intent prompt</p>
            </div>
            {CHATBOT_SURFACES.map((s) => (
              <ColumnHeader
                key={s.id}
                surface={s}
              />
            ))}
            <DividerCell />
            {SEARCH_FEATURE_SURFACES.map((s) => (
              <ColumnHeader
                key={s.id}
                surface={s}
              />
            ))}
            <div
              role="columnheader"
              className="pb-2 text-center"
            >
              <p className="eyebrow text-muted-foreground">Win rate</p>
            </div>
          </div>

          {prompts.map((prompt, i) => {
            const win = promptWinRate(rows, prompt);
            return (
              <div
                role="row"
                key={prompt}
                className={cn(
                  "border-border/50 grid items-center border-b last:border-b-0",
                  i % 2 === 1 && "bg-muted/40",
                )}
                style={{ gridTemplateColumns: template }}
              >
                <div
                  role="rowheader"
                  className="min-w-0 py-2 pr-2"
                >
                  <p className="text-foreground text-[13px] leading-snug font-medium">
                    &ldquo;{prompt}&rdquo;
                  </p>
                </div>
                {CHATBOT_SURFACES.map((s) => (
                  <MatrixCell
                    key={s.id}
                    surface={s}
                    prompt={prompt}
                    row={rowFor(rows, prompt, s.id)}
                    onOpen={onOpenCell}
                  />
                ))}
                <DividerCell />
                {SEARCH_FEATURE_SURFACES.map((s) => (
                  <MatrixCell
                    key={s.id}
                    surface={s}
                    prompt={prompt}
                    row={rowFor(rows, prompt, s.id)}
                    onOpen={onOpenCell}
                  />
                ))}
                <div
                  role="cell"
                  className="text-center"
                >
                  <span className="num text-foreground text-[13px] font-semibold">
                    {win.cited}/{win.checked}
                  </span>
                  <span className="text-muted-foreground block text-[10px]">cited</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px]">
        <span className="flex items-center gap-1">
          <Icons.checkCircle
            className="text-success-600 size-3"
            aria-hidden
          />
          Cited (with answer position)
        </span>
        <span className="flex items-center gap-1">
          <Icons.warning
            className="text-warning-600 size-3"
            aria-hidden
          />
          Partial — mentioned, no link
        </span>
        <span className="flex items-center gap-1">
          <Icons.xCircle
            className="size-3"
            aria-hidden
          />
          Not cited
        </span>
        <span className="flex items-center gap-1">
          <Icons.circleDashed
            className="size-3"
            aria-hidden
          />
          No check recorded
        </span>
        <span className="flex items-center gap-1">
          <span
            aria-hidden
            className="bg-primary size-1.5 rounded-full"
          />
          Live · DataForSEO check
        </span>
      </div>
    </Card>
  );
}
