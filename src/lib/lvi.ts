/**
 * Local Visibility Index — healthcare-weighted 9-component composite.
 *
 * THE ONLY place LVI weights live (CLAUDE.md architecture invariant).
 * Weights are the Baptist healthcare tuning:
 * Review Health, NAP/Duplicate Integrity, and Local AI Citation are elevated.
 * They MUST sum to exactly 1.00 — validated at module load.
 */

export type LVIBand = "elite" | "healthy" | "at-risk" | "critical";

export interface LVIComponentDef {
  id: string;
  label: string;
  weight: number;
  /** Route suffix of the module that owns this component (under /locations/[slug]) */
  module: string;
}

export const LVI_COMPONENTS: readonly LVIComponentDef[] = [
  { id: "geo_grid_rank", label: "Geo-Grid Rank", weight: 0.18, module: "geo-grid" },
  { id: "gbp_health", label: "GBP Health", weight: 0.14, module: "gbp-health" },
  { id: "review_health", label: "Review Health", weight: 0.16, module: "reviews" },
  { id: "review_response", label: "Review Response", weight: 0.08, module: "reviews" },
  { id: "nap_integrity", label: "NAP Integrity", weight: 0.14, module: "nap" },
  { id: "citation_coverage", label: "Citation Coverage", weight: 0.08, module: "citations" },
  { id: "local_ai_citation", label: "Local AI Citation", weight: 0.12, module: "local-ai" },
  { id: "posts_cadence", label: "Posts Cadence", weight: 0.05, module: "posts" },
  { id: "photo_freshness", label: "Photo Freshness", weight: 0.05, module: "gbp-health" },
] as const;

const WEIGHT_SUM = LVI_COMPONENTS.reduce((s, c) => s + c.weight, 0);
if (Math.round(WEIGHT_SUM * 100) !== 100) {
  throw new Error(`LVI weights must sum to exactly 1.00 — got ${WEIGHT_SUM.toFixed(4)}`);
}

export interface LVIComponentScore extends LVIComponentDef {
  /** 0–100 sub-score */
  score: number;
  band: LVIBand;
}

export interface LVIResult {
  value: number;
  band: LVIBand;
  delta?: number;
  components: LVIComponentScore[];
}

/** Band thresholds per _COMPONENT_SPECS_Batch_15.md §1 (exact). */
export function lviBand(value: number): LVIBand {
  if (value >= 80) return "elite";
  if (value >= 60) return "healthy";
  if (value >= 30) return "at-risk";
  return "critical";
}

export const LVI_BAND_LABEL: Record<LVIBand, string> = {
  elite: "Elite",
  healthy: "Healthy",
  "at-risk": "At-Risk",
  critical: "Critical",
};

/** Band → semantic color token (color + icon + text at render sites). */
export const LVI_BAND_COLOR: Record<LVIBand, string> = {
  elite: "var(--color-success-500)",
  healthy: "var(--color-success-500)",
  "at-risk": "var(--color-warning-500)",
  critical: "var(--color-error-500)",
};

/**
 * Compose an LVI from raw 0–100 component scores.
 * Missing components score 0 (visible honesty beats silent optimism).
 */
export function computeLVI(scores: Partial<Record<string, number>>, delta?: number): LVIResult {
  const components: LVIComponentScore[] = LVI_COMPONENTS.map((def) => {
    const raw = scores[def.id] ?? 0;
    const score = Math.max(0, Math.min(100, raw));
    return { ...def, score, band: lviBand(score) };
  });
  const value = Math.round(components.reduce((sum, c) => sum + c.score * c.weight, 0));
  return { value, band: lviBand(value), delta, components };
}

/** Portfolio LVI = weighted roll-up (equal location weights for the pilot fleet). */
export function rollupLVI(locationLVIs: number[]): number {
  if (locationLVIs.length === 0) return 0;
  return Math.round(locationLVIs.reduce((s, v) => s + v, 0) / locationLVIs.length);
}
