"use client";

import { useMemo } from "react";
import type { BaptistLocation, KeywordsFixture, GeoGridFixture } from "@/lib/data/types";
import { DASHBOARD_LOCATIONS, DASHBOARD_KEYWORDS, DASHBOARD_GEO_GRIDS } from "@/lib/data/fixtures";

export interface TrackerSnap {
  date: string;
  avg: number | null;
  best: number | null;
  top3Pct: number | null;
}

export interface TrackerRow {
  keyword: string;
  scanned: boolean;
  addedAt: string;
  usage: { grid: boolean; ai: boolean; comp: boolean };
  snapshots: TrackerSnap[];
  organic: Array<{ date: string; g: number | null; b: number | null }>;
}

export interface KeywordsData {
  location: BaptistLocation;
  locations: BaptistLocation[];
  locationName: string;
  locationLabel: string;
  maxKeywords: number;
  rows: TrackerRow[];
  lastScan: string | undefined;
}

const ORGANIC_DATES = [
  "2026-02-15",
  "2026-03-15",
  "2026-04-15",
  "2026-05-15",
  "2026-06-15",
  "2026-07-02",
];

function fnv(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function serializeSnapshots(grid: GeoGridFixture): TrackerSnap[] {
  return (grid.snapshots ?? []).map((s) => {
    return {
      date: s.date,
      avg: s.avg_rank != null && s.avg_rank > 0 ? s.avg_rank : null,
      best: s.best_position != null ? s.best_position : null,
      top3Pct:
        s.total_pins && s.total_pins > 0
          ? Math.round(((s.position_distribution?.["1-3"] ?? 0) / s.total_pins) * 100)
          : null,
    };
  });
}

function organicSeries(
  slug: string,
  keyword: string,
): Array<{ date: string; g: number | null; b: number | null }> {
  const seed = fnv(`${slug}|${keyword}`);
  const gStart = 4 + (seed % 38);
  const bStart = 3 + ((seed >> 3) % 45);
  const drift = ((seed >> 6) % 7) - 4;
  return ORGANIC_DATES.map((date, i) => {
    const wob = (fnv(`${keyword}|${i}`) % 7) - 3;
    const g = Math.max(1, Math.round(gStart + drift * i * 0.6 + wob));
    const b = Math.max(1, Math.round(bStart + drift * i * 0.5 + wob));
    return {
      date,
      g: g > 100 ? null : g,
      b: (seed >> 9) % 5 === 0 ? null : b > 100 ? null : b,
    };
  });
}

function compute(slug: string): KeywordsData | null {
  const location = (DASHBOARD_LOCATIONS as BaptistLocation[]).find((l) => l.slug === slug);
  if (!location) return null;

  const keywords: KeywordsFixture | null = DASHBOARD_KEYWORDS[slug] ?? null;
  if (!keywords) return null;

  const grids: GeoGridFixture[] = DASHBOARD_GEO_GRIDS[slug] ?? [];
  const gridByKeyword = new Map(grids.map((g) => [g.keyword, g]));

  let lastScan: string | undefined;
  const rows: TrackerRow[] = keywords.keywords.map((k) => {
    const grid = gridByKeyword.get(k.keyword);
    const snapshots = grid ? serializeSnapshots(grid) : [];
    for (const s of snapshots) {
      if (!lastScan || s.date > lastScan) lastScan = s.date;
    }
    return {
      keyword: k.keyword,
      scanned: snapshots.length > 0,
      addedAt: k.added_at ?? "2026-02-15",
      usage: {
        grid: k.in_geo_grid ?? false,
        ai: k.in_local_ai ?? false,
        comp: k.in_competitive ?? false,
      },
      snapshots,
      organic: organicSeries(slug, k.keyword),
    };
  });

  const locations = DASHBOARD_LOCATIONS as BaptistLocation[];

  return {
    location,
    locations,
    locationName: location.name,
    locationLabel: `${location.city}, ${location.state}`,
    maxKeywords: keywords.max_keywords,
    rows,
    lastScan,
  };
}

export function useKeywords(slug: string) {
  const data = useMemo(() => compute(slug), [slug]);

  return {
    data,
    isLoading: false,
    error: null as Error | null,
  };
}
