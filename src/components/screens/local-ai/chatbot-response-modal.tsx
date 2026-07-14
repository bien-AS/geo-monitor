"use client";

import * as React from "react";
import { Icons } from "@/lib/icons";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SurfacePill } from "@/components/local/surface-pill";
import { SourceBadge } from "@/components/local/source-badge";
import { StatusPill } from "@/components/local/status-pill";
import { cn } from "@/lib/utils";
import { fmtDate, fmtCostPerCall } from "@/lib/format";
import { surfaceById } from "@/lib/surfaces";
import type { AICheckRow, SourceMixEntry } from "./helpers";

export function ChatbotResponseModal({
  open,
  onOpenChange,
  row,
  mix,
  gbpDomain,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  row: AICheckRow | null;
  mix: SourceMixEntry[];
  gbpDomain?: string;
}) {
  if (!row) return null;
  const surface = surfaceById(row.surface);
  if (!surface) return null;

  const citedSources = mix
    .filter((m) => row.sourceCited === m.domain || m.hits.some((h) => h === row))
    .slice(0, 5);

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SurfacePill
              surface={surface}
              size="md"
              showName
            />
            <span className="text-muted-foreground text-[13px] font-normal">
              cited {row.cited === "partial" ? "partially" : ""} at{" "}
              {row.position != null ? (
                <span className="num font-semibold">#{row.position}</span>
              ) : (
                "position unavailable"
              )}
            </span>
          </DialogTitle>
          <DialogDescription>&ldquo;{row.prompt}&rdquo;</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          {row.note && (
            <div className="bg-accent text-accent-foreground rounded-md p-3 text-[12px]">
              <span className="font-semibold">Analyst note:</span> {row.note}
            </div>
          )}

          {row.snippet && (
            <div>
              <p className="text-muted-foreground text-[12px] font-semibold">
                {surface.name}&apos;s response
              </p>
              <p className="border-border bg-muted/30 mt-1 rounded-md border p-3 text-[13px] leading-relaxed">
                {row.snippet}
              </p>
            </div>
          )}

          <div>
            <p className="text-muted-foreground text-[12px] font-semibold">Cited sources</p>
            {citedSources.length > 0 ? (
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {citedSources.map((s) => (
                  <Badge
                    key={s.domain}
                    variant="outline"
                    className={cn(
                      "text-[11px]",
                      s.isBaptist && "border-primary/40 bg-primary/10 text-primary font-semibold",
                    )}
                  >
                    {s.domain}
                    {s.isGbpListed && " · GBP listed"}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground mt-1 text-[12px]">
                No source captured for this check.
              </p>
            )}
          </div>

          <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
            <span>
              Checked <span className="num font-semibold">{fmtDate(row.checkedAt)}</span>
            </span>
            <span>
              Cost: <span className="num font-semibold">{fmtCostPerCall(row.cost)}</span>
            </span>
            {row.model && (
              <span>
                Model: <span className="font-medium">{row.model}</span>
              </span>
            )}
            <SourceBadge source={row.source} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
