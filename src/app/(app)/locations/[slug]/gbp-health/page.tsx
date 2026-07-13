"use client";

import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import Link from "next/link";
import { useGBPHealth } from "@/hooks/use-gbp-health";
import { fmtDate } from "@/lib/format";
import { shortLocationName } from "@/lib/location-names";
import { ScopeBanner } from "@/components/shell/scope-banner";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icons } from "@/lib/icons";
import { ApprovalLadder } from "@/components/local/approval-ladder";
import { shortName } from "@/components/screens/gbp-health/short-name";
import { SummaryHero } from "@/components/screens/gbp-health/summary-hero";
import { ScorecardSection } from "@/components/screens/gbp-health/scorecard-section";
import { PerformancePanel } from "@/components/screens/gbp-health/performance-panel";
import { EditHistory } from "@/components/screens/gbp-health/edit-history";
import { AuditTrail } from "@/components/screens/gbp-health/audit-trail";

export default function GBPHealthPage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const { data, isLoading, error } = useGBPHealth(slug);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="skeleton h-10 w-full rounded-md" />
        <div className="skeleton h-8 w-64 rounded-md" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="skeleton h-48 rounded-lg lg:col-span-3" />
          <div className="skeleton h-48 rounded-lg lg:col-span-5" />
          <div className="skeleton h-48 rounded-lg lg:col-span-4" />
        </div>
        <div className="skeleton h-64 rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <p className="text-muted-foreground">Failed to load GBP Health data.</p>
        <p className="text-muted-foreground text-[13px]">{error.message}</p>
      </div>
    );
  }

  if (!data) notFound();

  const navLocations = data.locations.map((l) => ({
    slug: l.slug,
    name: l.name,
    city: l.city,
  }));

  const report = data.audit?.report ?? null;
  const processing = data.processing;
  const short = shortLocationName(data.location.name);

  return (
    <div className="flex flex-col gap-6">
      <ScopeBanner
        module="GBP Health"
        locationName={data.location.name}
        lastScan={report?.audit_date ? fmtDate(report.audit_date) : undefined}
        locations={navLocations}
      />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/local">Dashboard</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={`/locations/${slug}`}>{short}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>GBP Health</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="mt-2 flex flex-wrap items-center gap-2.5">
            <h1 className="text-foreground text-2xl font-semibold">GBP Audit Report</h1>
            <Badge
              variant="outline"
              className="capitalize"
            >
              {data.location.listing_type}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1 text-[13px]">
            {short} \u00b7 {data.location.address}
            {report ? (
              <>
                {" "}
                \u00b7 Audited{" "}
                <span className="num">
                  {report.audit_date ? fmtDate(report.audit_date) : "\u2014"}
                </span>
              </>
            ) : null}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            asChild
            variant="outline"
            size="sm"
          >
            <Link href={`/locations/${slug}`}>Location overview</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="sm"
          >
            <Link href={`/locations/${slug}/citations`}>
              Citation tracker
              <Icons.external className="size-3.5" />
            </Link>
          </Button>
          <ApprovalLadder
            trigger={
              <Button size="sm">
                <Icons.refresh className="size-3.5" />
                Re-run audit
              </Button>
            }
            title="Re-run GBP audit"
            description={short}
            actionVerb="Approve & re-run"
            auditAction="Refreshed GBP audit report"
            auditResource={
              report?.report_id ? `gbp_audit:report-${report.report_id}` : `gbp_audit:${slug}`
            }
            auditVerb="update"
            locationSlug={slug}
            cost={{
              value: "1 audit credit",
              math: "1 GBP audit re-pull \u00d7 1 location (Search Atlas quota)",
              subline: "No AI-surface spend \u2014 GBP profile data only",
            }}
            preview={
              <div className="flex flex-col gap-2 text-[13px]">
                <p>
                  Re-run the Search Atlas GBP audit for{" "}
                  <span className="font-semibold">{short}</span>.
                </p>
                <ul className="text-muted-foreground list-disc pl-5">
                  {report ? (
                    <li>
                      Re-pulls report <span className="num">{report.report_id}</span> \u2014 the
                      existing report is reused, never recreated
                    </li>
                  ) : (
                    <li>Creates the first audit report for this listing</li>
                  )}
                  <li>Recomputes the 6 category scores + citation score</li>
                  <li>Refreshes the 16-point healthcare scorecard mapping</li>
                </ul>
              </div>
            }
          />
        </div>
      </div>

      {(processing || !data.audit) && (
        <div
          role="status"
          className="border-border border-l-primary bg-accent text-accent-foreground flex items-start gap-2.5 rounded-md border border-l-[3px] px-4 py-3 text-[13px]"
        >
          <Icons.refresh
            className="mt-0.5 size-4 shrink-0"
            aria-hidden
          />
          <p>
            {data.audit ? (
              <>
                <span className="font-semibold">Audit refreshing</span> \u2014 last good read shown.
                Search Atlas is recomputing report <span className="num">{report?.report_id}</span>;
                checks without a landed category score degrade to{" "}
                <span className="font-medium">Unknown</span> below.
              </>
            ) : (
              <>
                <span className="font-semibold">No audit on file yet</span> \u2014 the scorecard
                below runs on enrichment data only. Re-run the audit to populate provider scores.
              </>
            )}
          </p>
        </div>
      )}

      <SummaryHero
        slug={slug}
        composite={data.composite}
        items={data.items}
        audit={data.audit}
      />

      <PerformancePanel
        location={{
          slug: data.location.slug,
          rating: data.location.rating ?? null,
          city: data.location.city,
          facility_type: data.location.facility_type ?? "primary_care",
        }}
        keywordSeeds={data.genCtx.serviceSeeds}
      />

      <ScorecardSection
        items={data.items}
        proposals={data.proposals}
        slug={slug}
        genCtx={data.genCtx}
      />

      <EditHistory
        changes={data.changes}
        slug={slug}
      />

      <AuditTrail
        slug={slug}
        initialEntries={data.fixtureEntries}
      />
    </div>
  );
}
