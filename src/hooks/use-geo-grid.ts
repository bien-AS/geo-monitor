"use client";

import { useMemo } from "react";
import {
  serializeGrid,
  slimLocation,
  summarizeLocalAI,
  type GeoLocationSlim,
  type KeywordGrid,
  type LocalAISummary,
  type ScanCostPreview,
} from "@/components/screens/geo-grid/helpers";
import type {
  BaptistLocation,
  GeoGridFixture,
  GridPreviewFixture,
  KeywordsFixture,
  LocalAIFixture,
} from "@/lib/data/types";

import {
  DASHBOARD_LOCATIONS,
  DASHBOARD_GEO_GRIDS,
  DASHBOARD_GRID_PREVIEWS,
  DASHBOARD_KEYWORDS,
  DASHBOARD_LOCAL_AI,
} from "@/lib/data/fixtures";

export interface GeoGridData {
  location: GeoLocationSlim;
  grids: KeywordGrid[];
  preview: ScanCostPreview | null;
  localAI: LocalAISummary | null;
  locations: Array<{ slug: string; name: string; city: string }>;
  trackedKeywords: Array<{ keyword: string; status: "scanned" | "not_scanned" }>;
}

function compute(slug: string): GeoGridData | null {
  const location = (DASHBOARD_LOCATIONS as BaptistLocation[]).find((l) => l.slug === slug);
  if (!location) return null;

  const slim = slimLocation(location);
  if (!slim) return null;

  const gridFixtures: GeoGridFixture[] = DASHBOARD_GEO_GRIDS[slug] ?? [];
  const grids = gridFixtures.map(serializeGrid).sort((a, b) => a.keyword.localeCompare(b.keyword));

  const previewFixture: GridPreviewFixture | null = DASHBOARD_GRID_PREVIEWS[slug] ?? null;
  const locations = (DASHBOARD_LOCATIONS as BaptistLocation[]).map((l) => ({
    slug: l.slug,
    name: l.name,
    city: l.city,
  }));
  const keywordsFixture: KeywordsFixture | null = DASHBOARD_KEYWORDS[slug] ?? null;
  const localAIFixture: LocalAIFixture | null = DASHBOARD_LOCAL_AI[slug] ?? null;

  const preview: ScanCostPreview | null = previewFixture
    ? {
        businessId: 0,
        pinCount: previewFixture.preview.pin_count,
        keywordCount: previewFixture.preview.keyword_count,
        refreshesPerMonth: 4,
        checksPerMonth: previewFixture.preview.pin_count * previewFixture.preview.keyword_count * 4,
        fleetChecksPerMonth:
          previewFixture.preview.pin_count *
          previewFixture.preview.keyword_count *
          4 *
          locations.length,
        fleetLocations: locations.length,
        source: "synthetic",
      }
    : null;

  return {
    location: slim,
    grids,
    preview,
    localAI: summarizeLocalAI(localAIFixture),
    locations,
    trackedKeywords: keywordsFixture?.keywords ?? [],
  };
}

export function useGeoGrid(slug: string) {
  const data = useMemo(() => compute(slug), [slug]);

  return {
    data,
    isLoading: false,
    error: null as Error | null,
  };
}
