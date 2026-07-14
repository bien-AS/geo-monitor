"use client";

import * as React from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import { useCitations } from "@/hooks/use-citations";
import { fmtCost, fmtCostPerCall, fmtDate, fmtPct } from "@/lib/format";
import { shortLocationName } from "@/lib/location-names";
import { buildDriftItems, rowDrifting } from "@/components/screens/nap/lib";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ScopeBanner } from "@/components/shell/scope-banner";
import { StatusPill } from "@/components/local/status-pill";
import { ApprovalLadder } from "@/components/local/approval-ladder";
import { Icons } from "@/lib/icons";
import { CitationsView } from "@/components/screens/citations/citations-view";
import { CanonicalCard } from "@/components/screens/nap/canonical-card";
import { ConsistencySummary } from "@/components/screens/nap/consistency-summary";
import { NAPMonitor } from "@/components/screens/nap/nap-monitor";

const RECHECK_COST_PER_DIRECTORY = 0.005;
const MONITOR_CHECK_COST = 0.004;

type Tab = "citations" | "nap";

export default function CitationsPage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const { data, isLoading, error } = useCitations(slug);
  const [tab, setTab] = React.useState<Tab>("citations");

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="skeleton h-10 w-full rounded-md" />
        <div className="skeleton h-8 w-64 rounded-md" />
        <div className="skeleton h-48 rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <p className="text-muted-foreground">Failed to load citations data.</p>
        <p className="text-muted-foreground text-[13px]">{error.message}</p>
      </div>
    );
  }

  if (!data) notFound();

  const {
    location,
    shortName,
    navLocations,
    canonical,
    canonicalSource,
    citations,
    napFile,
    lastChecked,
  } = data;

  const rows = citations?.rows ?? [];
  const breakdown = citations?.breakdown ?? { present: 0, mismatch: 0, missing: 0, duplicate: 0 };
  const recheckTotal = rows.length * RECHECK_COST_PER_DIRECTORY;

  const drifts = (napFile?.drifts ?? []).filter((d) => d.slug === slug);
  const items = canonical
    ? buildDriftItems({ drifts, rows, canonical: { ...canonical, source: canonicalSource } })
    : [];

  const listedRows = rows.filter((r) => r.listed);
  const cleanRows = listedRows.filter((r) => !rowDrifting(r));
  const fieldStats = {
    name: {
      match: listedRows.filter((r) => r.field_match?.name !== false).length,
      listed: listedRows.length,
    },
    address: {
      match: listedRows.filter((r) => r.field_match?.address !== false).length,
      listed: listedRows.length,
    },
    phone: {
      match: listedRows.filter((r) => r.field_match?.phone !== false).length,
      listed: listedRows.length,
    },
  };
  const pct = listedRows.length > 0 ? (cleanRows.length / listedRows.length) * 100 : 0;
  const pctTone = pct >= 95 ? "success" : pct >= 80 ? "warning" : "error";
  const openItems = items.filter((i) => i.status === "open").length;
  const queuedItems = items.filter((i) => i.status === "fix_queued").length;
  const active = items.filter((i) => i.status !== "fixed" && i.status !== "resolved");
  const severityCounts = {
    critical: active.filter((i) => i.severity === "critical").length,
    moderate: active.filter((i) => i.severity === "moderate").length,
    minor: active.filter((i) => i.severity === "minor").length,
  };

  return (
    <div className="flex flex-col gap-6">
      <ScopeBanner
        module="Citations & NAP"
        locationName={location.name}
        lastScan={lastChecked ? fmtDate(lastChecked) : undefined}
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
                  <Link href={`/locations/${slug}`}>{shortName}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Citations & NAP</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="mt-2 flex flex-wrap items-center gap-2.5">
            <h1 className="text-foreground text-2xl font-semibold">
              {tab === "citations" ? "Local Citation Tracker" : "NAP Consistency Monitor"}
            </h1>
            <Badge
              variant="outline"
              className="capitalize"
            >
              {location.listing_type}
            </Badge>
            {tab === "nap" && listedRows.length > 0 && (
              <StatusPill tone={pctTone}>{fmtPct(pct)} consistent</StatusPill>
            )}
          </div>
          <p className="text-text-tertiary mt-1 text-[13px]">
            {tab === "citations" ? (
              <>
                <span className="num text-foreground font-semibold">{rows.length}</span> directories
                tracked ·{" "}
                <span className="num text-foreground font-semibold">{breakdown.present}</span>{" "}
                present · <span className="num">{breakdown.mismatch}</span> NAP mismatch ·{" "}
                <span className="num">{breakdown.missing}</span> missing ·{" "}
                <span className="num">{breakdown.duplicate}</span> duplicate
                {lastChecked ? (
                  <>
                    {" "}
                    · Last checked <span className="num">{fmtDate(lastChecked)}</span>
                  </>
                ) : null}
              </>
            ) : (
              <>
                {shortName} · weekly auto-diff of <span className="num">{listedRows.length}</span>{" "}
                listed directories against canonical
              </>
            )}
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
          {rows.length > 0 && tab === "citations" && (
            <ApprovalLadder
              trigger={
                <Button size="sm">
                  <Icons.refresh className="size-3.5" />
                  Re-check citations
                </Button>
              }
              title="Re-check citations"
              description={`${shortName} · on-demand re-scan across all tracked directories`}
              actionVerb="Approve & re-check"
              auditAction={`Re-checked citations across ${rows.length} directories`}
              auditResource={`citations:${slug}`}
              auditVerb="update"
              locationSlug={slug}
              cost={{
                value: fmtCostPerCall(recheckTotal),
                math: `${rows.length} directories × ${fmtCostPerCall(RECHECK_COST_PER_DIRECTORY)} scrape + NAP diff`,
                subline: "On-demand re-check · quarterly auto-check is included in the pilot",
              }}
              preview={
                <div className="flex flex-col gap-2 text-[13px]">
                  <p>
                    Re-scan every tracked directory for{" "}
                    <span className="font-semibold">{shortName}</span>:
                  </p>
                  <ul className="text-text-secondary list-disc pl-5">
                    <li>
                      Re-pulls the live listing on all <span className="num">{rows.length}</span>{" "}
                      directories
                    </li>
                    <li>Re-diffs each listing field-by-field against the canonical NAP</li>
                    <li>Refreshes the parity band, N·A·P match pills and Δ-since-last flags</li>
                  </ul>
                </div>
              }
            />
          )}
          {rows.length > 0 && tab === "nap" && (
            <ApprovalLadder
              trigger={
                <Button size="sm">
                  <Icons.refresh className="size-3.5" />
                  Re-run diff
                </Button>
              }
              title="Re-run NAP diff"
              description={shortName}
              actionVerb="Approve & re-run"
              auditAction="Re-ran NAP monitor diff"
              auditResource={`nap_monitor:${slug}`}
              auditVerb="read"
              locationSlug={slug}
              cost={{
                value: fmtCost(rows.length * MONITOR_CHECK_COST),
                math: `${rows.length} directories × 1 monitor check × $${MONITOR_CHECK_COST.toFixed(3)}`,
                subline: "Diff-only re-check — cheaper than a full citation re-catalog",
              }}
              preview={
                <div className="flex flex-col gap-2 text-[13px]">
                  <p>
                    Re-diff all <span className="num font-semibold">{rows.length}</span> monitored
                    directories for <span className="font-semibold">{shortName}</span> against the
                    canonical NAP.
                  </p>
                  <ul className="text-text-secondary list-disc pl-5">
                    <li>Refreshes Listed + N·A·P field matches per directory</li>
                    <li>Flags new drift and verifies queued corrections</li>
                    <li>No directory writes — read-only monitor checks</li>
                  </ul>
                </div>
              }
            />
          )}
        </div>
      </div>

      <nav
        aria-label="Citations and NAP"
        className="border-border bg-secondary inline-flex items-center gap-0.5 self-start rounded-lg border p-0.5"
      >
        <button
          type="button"
          onClick={() => setTab("citations")}
          aria-current={tab === "citations" ? "page" : undefined}
          className={
            tab === "citations"
              ? "bg-card text-foreground rounded-md px-3 py-1.5 text-[13px] font-semibold"
              : "text-text-secondary hover:text-foreground rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors"
          }
        >
          Citations
        </button>
        <button
          type="button"
          onClick={() => setTab("nap")}
          aria-current={tab === "nap" ? "page" : undefined}
          className={
            tab === "nap"
              ? "bg-card text-foreground rounded-md px-3 py-1.5 text-[13px] font-semibold"
              : "text-text-secondary hover:text-foreground rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors"
          }
        >
          NAP Monitor
        </button>
      </nav>

      {tab === "citations" &&
        (!canonical ? (
          <Card className="diamond-watermark items-center gap-2 p-10 text-center">
            <span
              aria-hidden
              className="flex items-center gap-1.5"
            >
              <span className="bg-primary-200 size-4 rotate-45" />
              <span className="size-4 rotate-45 bg-cyan-200" />
            </span>
            <h3 className="text-base font-semibold">Set the canonical NAP first</h3>
            <p className="text-text-secondary max-w-md text-[13px]">
              Every directory listing is diffed against the canonical name-address-phone record, and
              none is on file for this location yet.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-1"
              onClick={() => setTab("nap")}
            >
              Switch to NAP Monitor
            </Button>
          </Card>
        ) : rows.length === 0 ? (
          <Card className="diamond-watermark items-center gap-2 p-10 text-center">
            <span
              aria-hidden
              className="flex items-center gap-1.5"
            >
              <span className="bg-primary-200 size-4 rotate-45" />
              <span className="size-4 rotate-45 bg-cyan-200" />
            </span>
            <h3 className="text-base font-semibold">No citation scan on file</h3>
            <p className="text-text-secondary max-w-md text-[13px]">
              This location has not been scanned against the directory set yet.
            </p>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="mt-1"
            >
              <Link href={`/locations/${slug}`}>Back to location overview</Link>
            </Button>
          </Card>
        ) : (
          <CitationsView
            slug={slug}
            locationName={shortName}
            aggregators={citations?.aggregators ?? []}
            canonical={{
              name: canonical.name,
              address: canonical.address,
              phone: canonical.phone,
              website: canonical.website,
            }}
            canonicalSource={canonicalSource}
            rows={rows}
            breakdown={breakdown}
            fixtureSource={citations?.source ?? "synthetic"}
          />
        ))}

      {tab === "nap" &&
        (canonical ? (
          rows.length > 0 ? (
            <>
              <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
                <CanonicalCard
                  canonical={{ ...canonical, source: canonicalSource }}
                  fieldStats={fieldStats}
                />
                <ConsistencySummary
                  clean={cleanRows.length}
                  listed={listedRows.length}
                  driftingRows={listedRows.length - cleanRows.length}
                  openItems={openItems}
                  queuedItems={queuedItems}
                  severityCounts={severityCounts}
                  lastChecked={lastChecked}
                />
              </div>
              <NAPMonitor
                slug={slug}
                locationName={shortName}
                rows={rows}
                items={items}
                fixtureSource={citations?.source ?? null}
              />
            </>
          ) : (
            <Card className="flex flex-col items-center gap-3 py-14 text-center">
              <div
                className="flex items-center gap-2"
                aria-hidden
              >
                <span className="bg-primary-200 size-6 rounded-md" />
                <span className="size-6 rounded-full bg-cyan-200" />
                <span className="bg-primary-200 size-6 rotate-45 rounded-sm" />
              </div>
              <h3 className="text-foreground text-[15px] font-semibold">
                No directory scans on file
              </h3>
              <p className="text-text-secondary max-w-md text-[13px]">
                The monitor diffs each directory listing against the canonical NAP. Run the citation
                catalog first to populate directory rows.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTab("citations")}
              >
                Switch to Citations tab
              </Button>
            </Card>
          )
        ) : (
          <Card className="flex flex-col items-center gap-3 py-14 text-center">
            <div
              className="flex items-center gap-2"
              aria-hidden
            >
              <span className="bg-primary-200 size-6 rounded-md" />
              <span className="size-6 rounded-full bg-cyan-200" />
              <span className="bg-primary-200 size-6 rotate-45 rounded-sm" />
            </div>
            <h3 className="text-foreground text-[15px] font-semibold">Canonical NAP not on file</h3>
            <p className="text-text-secondary max-w-md text-[13px]">
              NAP monitoring diffs every directory against a canonical record — none exists for this
              location yet.
            </p>
            <Button
              asChild
              variant="outline"
              size="sm"
            >
              <Link href={`/locations/${slug}`}>Back to location overview</Link>
            </Button>
          </Card>
        ))}
    </div>
  );
}
