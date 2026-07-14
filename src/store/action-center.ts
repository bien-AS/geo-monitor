import { create } from "zustand";
import type { RecStatus } from "@/lib/data/types";

interface RecState {
  moves: Record<string, RecStatus>;
  move: (id: string, to: RecStatus) => void;
}

export const useRecs = create<RecState>((set) => ({
  moves: {},
  move: (id, to) => set((s) => ({ moves: { ...s.moves, [id]: to } })),
}));
