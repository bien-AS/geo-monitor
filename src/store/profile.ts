import { create } from "zustand";

interface ProfileState {
  overrides: Record<string, string>;
  save: (edits: Record<string, string>) => void;
}

export const useProfile = create<ProfileState>((set) => ({
  overrides: {},
  save: (edits) => set((s) => ({ overrides: { ...s.overrides, ...edits } })),
}));
