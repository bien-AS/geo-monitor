"use client";

import { create } from "zustand";
import type { GBPPost } from "@/lib/data/types";

interface PostsSessionState {
  added: Record<string, GBPPost[]>;
  patched: Record<string, Record<string, Partial<GBPPost>>>;
  addPost: (slug: string, post: GBPPost) => void;
  patchPost: (slug: string, id: string, patch: Partial<GBPPost>) => void;
}

export const usePostsSession = create<PostsSessionState>((set) => ({
  added: {},
  patched: {},
  addPost: (slug, post) =>
    set((s) => ({
      added: { ...s.added, [slug]: [...(s.added[slug] ?? []), post] },
    })),
  patchPost: (slug, id, patch) =>
    set((s) => ({
      patched: {
        ...s.patched,
        [slug]: {
          ...(s.patched[slug] ?? {}),
          [id]: { ...(s.patched[slug]?.[id] ?? {}), ...patch },
        },
      },
    })),
}));
