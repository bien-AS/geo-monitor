"use client";

import * as React from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { fmtPct } from "@/lib/format";
import type { DataSource, NAP } from "@/lib/data/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SourceBadge } from "@/components/local/source-badge";
import { Icons } from "@/lib/icons";

export interface FieldStat {
  match: number;
  listed: number;
}

const FIELD_ROWS: Array<{ key: keyof NAP; label: string }> = [
  { key: "name", label: "Name" },
  { key: "address", label: "Address" },
  { key: "phone", label: "Phone" },
  { key: "website", label: "Website" },
];

function CopyButton({ label, value }: { label: string; value: string }) {
  return (
    <button
      type="button"
      aria-label={`Copy canonical ${label.toLowerCase()}`}
      className="text-text-tertiary hover:bg-secondary hover:text-foreground flex size-7 shrink-0 items-center justify-center rounded-md"
      onClick={() => {
        void navigator.clipboard.writeText(value);
        toast.success(`Canonical ${label.toLowerCase()} copied`);
      }}
    >
      <Icons.copy
        className="size-3.5"
        aria-hidden
      />
    </button>
  );
}

export function CanonicalCard({
  canonical,
  fieldStats,
}: {
  canonical: NAP & { source: DataSource };
  fieldStats: { name: FieldStat; address: FieldStat; phone: FieldStat };
}) {
  return (
    <Card className="min-w-0">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0">
        <div>
          <CardTitle className="text-[15px]">Canonical NAP — source of truth</CardTitle>
          <p className="text-text-tertiary mt-0.5 text-[12px]">
            Diff baseline for every directory below
          </p>
        </div>
        <SourceBadge source={canonical.source} />
      </CardHeader>
      <CardContent className="grid gap-5 md:grid-cols-[1fr_240px]">
        <dl className="flex min-w-0 flex-col gap-3">
          {FIELD_ROWS.map(({ key, label }) => {
            const value = canonical[key];
            if (!value) return null;
            return (
              <div
                key={key}
                className="flex items-start justify-between gap-2"
              >
                <div className="min-w-0">
                  <dt className="eyebrow text-text-tertiary">{label}</dt>
                  <dd className="num text-foreground mt-0.5 text-[13px] leading-relaxed break-words">
                    {value}
                  </dd>
                </div>
                <CopyButton
                  label={label}
                  value={value}
                />
              </div>
            );
          })}
        </dl>
        <div className="border-border flex flex-col gap-3 border-t pt-4 md:border-t-0 md:border-l md:pt-0 md:pl-5">
          <p className="eyebrow text-text-tertiary">Field consistency · of listed</p>
          {(["name", "address", "phone"] as const).map((key) => {
            const stat = fieldStats[key];
            const pct = stat.listed > 0 ? (stat.match / stat.listed) * 100 : 0;
            const clean = pct >= 100;
            const labels: Record<string, string> = {
              name: "Name",
              address: "Address",
              phone: "Phone",
            };
            return (
              <div key={key}>
                <div className="flex items-baseline justify-between gap-2 text-[12px]">
                  <span className="text-text-secondary font-medium">{labels[key]}</span>
                  <span
                    className={cn(
                      "num font-semibold",
                      clean
                        ? "text-success-600 dark:text-success-100"
                        : "text-warning-600 dark:text-warning-100",
                    )}
                  >
                    {fmtPct(pct)}{" "}
                    <span className="text-text-tertiary font-normal">
                      {stat.match}/{stat.listed}
                    </span>
                  </span>
                </div>
                <div
                  role="img"
                  aria-label={`${labels[key]}: ${stat.match} of ${stat.listed} listed directories match canonical`}
                  className="bg-secondary mt-1 h-1.5 overflow-hidden rounded-full"
                >
                  <div
                    className={cn(
                      "h-full rounded-full",
                      clean ? "bg-success-500" : "bg-warning-500",
                    )}
                    style={{ width: `${Math.max(pct, 2)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
