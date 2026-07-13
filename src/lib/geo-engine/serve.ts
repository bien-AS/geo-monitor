import { aggregateGrid } from "./aggregate";
import type { CompetitorHit } from "./parse";

/**
 * GeoScan -> GeoGridFixture composition. ONE code path builds the
 * screen-facing shape whether rows come from the store, file, or
 * a just-finished scan — fixtures and live mode never drift apart.
 */

export interface PinRow {
  pin_index: number;
  lat: number;
  lng: number;
  rank: number | null;
  family_rank: number | null;
  local_finder_rank: number | null;
  organic_rank: number | null;
  top20?: CompetitorHit[];
}

export interface ComposeMeta {
  slug: string;
  keyword: string;
  scanDate: string;
  fetchedAt: string;
  centerIndex: number;
  scanId: string;
  queue: string;
  aiAnchors?: Array<Record<string, unknown>>;
  history?: Array<{ date: string; avg_position: number }>;
  heatmapId?: string;
  gridId?: number;
  isFamilyCid?: (cid: string) => boolean;
}

export function composeGridFixture(meta: ComposeMeta, rows: PinRow[]) {
  const sorted = [...rows].sort((a, b) => a.pin_index - b.pin_index);
  const agg = aggregateGrid(
    sorted.map((r) => r.rank),
    {
      centerIndex: meta.centerIndex,
      familyRanks: sorted.map((r) => r.family_rank),
      top20PerPin: sorted.map((r) => r.top20 ?? []),
    },
  );
  const competitors = agg.competitors.map((c) => ({
    ...c,
    ...(meta.isFamilyCid ? { is_family: meta.isFamilyCid(c.data_cid) } : {}),
  }));
  const history = [...(meta.history ?? [])];
  if (agg.avg_rank != null && !history.some((h) => h.date === meta.scanDate)) {
    history.push({ date: meta.scanDate, avg_position: agg.avg_rank });
  }
  return {
    slug: meta.slug,
    keyword: meta.keyword,
    ...(meta.heatmapId ? { heatmap_id: meta.heatmapId } : {}),
    ...(meta.gridId ? { grid_id: meta.gridId } : {}),
    grid_shape: "square-10x10",
    source: "dataforseo" as const,
    fetched_at: meta.fetchedAt,
    pins_source: "dataforseo",
    pins_fetched_at: meta.fetchedAt,
    pins_note: "Per-pin data measured by the GeoScan engine via DataForSEO Google SERP APIs.",
    grid_note:
      "Square 10x10 lattice (100 pins, 1.0-mi cells = 100 sq mi). Composed by lib/geo-engine/serve.ts.",
    snapshots: [
      {
        date: meta.scanDate,
        pins: sorted.map((r) => ({
          lat: r.lat,
          lng: r.lng,
          rank: r.rank != null && r.rank <= 20 ? r.rank : null,
          local_finder_rank:
            r.local_finder_rank != null && r.local_finder_rank <= 20 ? r.local_finder_rank : null,
          organic_rank: r.organic_rank != null && r.organic_rank <= 20 ? r.organic_rank : null,
        })),
        keyword: meta.keyword,
        avg_rank: agg.avg_rank,
        best_position: agg.best_position,
        center_position: agg.center_position,
        radius_miles: 5,
        total_pins: sorted.length,
        position_distribution: agg.position_distribution,
        competitors,
        snapshot_history: history,
        aggregates_refreshed_at: meta.fetchedAt,
        aggregates_note:
          "Aggregates computed from measured per-pin results — avg counts found pins only (ARP); unranked pins bucket to 20+.",
        geoscan: {
          atgr: agg.atgr,
          solv: agg.solv,
          family_solv: agg.family_solv,
          scan_id: meta.scanId,
          provider: "dataforseo",
          queue: meta.queue,
        },
      },
    ],
  };
}
