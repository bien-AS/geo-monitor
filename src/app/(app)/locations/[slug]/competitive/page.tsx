"use client";

import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { Star, Swords } from "lucide-react";
import { useCompetitive } from "@/hooks/use-competitive";
import { shortLocationName } from "@/lib/location-names";
import { fmtCostPerCall, fmtDate, fmtInt } from "@/lib/format";
import { SURFACES, surfaceMixCost } from "@/lib/surfaces";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ScopeBanner } from "@/components/shell/scope-banner";
import { ApprovalLadder } from "@/components/local/approval-ladder";
import { StatusPill } from "@/components/local/status-pill";
import { CompetitiveView } from "@/components/screens/competitive/competitive-view";

const LISTING_CHECK = 0.005;
const SERP_SAMPLE = 0.003;
const REVIEW_PULL = 0.005;

export default function CompetitivePage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const { data, isLoading, error } = useCompetitive(slug);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="skeleton h-10 w-full rounded-md" />
        <div className="skeleton h-6 w-64 rounded-md" />
        <div className="skeleton h-96 rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <p className="text-muted-foreground">Failed to load competitive data.</p>
        <p className="text-muted-foreground text-[13px]">{error.message}</p>
      </div>
    );
  }

  if (!data) notFound();

  const { model, responseRate, responseRateSource, location, locations: locList } = data;
  const navLocations = locList.map((l) => ({
    slug: l.slug,
    name: l.name,
    city: l.city,
  }));

  const shortName = shortLocationName(location.name);

  const rosterCount = model.rivals.filter((r) => r.rosterSource != null).length;
  const topRival = model.rivals.find((r) => r.rosterSource != null) ?? model.rivals[0] ?? null;
  const promptCount = model.ai?.prompts.length ?? 0;
  const hasAnyData = rosterCount > 0 || model.boards.length > 0 || model.ai != null;

  const perRival = LISTING_CHECK + SERP_SAMPLE + REVIEW_PULL;
  const aiMix = surfaceMixCost(SURFACES.map((s) => s.id));
  const refreshTotal = rosterCount * perRival + promptCount * aiMix;

  return (
    <div className="flex flex-col gap-6">
      <ScopeBanner
        module="Competitive"
        locationName={location.name}
        lastScan={model.lastScan ? fmtDate(model.lastScan) : undefined}
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
                <BreadcrumbPage>Competitive</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="mt-2 flex flex-wrap items-center gap-2.5">
            <h1 className="text-foreground text-2xl font-semibold">Local Competitive</h1>
            <Badge
              variant="outline"
              className="capitalize"
            >
              {location.listing_type}
            </Badge>
            {topRival && (
              <StatusPill
                tone="neutral"
                icon={Swords}
              >
                Top rival: {topRival.name}
              </StatusPill>
            )}
          </div>
          <p className="text-text-tertiary mt-1 text-[13px]">
            <span className="num text-foreground font-semibold">{fmtInt(rosterCount)}</span> rivals
            tracked &middot;{" "}
            <span className="num text-foreground font-semibold">{fmtInt(model.boards.length)}</span>{" "}
            keyword grids &middot;{" "}
            <span className="num text-foreground font-semibold">{fmtInt(promptCount)}</span> AI
            prompts checked
            {location.rating ? (
              <>
                {" "}
                &middot; your rating{" "}
                <span className="num text-foreground font-semibold">
                  {location.rating.value.toFixed(1)}
                </span>{" "}
                &times; <span className="num">{fmtInt(location.rating.votes_count)}</span> reviews
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
          {hasAnyData && (
            <ApprovalLadder
              trigger={
                <Button size="sm">
                  <span className="inline-flex items-center gap-1.5">
                    <Star className="size-3.5" />
                    Refresh competitive scan
                  </span>
                </Button>
              }
              title="Refresh competitive scan"
              description={`${shortName} &middot; re-pull rival listings, SERP samples, reviews and AI cited sources`}
              actionVerb="Approve & scan"
              auditAction={`Refreshed competitive scan across ${rosterCount} rivals`}
              auditResource={`competitors:${slug}`}
              auditVerb="update"
              locationSlug={slug}
              cost={{
                value: fmtCostPerCall(refreshTotal),
                math: `${rosterCount} rivals × ${fmtCostPerCall(perRival)} (listings + SERP sample + review pull) + ${promptCount} prompts × ${fmtCostPerCall(aiMix)} across ${SURFACES.length} AI surfaces`,
                subline: "Fresh geo-grid and review data from this cycle is reused, not re-bought",
              }}
              preview={
                <div className="flex flex-col gap-2 text-[13px]">
                  <p>
                    Re-run the competitive scan for{" "}
                    <span className="font-semibold">{shortName}</span>:
                  </p>
                  <ul className="text-text-secondary list-disc pl-5">
                    <li>
                      Re-pulls the Google Business listing, a SERP sample and the latest reviews for
                      all <span className="num">{rosterCount}</span> tracked rivals
                    </li>
                    <li>
                      Re-checks the <span className="num">{promptCount}</span> local AI prompts
                      across all <span className="num">{SURFACES.length}</span> surfaces for cited
                      sources
                    </li>
                    <li>
                      Refreshes the map-pack leaderboard, AI-answer tallies and rating comparison
                    </li>
                  </ul>
                </div>
              }
            />
          )}
        </div>
      </div>

      {!hasAnyData ? (
        <div className="diamond-watermark border-border bg-card flex flex-col items-center gap-2 rounded-lg border p-10 text-center">
          <span
            aria-hidden
            className="flex items-center gap-1.5"
          >
            <span className="bg-primary-200 size-4 rotate-45" />
            <span className="size-4 rotate-45 bg-cyan-200" />
          </span>
          <h3 className="text-base font-semibold">No competitive scan on file</h3>
          <p className="text-text-secondary max-w-md text-[13px]">
            Run the first competitive scan to discover this location&apos;s local rivals from
            Google&apos;s &ldquo;people also search&rdquo; data, the geo-grid pack and the AI answer
            sources.
          </p>
          <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
            <Button
              asChild
              variant="outline"
              size="sm"
            >
              <Link href={`/locations/${slug}`}>Back to location overview</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="sm"
            >
              <Link href={`/locations/${slug}/geo-grid`}>Open geo-grid scanner</Link>
            </Button>
          </div>
        </div>
      ) : (
        <CompetitiveView
          slug={slug}
          model={model}
          responseRate={responseRate}
          responseRateSource={responseRateSource}
        />
      )}

      {location.rating && (
        <p className="text-text-tertiary flex items-center gap-1.5 text-[11px]">
          <Star
            className="size-3"
            aria-hidden
          />
          Ratings and review counts shown for you and DataForSEO-seeded rivals are real Google
          Business Profile values.
        </p>
      )}
    </div>
  );
}
