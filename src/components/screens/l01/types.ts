import type { LVIBand } from "@/lib/lvi";

/** Serializable prop shapes for L01 — computed server-side in page.tsx. */

export interface L01LocationCardData {
  slug: string;
  shortName: string;
  city: string;
  state: string;
  listingType: "facility" | "department" | "practitioner";
  lvi: number;
  band: LVIBand;
  delta: number;
  spark: number[];
  gbpHealth: number | null;
  avgRank: number | null;
  citationsPct: number | null;
  rating: number | null;
  ratingVotes: number | null;
  aiPct: number | null;
}

export interface L01Mover {
  slug: string;
  shortName: string;
  city: string;
  lvi: number;
  band: LVIBand;
  delta: number;
  spark: number[];
}

export interface L01BandRow {
  band: LVIBand;
  label: string;
  count: number;
  pct: number;
}

export interface L01AlertItem {
  id: string;
  eyebrow: string;
  tone: "error" | "warning" | "info";
  count: string;
  line: string;
  secondary?: string;
  href: string;
  linkLabel: string;
}

export interface L01SurfaceStat {
  id: string;
  pct: number;
  cited: number;
  partial: number;
  total: number;
}

export interface L01TrendPoint {
  month: string;
  portfolio: number;
  median: number;
}
