"use client";

import { create } from "zustand";
import type { CitationPipelineStatus, IndexationStatus } from "@/lib/data/types";

interface CitationsState {
  overrides: Record<string, Record<string, CitationPipelineStatus>>;
  indexation: Record<string, Record<string, IndexationStatus>>;
  lastOrder: Record<
    string,
    { package: string; count: number; express: boolean; at: string } | undefined
  >;
  recordOrder: (slug: string, domains: string[], pkg: string, express: boolean) => void;
  submitForIndexing: (slug: string, domains: string[]) => void;
  recordIndexCheck: (
    slug: string,
    outcomes: Array<{ domain: string; result: IndexationStatus }>,
  ) => void;
}

export const useCitations = create<CitationsState>((set) => ({
  overrides: {},
  indexation: {},
  lastOrder: {},
  recordOrder: (slug, domains, pkg, express) =>
    set((s) => ({
      overrides: {
        ...s.overrides,
        [slug]: {
          ...(s.overrides[slug] ?? {}),
          ...Object.fromEntries(domains.map((d) => [d, "ordered" as const])),
        },
      },
      lastOrder: {
        ...s.lastOrder,
        [slug]: {
          package: pkg,
          count: domains.length,
          express,
          at: new Date().toISOString(),
        },
      },
    })),
  submitForIndexing: (slug, domains) =>
    set((s) => ({
      overrides: {
        ...s.overrides,
        [slug]: {
          ...(s.overrides[slug] ?? {}),
          ...Object.fromEntries(domains.map((d) => [d, "indexing" as const])),
        },
      },
    })),
  recordIndexCheck: (slug, outcomes) =>
    set((s) => ({
      indexation: {
        ...s.indexation,
        [slug]: {
          ...(s.indexation[slug] ?? {}),
          ...Object.fromEntries(outcomes.map((o) => [o.domain, o.result])),
        },
      },
      overrides: {
        ...s.overrides,
        [slug]: {
          ...(s.overrides[slug] ?? {}),
          ...Object.fromEntries(
            outcomes
              .filter((o) => o.result === "checking")
              .map((o) => [o.domain, "index_checking" as const]),
          ),
        },
      },
    })),
}));

export function checkOutcome(domain: string): IndexationStatus {
  let h = 2166136261;
  for (let i = 0; i < domain.length; i++) {
    h ^= domain.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % 10 < 7 ? "indexed" : "checking";
}
