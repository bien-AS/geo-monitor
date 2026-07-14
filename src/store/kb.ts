import { create } from "zustand";
import type { KBVersion } from "@/lib/data/types";

interface KBState {
  overrides: Record<string, Record<string, string>>;
  versions: Record<string, KBVersion[]>;
  saveGroup: (slug: string, edits: Record<string, string>, groupTitle: string) => void;
}

export const useKB = create<KBState>((set) => ({
  overrides: {},
  versions: {},
  saveGroup: (slug, edits, groupTitle) =>
    set((s) => {
      const prior = s.versions[slug] ?? [];
      return {
        overrides: {
          ...s.overrides,
          [slug]: { ...(s.overrides[slug] ?? {}), ...edits },
        },
        versions: {
          ...s.versions,
          [slug]: [
            ...prior,
            {
              version: 3 + prior.length,
              label: `${groupTitle} updated`,
              actor: "Agency Operator",
              at: new Date().toISOString(),
              fieldCount: Object.keys(edits).length,
            },
          ],
        },
      };
    }),
}));
