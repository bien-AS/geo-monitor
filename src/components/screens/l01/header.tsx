"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CostPreview } from "@/components/local/cost-preview";
import { StatusPill } from "@/components/local/status-pill";
import { useAuditLog } from "@/components/local/audit-log-store";
import { useRole } from "@/components/shell/role-store";
import { Icons } from "@/lib/icons";
import { SURFACES } from "@/lib/surfaces";
import { fmtCost, fmtCostPerCall, fmtInt } from "@/lib/format";

export function L01Header({
  locationCount,
  needsAttention,
  facilityCount,
  departmentCount,
  practitionerCount,
  snapshotDate,
  auditCostUsd,
  promptCount,
  keywordGrids,
  rankChecks,
  extraActions,
}: {
  locationCount: number;
  needsAttention: number;
  facilityCount: number;
  departmentCount: number;
  practitionerCount: number;
  snapshotDate: string;
  auditCostUsd: number;
  promptCount: number;
  keywordGrids: number;
  rankChecks: number;
  extraActions?: React.ReactNode;
}) {
  const role = useRole();
  const addEntry = useAuditLog((s) => s.addEntry);
  const [open, setOpen] = React.useState(false);

  const runAudit = () => {
    addEntry({
      actor: "Agency Operator",
      role: "operator",
      verb: "create",
      action: "fleet_audit.run",
      resource: `fleet:${locationCount}-locations`,
      detail: `Fleet audit queued — ${fmtCost(auditCostUsd)} 6-surface AI re-check + ${fmtInt(rankChecks)} geo-grid rank checks. Demo mode — write simulated.`,
    });
    setOpen(false);
    toast.success("Fleet audit queued", {
      description: "Demo mode — write simulated. Logged to the audit trail.",
    });
  };

  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="text-text-tertiary text-[13px] font-medium">
          Welcome back,{" "}
          <span className="text-text-secondary font-semibold">
            {role === "operator" ? "Zach B." : "Karen W."}
          </span>
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">Local SEO</h1>
          <StatusPill tone="neutral">
            <span className="num">{locationCount}</span>&nbsp;locations
          </StatusPill>
          {needsAttention > 0 && (
            <StatusPill tone="warning">
              <span className="num">{needsAttention}</span>&nbsp;need attention
            </StatusPill>
          )}
        </div>
        <p className="text-text-tertiary mt-1 text-[13px]">
          Baptist Memorial Health Care fleet · <span className="num">{facilityCount}</span>{" "}
          facilities · <span className="num">{departmentCount}</span> departments
          {practitionerCount > 0 ? (
            <>
              {" "}
              · <span className="num">{practitionerCount}</span> practitioners
            </>
          ) : null}{" "}
          · Data snapshot <span className="num">{snapshotDate}</span>
        </p>
      </div>

      <div className="flex flex-col items-end gap-1.5">
        <div className="flex items-center gap-2">
          {extraActions}
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              toast.info("Fleet brief export queued", {
                description: "Demo mode — PDF generation simulated.",
              })
            }
          >
            <Icons.export aria-hidden />
            Export fleet brief
          </Button>
          {role === "operator" && (
            <Popover
              open={open}
              onOpenChange={setOpen}
            >
              <PopoverTrigger asChild>
                <Button size="sm">
                  <Icons.rocket aria-hidden />
                  Run fleet audit
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="w-[380px] p-0"
              >
                <CostPreview
                  title="Estimated cost — full fleet refresh"
                  value={`${fmtCost(auditCostUsd)} + ${fmtInt(rankChecks)} rank checks`}
                  math={`${locationCount} locations × ${promptCount} prompts × ${fmtCostPerCall(
                    SURFACES.reduce((s, x) => s + x.cost, 0),
                  )} (6 surfaces) · ${keywordGrids} keyword grids × 49 pins`}
                  subline="Geo-grid rank checks are provider-metered per pin; citation diff and GBP re-audit run on the same cycle at no extra call cost."
                  perSurface={SURFACES.map((s) => ({
                    label: s.name,
                    value: fmtCostPerCall(s.cost),
                    color: s.color,
                  }))}
                  className="rounded-t-md"
                />
                <div className="border-border flex items-center justify-between gap-3 border-t p-3">
                  <p className="text-text-tertiary text-[11px] leading-snug">
                    Preview → Approve → Simulated write → Audit log
                  </p>
                  <Button
                    size="sm"
                    onClick={runAudit}
                  >
                    Approve &amp; run
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
        <span className="bg-secondary text-text-secondary rounded px-2 py-0.5 text-[11px] font-bold">
          Last cycle · <span className="num">{snapshotDate}</span>
        </span>
      </div>
    </div>
  );
}
