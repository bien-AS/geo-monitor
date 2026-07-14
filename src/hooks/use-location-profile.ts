"use client";

import { useMemo } from "react";
import { shortLocationName } from "@/lib/location-names";
import { buildKB } from "@/lib/kb";
import { buildLocationProfileSections } from "@/lib/location-profile";
import { DASHBOARD_LOCATIONS, DASHBOARD_LOCATIONS_FILE } from "@/lib/data/fixtures";
import type { KBVersion } from "@/lib/data/types";

export function useLocationProfile(slug: string) {
  const data = useMemo(() => {
    const location = DASHBOARD_LOCATIONS.find((l) => l.slug === slug);
    if (!location) return null;

    const locationsFile = DASHBOARD_LOCATIONS_FILE;
    const serviceSeeds = (
      locationsFile.keyword_templates[location.facility_type ?? "primary_care"] ?? []
    )
      .map((kw) => kw.replace("{city}", location.city).replace("{metro}", `${location.city} metro`))
      .filter((kw) => !kw.includes("near me"));

    const groups = buildKB(location, serviceSeeds);
    const sections = buildLocationProfileSections(location, serviceSeeds);
    const locationName = shortLocationName(location.name);

    const seededVersions: KBVersion[] = [
      {
        version: 1,
        label: "Initial import - DataForSEO enrichment",
        actor: "System",
        at: "2026-06-25T14:00:00Z",
        fieldCount: 14,
      },
      {
        version: 2,
        label: "Canonical NAP confirmed against GBP",
        actor: "Agency Operator",
        at: "2026-06-27T21:40:00Z",
        fieldCount: 3,
      },
    ];

    return { location, locationName, groups, sections, seededVersions };
  }, [slug]);

  return { data, isLoading: false, error: null as Error | null };
}
