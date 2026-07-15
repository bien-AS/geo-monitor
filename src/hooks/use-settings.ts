"use client";

import { useMemo } from "react";
import type { ProviderStatus } from "@/components/screens/settings/provider-health-card";

const PROVIDERS: ProviderStatus[] = [
  {
    name: "Search Atlas",
    purpose: "Geo-grids, GBP audits & (post-OAuth) GBP writes",
    envVar: "SEARCHATLAS_API_KEY",
    configured: true,
    note: "20 Baptist heatmap businesses registered",
  },
  {
    name: "DataForSEO",
    purpose: "AI-surface checks & geolocated SERPs",
    envVar: "DATAFORSEO_*",
    configured: false,
    note: "snapshot via MCP — app-side key lands with the live adapter",
  },
  {
    name: "Bright Local",
    purpose: "Citation Builder orders & aggregator syncs",
    envVar: "BRIGHTLOCAL_API_KEY",
    configured: true,
    note: "confirm calls spend credits — env-gated",
  },
  {
    name: "Omega Indexer",
    purpose: "Pushes new citation URLs into the index queue",
    envVar: "OMEGA_INDEXER_API_KEY",
    configured: true,
  },
  {
    name: "IndexCheckr",
    purpose: "Verifies citation indexation per row",
    envVar: "INDEXCHECKR_API_KEY",
    configured: true,
  },
  {
    name: "Mapbox",
    purpose: "Geo-grid & fleet maps",
    envVar: "NEXT_PUBLIC_MAPBOX_TOKEN",
    configured: true,
  },
];

export function useSettings() {
  const data = useMemo(() => ({ providers: PROVIDERS }), []);
  return { data, isLoading: false, error: null as Error | null };
}
