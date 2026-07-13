"use client";

import * as React from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Icons } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { AuditVerb } from "@/lib/data/types";
import { CostPreview } from "./cost-preview";
import { useAuditLog } from "./audit-log-store";
import { useRole } from "@/components/shell/role-store";
import { fmtTime } from "@/lib/format";

const STEPS = ["Preview", "Approve", "Write", "Audit log"] as const;

export function ApprovalLadder({
  trigger,
  title,
  description,
  actionVerb = "Approve & write",
  auditAction,
  auditResource,
  auditVerb = "update",
  locationSlug,
  preview,
  cost,
  gate,
  onCompleted,
}: {
  trigger: React.ReactNode;
  title: string;
  description?: string;
  actionVerb?: string;
  auditAction: string;
  auditResource: string;
  auditVerb?: AuditVerb;
  locationSlug?: string;
  preview: React.ReactNode;
  cost?: { value: string; math: string; subline?: string };
  gate?: { blocked: boolean; label: string; detail?: string };
  onCompleted?: () => void;
}) {
  const role = useRole();
  const addEntry = useAuditLog((s) => s.addEntry);
  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState(0);
  const [writing, setWriting] = React.useState(false);
  const [loggedAt, setLoggedAt] = React.useState<string | null>(null);

  if (role === "client-viewer") return null;

  const reset = () => {
    setStep(0);
    setWriting(false);
    setLoggedAt(null);
  };

  const runWrite = () => {
    setStep(2);
    setWriting(true);
    window.setTimeout(() => {
      setWriting(false);
      const entry = addEntry({
        actor: "Agency Operator",
        role: "operator",
        verb: auditVerb,
        action: auditAction,
        resource: auditResource,
        location_slug: locationSlug,
        detail: "Demo mode \u2014 write simulated",
      });
      setLoggedAt(entry.ts);
      setStep(3);
      toast.success("Write simulated", {
        description: `${auditAction} \u00b7 logged to audit trail`,
      });
      onCompleted?.();
    }, 900);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>

        <ol
          className="flex items-center gap-0"
          aria-label="Approval steps"
        >
          {STEPS.map((label, i) => (
            <li
              key={label}
              className="flex flex-1 items-center last:flex-none"
            >
              <span className="flex flex-col items-center gap-1">
                <span
                  className={cn(
                    "flex size-6 items-center justify-center rounded-full border text-[11px] font-semibold",
                    i < step
                      ? "border-primary bg-primary text-primary-foreground"
                      : i === step
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground",
                  )}
                  aria-current={i === step ? "step" : undefined}
                >
                  {i < step ? <Icons.check className="size-3.5" /> : i + 1}
                </span>
                <span
                  className={cn(
                    "text-[10px] font-semibold tracking-[0.05em] uppercase",
                    i <= step ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {label}
                </span>
              </span>
              {i < STEPS.length - 1 && (
                <span
                  aria-hidden
                  className={cn("mx-2 mb-4 h-px flex-1", i < step ? "bg-primary" : "bg-border")}
                />
              )}
            </li>
          ))}
        </ol>

        <div className="min-h-[160px]">
          {step === 0 && (
            <div className="flex flex-col gap-3">
              <p className="text-muted-foreground flex items-center gap-1.5 text-[12px] font-medium">
                <Icons.fileText className="size-3.5" />
                Exact change to be written
              </p>
              <div className="border-border bg-muted/30 max-h-64 overflow-y-auto rounded-md border p-3 text-sm">
                {preview}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col gap-3">
              {cost && (
                <CostPreview
                  value={cost.value}
                  math={cost.math}
                  subline={cost.subline}
                />
              )}
              {gate?.blocked ? (
                <div
                  role="alert"
                  className="bg-destructive/10 text-destructive flex items-start gap-2 rounded-md p-3 text-[13px]"
                >
                  <Icons.lock className="mt-0.5 size-4 shrink-0" />
                  <div>
                    <p className="font-semibold">{gate.label}</p>
                    {gate.detail && <p className="mt-0.5">{gate.detail}</p>}
                  </div>
                </div>
              ) : (
                <div className="bg-accent text-accent-foreground flex items-start gap-2 rounded-md p-3 text-[13px]">
                  <Icons.alert className="mt-0.5 size-4 shrink-0" />
                  <p>
                    Approving queues this exact change. Every approval is recorded to the immutable
                    audit trail with your name and timestamp.
                  </p>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="text-muted-foreground flex h-40 flex-col items-center justify-center gap-3">
              <Icons.loading className="text-primary size-6 animate-spin" />
              <p className="text-sm">Writing change\u2026</p>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 rounded-md bg-green-50 p-3 text-[13px] font-medium text-green-700 dark:bg-green-950 dark:text-green-200">
                <Icons.checkCircle className="size-4 shrink-0" />
                Change accepted{" "}
                <span className="rounded bg-yellow-50 px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.05em] text-yellow-700 uppercase dark:bg-yellow-950 dark:text-yellow-200">
                  Demo mode \u2014 write simulated
                </span>
              </div>
              <div className="border-border rounded-md border border-l-[3px] border-l-green-500 p-3">
                <p className="num text-muted-foreground text-[11px]">
                  {loggedAt ? `Logged ${fmtTime(loggedAt)}` : "Logged"}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-[13px]">
                  <Icons.audit className="text-muted-foreground size-3.5" />
                  <span className="font-medium">Agency Operator</span>
                  <span className="text-muted-foreground">{auditAction}</span>
                </p>
                <p className="text-muted-foreground mt-0.5 text-[12px]">{auditResource}</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {step === 0 && (
            <>
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={() => setStep(1)}>Continue to approve</Button>
            </>
          )}
          {step === 1 && (
            <>
              <Button
                variant="outline"
                onClick={() => setStep(0)}
              >
                Back
              </Button>
              <Button
                onClick={runWrite}
                disabled={Boolean(gate?.blocked)}
              >
                <Icons.send className="size-4" />
                {actionVerb}
              </Button>
            </>
          )}
          {step === 3 && <Button onClick={() => setOpen(false)}>Done</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
