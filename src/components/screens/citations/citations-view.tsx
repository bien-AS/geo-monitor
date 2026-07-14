"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { fmtPct } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SourceBadge } from "@/components/local/source-badge";
import { ApprovalLadder } from "@/components/local/approval-ladder";
import { Icons } from "@/lib/icons";
import type {
  CitationAggregator,
  CitationRow,
  CitationStatus,
  DataSource,
  NAP,
} from "@/lib/data/types";
import { CanonicalNapCard } from "./canonical-nap-card";
import { AggregatorsSection } from "./aggregators-section";
import { OrderDrawer } from "./order-drawer";
import { useCitations, checkOutcome } from "./citations-store";
import { ParityBand, STATUS_LABEL, type StatusFilter } from "./citation-parity-diff-strip";
import { DirectoryTable } from "./directory-table";
import { PipelineStepper, furthestStage, type StageKey } from "./pipeline-stepper";

export function CitationsView({
  slug,
  locationName,
  canonical,
  canonicalSource,
  rows,
  breakdown,
  aggregators = [],
  fixtureSource,
}: {
  slug: string;
  locationName: string;
  canonical: NAP;
  canonicalSource: DataSource;
  rows: CitationRow[];
  breakdown: Record<CitationStatus, number>;
  aggregators?: CitationAggregator[];
  fixtureSource: DataSource;
}) {
  const [filter, setFilter] = React.useState<StatusFilter>("all");
  const [stageFilter, setStageFilter] = React.useState<StageKey | null>(null);
  const pipelineOverrides = useCitations((s) => s.overrides[slug]);
  const indexationOverrides = useCitations((s) => s.indexation[slug]);
  const submitForIndexing = useCitations((s) => s.submitForIndexing);
  const recordIndexCheck = useCitations((s) => s.recordIndexCheck);

  const byAuthority = React.useMemo(() => {
    const merged = rows.map((r) => ({
      ...r,
      ...(pipelineOverrides?.[r.domain] ? { pipeline_status: pipelineOverrides[r.domain] } : {}),
      ...(indexationOverrides?.[r.domain] ? { indexation: indexationOverrides[r.domain] } : {}),
    }));
    return merged.sort((a, b) => b.authority - a.authority);
  }, [rows, pipelineOverrides, indexationOverrides]);

  const health = byAuthority.filter((r) => r.category === "health");
  const general = byAuthority.filter((r) => r.category === "general");

  const visible = (group: CitationRow[]) => {
    let out = filter === "all" ? group : group.filter((r) => r.status === filter);
    if (stageFilter) out = out.filter((r) => furthestStage(r) === stageFilter);
    return out;
  };

  const liveEligible = byAuthority.filter((r) => furthestStage(r) === "live");
  const checkEligible = byAuthority.filter((r) => furthestStage(r) === "indexing");

  const total = rows.length;
  const consistent = breakdown.present;
  const coveragePct = total > 0 ? (consistent / total) * 100 : 0;
  const coverageTone =
    coveragePct >= 90
      ? "text-success-700 dark:text-success-100"
      : coveragePct >= 70
        ? "text-warning-700 dark:text-warning-100"
        : "text-error-700 dark:text-error-100";

  const filterLabel = filter === "all" ? undefined : STATUS_LABEL[filter];

  const chips: Array<{ value: StatusFilter; label: string; count: number }> = [
    { value: "all", label: "All", count: total },
    ...(["present", "mismatch", "missing", "duplicate"] as const).map((status) => ({
      value: status as StatusFilter,
      label: STATUS_LABEL[status],
      count: breakdown[status],
    })),
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
        <CanonicalNapCard
          canonical={canonical}
          source={canonicalSource}
          slug={slug}
        />
        <Card className="gap-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="eyebrow text-text-tertiary">Citation coverage</p>
            <SourceBadge source={fixtureSource} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={cn("num text-[28px] font-bold", coverageTone)}>
              {fmtPct(coveragePct)}
            </span>
            <span className="text-text-secondary text-[13px]">
              <span className="num text-foreground font-semibold">{consistent}</span> of{" "}
              <span className="num">{total}</span> tracked directories present and matching
            </span>
          </div>
          <ParityBand
            breakdown={breakdown}
            selected={filter}
            onSelect={setFilter}
          />
          <p className="border-border-subtle text-text-tertiary border-t pt-2.5 text-[12px]">
            Click a band segment to filter both tables. Coverage = present ÷ tracked set.
          </p>
        </Card>
      </div>

      <AggregatorsSection
        aggregators={aggregators}
        slug={slug}
        locationName={locationName}
      />

      <PipelineStepper
        rows={byAuthority}
        activeStage={stageFilter}
        onStageClick={(k) => setStageFilter((cur) => (cur === k ? null : k))}
      />

      {(liveEligible.length > 0 || checkEligible.length > 0) && (
        <div className="border-border bg-card flex flex-wrap items-center gap-2 rounded-md border px-4 py-2.5">
          <p className="eyebrow text-text-tertiary">Indexation</p>
          {liveEligible.length > 0 && (
            <ApprovalLadder
              trigger={
                <Button
                  variant="outline"
                  size="sm"
                >
                  <Icons.listEnd className="size-3.5" />
                  Submit {liveEligible.length} live to indexing ·{" "}
                  <span className="num">${(liveEligible.length * 0.02).toFixed(2)}</span>
                </Button>
              }
              title={`Submit ${liveEligible.length} live listings to Omega Indexer`}
              description={`${locationName} · one batch, every live listing URL`}
              actionVerb="Approve & submit batch"
              auditAction={`Submitted ${liveEligible.length} live citations to Omega Indexer (batch)`}
              auditResource={`citations:${slug}:index-submit-batch`}
              auditVerb="create"
              locationSlug={slug}
              cost={{
                value: `$${(liveEligible.length * 0.02).toFixed(2)}`,
                math: `${liveEligible.length} URLs × $0.02 Omega submission`,
                subline: "Demo mode — batch simulated",
              }}
              preview={
                <div className="max-h-40 space-y-1 overflow-y-auto text-[12.5px]">
                  {liveEligible.map((r) => (
                    <p
                      key={r.domain}
                      className="num"
                    >
                      {r.domain}
                    </p>
                  ))}
                </div>
              }
              onCompleted={() =>
                submitForIndexing(
                  slug,
                  liveEligible.map((r) => r.domain),
                )
              }
            />
          )}
          {checkEligible.length > 0 && (
            <ApprovalLadder
              trigger={
                <Button
                  variant="outline"
                  size="sm"
                >
                  <Icons.searchCheck className="size-3.5" />
                  Check {checkEligible.length} pending ·{" "}
                  <span className="num">${(checkEligible.length * 0.01).toFixed(2)}</span>
                </Button>
              }
              title={`Run index checks on ${checkEligible.length} pending listings`}
              description={`${locationName} · IndexCheckr verification pass`}
              actionVerb="Approve & check batch"
              auditAction={`Ran IndexCheckr pass on ${checkEligible.length} citations (batch)`}
              auditResource={`citations:${slug}:index-check-batch`}
              auditVerb="create"
              locationSlug={slug}
              cost={{
                value: `$${(checkEligible.length * 0.01).toFixed(2)}`,
                math: `${checkEligible.length} URLs × $0.01 IndexCheckr check`,
                subline: "Demo mode — pass simulated · ~70% verify first pass",
              }}
              preview={
                <div className="max-h-40 space-y-1 overflow-y-auto text-[12.5px]">
                  {checkEligible.map((r) => (
                    <p
                      key={r.domain}
                      className="num"
                    >
                      {r.domain}
                    </p>
                  ))}
                </div>
              }
              onCompleted={() =>
                recordIndexCheck(
                  slug,
                  checkEligible.map((r) => ({
                    domain: r.domain,
                    result: checkOutcome(r.domain),
                  })),
                )
              }
            />
          )}
          <p className="text-text-tertiary ml-auto text-[11px]">
            Bright Local publishes → Omega submits → IndexCheckr verifies
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          className="flex flex-wrap items-center gap-1.5"
          role="group"
          aria-label="Filter directories by status"
        >
          {chips.map((chip) => (
            <button
              key={chip.value}
              type="button"
              aria-pressed={filter === chip.value}
              onClick={() => setFilter(chip.value)}
              className={cn(
                "flex min-h-8 items-center gap-1.5 rounded-md border px-3 text-[12px] font-medium transition-colors",
                filter === chip.value
                  ? "border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-500/20 dark:text-primary-100"
                  : "border-border bg-card text-text-secondary hover:bg-secondary",
              )}
            >
              {chip.label}
              <span className="num font-semibold">{chip.count}</span>
            </button>
          ))}
        </div>
        <OrderDrawer
          slug={slug}
          locationName={locationName}
          missing={byAuthority.filter(
            (r) => r.status === "missing" && r.pipeline_status !== "ordered",
          )}
          aggregators={aggregators}
        />
      </div>

      <DirectoryTable
        eyebrow="Healthcare directory set · Baptist differentiator"
        title="Healthcare directories"
        description="Healthgrades, Vitals, WebMD, Zocdoc, the NPI Registry and payer provider directories — accuracy here drives referral routing, payer findability and patient trust."
        rows={visible(health)}
        totalInGroup={health.length}
        canonical={canonical}
        slug={slug}
        healthAccent
        filterLabel={filterLabel}
      />

      <DirectoryTable
        eyebrow="General directory set"
        title="General directories"
        description="The core local-citation base set — search engines, maps and business directories, ranked by authority."
        rows={visible(general)}
        totalInGroup={general.length}
        canonical={canonical}
        slug={slug}
        filterLabel={filterLabel}
      />
    </div>
  );
}
