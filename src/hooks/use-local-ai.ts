"use client";

import { useMemo } from "react";
import { shortLocationName } from "@/lib/location-names";
import type { BaptistLocation, LocalAIFixture, CompetitorsFixture } from "@/lib/data/types";
import {
  DASHBOARD_LOCATIONS,
  DASHBOARD_LOCAL_AI,
  DASHBOARD_COMPETITORS,
} from "@/lib/data/fixtures";
import {
  type LocalAILocationSlim,
  type CompetitorSlim,
  type AICheckRow,
  slimLocalAILocation,
  serializeResults,
  slimCompetitors,
} from "@/components/screens/local-ai/helpers";

export type { LocalAILocationSlim, CompetitorSlim, AICheckRow };

export interface LocalAIPageData {
  location: LocalAILocationSlim;
  shortName: string;
  navLocations: Array<{ slug: string; name: string; city: string }>;
  prompts: string[];
  rows: AICheckRow[];
  competitors: CompetitorSlim[];
}

function compute(slug: string): LocalAIPageData | null {
  const location = (DASHBOARD_LOCATIONS as BaptistLocation[]).find((l) => l.slug === slug);
  if (!location) return null;

  const shortName = shortLocationName(location.name);
  const navLocations = (DASHBOARD_LOCATIONS as BaptistLocation[]).map((l) => ({
    slug: l.slug,
    name: l.name,
    city: l.city,
  }));

  const fixture: LocalAIFixture | null = DASHBOARD_LOCAL_AI[slug] ?? null;
  const competitorsFixture: CompetitorsFixture | null = DASHBOARD_COMPETITORS[slug] ?? null;

  return {
    location: slimLocalAILocation(location),
    shortName,
    navLocations,
    prompts: fixture?.prompts ?? [],
    rows: fixture ? serializeResults(fixture) : [],
    competitors: slimCompetitors(competitorsFixture),
  };
}

export function useLocalAI(slug: string) {
  const data = useMemo(() => compute(slug), [slug]);

  return {
    data,
    isLoading: false,
    error: null as Error | null,
  };
}
