"use client";

import { Icons } from "@/lib/icons";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useRole } from "@/components/shell/role-store";

const POLICIES = [
  {
    id: "approval-all-writes",
    label: "Every write requires approval",
    detail:
      "Preview → approve → write → audit log on every mutation. Locked on — the platform's core safety pattern.",
    value: true,
  },
  {
    id: "no-auto-post-replies",
    label: "Never auto-post review replies",
    detail:
      "HIPAA guardrail: drafts always pass the PHI gate and a human approval. Locked off — cannot be enabled.",
    value: false,
  },
  {
    id: "simulated-writes",
    label: "Simulated writes (prototype)",
    detail:
      "Approved writes update local state and the audit log only. Live GBP writes arrive with the Search Atlas OAuth phase.",
    value: true,
  },
] as const;

/** Approvals & write policy — all three are structural, shown locked. */
export function PolicyCard() {
  const role = useRole();
  if (role !== "operator") return null;

  return (
    <Card className="gap-4 p-6">
      <div className="flex items-center gap-2">
        <Icons.shield className="text-text-tertiary size-4" />
        <h2 className="text-base font-semibold">Approvals & write policy</h2>
      </div>
      <div className="divide-border-subtle flex flex-col divide-y">
        {POLICIES.map((p) => (
          <div
            key={p.id}
            className="flex items-start justify-between gap-4 py-3"
          >
            <div>
              <Label
                htmlFor={p.id}
                className="flex items-center gap-1.5 text-sm font-medium"
              >
                {p.label}
                <Icons.lock
                  className="text-text-disabled size-3"
                  aria-label="Locked"
                />
              </Label>
              <p className="text-text-tertiary mt-0.5 text-[13px]">{p.detail}</p>
            </div>
            <Switch
              id={p.id}
              checked={p.value}
              disabled
              aria-readonly
            />
          </div>
        ))}
      </div>
    </Card>
  );
}
