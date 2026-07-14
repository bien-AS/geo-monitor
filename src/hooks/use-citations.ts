"use client";

import { useMemo } from "react";
import { shortLocationName } from "@/lib/location-names";
import type { BaptistLocation, CitationsFixture, NAPFile, NAP, DataSource } from "@/lib/data/types";
import { DASHBOARD_LOCATIONS, DASHBOARD_CITATIONS, DASHBOARD_NAP } from "@/lib/data/fixtures";

export interface CitationsPageData {
  location: BaptistLocation;
  shortName: string;
  navLocations: Array<{ slug: string; name: string; city: string }>;
  canonical: (NAP & { source?: DataSource }) | null;
  canonicalSource: DataSource;
  citations: CitationsFixture | null;
  napFile: NAPFile | null;
  lastChecked: string | null;
}

function compute(slug: string): CitationsPageData | null {
  const location = (DASHBOARD_LOCATIONS as BaptistLocation[]).find((l) => l.slug === slug);
  if (!location) return null;

  const shortName = shortLocationName(location.name);
  const navLocations = (DASHBOARD_LOCATIONS as BaptistLocation[]).map((l) => ({
    slug: l.slug,
    name: l.name,
    city: l.city,
  }));

  const citations: CitationsFixture | null = DASHBOARD_CITATIONS[slug] ?? null;
  const napFile: NAPFile = {
    generated_at: "2026-07-10",
    source_note: "Canonical NAP + observed drifts from DataForSEO",
    canonical: {},
    drifts: DASHBOARD_NAP.drifts,
  };

  const canonicalRec = napFile.canonical[slug] ?? null;
  const canonical: (NAP & { source?: DataSource }) | null =
    canonicalRec ??
    (location.phone
      ? {
          name: location.name,
          address: `${location.address}, ${location.city}, ${location.state}`,
          phone: location.phone,
          website: location.website ?? undefined,
        }
      : null);
  const canonicalSource: DataSource = canonicalRec?.source ?? "synthetic";

  const rows = citations?.rows ?? [];
  const lastChecked =
    rows.length > 0
      ? rows.reduce((max, r) => (r.last_checked > max ? r.last_checked : max), rows[0].last_checked)
      : null;

  return {
    location,
    shortName,
    navLocations,
    canonical,
    canonicalSource,
    citations,
    napFile,
    lastChecked,
  };
}

export function useCitations(slug: string) {
  const data = useMemo(() => compute(slug), [slug]);
  return { data, isLoading: false, error: null as Error | null };
}
