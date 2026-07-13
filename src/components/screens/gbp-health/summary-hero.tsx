"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/local/status-pill";
import { SourceBadge } from "@/components/local/source-badge";
import { fmtDate } from "@/lib/format";
import type { GBPAuditFixture, ScorecardItem } from "@/lib/data/types";
import { ScoreGauge, scoreTone } from "./score-gauge";
import { CategoryScores } from "./category-scores";

export function SummaryHero({
  slug,
  composite,
  items,
  audit,
}: {
  slug: string;
  composite: number | null;
  items: ScorecardItem[];
  audit: GBPAuditFixture | null;
}) {
  const counts = {
    pass: items.filter((i) => i.status === "pass").length,
    attention: items.filter((i) => i.status === "attention").length,
    fail: items.filter((i) => i.status === "fail").length,
    unknown: items.filter((i) => i.status === "unknown").length,
  };
  const report = audit?.report ?? null;
  const rating = report?.business_metrics_core?.reviews?.value ?? null;
  const tone = scoreTone(composite);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <Card className="items-center gap-3 p-6 lg:col-span-3">
        <p className="text-muted-foreground self-start text-[11px] font-semibold tracking-[0.05em] uppercase">
          Healthcare scorecard
        </p>
        <ScoreGauge score={composite} />
        <StatusPill
          tone={
            tone === "success"
              ? "success"
              : tone === "warning"
                ? "warning"
                : tone === "error"
                  ? "error"
                  : "neutral"
          }
        >
          {tone === "success"
            ? "Healthy"
            : tone === "warning"
              ? "Needs work"
              : tone === "error"
                ? "At risk"
                : "Pending"}
        </StatusPill>
        <p className="text-muted-foreground text-center text-[12px]">
          Composite of <span className="num">16</span> healthcare checks \u00b7{" "}
          <span className="num">{counts.pass}</span> pass \u00b7{" "}
          <span className="num">{counts.attention}</span> attention \u00b7{" "}
          <span className="num">{counts.fail}</span> fail
          {counts.unknown > 0 ? (
            <>
              {" "}
              \u00b7 <span className="num">{counts.unknown}</span> unknown
            </>
          ) : null}
        </p>
      </Card>

      <Card className="gap-4 p-6 lg:col-span-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-[15px] font-semibold">Audit category scores</h2>
            <p className="text-muted-foreground text-[12px]">
              Six categories scored by the provider audit
            </p>
          </div>
          {audit ? <SourceBadge source={audit.source ?? "searchatlas"} /> : null}
        </div>
        <CategoryScores categoryScores={report?.category_scores ?? null} />
      </Card>

      <Card className="gap-3 p-6 lg:col-span-4">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-[15px] font-semibold">Audit report</h2>
          {report?.is_verified != null ? (
            <StatusPill tone={report.is_verified ? "success" : "warning"}>
              {report.is_verified ? "Verified" : "Unverified"}
            </StatusPill>
          ) : null}
        </div>
        {report ? (
          <dl className="flex flex-col">
            <MetaRow label="Report ID">
              <span className="num font-semibold">{report.report_id ?? report.overall_score}</span>
            </MetaRow>
            <MetaRow label="Audit date">
              <span className="num">
                {report.audit_date ? fmtDate(report.audit_date) : "\u2014"}
              </span>
            </MetaRow>
            <MetaRow label="Provider overall">
              {report.overall_score != null ? (
                <span className="num">
                  {report.overall_score}/100 \u00b7 {report.score_grade}
                </span>
              ) : (
                <span className="text-muted-foreground">Processing</span>
              )}
            </MetaRow>
            <MetaRow label="Citation score">
              {report.citation_score != null ? (
                <Link
                  href={`/locations/${slug}/citations`}
                  className="num font-semibold text-blue-600 hover:underline"
                >
                  {report.citation_score}/100 \u2192
                </Link>
              ) : (
                <Link
                  href={`/locations/${slug}/citations`}
                  className="text-[12px] text-blue-600 hover:underline"
                >
                  View citation tracker \u2192
                </Link>
              )}
            </MetaRow>
            <MetaRow label="GBP score">
              {report.gbp_score != null ? (
                <span className="num">{report.gbp_score}/100</span>
              ) : (
                <span className="text-muted-foreground">\u2014</span>
              )}
            </MetaRow>
            <MetaRow label="Reviews">
              {rating != null ? (
                <span className="num">{rating} reviews</span>
              ) : (
                <span className="text-muted-foreground">\u2014</span>
              )}
            </MetaRow>
          </dl>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-6">
            <div
              className="flex items-center gap-2"
              aria-hidden
            >
              <span className="size-5 rotate-45 bg-blue-200" />
              <span className="size-5 rounded-full bg-cyan-200" />
            </div>
            <h3 className="text-[14px] font-semibold">No audit on file yet</h3>
            <p className="text-muted-foreground max-w-[240px] text-center text-[12px]">
              Run the first GBP audit to populate category scores and report metadata for this
              listing.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b py-2 text-[13px] last:border-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right">{children}</dd>
    </div>
  );
}
