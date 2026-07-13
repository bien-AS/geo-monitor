import Link from "next/link";
import { Card } from "@/components/ui/card";
import { StatusPill, type PillTone } from "@/components/local/status-pill";
import { Icons } from "@/lib/icons";
import { fmtDateShort } from "@/lib/format";
import {
  changeStatusLabel,
  type ChangeSeverity,
  type ChangeWho,
  type ProfileChange,
} from "./changes";

const WHO_TONE: Record<ChangeWho, PillTone> = {
  google: "warning",
  directory: "neutral",
  operator: "info",
};

const SEVERITY_META: Record<ChangeSeverity, { label: string; dot: string }> = {
  critical: { label: "Critical", dot: "bg-red-500" },
  moderate: { label: "Moderate", dot: "bg-yellow-500" },
  minor: { label: "Minor", dot: "bg-neutral-400" },
  info: { label: "Info", dot: "bg-blue-300" },
};

const STATUS_TONE: Record<ProfileChange["status"], PillTone> = {
  open: "error",
  fix_queued: "warning",
  fixed: "success",
  logged: "neutral",
};

export function EditHistory({ changes, slug }: { changes: ProfileChange[]; slug: string }) {
  return (
    <Card className="gap-4 p-6">
      <div>
        <h2 className="text-lg font-semibold">Edit history</h2>
        <p className="text-muted-foreground text-[13px]">
          NAP drift vs canonical + operator writes \u00b7{" "}
          <span className="num">{changes.length}</span> change
          {changes.length === 1 ? "" : "s"} on record
        </p>
      </div>

      {changes.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-10">
          <div
            className="flex items-center gap-2"
            aria-hidden
          >
            <span className="size-6 rotate-45 bg-blue-200" />
            <span className="size-6 rounded-full bg-cyan-200" />
          </div>
          <h3 className="text-[15px] font-semibold">No profile changes recorded</h3>
          <p className="text-muted-foreground max-w-sm text-center text-[13px]">
            Each scan diffs this listing against the canonical NAP; the first drift or operator
            write will appear here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col divide-y">
          {changes.map((change) => {
            const sev = SEVERITY_META[change.severity];
            return (
              <Link
                key={change.changeId}
                href={`/locations/${slug}/gbp-health/diff/${change.changeId}`}
                aria-label={`View full diff: ${change.summary}`}
                className="group hover:bg-secondary/50 focus-visible:bg-secondary/50 flex min-h-11 items-center gap-3 px-1 py-2.5"
              >
                <span className="num text-muted-foreground w-14 shrink-0 text-[11px] leading-tight">
                  {fmtDateShort(change.date)}
                </span>
                <StatusPill
                  tone={WHO_TONE[change.who]}
                  className="shrink-0"
                >
                  {change.whoLabel}
                </StatusPill>
                <span className="w-20 shrink-0 truncate text-[12px] font-medium">
                  {change.fieldLabel}
                </span>
                <span className="text-muted-foreground min-w-0 flex-1 truncate text-[13px]">
                  {change.summary}
                </span>
                <span
                  className="text-muted-foreground hidden shrink-0 items-center gap-1.5 text-[11px] font-semibold tracking-[0.05em] uppercase sm:flex"
                  title={`Severity: ${sev.label}`}
                >
                  <span
                    aria-hidden
                    className={`size-1.5 rounded-full ${sev.dot}`}
                  />
                  {sev.label}
                </span>
                <StatusPill
                  tone={STATUS_TONE[change.status]}
                  className="shrink-0"
                >
                  {changeStatusLabel(change.status)}
                </StatusPill>
                <span className="flex shrink-0 items-center gap-0.5 text-[12px] font-medium text-blue-600">
                  <span className="hidden md:inline">View full diff</span>
                  <Icons.chevronRight
                    className="size-3.5"
                    aria-hidden
                  />
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </Card>
  );
}
