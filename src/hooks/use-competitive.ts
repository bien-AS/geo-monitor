"use client";

import { useMemo } from "react";
import {
  DASHBOARD_LOCATIONS,
  DASHBOARD_COMPETITORS,
  DASHBOARD_GEO_GRIDS,
  DASHBOARD_LOCAL_AI,
  DASHBOARD_REVIEWS,
} from "@/lib/data/fixtures";
import type {
  BaptistLocation,
  GeoGridFixture,
  LocalAIFixture,
  ReviewsFixture,
} from "@/lib/data/types";
import { deriveCompetitiveModel, type CompetitiveModel } from "@/lib/competitive-derive";

export interface CompetitiveData {
  model: CompetitiveModel;
  responseRate: number | null;
  responseRateSource: "searchatlas" | "dataforseo" | "synthetic" | null;
  location: BaptistLocation;
  locations: BaptistLocation[];
}

function compute(slug: string): CompetitiveData | null {
  const locations = DASHBOARD_LOCATIONS as BaptistLocation[];
  const location = locations.find((l) => l.slug === slug);
  if (!location) return null;

  const competitorsFx = DASHBOARD_COMPETITORS[slug] ?? null;
  const grids: GeoGridFixture[] = DASHBOARD_GEO_GRIDS[slug] ?? [];
  const localAI: LocalAIFixture | null = DASHBOARD_LOCAL_AI[slug] ?? null;
  const reviews: ReviewsFixture | null = DASHBOARD_REVIEWS[slug] ?? null;

  const model = deriveCompetitiveModel({
    location,
    competitorsFx,
    grids,
    localAI,
  });

  return {
    model,
    responseRate: reviews?.summary.response_rate ?? null,
    responseRateSource: reviews ? reviews.source : null,
    location,
    locations,
  };
}

export function useCompetitive(slug: string) {
  const data = useMemo(() => compute(slug), [slug]);

  return {
    data,
    isLoading: false,
    error: null as Error | null,
  };
}
