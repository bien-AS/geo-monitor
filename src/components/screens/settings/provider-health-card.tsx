"use client";

import { Icons } from "@/lib/icons";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/local/status-pill";
import { useRole } from "@/components/shell/role-store";

export interface ProviderStatus {
  name: string;
  purpose: string;
  envVar: string;
  configured: boolean;
  note?: string;
}

/**
 * Provider health panel (agency plumbing). Rendered for AS roles only:
 * clients never see vendor names or key state.
 */
export function ProviderHealthCard({ providers }: { providers: ProviderStatus[] }) {
  const role = useRole();
  if (role !== "operator") return null;

  const okCount = providers.filter((p) => p.configured).length;

  return (
    <Card className="gap-4 p-6">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icons.plug className="text-text-tertiary size-4" />
          <h2 className="text-base font-semibold">Provider health</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="num text-text-tertiary text-[12px]">
            {okCount}/{providers.length} configured
          </span>
          <StatusPill tone="neutral">Agency only</StatusPill>
        </div>
      </div>
      <div className="divide-border-subtle flex flex-col divide-y">
        {providers.map((p) => (
          <div
            key={p.name}
            className="flex items-center justify-between gap-3 py-3"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium">{p.name}</p>
              <p className="text-text-tertiary truncate text-[13px]">
                {p.purpose}
                {p.note ? ` · ${p.note}` : ""}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="num text-text-disabled hidden text-[11px] sm:inline">
                {p.envVar}
              </span>
              {p.configured ? (
                <StatusPill tone="success">Configured</StatusPill>
              ) : (
                <StatusPill tone="warning">Not set</StatusPill>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
