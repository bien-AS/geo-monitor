"use client";

import { Card } from "@/components/ui/card";
import { AuditLogRow } from "@/components/local/audit-log-row";
import { useAuditLog } from "@/components/local/audit-log-store";
import type { AuditLogEntry } from "@/lib/data/types";

export function AuditTrail({
  slug,
  initialEntries,
}: {
  slug: string;
  initialEntries: AuditLogEntry[];
}) {
  const sessionEntries = useAuditLog((s) => s.sessionEntries);
  const mine = sessionEntries.filter((e) => e.location_slug === slug);
  const entries = [...mine, ...initialEntries].slice(0, 8);

  return (
    <Card className="gap-4 p-6">
      <div>
        <h2 className="text-lg font-semibold">GBP write audit trail</h2>
        <p className="text-muted-foreground text-[13px]">
          Every approval on this screen lands here \u00b7 <span className="num">{mine.length}</span>{" "}
          this session
        </p>
      </div>
      {entries.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-8">
          <div
            className="flex items-center gap-2"
            aria-hidden
          >
            <span className="size-5 rotate-45 bg-blue-200" />
            <span className="size-5 rounded-full bg-cyan-200" />
          </div>
          <h3 className="text-[14px] font-semibold">No writes yet</h3>
          <p className="text-muted-foreground max-w-sm text-center text-[13px]">
            Approve a scorecard fix through the ladder and the simulated write will be logged here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {entries.map((entry) => (
            <AuditLogRow
              key={entry.id}
              entry={entry}
            />
          ))}
        </div>
      )}
    </Card>
  );
}
