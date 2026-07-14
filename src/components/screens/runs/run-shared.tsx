"use client";

import { StatusPill } from "@/components/local/status-pill";
import type { RunStatus } from "@/lib/data/types";

export function RunStatusPill({ status }: { status: RunStatus }) {
  switch (status) {
    case "succeeded":
      return <StatusPill tone="success">Succeeded</StatusPill>;
    case "failed":
      return <StatusPill tone="error">Failed</StatusPill>;
    case "partial":
      return <StatusPill tone="warning">Partial</StatusPill>;
    case "running":
      return <StatusPill tone="info">Running</StatusPill>;
  }
}

export function fmtDuration(s: number): string {
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return rem ? `${m}m ${rem}s` : `${m}m`;
}

export const KIND_LABEL: Record<string, string> = {
  ai_surface_check: "AI surface check",
  geo_grid_scan: "Geo-grid scan",
  citation_baseline: "Citation baseline",
  gbp_audit: "GBP audit",
  enrichment: "Enrichment",
  heatmap_setup: "Heatmap setup",
  review_sync: "Review sync",
  nap_drift_check: "NAP drift check",
  keyword_scan: "Keyword scan",
  citation_order: "Citation order",
  report_generate: "Report generation",
};

export const PROVIDER_LABEL: Record<string, string> = {
  dataforseo: "DataForSEO",
  searchatlas: "Search Atlas",
  brightlocal: "Bright Local",
  omega: "Omega Indexer",
  indexcheckr: "IndexCheckr",
};
