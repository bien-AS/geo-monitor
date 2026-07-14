"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusPill, type PillTone } from "@/components/local/status-pill";
import { SourceBadge } from "@/components/local/source-badge";
import { Icons } from "@/lib/icons";
import { fmtDateShort } from "@/lib/format";
import { charDiff, FIELD_LABEL, type DriftItem, type DriftSeverity, type DriftStatus } from "./lib";
import { cn } from "@/lib/utils";

export const SEVERITY_TONE: Record<DriftSeverity, PillTone> = {
  critical: "error",
  moderate: "warning",
  minor: "neutral",
};

export const STATUS_TONE: Record<DriftStatus, PillTone> = {
  open: "warning",
  fix_queued: "info",
  fixed: "success",
  resolved: "success",
};

export const STATUS_LABEL: Record<DriftStatus, string> = {
  open: "Open",
  fix_queued: "Fix queued",
  fixed: "Fixed",
  resolved: "Resolved",
};

export function InlineDiff({ item }: { item: DriftItem }) {
  const d = charDiff(item.canonical_value, item.observed_value);
  return (
    <div className="flex min-w-0 flex-col gap-1 text-[12px] leading-relaxed">
      <p className="num break-words">
        <span className="eyebrow text-text-tertiary mr-1.5">Canonical</span>
        {d.prefix}
        {d.aMid ? (
          <span className="bg-success-50 text-success-700 dark:bg-success-700/25 dark:text-success-100 rounded-sm px-0.5 font-semibold">
            {d.aMid}
          </span>
        ) : null}
        {d.suffix}
      </p>
      <p className="num break-words">
        <span className="eyebrow text-text-tertiary mr-1.5">Observed</span>
        {d.prefix}
        {d.bMid ? (
          <span className="bg-warning-50 text-warning-700 dark:bg-warning-700/25 dark:text-warning-100 rounded-sm px-0.5 font-semibold">
            {d.bMid}
          </span>
        ) : null}
        {d.suffix}
      </p>
    </div>
  );
}

export function DriftQueue({
  items,
  onView,
}: {
  items: DriftItem[];
  onView: (key: string) => void;
}) {
  const open = items.filter((i) => i.status === "open").length;

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-[15px]">Drift queue</CardTitle>
          <span className="num text-text-tertiary text-[12px]">
            {open} open of {items.length} detected
          </span>
        </div>
        <p className="text-text-tertiary text-[12px]">
          Queued fixes are verified by the next re-scan
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-0 px-0 pb-0">
        {items.length === 0 ? (
          <div className="text-success-700 dark:text-success-100 flex items-center gap-2 px-6 pb-6 text-[13px] font-medium">
            <Icons.approve
              className="size-4 shrink-0"
              aria-hidden
            />
            All listed directories match the canonical NAP — no open drift since the last weekly
            diff.
          </div>
        ) : (
          items.map((item, i) => (
            <div
              key={item.key}
              className={cn(
                "border-border flex flex-wrap items-start justify-between gap-3 border-t px-6 py-4",
                i === items.length - 1 && "rounded-b-lg",
                item.severity === "critical" &&
                  item.status === "open" &&
                  "border-l-error-500 border-l-[3px]",
              )}
            >
              <div className="flex min-w-0 flex-1 basis-64 flex-col gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <StatusPill tone={SEVERITY_TONE[item.severity]}>{item.severity}</StatusPill>
                  <Badge
                    variant="outline"
                    className="text-text-secondary text-[10px] font-medium"
                  >
                    {FIELD_LABEL[item.field]}
                  </Badge>
                  <span className="text-foreground text-[13px] font-medium">{item.directory}</span>
                  <span className="text-text-tertiary text-[11px]">{item.domain}</span>
                  <SourceBadge
                    source={item.source}
                    note={item.derived ? "Mismatch observed in the citation scan" : undefined}
                  />
                </div>
                <InlineDiff item={item} />
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <div className="flex items-center gap-2">
                  <span className="num text-text-tertiary text-[11px]">
                    detected {fmtDateShort(item.detected_at)}
                  </span>
                  <StatusPill tone={STATUS_TONE[item.status]}>
                    {STATUS_LABEL[item.status]}
                  </StatusPill>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2.5 text-[12px]"
                  onClick={() => onView(item.key)}
                  aria-label={`View recommendation for ${item.directory} ${FIELD_LABEL[item.field]} drift`}
                >
                  View
                  <Icons.arrowRight
                    className="size-3.5"
                    aria-hidden
                  />
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
