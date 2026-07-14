"use client";

import * as React from "react";
import { Icons } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { CHATBOT_SURFACES, SEARCH_FEATURE_SURFACES, type AISurface } from "@/lib/surfaces";
import { fmtCostPerCall, fmtDateShort, fmtPct } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { SourceBadge } from "@/components/local/source-badge";
import { StatusPill } from "@/components/local/status-pill";
import { SurfacePill } from "@/components/local/surface-pill";
import { groupShare, type AICheckRow } from "./helpers";

function SurfaceCard({
  surface,
  rows,
  promptCount,
  expanded,
  onToggle,
  onOpenCell,
}: {
  surface: AISurface;
  rows: AICheckRow[];
  promptCount: number;
  expanded: boolean;
  onToggle: () => void;
  onOpenCell: (row: AICheckRow) => void;
}) {
  const mine = rows.filter((r) => r.surface === surface.id);
  const share = groupShare(mine, [surface]);
  const panelId = `surface-panel-${surface.id}`;

  return (
    <div className="border-border rounded-lg border">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={panelId}
        className="hover:bg-muted/60 flex min-h-11 w-full flex-wrap items-center gap-x-3 gap-y-1 rounded-lg px-3 py-2.5 text-left"
      >
        <SurfacePill
          surface={surface}
          size="md"
        />
        <span className="num text-foreground text-[15px] font-bold">{fmtPct(share.pct)}</span>
        <span className="text-muted-foreground text-[12px]">
          <span className="num">
            {share.cited}/{share.cells}
          </span>{" "}
          prompts cited
          {share.partial > 0 && (
            <>
              {" "}
              · <span className="num">{share.partial}</span> partial
            </>
          )}
        </span>
        <span className="num text-muted-foreground ml-auto text-[11px]">
          {fmtCostPerCall(surface.cost)}/call
        </span>
        <Icons.chevronDown
          className={cn(
            "text-muted-foreground size-4 shrink-0 transition-transform",
            expanded && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      {expanded && (
        <div
          id={panelId}
          className="border-border/50 border-t px-2 py-1.5"
        >
          {mine.length === 0 ? (
            <p className="text-muted-foreground px-2 py-2 text-[12px]">
              No checks recorded on {surface.name} for the current corpus (
              <span className="num">{promptCount}</span> prompts).
            </p>
          ) : (
            <ul className="flex flex-col gap-0.5">
              {mine.map((row) => (
                <li key={`${row.prompt}-${row.surface}`}>
                  <button
                    type="button"
                    onClick={() => onOpenCell(row)}
                    aria-label={`Open the ${surface.name} answer for "${row.prompt}"`}
                    className="hover:bg-muted grid min-h-11 w-full grid-cols-[1fr_auto] items-center gap-x-3 gap-y-0.5 rounded-md px-2 py-1.5 text-left sm:grid-cols-[minmax(0,1fr)_auto_auto_auto_auto]"
                  >
                    <span className="text-foreground min-w-0 truncate text-[12px] font-medium">
                      {row.prompt}
                    </span>
                    <StatusPill
                      tone={
                        row.cited === true
                          ? "success"
                          : row.cited === "partial"
                            ? "warning"
                            : "neutral"
                      }
                      className="shrink-0"
                    >
                      {row.cited === true
                        ? `Cited${row.position != null ? ` #${row.position}` : ""}`
                        : row.cited === "partial"
                          ? `Partial${row.position != null ? ` #${row.position}` : ""}`
                          : "Not cited"}
                    </StatusPill>
                    <span className="text-muted-foreground col-start-1 truncate text-[11px] sm:col-start-auto sm:max-w-40">
                      {row.sourceCited ?? "no source captured"}
                    </span>
                    <span className="num text-muted-foreground hidden text-[11px] sm:inline">
                      {fmtDateShort(row.checkedAt)}
                    </span>
                    <span className="col-start-2 row-start-2 flex items-center gap-1.5 justify-self-end sm:col-start-auto sm:row-start-auto">
                      <SourceBadge source={row.source} />
                      <Icons.chevronRight
                        className="text-muted-foreground size-3.5"
                        aria-hidden
                      />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export function SurfaceBreakdown({
  rows,
  promptCount,
  onOpenCell,
}: {
  rows: AICheckRow[];
  promptCount: number;
  onOpenCell: (row: AICheckRow) => void;
}) {
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const toggle = (id: string) => setExpandedId((cur) => (cur === id ? null : id));

  return (
    <Card className="gap-4 p-6">
      <div>
        <h2 className="text-lg font-semibold">Surface-by-surface breakdown</h2>
        <p className="text-muted-foreground text-[13px]">
          Per-surface citation share and every stored check — chatbot assistants and Google Search
          AI features reported separately
        </p>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-[2]">
          <p className="eyebrow text-muted-foreground mb-2">
            Chatbots · <span className="num">{CHATBOT_SURFACES.length}</span>
          </p>
          <div className="flex flex-col gap-2">
            {CHATBOT_SURFACES.map((s) => (
              <SurfaceCard
                key={s.id}
                surface={s}
                rows={rows}
                promptCount={promptCount}
                expanded={expandedId === s.id}
                onToggle={() => toggle(s.id)}
                onOpenCell={onOpenCell}
              />
            ))}
          </div>
        </div>

        <div
          aria-hidden
          className="hidden w-3 justify-center self-stretch lg:flex"
        >
          <div className="bg-border w-px" />
        </div>
        <div
          aria-hidden
          className="flex h-3 items-center lg:hidden"
        >
          <div className="bg-border h-px w-full" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="eyebrow text-muted-foreground mb-2">
            Google search AI · <span className="num">{SEARCH_FEATURE_SURFACES.length}</span>
          </p>
          <div className="flex flex-col gap-2">
            {SEARCH_FEATURE_SURFACES.map((s) => (
              <SurfaceCard
                key={s.id}
                surface={s}
                rows={rows}
                promptCount={promptCount}
                expanded={expandedId === s.id}
                onToggle={() => toggle(s.id)}
                onOpenCell={onOpenCell}
              />
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
