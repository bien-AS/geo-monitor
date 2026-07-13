"use client";

import { Card } from "@/components/ui/card";
import { AuditLogRow } from "@/components/local/audit-log-row";
import { useAuditLog } from "@/components/local/audit-log-store";
import { SourceBadge } from "@/components/local/source-badge";
import type { AuditLogEntry } from "@/lib/data/types";

export function ActivityCard({ entries, limit = 6 }: { entries: AuditLogEntry[]; limit?: number }) {
  const sessionEntries = useAuditLog((s) => s.sessionEntries);
  const merged = [...sessionEntries, ...entries]
    .sort((a, b) => (a.ts < b.ts ? 1 : -1))
    .slice(0, limit);

  return (
    <Card className="gap-4 rounded-lg p-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-foreground text-lg font-semibold">Recent activity</h2>
          <p className="text-text-tertiary text-[13px]">
            What the operating team has done · fleet audit trail
          </p>
        </div>
        <SourceBadge source="synthetic" />
      </div>
      {merged.length === 0 ? (
        <p className="text-text-tertiary text-[13px]">No activity recorded yet this session.</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {merged.map((entry) => (
            <AuditLogRow
              key={entry.id}
              entry={entry}
            />
          ))}
        </div>
      )}
      <p className="text-text-tertiary text-[11px]">
        Demo mode — prototype writes are simulated and land in this trail only.
      </p>
    </Card>
  );
}
