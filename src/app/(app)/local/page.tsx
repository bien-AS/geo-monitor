"use client";

import { useDashboard } from "@/hooks/use-dashboard";
import { MetricCard } from "@/components/local/metric-card";
import { SourceBadge } from "@/components/local/source-badge";
import { L01Header } from "@/components/screens/l01/header";
import { AddLocationModal } from "@/components/screens/l01/add-location-modal";
import { FleetScopeStrip } from "@/components/screens/l01/scope-strip";
import { LVIHero } from "@/components/screens/l01/lvi-hero";
import { AlertRails } from "@/components/screens/l01/alert-rails";
import { BandDonutCard, LVITrendCard } from "@/components/screens/l01/trend-band-row";
import { FleetMapCard } from "@/components/screens/l01/fleet-map-card";
import { AISnapshotCard } from "@/components/screens/l01/ai-snapshot";
import { LocationsGrid } from "@/components/screens/l01/locations-grid";
import { ActivityCard } from "@/components/screens/l01/activity";

export default function DashboardPage() {
  const { data, isLoading, error } = useDashboard();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="skeleton h-24 w-full rounded-lg" />
        <div className="skeleton h-10 w-full rounded-r-md" />
        <div className="skeleton h-80 w-full rounded-lg" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          <div className="skeleton h-40 rounded-lg" />
          <div className="skeleton h-40 rounded-lg" />
          <div className="skeleton h-40 rounded-lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-foreground text-lg font-semibold">Failed to load dashboard</p>
        <p className="text-text-tertiary text-[13px]">
          {typeof error === "object" && error !== null && "message" in error
            ? String(error.message)
            : "An unknown error occurred"}
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-foreground text-lg font-semibold">No dashboard data</p>
        <p className="text-text-tertiary text-[13px]">
          No locations configured. Add a location to get started.
        </p>
      </div>
    );
  }

  const {
    locations,
    snapshotDate,
    listingCounts,
    atRiskOrWorse,
    portfolioValue,
    portfolioBand,
    portfolioDelta,
    bands,
    up,
    down,
    insights,
    top3Pct,
    prevTop3Pct,
    gridsTop3,
    gridsWithAvg,
    fleetRating,
    fleetResponseRate,
    reviewTotal,
    zeroReviewCount,
    ratingSpark,
    aiSharePct,
    aiCited,
    aiPartial,
    aiRows,
    surfaceStats,
    chatbotPct,
    googlePct,
    alerts,
    cards,
    pins,
    auditEntries,
    addableCandidates,
    auditCostUsd,
    promptCount,
    keywordGrids,
    rankChecks,
    trendPoints,
  } = data;

  return (
    <div className="flex flex-col gap-6">
      <L01Header
        locationCount={locations.length}
        needsAttention={atRiskOrWorse}
        facilityCount={listingCounts.facility}
        departmentCount={listingCounts.department}
        practitionerCount={listingCounts.practitioner}
        snapshotDate={snapshotDate}
        auditCostUsd={auditCostUsd}
        promptCount={promptCount}
        keywordGrids={keywordGrids}
        rankChecks={rankChecks}
        extraActions={
          <AddLocationModal
            candidates={addableCandidates}
            fleet={locations.map((l) => ({
              cid: l.cid,
              place_id: l.place_id,
              name: l.name,
            }))}
          />
        }
      />

      <FleetScopeStrip
        locationCount={locations.length}
        snapshotDate={snapshotDate}
      />

      <LVIHero
        value={portfolioValue}
        band={portfolioBand}
        delta={portfolioDelta}
        locationCount={locations.length}
        bands={bands}
        up={up}
        down={down}
        insights={insights}
        snapshotDate={snapshotDate}
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          eyebrow="Top-3 map pack"
          value={`${top3Pct}%`}
          secondary={
            <>
              <span className="num">{gridsTop3}</span> of{" "}
              <span className="num">{gridsWithAvg}</span> keyword grids with avg rank ≤{" "}
              <span className="num">3</span>
            </>
          }
          delta={prevTop3Pct != null ? top3Pct - prevTop3Pct : undefined}
          deltaLabel="pts vs last cycle"
          pill={<SourceBadge source="synthetic" />}
        />
        <MetricCard
          eyebrow="Review health"
          value={fleetRating ? fleetRating.toFixed(1) : "—"}
          valueSuffix="★"
          secondary={
            <>
              Response rate <span className="num font-semibold">{fleetResponseRate}%</span> ·{" "}
              <span className="num">{reviewTotal.toLocaleString("en-US")}</span> reviews ·{" "}
              <span className="num">{zeroReviewCount}</span> zero-review locations
            </>
          }
          spark={ratingSpark.length > 1 ? ratingSpark : undefined}
          pill={<SourceBadge source="synthetic" />}
        />
        <MetricCard
          eyebrow="AI citation"
          value={`${aiSharePct}%`}
          secondary={
            <>
              <span className="num">{aiCited}</span> cited ·{" "}
              <span className="num">{aiPartial}</span> partial of{" "}
              <span className="num">{aiRows}</span> checks across{" "}
              <span className="num">{surfaceStats.length}</span> surfaces
            </>
          }
          pill={<SourceBadge source="synthetic" />}
        />
      </div>

      <AlertRails items={alerts} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <LVITrendCard
          points={trendPoints}
          locationCount={locations.length}
          sinceLabel={trendPoints[0]?.month ?? "—"}
          delta={portfolioDelta}
        />
        <BandDonutCard
          bands={bands}
          locationCount={locations.length}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <FleetMapCard
          pins={pins}
          locationCount={pins.length}
        />
        <AISnapshotCard
          stats={surfaceStats}
          chatbotPct={chatbotPct}
          googlePct={googlePct}
          detailHref="/locations/baptist-collierville/local-ai"
          totalChecks={aiRows}
        />
      </div>

      <LocationsGrid locations={cards} />

      <ActivityCard entries={auditEntries} />
    </div>
  );
}
