"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { StatusPill, type PillTone } from "@/components/local/status-pill";
import { SourceBadge } from "@/components/local/source-badge";
import { ApprovalLadder } from "@/components/local/approval-ladder";
import { Icons } from "@/lib/icons";
import { fmtDate } from "@/lib/format";
import {
  changeStatusLabel,
  type ChangeSeverity,
  type ChangeWho,
  type ProfileChange,
} from "./changes";
import { DiffPanel } from "./diff-panel";

const WHO_TONE: Record<ChangeWho, PillTone> = {
  google: "warning",
  directory: "neutral",
  operator: "info",
};

const SEVERITY_TONE: Record<ChangeSeverity, PillTone> = {
  critical: "error",
  moderate: "warning",
  minor: "neutral",
  info: "info",
};

const STATUS_TONE: Record<ProfileChange["status"], PillTone> = {
  open: "error",
  fix_queued: "warning",
  fixed: "success",
  logged: "neutral",
};

export function DiffSheet({
  change,
  slug,
  locationName,
  fieldHistoryCount,
}: {
  change: ProfileChange;
  slug: string;
  locationName: string;
  fieldHistoryCount: number;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(true);
  const [queued, setQueued] = React.useState(false);

  const close = React.useCallback(() => {
    setOpen(false);
    window.setTimeout(() => {
      router.push(`/locations/${slug}/gbp-health`);
    }, 150);
  }, [router, slug]);

  const status = queued && change.status === "open" ? "fix_queued" : change.status;

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => (o ? setOpen(true) : close())}
    >
      <SheetContent
        side="right"
        className="w-full gap-0 overflow-y-auto sm:max-w-[600px]"
      >
        <SheetHeader className="border-border border-b px-6 pt-6 pb-4">
          <SheetTitle>Profile change \u2014 {change.fieldLabel}</SheetTitle>
          <SheetDescription>
            {locationName} \u00b7 change <span className="num">{change.changeId}</span> \u00b7
            detected <span className="num">{fmtDate(change.date)}</span>
          </SheetDescription>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <StatusPill tone={WHO_TONE[change.who]}>{change.whoLabel}</StatusPill>
            <StatusPill tone={SEVERITY_TONE[change.severity]}>
              {change.severity === "info"
                ? "Info"
                : change.severity.charAt(0).toUpperCase() + change.severity.slice(1)}
            </StatusPill>
            <StatusPill tone={STATUS_TONE[status]}>{changeStatusLabel(status)}</StatusPill>
            <SourceBadge source={change.source} />
          </div>
        </SheetHeader>

        <div className="flex flex-col gap-4 px-6 py-5">
          <p className="text-muted-foreground text-[13px]">{change.summary}</p>

          <DiffPanel change={change} />

          {change.kind === "nap-drift" ? (
            change.actionable && !queued ? (
              <div className="border-border bg-muted/30 flex items-center justify-between gap-3 rounded-md border p-3.5">
                <p className="text-muted-foreground text-[12px]">
                  Queue a correction writing the canonical value back to{" "}
                  <span className="font-medium">{change.directory}</span>.
                </p>
                <ApprovalLadder
                  trigger={
                    <Button size="sm">
                      <Icons.wrench className="size-3.5" />
                      Queue fix
                    </Button>
                  }
                  title={`Queue ${change.field} fix \u2014 ${change.directory}`}
                  description={locationName}
                  actionVerb="Approve & queue fix"
                  auditAction={`Queued ${change.field} correction to ${change.directory}`}
                  auditResource={`nap:${slug}/${change.directory}`}
                  auditVerb="update"
                  locationSlug={slug}
                  onCompleted={() => setQueued(true)}
                  preview={
                    <div className="flex flex-col gap-2 text-[13px]">
                      <p>
                        Replace the drifted value on{" "}
                        <span className="font-medium">{change.directory}</span> with the canonical
                        record:
                      </p>
                      <div className="border-border bg-card rounded-md border p-2.5">
                        <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.05em] uppercase">
                          {change.fieldLabel} \u00b7 {change.directory}
                        </p>
                        <p className="num mt-0.5 text-[12px] text-red-700 line-through dark:text-red-300">
                          {change.after}
                        </p>
                        <p className="num mt-0.5 text-[12px] font-semibold text-green-700 dark:text-green-300">
                          {change.before}
                        </p>
                      </div>
                    </div>
                  }
                />
              </div>
            ) : (
              <p className="bg-secondary text-muted-foreground rounded-md p-3 text-[12px]">
                {status === "fix_queued"
                  ? "A correction is already queued for this drift \u2014 it will clear on the next verification scan."
                  : status === "fixed"
                    ? "This drift was corrected and verified on a later scan."
                    : "No action available for this change."}
              </p>
            )
          ) : (
            <p className="bg-secondary text-muted-foreground rounded-md p-3 text-[12px]">
              Operator write from the audit trail \u2014 read-only history, no action to take.
            </p>
          )}
        </div>

        <div className="border-border mt-auto border-t px-6 py-4">
          <p className="text-muted-foreground text-[12px]">
            <span className="num">{fieldHistoryCount}</span> {change.fieldLabel.toLowerCase()}{" "}
            change
            {fieldHistoryCount === 1 ? "" : "s"} on record for this location \u00b7{" "}
            <button
              type="button"
              onClick={close}
              className="font-medium text-blue-600 hover:underline"
            >
              Back to GBP audit \u2190
            </button>
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
