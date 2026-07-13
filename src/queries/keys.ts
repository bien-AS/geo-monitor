export const queryKeys = {
  dashboard: {
    all: ["dashboard"] as const,
  },
  geoGrid: {
    all: ["geo-grid"] as const,
    bySlug: (slug: string) => ["geo-grid", slug] as const,
  },
} as const;
