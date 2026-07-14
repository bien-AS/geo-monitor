"use client";

import { useMemo } from "react";
import { shortLocationName } from "@/lib/location-names";
import type { BaptistLocation, ReviewsFixture, AuditLogEntry } from "@/lib/data/types";
import { DASHBOARD_LOCATIONS, DASHBOARD_REVIEWS, DASHBOARD_AUDIT_LOG } from "@/lib/data/fixtures";

export interface SeoWeaveContext {
  shortName: string;
  city: string;
  serviceLine: string;
}

export interface ReviewsPageData {
  location: BaptistLocation;
  shortName: string;
  navLocations: Array<{ slug: string; name: string; city: string }>;
  reviewsFixture: ReviewsFixture | null;
  unanswered: number;
  critical: number;
  fixtureAuditEntries: AuditLogEntry[];
  seoCtx: SeoWeaveContext | undefined;
}

function compute(slug: string): ReviewsPageData | null {
  const location = (DASHBOARD_LOCATIONS as BaptistLocation[]).find((l) => l.slug === slug);
  if (!location) return null;

  const shortName = shortLocationName(location.name);
  const navLocations = (DASHBOARD_LOCATIONS as BaptistLocation[]).map((l) => ({
    slug: l.slug,
    name: l.name,
    city: l.city,
  }));

  const reviewsFixture: ReviewsFixture | null = DASHBOARD_REVIEWS[slug] ?? null;
  const reviews = reviewsFixture?.reviews ?? [];
  const unanswered = reviews.filter((r) => r.status === "unanswered").length;
  const critical = reviews.filter(
    (r) => r.sentiment === "critical" || r.status === "handoff",
  ).length;

  const fixtureAuditEntries = (DASHBOARD_AUDIT_LOG as AuditLogEntry[]).filter(
    (e) => e.location_slug === slug && e.resource.startsWith("review"),
  );

  const seoCtx: SeoWeaveContext | undefined = location.facility_type
    ? {
        shortName,
        city: location.city,
        serviceLine: location.facility_type
          .replace(/^specialty_/, "")
          .replace(/_/g, " ")
          .replace(/\bent\b/i, "ENT")
          .replace(/\bmfm\b/i, "maternal-fetal medicine")
          .replace(/\bpmr\b/i, "physical medicine & rehabilitation")
          .replace(/^(?!.*care$)(.*)$/, "$1 care")
          .replace("care care", "care"),
      }
    : undefined;

  return {
    location,
    shortName,
    navLocations,
    reviewsFixture,
    unanswered,
    critical,
    fixtureAuditEntries,
    seoCtx,
  };
}

export function useReviews(slug: string) {
  const data = useMemo(() => compute(slug), [slug]);
  return { data, isLoading: false, error: null as Error | null };
}
