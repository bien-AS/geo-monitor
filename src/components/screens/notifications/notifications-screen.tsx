"use client";

import * as React from "react";
import Link from "next/link";
import { Icons } from "@/lib/icons";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/local/status-pill";
import { useRole } from "@/components/shell/role-store";
import { useNotificationsStore } from "@/store/notifications";
import { fmtDate, fmtTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AppNotification, NotificationSeverity } from "@/lib/data/types";

const SEVERITY_ICON: Record<NotificationSeverity, React.ComponentType<{ className?: string }>> = {
  info: Icons.info,
  success: Icons.checkCircle,
  warning: Icons.alert,
  error: Icons.error,
};

const SEVERITY_COLOR: Record<NotificationSeverity, string> = {
  info: "text-primary-500",
  success: "text-success-600",
  warning: "text-warning-500",
  error: "text-error-600",
};

const KIND_FILTERS = [
  { key: "all", label: "All", kind: null },
  { key: "rank", label: "Rank", kind: "rank_drop" },
  { key: "reviews", label: "Reviews", kind: "review" },
  { key: "nap", label: "NAP", kind: "nap_drift" },
  { key: "runs", label: "Runs", kind: "run" },
] as const;

export function NotificationsScreen({ notifications }: { notifications: AppNotification[] }) {
  const role = useRole();
  const { readIds, markRead, markAllRead } = useNotificationsStore();
  const [filter, setFilter] = React.useState<(typeof KIND_FILTERS)[number]["key"]>("all");

  const inAudience = notifications.filter((n) => n.audience === "all" || role === "operator");
  const activeKind = KIND_FILTERS.find((f) => f.key === filter)?.kind ?? null;
  const visible = activeKind ? inAudience.filter((n) => n.kind === activeKind) : inAudience;
  const unread = visible.filter((n) => !readIds.includes(n.id));

  return (
    <div className="flex max-w-3xl flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {KIND_FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={cn(
                "focus-visible:border-ring focus-visible:ring-ring/50 h-8 rounded-full border px-2.5 text-[12.5px] font-medium transition-colors outline-none focus-visible:ring-3",
                filter === f.key
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-text-secondary hover:bg-muted",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={unread.length === 0}
            onClick={() => markAllRead(visible.map((n) => n.id))}
          >
            Mark all read
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <Link href="/settings">Preferences</Link>
          </Button>
        </div>
      </div>

      <Card className="gap-0 p-0">
        {visible.length === 0 && (
          <div className="flex flex-col items-center gap-2 p-10">
            <Icons.bell className="text-text-tertiary size-6" />
            <p className="text-text-tertiary text-[13px]">
              Nothing here — this filter has no notifications.
            </p>
          </div>
        )}
        {visible.map((n, i) => {
          const isRead = readIds.includes(n.id);
          const SeverityIcon = SEVERITY_ICON[n.severity];
          return (
            <Link
              key={n.id}
              href={n.href}
              onClick={() => markRead(n.id)}
              className={cn(
                "group/row hover:bg-muted flex items-start gap-3 px-5 py-4 transition-colors",
                i > 0 && "border-border-subtle border-t",
              )}
            >
              <SeverityIcon className={cn("mt-0.5 size-4 shrink-0", SEVERITY_COLOR[n.severity])} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {!isRead && (
                    <span
                      aria-label="Unread"
                      className="bg-primary size-1.5 shrink-0 rounded-full"
                    />
                  )}
                  <p className={cn("text-[13.5px]", isRead ? "font-normal" : "font-semibold")}>
                    {n.title}
                  </p>
                  {n.audience === "operator" && <StatusPill tone="neutral">Agency</StatusPill>}
                </div>
                <p className="text-text-tertiary mt-0.5 text-[12.5px]">{n.body}</p>
                <p className="text-text-tertiary mt-1 text-[11.5px] tabular-nums">
                  {fmtDate(n.ts)} · {fmtTime(n.ts)}
                </p>
              </div>
              <Icons.arrowUpRight className="text-text-tertiary mt-0.5 size-4 shrink-0 opacity-0 transition-opacity group-hover/row:opacity-100" />
            </Link>
          );
        })}
      </Card>
    </div>
  );
}
