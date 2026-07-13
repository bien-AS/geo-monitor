"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useLocationOverview } from "@/hooks/use-location-overview";
import { ScopeBanner } from "@/components/shell/scope-banner";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card } from "@/components/ui/card";
import { LocationHeader } from "@/components/screens/l02/location-header";
import { LVIHero } from "@/components/screens/l02/lvi-hero";
import { AlertsStrip } from "@/components/screens/l02/alerts-strip";
import { HubCards } from "@/components/screens/l02/hub-cards";
import { AISurfaceSnapshot } from "@/components/screens/l02/ai-surface-snapshot";

export default function LocationOverviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data, isLoading, error } = useLocationOverview(slug);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="skeleton h-10 w-full rounded-r-md" />
        <div className="skeleton h-64 w-full rounded-lg" />
        <div className="skeleton h-80 w-full rounded-lg" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="skeleton h-48 rounded-lg" />
          <div className="skeleton h-48 rounded-lg" />
          <div className="skeleton h-48 rounded-lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-foreground text-lg font-semibold">Failed to load location overview</p>
        <p className="text-text-tertiary text-[13px]">
          {typeof error === "object" && error !== null && "message" in error
            ? String(error.message)
            : "An unknown error occurred"}
        </p>
      </div>
    );
  }

  if (!data) {
    notFound();
  }

  const {
    location,
    shortName,
    lvi,
    lviSource,
    navLocations,
    gbp,
    geo,
    citations,
    reviews,
    localAI,
    competitive,
    keywords,
    aiStats,
    aiSource,
    attention,
    auditCost,
    portfolioLVI,
    fleetLocationCount,
  } = data;

  return (
    <div className="flex flex-col gap-6">
      <ScopeBanner
        module="Overview"
        locationName={location.name}
        locations={navLocations}
      />

      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/local">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{shortName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <LocationHeader
        location={location}
        cost={auditCost}
      />

      <LVIHero
        slug={slug}
        locationName={shortName}
        lvi={lvi}
        source={lviSource}
      />

      <AlertsStrip items={attention} />

      <section
        aria-label="Sub-module summaries"
        className="flex flex-col gap-4"
      >
        <div>
          <h2 className="text-lg font-semibold">Sub-modules</h2>
          <p className="text-text-tertiary text-[13px]">
            Six local workspaces — each card opens its module one click deep
          </p>
        </div>
        <HubCards
          slug={slug}
          keywords={keywords}
          gbp={gbp}
          geo={geo}
          citations={citations}
          reviews={reviews}
          localAI={localAI}
          competitive={competitive}
        />
      </section>

      <AISurfaceSnapshot
        slug={slug}
        stats={aiStats}
        source={aiSource}
      />

      <Card className="flex-col items-start justify-between gap-2 p-5 sm:flex-row sm:items-center">
        <p className="text-text-secondary text-[13px]">
          Part of the Baptist Medical Group fleet — Portfolio LVI{" "}
          <span className="num text-foreground font-bold">{portfolioLVI}</span> ·{" "}
          <span className="num text-foreground font-bold">{fleetLocationCount}</span> locations
        </p>
        <Link
          href="/local"
          className="text-text-link text-[13px] font-medium hover:underline"
        >
          View fleet dashboard →
        </Link>
      </Card>
    </div>
  );
}
