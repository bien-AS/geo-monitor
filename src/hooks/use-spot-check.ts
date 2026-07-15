"use client";

import { useMemo } from "react";
import type { BaptistLocation, LocalAIFixture } from "@/lib/data/types";
import { DASHBOARD_LOCATIONS, DASHBOARD_LOCAL_AI } from "@/lib/data/fixtures";
import { normalizeDomain } from "@/components/screens/local-ai/helpers";
import type { EvidenceLocation } from "@/components/screens/spot-check/spot-check-data";

function compute(): EvidenceLocation[] {
  return (DASHBOARD_LOCATIONS as BaptistLocation[]).map((l) => {
    const fixture: LocalAIFixture | null = DASHBOARD_LOCAL_AI[l.slug] ?? null;
    return {
      slug: l.slug,
      name: l.name,
      city: l.city,
      state: l.state,
      domain: normalizeDomain(l.domain ?? l.website) ?? null,
      prompts: fixture?.prompts ?? [],
      results: (fixture?.results ?? []).map((r) => ({
        prompt: r.prompt,
        surface: r.surface,
        cited: r.cited,
        source_cited: r.source_cited ?? null,
        snippet: r.snippet ?? "",
        checked_at: r.checked_at ?? "2026-07-10",
        cost: r.cost ?? 0,
        source: r.source ?? "synthetic",
      })),
    };
  });
}

export function useFleetSpotCheck() {
  const data = useMemo(() => compute(), []);
  return { data, isLoading: false, error: null as Error | null };
}
