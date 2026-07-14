"use client";

import { useMemo } from "react";
import { composeRecs } from "@/lib/action-center";
import { shortLocationName } from "@/lib/location-names";
import {
  DASHBOARD_LOCATIONS,
  DASHBOARD_NAP,
  DASHBOARD_REVIEWS,
  DASHBOARD_CITATIONS,
  DASHBOARD_LOCAL_AI,
} from "@/lib/data/fixtures";
import type { ActionRec } from "@/lib/data/types";

export function useFleetActionCenter() {
  const data = useMemo(() => {
    const locations = DASHBOARD_LOCATIONS.map((l) => ({
      slug: l.slug,
      name: l.name,
      city: l.city,
    }));

    const reviewsBySlug: Record<
      string,
      (typeof DASHBOARD_REVIEWS)[keyof typeof DASHBOARD_REVIEWS] | null
    > = {};
    const aiBySlug: Record<
      string,
      (typeof DASHBOARD_LOCAL_AI)[keyof typeof DASHBOARD_LOCAL_AI] | null
    > = {};
    const citationsBySlug: Record<
      string,
      (typeof DASHBOARD_CITATIONS)[keyof typeof DASHBOARD_CITATIONS] | null
    > = {};

    for (const l of locations) {
      reviewsBySlug[l.slug] = DASHBOARD_REVIEWS[l.slug as keyof typeof DASHBOARD_REVIEWS] ?? null;
      aiBySlug[l.slug] = DASHBOARD_LOCAL_AI[l.slug as keyof typeof DASHBOARD_LOCAL_AI] ?? null;
      citationsBySlug[l.slug] =
        DASHBOARD_CITATIONS[l.slug as keyof typeof DASHBOARD_CITATIONS] ?? null;
    }

    const recs = composeRecs({
      locations,
      drifts: DASHBOARD_NAP.drifts,
      reviewsBySlug,
      aiBySlug,
      citationsBySlug,
    });

    return recs;
  }, []);

  return { data, isLoading: false, error: null as Error | null };
}

export function useLocationActionCenter(slug: string) {
  const data = useMemo(() => {
    const location = DASHBOARD_LOCATIONS.find((l) => l.slug === slug);
    if (!location) return null;

    const locations = [{ slug: location.slug, name: location.name, city: location.city }];

    const reviewsBySlug: Record<
      string,
      (typeof DASHBOARD_REVIEWS)[keyof typeof DASHBOARD_REVIEWS] | null
    > = {
      [slug]: DASHBOARD_REVIEWS[slug as keyof typeof DASHBOARD_REVIEWS] ?? null,
    };
    const aiBySlug: Record<
      string,
      (typeof DASHBOARD_LOCAL_AI)[keyof typeof DASHBOARD_LOCAL_AI] | null
    > = {
      [slug]: DASHBOARD_LOCAL_AI[slug as keyof typeof DASHBOARD_LOCAL_AI] ?? null,
    };
    const citationsBySlug: Record<
      string,
      (typeof DASHBOARD_CITATIONS)[keyof typeof DASHBOARD_CITATIONS] | null
    > = {
      [slug]: DASHBOARD_CITATIONS[slug as keyof typeof DASHBOARD_CITATIONS] ?? null,
    };

    return composeRecs({
      locations,
      drifts: DASHBOARD_NAP.drifts,
      reviewsBySlug,
      aiBySlug,
      citationsBySlug,
    }).filter((r) => r.location_slug === slug);
  }, [slug]);

  return { data, isLoading: false, error: null as Error | null };
}
