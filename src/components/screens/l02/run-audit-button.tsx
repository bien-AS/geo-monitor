"use client";

import * as React from "react";
import { toast } from "sonner";
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
import { CostPreview } from "@/components/local/cost-preview";
import { useAuditLog } from "@/components/local/audit-log-store";
import { useRole } from "@/components/shell/role-store";
import { fmtCost, fmtCostPerCall, fmtInt } from "@/lib/format";

export interface RunAuditCost {
  gridCells: number;
  gridCost: number;
  promptCount: number;
  aiPerPrompt: number;
  aiCost: number;
  total: number;
}

export function RunAuditButton({
  slug,
  locationName,
  cost,
}: {
  slug: string;
  locationName: string;
  cost: RunAuditCost;
}) {
  const role = useRole();
  const addEntry = useAuditLog((s) => s.addEntry);
  const [open, setOpen] = React.useState(false);

  if (role !== "operator") return null;

  const approve = () => {
    addEntry({
      actor: "Agency Operator",
      role: "operator",
      verb: "create",
      action: "Run location audit",
      resource: `locations/${slug}`,
      location_slug: slug,
      detail: `Queued GBP audit refresh + ${fmtInt(cost.gridCells)}-cell geo-grid sample + ${cost.promptCount}-prompt × 6-surface AI check (${fmtCost(cost.total)}, simulated)`,
    });
    setOpen(false);
    toast.success("Location audit queued", {
      description: "Demo mode — write simulated. Entry added to the audit log.",
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger asChild>
        <Button
          size="sm"
          aria-label={`Run location audit for ${locationName}`}
        >
          <Icons.rocket aria-hidden />
          Run location audit
          <span className="num font-semibold">{fmtCost(cost.total)}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Run location audit</DialogTitle>
          <DialogDescription>
            Refreshes all sub-modules for {locationName}: GBP profile audit, geo-grid sample,
            6-surface local AI check, citation diff and review pull.
          </DialogDescription>
        </DialogHeader>
        <CostPreview
          title="Estimated cost per run"
          value={fmtCost(cost.total)}
          math={`${fmtInt(cost.gridCells)} grid cells × ${fmtCostPerCall(0.0025)} + ${cost.promptCount} prompts × ${fmtCostPerCall(cost.aiPerPrompt)} (6-surface mix)`}
          perSurface={[
            { label: "Geo-grid sample", value: fmtCost(cost.gridCost) },
            { label: "Local AI (6 surfaces)", value: fmtCost(cost.aiCost) },
          ]}
          subline="GBP profile refresh, citation diff and review pull are bundled — no metered cost."
        />
        <DialogFooter className="items-center gap-2 sm:justify-between">
          <p className="text-text-tertiary text-[12px]">Demo mode — write simulated</p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={approve}
            >
              Approve &amp; run
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
