"use client";

import { create } from "zustand";
import type { TrackedKeyword } from "@/lib/data/types";

export interface SessionScan {
  slug: string;
  keyword: string;
  scanned_at: string;
  gridSize: "10x10" | "5x5";
  avg_rank: number;
  best_position: number;
  total_pins: number;
  position_distribution: Record<string, number>;
}

interface KeywordsState {
  added: Record<string, TrackedKeyword[]>;
  removed: Record<string, string[]>;
  scans: Record<string, Record<string, SessionScan>>;
  addKeyword: (slug: string, kw: TrackedKeyword) => void;
  removeKeyword: (slug: string, keyword: string) => void;
  recordScan: (scan: SessionScan) => void;
}

export const useKeywords = create<KeywordsState>((set) => ({
  added: {},
  removed: {},
  scans: {},
  addKeyword: (slug, kw) =>
    set((s) => ({
      added: { ...s.added, [slug]: [...(s.added[slug] ?? []), kw] },
      removed: {
        ...s.removed,
        [slug]: (s.removed[slug] ?? []).filter((k) => k !== kw.keyword),
      },
    })),
  removeKeyword: (slug, keyword) =>
    set((s) => ({
      removed: { ...s.removed, [slug]: [...(s.removed[slug] ?? []), keyword] },
      added: {
        ...s.added,
        [slug]: (s.added[slug] ?? []).filter((k) => k.keyword !== keyword),
      },
    })),
  recordScan: (scan) =>
    set((s) => ({
      scans: {
        ...s.scans,
        [scan.slug]: { ...(s.scans[scan.slug] ?? {}), [scan.keyword]: scan },
      },
    })),
}));

export function mergeKeywords(
  base: TrackedKeyword[],
  slug: string,
  state: Pick<KeywordsState, "added" | "removed" | "scans">,
): TrackedKeyword[] {
  const removed = new Set(state.removed[slug] ?? []);
  const scans = state.scans[slug] ?? {};
  const merged = [
    ...base.filter((k) => !removed.has(k.keyword)),
    ...(state.added[slug] ?? []).filter((k) => !removed.has(k.keyword)),
  ];
  return merged.map((k) =>
    scans[k.keyword] ? { ...k, status: "scanned" as const, in_geo_grid: true } : k,
  );
}
