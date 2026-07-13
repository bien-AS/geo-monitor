"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { SURFACES } from "@/lib/surfaces";
import { fmtCostPerCall, fmtPct } from "@/lib/format";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { SurfacePresence } from "./helpers";

export function SurfacePresenceRow({
  surfaces,
  size = "md",
  className,
}: {
  surfaces: SurfacePresence[];
  size?: "sm" | "md";
  className?: string;
}) {
  const byId = new Map(surfaces.map((s) => [s.surfaceId, s]));
  const dot = size === "sm" ? "size-6" : "size-7";

  return (
    <div className={cn("flex items-center", className)}>
      {SURFACES.map((surface, idx) => {
        const presence = byId.get(surface.id);
        const checked = presence?.checked ?? 0;
        const cited = presence?.cited ?? 0;
        const partial = presence?.partial ?? 0;
        const pct = checked > 0 ? ((cited + partial * 0.5) / checked) * 100 : null;
        const prevCategory = idx > 0 ? (SURFACES[idx - 1]?.category ?? null) : null;
        const divider = prevCategory !== null && prevCategory !== surface.category;
        return (
          <React.Fragment key={surface.id}>
            {divider && (
              <span
                aria-hidden
                className="bg-border mx-[6px] h-6 w-px shrink-0"
              />
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="mr-1 inline-flex flex-col items-center gap-0.5 last:mr-0">
                  <span
                    className={cn(
                      dot,
                      "inline-flex items-center justify-center rounded-full font-mono text-[8px] font-bold text-white",
                    )}
                    style={{
                      background: surface.color,
                      opacity: checked === 0 ? 0.35 : 1,
                    }}
                    aria-label={`${surface.name}: ${
                      pct == null ? "not checked" : `${Math.round(pct)}% presence`
                    }`}
                  >
                    {surface.glyph}
                  </span>
                  <span className="num text-muted-foreground text-[10px] leading-none">
                    {pct == null ? "—" : fmtPct(pct)}
                  </span>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium">{surface.name}</p>
                <p className="text-xs">
                  {checked === 0 ? (
                    "Not checked for this location"
                  ) : (
                    <>
                      Cited <span className="num">{cited}</span>
                      {partial > 0 && (
                        <>
                          {" "}
                          · partial <span className="num">{partial}</span>
                        </>
                      )}{" "}
                      of <span className="num">{checked}</span> prompts
                    </>
                  )}
                </p>
                <p className="num text-xs">{fmtCostPerCall(surface.cost)} per check</p>
              </TooltipContent>
            </Tooltip>
          </React.Fragment>
        );
      })}
    </div>
  );
}

export function SurfaceListRows({
  surfaces,
  className,
}: {
  surfaces: SurfacePresence[];
  className?: string;
}) {
  const byId = new Map(surfaces.map((s) => [s.surfaceId, s]));
  const groups: { label: string; category: string; headerCls: string }[] = [
    {
      label: "Chatbot surfaces",
      category: "chatbot",
      headerCls: "text-primary border-primary/20 dark:text-primary-100 dark:border-primary-700",
    },
    {
      label: "Google Search AI",
      category: "search-feature",
      headerCls: "text-muted-foreground border-border",
    },
  ];

  return (
    <div className={cn("flex flex-col", className)}>
      {groups.map((group, gi) => (
        <React.Fragment key={group.category}>
          {gi > 0 && (
            <div
              aria-hidden
              className="h-3"
            />
          )}
          <p
            className={cn(
              "border-b pb-1 text-[9.5px] font-semibold tracking-wider uppercase",
              group.headerCls,
            )}
          >
            {group.label}
          </p>
          {SURFACES.filter((s) => s.category === group.category).map((surface) => {
            const presence = byId.get(surface.id);
            const checked = presence?.checked ?? 0;
            const cited = presence?.cited ?? 0;
            const partial = presence?.partial ?? 0;
            const pct = checked > 0 ? Math.round(((cited + partial * 0.5) / checked) * 100) : null;
            const pctCls =
              pct == null
                ? "text-muted-foreground"
                : pct >= 35
                  ? "text-green-600 dark:text-green-400"
                  : pct >= 20
                    ? "text-yellow-600 dark:text-yellow-400"
                    : "text-red-600 dark:text-red-400";
            return (
              <div
                key={surface.id}
                className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-x-2 py-[5px]"
              >
                <span
                  aria-hidden
                  className="size-2 rounded-full"
                  style={{ background: surface.color }}
                />
                <span className="text-foreground truncate text-[12px] font-medium">
                  {surface.name}
                </span>
                <span className="num text-muted-foreground text-[10px]">
                  {fmtCostPerCall(surface.cost)}
                </span>
                <span
                  className={cn("num min-w-9 text-right text-[13px] font-bold", pctCls)}
                  aria-label={`${surface.name} presence ${pct == null ? "not checked" : `${pct}%`}`}
                >
                  {pct == null ? "—" : `${pct}%`}
                </span>
              </div>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
}
