"use client";

import { create } from "zustand";
import type { GeneratedPackage } from "@/lib/paa-articles";
import type { ArticleStatus } from "@/lib/data/types";

interface PaaState {
  packages: Record<string, GeneratedPackage>;
  bodies: Record<string, string>;
  metaTitles: Record<string, string>;
  metaDescs: Record<string, string>;
  statuses: Record<string, ArticleStatus>;
  postPushed: Record<string, boolean>;
  addPackage: (p: GeneratedPackage) => void;
  saveBody: (id: string, body: string) => void;
  saveMeta: (id: string, title: string, desc: string) => void;
  setStatus: (id: string, status: ArticleStatus) => void;
  markPostPushed: (id: string) => void;
}

export const usePaaStudio = create<PaaState>((set) => ({
  packages: {},
  bodies: {},
  metaTitles: {},
  metaDescs: {},
  statuses: {},
  postPushed: {},
  addPackage: (p) => set((s) => ({ packages: { ...s.packages, [p.article.id]: p } })),
  saveBody: (id, body) => set((s) => ({ bodies: { ...s.bodies, [id]: body } })),
  saveMeta: (id, title, desc) =>
    set((s) => ({
      metaTitles: { ...s.metaTitles, [id]: title },
      metaDescs: { ...s.metaDescs, [id]: desc },
    })),
  setStatus: (id, status) => set((s) => ({ statuses: { ...s.statuses, [id]: status } })),
  markPostPushed: (id) => set((s) => ({ postPushed: { ...s.postPushed, [id]: true } })),
}));
