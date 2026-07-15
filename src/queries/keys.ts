export const queryKeys = {
  dashboard: {
    all: ["dashboard"] as const,
  },
  geoGrid: {
    all: ["geo-grid"] as const,
    bySlug: (slug: string) => ["geo-grid", slug] as const,
  },
  keywords: {
    all: ["keywords"] as const,
    bySlug: (slug: string) => ["keywords", slug] as const,
  },
  gbpHealth: {
    all: ["gbp-health"] as const,
    bySlug: (slug: string) => ["gbp-health", slug] as const,
  },
  citations: {
    all: ["citations"] as const,
    bySlug: (slug: string) => ["citations", slug] as const,
  },
  reviews: {
    all: ["reviews"] as const,
    bySlug: (slug: string) => ["reviews", slug] as const,
  },
  posts: {
    all: ["posts"] as const,
    bySlug: (slug: string) => ["posts", slug] as const,
  },
  localAI: {
    all: ["local-ai"] as const,
    bySlug: (slug: string) => ["local-ai", slug] as const,
  },
  competitive: {
    all: ["competitive"] as const,
    bySlug: (slug: string) => ["competitive", slug] as const,
  },
  paaStudio: {
    all: ["paa-studio"] as const,
    bySlug: (slug: string) => ["paa-studio", slug] as const,
  },
  actionCenter: {
    fleet: ["action-center", "fleet"] as const,
    bySlug: (slug: string) => ["action-center", slug] as const,
  },
  runs: {
    fleet: ["runs", "fleet"] as const,
    bySlug: (slug: string) => ["runs", slug] as const,
    byId: (id: string) => ["runs", id] as const,
  },
  reports: {
    fleet: ["reports", "fleet"] as const,
    bySlug: (slug: string) => ["reports", slug] as const,
  },
  locationProfile: {
    bySlug: (slug: string) => ["location-profile", slug] as const,
  },
  notifications: {
    all: ["notifications"] as const,
  },
  settings: {
    all: ["settings"] as const,
  },
  users: {
    all: ["users"] as const,
  },
} as const;
