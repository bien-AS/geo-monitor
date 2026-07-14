"use client";

import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import { useReviews } from "@/hooks/use-reviews";
import { fmtDate, fmtPct } from "@/lib/format";
import { shortLocationName } from "@/lib/location-names";
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
import { SourceBadge } from "@/components/local/source-badge";
import { StatusPill } from "@/components/local/status-pill";
import { Icons } from "@/lib/icons";
import { ReviewsWorkspace } from "@/components/screens/reviews/reviews-workspace";
import { ReviewsTabNav } from "@/components/screens/reviews/tab-nav";

export default function ReviewsPage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const { data, isLoading, error } = useReviews(slug);

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
        <p className="text-muted-foreground">Failed to load reviews data.</p>
        <p className="text-muted-foreground text-[13px]">{error.message}</p>
      </div>
    );
  }

  if (!data) notFound();

  const {
    location,
    shortName,
    navLocations,
    reviewsFixture,
    unanswered,
    critical,
    fixtureAuditEntries,
    seoCtx,
  } = data;
  const reviews = reviewsFixture?.reviews ?? [];
  const summary = reviewsFixture?.summary ?? null;
  const hasReviews = reviews.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <ScopeBanner
        module="Reviews"
        locationName={location.name}
        lastScan={reviewsFixture ? fmtDate(reviewsFixture.generated_at) : undefined}
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
                <BreadcrumbPage>Reviews</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="mt-2 flex flex-wrap items-center gap-2.5">
            <h1 className="text-foreground text-2xl font-semibold">Review Response Workspace</h1>
            <Badge
              variant="outline"
              className="capitalize"
            >
              {location.listing_type}
            </Badge>
            {summary?.avg_rating != null && (
              <span className="num bg-accent text-accent-foreground rounded-full px-2.5 py-1 text-[12px] font-bold">
                ★ {summary.avg_rating.toFixed(1)}
              </span>
            )}
            {unanswered > 0 && (
              <StatusPill tone="warning">
                <span className="num">{unanswered}</span> unanswered
              </StatusPill>
            )}
            {critical > 0 && (
              <StatusPill tone="error">
                <span className="num">{critical}</span> critical
              </StatusPill>
            )}
          </div>
          <p className="text-text-tertiary mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px]">
            {summary ? (
              <>
                <span>
                  <span className="num text-text-secondary font-semibold">{summary.total}</span>{" "}
                  Google reviews · response rate{" "}
                  <span className="num text-text-secondary font-semibold">
                    {fmtPct(summary.response_rate)}
                  </span>
                </span>
                ·
              </>
            ) : null}
            <span>
              HIPAA guardrail: replies never confirm patienthood · PHI gate before every approval ·
              no auto-post
            </span>
            <SourceBadge
              source="synthetic"
              note="Synthetic demo reviews — fake reviewers (first name + last initial), HIPAA-safe"
            />
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
            <Link href={`/locations/${slug}/reviews/trends`}>
              <Icons.trendingUp
                className="size-3.5"
                aria-hidden
              />
              Reviews Trends
              <Icons.arrowRight
                className="size-3.5"
                aria-hidden
              />
            </Link>
          </Button>
        </div>
      </div>

      <ReviewsTabNav
        slug={slug}
        active="inbox"
      />

      {hasReviews ? (
        <ReviewsWorkspace
          slug={slug}
          reviews={reviews}
          checkUrl={location.check_url ?? null}
          fixtureAuditEntries={fixtureAuditEntries}
          seoCtx={seoCtx}
        />
      ) : (
        <div className="border-border bg-card flex flex-col items-center gap-3 rounded-lg border py-16">
          <div
            className="flex items-center gap-2.5"
            aria-hidden
          >
            <span className="bg-primary-200 size-6 rotate-45" />
            <span className="size-6 rounded-full bg-cyan-200" />
            <span
              className="border-b-primary-200 size-0 border-x-[13px] border-b-[22px] border-x-transparent"
              style={{ borderBottomStyle: "solid" }}
            />
          </div>
          <h3 className="text-foreground text-[15px] font-semibold">
            No reviews yet for this listing
          </h3>
          <p className="text-text-secondary max-w-md text-center text-[13px]">
            When Google reviews land for {shortName}, they will appear here with sentiment tagging,
            the PHI-gated reply workspace, and the patient relations handoff lane.
          </p>
          <Button
            asChild
            variant="outline"
            size="sm"
          >
            <Link href={`/locations/${slug}`}>Back to location overview</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
