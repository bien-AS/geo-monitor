"use client";

import * as React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRole } from "@/components/shell/role-store";
import { Icons } from "@/lib/icons";
import { fmtDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { RunReceipt, RunStatus } from "@/lib/data/types";
import { fmtDuration, KIND_LABEL, PROVIDER_LABEL, RunStatusPill } from "./run-shared";

type Filter = "all" | RunStatus;

const FILTERS: Array<{ id: Filter; label: string }> = [
  { id: "all", label: "All" },
  { id: "succeeded", label: "Succeeded" },
  { id: "partial", label: "Partial" },
  { id: "failed", label: "Failed" },
];

export function RunsList({ runs }: { runs: RunReceipt[] }) {
  const role = useRole();
  const [filter, setFilter] = React.useState<Filter>("all");
  const isOperator = role === "operator";

  const visible = runs.filter((r) => filter === "all" || r.status === filter);
  const counts = Object.fromEntries(
    FILTERS.map((f) => [
      f.id,
      f.id === "all" ? runs.length : runs.filter((r) => r.status === f.id).length,
    ]),
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={cn(
              "rounded-full border px-3 py-1 text-[12.5px] font-medium",
              filter === f.id
                ? "border-primary bg-primary/10 text-primary dark:text-primary-100"
                : "border-border text-text-secondary hover:bg-secondary/60",
            )}
          >
            {f.label} <span className="tabular-nums">{counts[f.id]}</span>
          </button>
        ))}
      </div>

      <Card className="gap-0 overflow-hidden p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Run</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead className="text-right">Calls</TableHead>
              <TableHead className="text-right">Errors</TableHead>
              {isOperator && <TableHead className="text-right">Cost</TableHead>}
              <TableHead className="text-right">Duration</TableHead>
              <TableHead className="text-right">Started</TableHead>
              <TableHead className="w-8" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((r) => (
              <TableRow
                key={r.id}
                className="group relative"
              >
                <TableCell>
                  <Link
                    href={`/system/runs/${r.id}`}
                    className="font-medium after:absolute after:inset-0"
                  >
                    <span className="text-[13.5px]">{r.label}</span>
                  </Link>
                  <p className="text-text-tertiary mt-0.5 text-[12px]">
                    {KIND_LABEL[r.kind] ?? r.kind} - {r.location_scope} -{" "}
                    {r.trigger === "scheduled" ? r.triggered_by : `by ${r.triggered_by}`}
                  </p>
                </TableCell>
                <TableCell>
                  <RunStatusPill status={r.status} />
                </TableCell>
                <TableCell className="text-[13px]">
                  {PROVIDER_LABEL[r.provider] ?? r.provider}
                </TableCell>
                <TableCell className="text-right text-[13px] tabular-nums">{r.calls}</TableCell>
                <TableCell
                  className={cn(
                    "text-right text-[13px] tabular-nums",
                    r.errors > 0 && "text-destructive font-semibold",
                  )}
                >
                  {r.errors}
                </TableCell>
                {isOperator && (
                  <TableCell className="text-right text-[13px] tabular-nums">
                    {r.cost_usd > 0 ? `$${r.cost_usd.toFixed(2)}` : "-"}
                  </TableCell>
                )}
                <TableCell className="text-right text-[13px] tabular-nums">
                  {fmtDuration(r.duration_s)}
                </TableCell>
                <TableCell className="text-text-secondary text-right text-[13px] tabular-nums">
                  {fmtDate(r.started_at)}
                </TableCell>
                <TableCell>
                  <Icons.chevronRight className="text-text-tertiary size-4 transition-transform group-hover:translate-x-0.5" />
                </TableCell>
              </TableRow>
            ))}
            {visible.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={isOperator ? 9 : 8}
                  className="text-text-tertiary py-8 text-center text-[13px]"
                >
                  No runs match this filter.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
