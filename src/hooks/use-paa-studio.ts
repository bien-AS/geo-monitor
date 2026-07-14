"use client";

import { useMemo } from "react";
import { DASHBOARD_LOCATIONS, DASHBOARD_KEYWORDS, DASHBOARD_LOCAL_AI } from "@/lib/data/fixtures";
import type { BaptistLocation } from "@/lib/data/types";
import type { PaaLocationCtx, PaaOpportunity } from "@/lib/paa-articles";

function serviceLabel(facilityType: string | undefined): string {
  if (!facilityType) return "primary care";
  return facilityType
    .replace(/^specialty_/, "")
    .replace(/_/g, " ")
    .replace(/\bent\b/i, "ENT")
    .replace(/\bmfm\b/i, "maternal-fetal medicine")
    .replace(/\bpmr\b/i, "physical medicine & rehabilitation");
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export interface PaaStudioData {
  ctx: PaaLocationCtx;
  opportunities: PaaOpportunity[];
  fixtureArticles: never[];
  bakedQueries: string[];
  pool: never[];
  modelsByQuery: Record<string, never>;
  rivals: Array<{ domain: string; surface: string }>;
  location: BaptistLocation;
  locations: BaptistLocation[];
}

function compute(slug: string): PaaStudioData | null {
  const locations = DASHBOARD_LOCATIONS as BaptistLocation[];
  const location = locations.find((l) => l.slug === slug);
  if (!location) return null;

  const keywords = DASHBOARD_KEYWORDS[slug] ?? null;
  const localAI = DASHBOARD_LOCAL_AI[slug] ?? null;

  const service = serviceLabel(location.facility_type);
  const ctx: PaaLocationCtx = {
    slug,
    name: location.name,
    shortName: location.name.split(" - ")[1] ?? location.name,
    city: location.city,
    state: location.state,
    service,
    domain: location.domain ?? null,
    rating: location.rating ?? null,
  };

  const rivalCounts = new Map<string, { n: number; surface: string }>();
  for (const r of localAI?.results ?? []) {
    const d = r.source_cited;
    if (!d || /baptist/i.test(d)) continue;
    const cur = rivalCounts.get(d);
    rivalCounts.set(d, { n: (cur?.n ?? 0) + 1, surface: cur?.surface ?? r.surface });
  }
  const rivals = [...rivalCounts.entries()].sort((a, b) => b[1].n - a[1].n);

  const kws = (keywords?.keywords ?? []).slice(0, 8);
  const QUESTION_TEMPLATES = [
    () => `How much does ${service} cost in ${location.city} without insurance?`,
    () => `Do I need a referral for ${service} in ${location.city}?`,
    () => `Who is the best ${service} provider near ${location.city}, ${location.state}?`,
    () => `How fast can I get a ${service} appointment in ${location.city}?`,
    (kw: string) => `Does insurance cover ${kw}?`,
    () => `What should I expect at a first ${service} visit?`,
    () => `Can I be seen same day for ${service} in ${location.city}?`,
    () => `What questions should I ask a ${service} provider?`,
  ];
  const SURFACE_ROTATION = ["serp_paa", "ai_overview", "serp_paa", "ai_mode"];
  const seenQ = new Set<string>();
  const opportunities: PaaOpportunity[] = [];
  kws.forEach((k, i) => {
    const question = QUESTION_TEMPLATES[i % QUESTION_TEMPLATES.length](k.keyword);
    if (seenQ.has(question)) return;
    seenQ.add(question);
    const rival = rivals[i % Math.max(rivals.length, 1)];
    opportunities.push({
      id: `opp-${slug}-${i}`,
      question,
      sourceKeyword: k.keyword,
      competitorDomain: rival ? rival[0] : null,
      surface: rival ? rival[1].surface : null,
      breadthNote: `asked across ~${28 + (hash(question) % 45)} grid cells`,
      related: [],
      surfaceSource: SURFACE_ROTATION[i % SURFACE_ROTATION.length],
    });
  });

  return {
    ctx,
    opportunities,
    fixtureArticles: [],
    bakedQueries: [],
    pool: [],
    modelsByQuery: {},
    rivals: rivals.map(([domain, meta]) => ({ domain, surface: meta.surface })),
    location,
    locations,
  };
}

export function usePaaStudio(slug: string) {
  const data = useMemo(() => compute(slug), [slug]);

  return {
    data,
    isLoading: false,
    error: null as Error | null,
  };
}
