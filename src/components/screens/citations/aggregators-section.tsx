"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/local/status-pill";
import { ApprovalLadder } from "@/components/local/approval-ladder";
import { useRole } from "@/components/shell/role-store";
import { Icons } from "@/lib/icons";
import type { CitationAggregator } from "@/lib/data/types";

export function AggregatorsSection({
  aggregators,
  slug,
  locationName,
}: {
  aggregators: CitationAggregator[];
  slug: string;
  locationName: string;
}) {
  const role = useRole();
  if (aggregators.length === 0) return null;

  return (
    <Card className="gap-4 p-6">
      <div>
        <div className="flex items-center gap-2">
          <Icons.layers
            className="text-text-tertiary size-4"
            aria-hidden
          />
          <h2 className="text-base font-semibold">Data aggregators</h2>
        </div>
        <p className="text-text-tertiary mt-0.5 text-[13px]">
          One sync pushes the canonical NAP across each network&apos;s entire distribution — the
          foundation under the individual directories below.
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {aggregators.map((a) => (
          <div
            key={a.id}
            className="border-border flex flex-col gap-2 rounded-lg border p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span
                  aria-hidden
                  className="bg-primary-50 text-primary-700 dark:bg-primary-700/25 dark:text-primary-100 flex size-8 shrink-0 items-center justify-center rounded-md font-mono text-[11px] font-bold"
                >
                  {a.name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </span>
                <p className="text-[13.5px] leading-tight font-semibold">{a.name}</p>
              </div>
              {a.status === "synced" ? (
                <StatusPill tone="success">Synced</StatusPill>
              ) : (
                <StatusPill tone="neutral">Available</StatusPill>
              )}
            </div>
            <p className="text-text-secondary text-[12px] leading-snug">{a.tagline}</p>
            <div className="mt-auto flex items-center justify-between gap-2 pt-1">
              <p className="num text-text-tertiary text-[11px]">
                {a.status === "synced" && a.last_synced
                  ? `Last synced ${a.last_synced}`
                  : "Not yet distributed"}
              </p>
              {role === "operator" && a.status !== "synced" && (
                <ApprovalLadder
                  trigger={
                    <Button
                      variant="outline"
                      size="sm"
                    >
                      <Icons.refreshCcw className="size-3.5" />
                      Sync
                    </Button>
                  }
                  title={`Sync ${a.name}`}
                  description={`${locationName} · aggregator distribution via Bright Local`}
                  actionVerb="Approve & order sync"
                  auditAction={`Ordered ${a.name} aggregator sync (Bright Local publisher: ${a.bl_publisher})`}
                  auditResource={`citations:${slug}:${a.id}`}
                  auditVerb="create"
                  locationSlug={slug}
                  preview={
                    <div className="space-y-1.5 text-[13px]">
                      <p>
                        <span className="font-semibold">{a.name}</span> receives the canonical NAP
                        for <span className="font-semibold">{locationName}</span> and distributes it
                        across its network.
                      </p>
                      <p className="text-text-secondary">{a.tagline}</p>
                      <p className="num text-text-tertiary text-[12px]">
                        Bright Local publisher id: {a.bl_publisher} · package cb0 (aggregators-only)
                        compatible
                      </p>
                    </div>
                  }
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
