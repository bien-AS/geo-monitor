import { create } from "zustand";
import { persist } from "zustand/middleware";

type SidebarState = "expanded" | "collapsed";

interface FiltersState {
  search: string;
}

interface UIState {
  sidebar: SidebarState;
  filters: FiltersState;
  commandPaletteOpen: boolean;

  toggleSidebar: () => void;
  setSidebar: (state: SidebarState) => void;
  setFilters: (partial: Partial<FiltersState>) => void;
  resetFilters: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
}

const DEFAULT_FILTERS: FiltersState = {
  search: "",
};

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebar: "expanded",
      filters: { ...DEFAULT_FILTERS },
      commandPaletteOpen: false,

      toggleSidebar: () =>
        set((s) => ({
          sidebar: s.sidebar === "expanded" ? "collapsed" : "expanded",
        })),

      setSidebar: (sidebar) => set({ sidebar }),

      setFilters: (partial) =>
        set((s) => ({ filters: { ...s.filters, ...partial } })),

      resetFilters: () => set({ filters: { ...DEFAULT_FILTERS } }),

      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
    }),
    {
      name: "baptist-local-ui",
      partialize: (state) => ({
        sidebar: state.sidebar,
      }),
    },
  ),
);
