"use client";

import Link from "next/link";
import { Icons } from "@/lib/icons";
import { Card } from "@/components/ui/card";
import { SourceBadge } from "@/components/local/source-badge";
import { useRole } from "@/components/shell/role-store";
import { fmtDate, fmtTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { RunReceipt } from "@/lib/data/types";
import { fmtDuration, KIND_LABEL, PROVIDER_LABEL, RunStatusPill } from "./run-shared";

function StepIcon({ status }: { status: RunReceipt["status"] }) {
  if (status === "succeeded")
    return (
      <Icons.checkCircle
        className="text-success size-4"
        aria-hidden
      />
    );
  if (status === "failed")
    return (
      <Icons.xCircle
        className="text-destructive size-4"
        aria-hidden
      />
    );
  return (
    <Icons.alert
      className="text-warning size-4"
      aria-hidden
    />
  );
}

export function RunDetail({ run }: { run: RunReceipt }) {
  const role = useRole();
  const isOperator = role === "operator";

  const stats: Array<{ label: string; value: string; error?: boolean }> = [
    { label: "Provider", value: PROVIDER_LABEL[run.provider] ?? run.provider },
    { label: "API calls", value: String(run.calls) },
    { label: "Errors", value: String(run.errors), error: run.errors > 0 },
    { label: "Duration", value: fmtDuration(run.duration_s) },
    ...(isOperator
      ? [
          {
            label: "Cost",
            value: run.cost_usd > 0 ? `$${run.cost_usd.toFixed(2)}` : "$0.00",
          },
        ]
      : []),
  ];

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div>
        <Link
          href="/system/runs"
          className="text-text-tertiary hover:text-text-secondary inline-flex items-center gap-1 text-[13px]"
        >
          <Icons.arrowLeft className="size-3.5" />
          Run history
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold">{run.label}</h1>
          <RunStatusPill status={run.status} />
          <SourceBadge source={run.source} />
        </div>
        <p className="text-text-tertiary mt-1 text-[13px]">
          {KIND_LABEL[run.kind] ?? run.kind} - {run.location_scope} -{" "}
          {run.trigger === "scheduled" ? run.triggered_by : `triggered by ${run.triggered_by}`} -{" "}
          <span className="tabular-nums">
            {fmtDate(run.started_at)} {fmtTime(run.started_at)}
          </span>
        </p>
      </div>

      <Card className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label}>
            <p className="eyebrow text-text-tertiary">{s.label}</p>
            <p
              className={cn(
                "mt-1 text-[17px] font-bold tabular-nums",
                s.error && "text-destructive",
              )}
            >
              {s.value}
            </p>
          </div>
        ))}
      </Card>

      {isOperator && (
        <div className="text-text-tertiary flex items-center gap-2 text-[12.5px]">
          <Icons.receipt className="size-3.5" />
          <span>
            Billing note: <span className="tabular-nums">{run.cost_note}</span> - full ledger in
            Admin - Costs
          </span>
        </div>
      )}

      <Card className="gap-4 p-6">
        <h2 className="text-base font-semibold">Steps</h2>
        <ol className="flex flex-col">
          {run.steps.map((step, i) => (
            <li
              key={step.name}
              className={cn(
                "flex items-start gap-3 py-3",
                i > 0 && "border-border-subtle border-t",
              )}
            >
              <StepIcon status={step.status} />
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] font-medium">{step.name}</p>
                <p className="text-text-tertiary mt-0.5 text-[13px]">{step.detail}</p>
              </div>
              <span className="text-text-tertiary shrink-0 text-[12px] tabular-nums">
                {fmtDuration(step.duration_s)}
              </span>
            </li>
          ))}
        </ol>
      </Card>

      {isOperator && (
        <Card className="gap-3 p-6">
          <h2 className="text-base font-semibold">Log</h2>
          <div className="border-border bg-secondary/40 overflow-x-auto rounded-md border p-3">
            {run.log.map((line, i) => (
              <p
                key={i}
                className="py-0.5 text-[12px] leading-relaxed whitespace-nowrap tabular-nums"
              >
                <span className="text-text-disabled">{fmtTime(line.ts)}</span>{" "}
                <span
                  className={cn(
                    "font-semibold uppercase",
                    line.level === "error"
                      ? "text-destructive"
                      : line.level === "warn"
                        ? "text-warning"
                        : "text-text-tertiary",
                  )}
                >
                  {line.level}
                </span>{" "}
                <span className="text-text-secondary">{line.msg}</span>
              </p>
            ))}
          </div>
        </Card>
      )}

      {run.artifacts.length > 0 && (
        <Card className="gap-3 p-6">
          <h2 className="text-base font-semibold">Artifacts</h2>
          <div className="flex flex-wrap gap-2">
            {run.artifacts.map((a) => (
              <Link
                key={a.href + a.label}
                href={a.href}
                className="border-border hover:bg-secondary/60 inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[13px] font-medium"
              >
                {a.label}
                <Icons.arrowUpRight className="text-text-tertiary size-3.5" />
              </Link>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
