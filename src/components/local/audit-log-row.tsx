import { cn } from "@/lib/utils";
import type { AuditLogEntry } from "@/lib/data/types";
import { fmtDateShort, fmtTime } from "@/lib/format";

const VERB_BORDER: Record<AuditLogEntry["verb"], string> = {
  create: "border-l-success-500",
  approve: "border-l-success-500",
  update: "border-l-warning-500",
  delete: "border-l-error-500",
  read: "border-l-primary-500",
};

/** Audit log row — DESIGN.md healthcare pattern (state-colored left border). */
export function AuditLogRow({ entry, className }: { entry: AuditLogEntry; className?: string }) {
  return (
    <div
      className={cn(
        "bg-card flex items-start gap-3 rounded-r-md border-l-[3px] px-3 py-2.5",
        VERB_BORDER[entry.verb],
        className,
      )}
    >
      <div className="num text-text-tertiary w-[86px] shrink-0 pt-0.5 text-[11px] leading-tight">
        {fmtDateShort(entry.ts)}
        <br />
        {fmtTime(entry.ts)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] leading-snug">
          <span className="font-semibold">{entry.actor}</span>{" "}
          <span className="text-text-secondary">{entry.action}</span>
        </p>
        <p className="text-text-tertiary mt-0.5 truncate text-[12px]">
          {entry.resource}
          {entry.detail ? ` · ${entry.detail}` : ""}
        </p>
      </div>
      {entry.demo && (
        <span className="eyebrow bg-warning-50 text-warning-700 dark:bg-warning-700/25 dark:text-warning-100 shrink-0 rounded px-1.5 py-0.5">
          Demo
        </span>
      )}
    </div>
  );
}
