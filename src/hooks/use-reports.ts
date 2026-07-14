"use client";

import { useMemo } from "react";
import { DASHBOARD_REPORTS, DASHBOARD_LOCATIONS } from "@/lib/data/fixtures";
import { shortLocationName } from "@/lib/location-names";
import type { ReportArtifact } from "@/lib/data/types";

export function useFleetReports() {
  const data = useMemo(() => {
    const reports = [...DASHBOARD_REPORTS.reports].sort(
      (a, b) => +new Date(b.created_at) - +new Date(a.created_at),
    );
    return {
      reports,
      locations: DASHBOARD_LOCATIONS.map((l) => ({ slug: l.slug, name: l.name })),
    };
  }, []);

  return { data, isLoading: false, error: null as Error | null };
}

export function useLocationReports(slug: string) {
  const data = useMemo(() => {
    const location = DASHBOARD_LOCATIONS.find((l) => l.slug === slug);
    if (!location) return null;

    const shortName = shortLocationName(location.name);
    const reports = DASHBOARD_REPORTS.reports
      .filter((r) => r.scope.includes(shortName) || r.href.includes(`/locations/${slug}/`))
      .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));

    return {
      reports,
      location,
      shortName,
      locations: [{ slug: location.slug, name: location.name }],
    };
  }, [slug]);

  return { data, isLoading: false, error: null as Error | null };
}
