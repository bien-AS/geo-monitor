"use client";

import { useMemo } from "react";
import { DASHBOARD_RUNS, DASHBOARD_LOCATIONS } from "@/lib/data/fixtures";
import { shortLocationName } from "@/lib/location-names";
import type { RunReceipt } from "@/lib/data/types";

export function useFleetRuns() {
  const data = useMemo(() => {
    return [...DASHBOARD_RUNS.runs].sort(
      (a, b) => +new Date(b.started_at) - +new Date(a.started_at),
    );
  }, []);

  return { data, isLoading: false, error: null as Error | null };
}

export function useLocationRuns(slug: string) {
  const data = useMemo(() => {
    const location = DASHBOARD_LOCATIONS.find((l) => l.slug === slug);
    if (!location) return null;

    const shortName = shortLocationName(location.name);
    return DASHBOARD_RUNS.runs
      .filter(
        (r) =>
          r.location_scope.includes(shortName) ||
          r.location_scope.startsWith("All ") ||
          r.artifacts.some((a) => a.href.includes(`/locations/${slug}/`)),
      )
      .sort((a, b) => +new Date(b.started_at) - +new Date(a.started_at));
  }, [slug]);

  return { data, isLoading: false, error: null as Error | null };
}

export function useRunDetail(id: string) {
  const data = useMemo(() => {
    return DASHBOARD_RUNS.runs.find((r) => r.id === id) ?? null;
  }, [id]);

  return { data, isLoading: false, error: null as Error | null };
}
