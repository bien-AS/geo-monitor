"use client";

import { useMemo } from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import { useReviews } from "@/hooks/use-reviews";
import { fmtDate, fmtPct } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ScopeBanner } from "@/components/shell/scope-banner";
import { ReviewsTabNav } from "@/components/screens/reviews/tab-nav";
import { RatingDistributionBars, TopicFrequencyBars } from "@/components/screens/reviews/bars";
import {
  VolumeRatingChart,
  ResponseRateChart,
  SentimentLegend,
  SentimentMixChart,
  type MonthlyPoint,
  type ResponseRatePoint,
  type SentimentMonthPoint,
} from "@/components/screens/reviews/trends-charts";
import type { ReviewSentiment } from "@/lib/data/types";

export default function ReviewsTrendsPage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const { data, isLoading, error } = useReviews(slug);

  const trends = useMemo(() => {
    if (!data?.reviewsFixture) return null;
    const { summary, reviews } = data.reviewsFixture;

    const monthlyPoints: MonthlyPoint[] = Object.entries(summary.monthly ?? {})
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([label, v]) => ({
        label: label.slice(-2),
        count: v.count,
        avg: v.avg,
      }));

    const responseRatePoints: ResponseRatePoint[] = monthlyPoints.map((p) => ({
      label: p.label,
      pct: summary.response_rate,
    }));

    const sentimentMonthPoints: SentimentMonthPoint[] = monthlyPoints.map((p) => {
      const counts: Record<ReviewSentiment, number> = {
        positive: 0,
        neutral: 0,
        negative: 0,
        critical: 0,
      };
      for (const r of reviews) {
        counts[r.sentiment] = (counts[r.sentiment] ?? 0) + 1;
      }
      const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
      return {
        label: p.label,
        positive: Math.round((counts.positive / total) * p.count),
        neutral: Math.round((counts.neutral / total) * p.count),
        negative: Math.round((counts.negative / total) * p.count),
        critical: Math.round((counts.critical / total) * p.count),
      };
    });

    const distribution: Record<string, number> = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };
    for (const r of reviews) {
      distribution[String(r.rating)] = (distribution[String(r.rating)] ?? 0) + 1;
    }

    const sentimentTotals: Record<ReviewSentiment, number> = {
      positive: reviews.filter((r) => r.sentiment === "positive").length,
      neutral: reviews.filter((r) => r.sentiment === "neutral").length,
      negative: reviews.filter((r) => r.sentiment === "negative").length,
      critical: reviews.filter((r) => r.sentiment === "critical").length,
    };

    const topicCounts: Record<string, number> = {};
    for (const r of reviews) {
      for (const t of r.topics) {
        topicCounts[t] = (topicCounts[t] ?? 0) + 1;
      }
    }

    return {
      monthlyPoints,
      responseRatePoints,
      sentimentMonthPoints,
      distribution,
      sentimentTotals,
      topicCounts,
      summary,
    };
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="skeleton h-10 w-full rounded-md" />
        <div className="skeleton h-8 w-64 rounded-md" />
        <div className="skeleton h-64 rounded-lg" />
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

  const { location, shortName, navLocations, reviewsFixture } = data;
  const summary = reviewsFixture?.summary ?? null;
  const inboxHref = `/locations/${slug}/reviews`;

  return (
    <div className="flex flex-col gap-6">
      <ScopeBanner
        module="Reviews Trends"
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
                <BreadcrumbLink asChild>
                  <Link href={`/locations/${slug}/reviews`}>Reviews</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Trends</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="mt-2 flex flex-wrap items-center gap-2.5">
            <h1 className="text-foreground text-2xl font-semibold">Review Trends</h1>
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
          </div>
          <p className="text-text-tertiary mt-1 text-[13px]">
            {summary ? (
              <>
                <span className="num text-text-secondary font-semibold">{summary.total}</span>{" "}
                Google reviews · response rate{" "}
                <span className="num text-text-secondary font-semibold">
                  {fmtPct(summary.response_rate)}
                </span>
              </>
            ) : (
              "No review data available"
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
        </div>
      </div>

      <ReviewsTabNav
        slug={slug}
        active="trends"
      />

      {!trends ? (
        <div className="border-border bg-card flex flex-col items-center gap-3 rounded-lg border py-16">
          <h3 className="text-foreground text-[15px] font-semibold">No trend data available</h3>
          <p className="text-text-secondary max-w-md text-center text-[13px]">
            Review trends will populate when Google reviews accumulate for this location.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-[15px]">Review volume & rating</CardTitle>
              </CardHeader>
              <CardContent>
                <VolumeRatingChart points={trends.monthlyPoints} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-[15px]">Response rate</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponseRateChart points={trends.responseRatePoints} />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-[15px]">Rating distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <RatingDistributionBars
                  distribution={trends.distribution}
                  href={inboxHref}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-[15px]">Sentiment overview</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <SentimentMixChart points={trends.sentimentMonthPoints} />
                <SentimentLegend
                  totals={trends.sentimentTotals}
                  inboxHref={inboxHref}
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-[15px]">Frequent topics</CardTitle>
            </CardHeader>
            <CardContent>
              <TopicFrequencyBars
                topics={trends.topicCounts}
                href={inboxHref}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
