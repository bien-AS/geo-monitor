import type { LocationNavItem } from "@/components/shell/location-selector";
import type { BellItem } from "@/components/shell/notification-bell";
import type {
  BaptistLocation,
  LVIData,
  NAPData,
  ReviewsFixture,
  CitationsFixture,
  LocalAIFixture,
  GBPAuditFixture,
  GridPreviewFixture,
  GeoGridFixture,
  AuditLogEntry,
  AddableCandidate,
} from "@/lib/data/types";

export const STUB_LOCATIONS: LocationNavItem[] = [
  { slug: "baptist-memphis", name: "Baptist Memorial Hospital - Memphis", city: "Memphis, TN" },
  {
    slug: "baptist-collierville",
    name: "Baptist Memorial Hospital - Collierville",
    city: "Collierville, TN",
  },
  { slug: "baptist-desoto", name: "Baptist Memorial Hospital - DeSoto", city: "Southaven, MS" },
  {
    slug: "baptist-north-mississippi",
    name: "Baptist Memorial Hospital - North Mississippi",
    city: "Oxford, MS",
  },
  {
    slug: "baptist-golden-triangle",
    name: "Baptist Memorial Hospital - Golden Triangle",
    city: "Columbus, MS",
  },
];

export const DASHBOARD_LOCATIONS: BaptistLocation[] = [
  {
    slug: "baptist-memphis",
    name: "Baptist Memorial Hospital - Memphis",
    city: "Memphis",
    state: "TN",
    cid: "11001",
    place_id: null,
    lat: 35.1375,
    lng: -89.9792,
    listing_type: "facility",
    rating: { value: 4.2, votes_count: 1240 },
  },
  {
    slug: "baptist-collierville",
    name: "Baptist Memorial Hospital - Collierville",
    city: "Collierville",
    state: "TN",
    cid: "11002",
    place_id: null,
    lat: 35.042,
    lng: -89.6645,
    listing_type: "facility",
    rating: { value: 4.5, votes_count: 890 },
  },
  {
    slug: "baptist-desoto",
    name: "Baptist Memorial Hospital - DeSoto",
    city: "Southaven",
    state: "MS",
    cid: "11003",
    place_id: null,
    lat: 34.9436,
    lng: -89.9783,
    listing_type: "facility",
    rating: { value: 3.9, votes_count: 560 },
  },
  {
    slug: "baptist-north-mississippi",
    name: "Baptist Memorial Hospital - North Mississippi",
    city: "Oxford",
    state: "MS",
    cid: "11004",
    place_id: null,
    lat: 34.3597,
    lng: -89.5261,
    listing_type: "facility",
    rating: { value: 4.1, votes_count: 420 },
  },
  {
    slug: "baptist-golden-triangle",
    name: "Baptist Memorial Hospital - Golden Triangle",
    city: "Columbus",
    state: "MS",
    cid: "11005",
    place_id: null,
    lat: 33.4957,
    lng: -88.4273,
    listing_type: "facility",
    rating: { value: 3.7, votes_count: 310 },
  },
];

export const DASHBOARD_LVI: LVIData = {
  generated_at: "2026-07-10",
  portfolio: {
    value: 64,
    band: "healthy",
    delta: 3,
    spark: [58, 60, 59, 61, 63, 64],
  },
  locations: {
    "baptist-memphis": { value: 72, band: "healthy", delta: 4, spark: [64, 66, 68, 70, 71, 72] },
    "baptist-collierville": {
      value: 78,
      band: "healthy",
      delta: 2,
      spark: [72, 73, 75, 77, 78, 78],
    },
    "baptist-desoto": { value: 55, band: "at-risk", delta: -3, spark: [60, 58, 57, 56, 55, 55] },
    "baptist-north-mississippi": {
      value: 62,
      band: "healthy",
      delta: 5,
      spark: [52, 54, 55, 58, 60, 62],
    },
    "baptist-golden-triangle": {
      value: 41,
      band: "at-risk",
      delta: -2,
      spark: [45, 44, 43, 42, 41, 41],
    },
  },
};

export const DASHBOARD_NAP: NAPData = {
  drifts: [
    {
      slug: "baptist-golden-triangle",
      directory: "google.com",
      field: "address",
      canonical: "2520 5th St N, Columbus, MS 39705",
      observed: "2520 5th St N, Columbia, MS 39705",
      severity: "high",
      status: "open",
      detected_at: "2026-07-01",
    },
    {
      slug: "baptist-desoto",
      directory: "yelp.com",
      field: "phone",
      canonical: "(662) 893-1000",
      observed: "(662) 893-1001",
      severity: "moderate",
      status: "open",
      detected_at: "2026-06-28",
    },
  ],
};

export const DASHBOARD_AUDIT_LOG: AuditLogEntry[] = [
  {
    id: "al01",
    ts: "2026-07-10T14:30:00Z",
    actor: "Agency Operator",
    action: "Fleet AI audit completed — 5 locations × 4 prompts × 6 surfaces",
    verb: "create",
    resource: "fleet:5-locations",
    role: "operator",
    demo: true,
    source: "synthetic",
  },
  {
    id: "al02",
    ts: "2026-07-09T10:15:00Z",
    actor: "Agency Operator",
    action: "Geo-grid scan dispatched — 5 locations × 3 keywords",
    verb: "create",
    resource: "fleet:geo-grid",
    detail: "DataForSEO maps + organic ranks; fleet cost $3.80",
    role: "operator",
    demo: true,
    source: "synthetic",
  },
  {
    id: "al03",
    ts: "2026-07-08T16:45:00Z",
    actor: "Agency Operator",
    action: "Published GBP post — Baptist Memphis: 'Meet our new orthopedic team'",
    verb: "update",
    resource: "location:baptist-memphis",
    role: "operator",
    demo: true,
    source: "synthetic",
  },
  {
    id: "al04",
    ts: "2026-07-07T09:00:00Z",
    actor: "Agency Operator",
    action: "Resolved citation mismatches — 3 directories on Baptist DeSoto",
    verb: "update",
    resource: "location:baptist-desoto",
    role: "operator",
    demo: true,
    source: "synthetic",
  },
  {
    id: "al05",
    ts: "2026-07-06T13:20:00Z",
    actor: "Agency Operator",
    action: "Approved review reply — Baptist Collierville 5★ response",
    verb: "approve",
    resource: "location:baptist-collierville",
    role: "operator",
    demo: true,
    source: "synthetic",
  },
  {
    id: "al06",
    ts: "2026-07-06T11:00:00Z",
    actor: "Zach B.",
    action: "Added location — Baptist Golden Triangle",
    verb: "create",
    resource: "location:baptist-golden-triangle",
    role: "operator",
    demo: true,
    source: "synthetic",
  },
];

const DASHBOARD_REVIEWS_BASE = {
  reviews: [
    {
      id: "r1",
      reviewer: "James T.",
      rating: 5,
      text: "Outstanding care from the orthopedic team. Dr. Williams was thorough and the recovery plan was clearly explained.",
      date: "2026-07-08",
      status: "answered",
      response:
        "Thank you for your kind words, James. We're glad your experience with our orthopedic team was positive.",
    },
    {
      id: "r2",
      reviewer: "Maria S.",
      rating: 1,
      text: "Waited over 2 hours past my appointment time. No one communicated what was happening.",
      date: "2026-07-05",
      status: "handoff",
    },
    {
      id: "r3",
      reviewer: "Robert K.",
      rating: 4,
      text: "Good experience overall. The nursing staff was attentive and the facility is clean.",
      date: "2026-07-02",
      status: "answered",
    },
    {
      id: "r4",
      reviewer: "Linda H.",
      rating: 2,
      text: "Billing department is impossible to reach. Been trying to resolve an incorrect charge for 3 weeks.",
      date: "2026-06-28",
      status: "unanswered",
    },
  ],
};

function makeReviews(
  avgRating: number,
  total: number,
  monthlyOverrides: Record<string, { count: number; avg: number }> = {},
): ReviewsFixture {
  return {
    summary: {
      total,
      avg_rating: avgRating,
      response_rate: total > 0 ? Math.round(Math.random() * 30 + 50) : 0,
      monthly: {
        "2026-07": { count: Math.round(total * 0.15), avg: avgRating },
        "2026-06": { count: Math.round(total * 0.13), avg: avgRating - 0.1 },
        "2026-05": { count: Math.round(total * 0.12), avg: avgRating + 0.2 },
        "2026-04": { count: Math.round(total * 0.1), avg: avgRating - 0.2 },
        "2026-03": { count: Math.round(total * 0.11), avg: avgRating + 0.1 },
        "2026-02": { count: Math.round(total * 0.1), avg: avgRating },
        ...monthlyOverrides,
      },
    },
    reviews: DASHBOARD_REVIEWS_BASE.reviews,
  };
}

export const DASHBOARD_REVIEWS: Record<string, ReviewsFixture> = {
  "baptist-memphis": makeReviews(4.2, 1240),
  "baptist-collierville": makeReviews(4.5, 890),
  "baptist-desoto": {
    ...makeReviews(3.9, 560),
    reviews: [
      ...DASHBOARD_REVIEWS_BASE.reviews,
      {
        id: "r5",
        reviewer: "Pat D.",
        rating: 1,
        text: "Extremely disappointed. The referral process took forever and the front desk was rude.",
        date: "2026-07-07",
        status: "handoff",
      },
    ],
  },
  "baptist-north-mississippi": makeReviews(4.1, 420),
  "baptist-golden-triangle": makeReviews(3.7, 310),
};

function makeCitations(
  present: number,
  mismatch: number,
  missing: number,
  duplicate: number,
): CitationsFixture {
  return { breakdown: { present, mismatch, missing, duplicate } };
}

export const DASHBOARD_CITATIONS: Record<string, CitationsFixture> = {
  "baptist-memphis": makeCitations(62, 3, 8, 2),
  "baptist-collierville": makeCitations(58, 5, 10, 1),
  "baptist-desoto": makeCitations(45, 12, 18, 4),
  "baptist-north-mississippi": makeCitations(52, 8, 14, 3),
  "baptist-golden-triangle": makeCitations(40, 15, 22, 5),
};

function makeLocalAI(prompts: string[], citedSlugs: string[]): LocalAIFixture {
  const results: LocalAIFixture["results"] = [];
  for (const prompt of prompts) {
    for (const surface of [
      "chatgpt",
      "gemini",
      "claude",
      "perplexity",
      "ai-overviews",
      "ai-mode",
    ]) {
      const roll = Math.random();
      results.push({
        surface,
        cited: roll > 0.7 ? true : roll > 0.35 ? "partial" : false,
        prompt,
      });
    }
  }
  return { prompts, results };
}

const AI_PROMPTS = [
  "best orthopedic surgeon near me",
  "emergency room wait times",
  "primary care doctor accepting new patients",
  "cardiology specialist Baptist hospital",
];

export const DASHBOARD_LOCAL_AI: Record<string, LocalAIFixture> = {
  "baptist-memphis": makeLocalAI(AI_PROMPTS, ["baptist-memphis", "baptist-collierville"]),
  "baptist-collierville": makeLocalAI(AI_PROMPTS, ["baptist-collierville", "baptist-memphis"]),
  "baptist-desoto": makeLocalAI(AI_PROMPTS, ["baptist-memphis"]),
  "baptist-north-mississippi": makeLocalAI(AI_PROMPTS, ["baptist-north-mississippi"]),
  "baptist-golden-triangle": makeLocalAI(AI_PROMPTS, []),
};

export const DASHBOARD_GBP_AUDITS: Record<string, GBPAuditFixture> = {
  "baptist-memphis": { audit_status: "completed" },
  "baptist-collierville": { audit_status: "completed" },
  "baptist-desoto": { audit_status: "processing" },
  "baptist-north-mississippi": { audit_status: "completed" },
  "baptist-golden-triangle": { audit_status: "processing" },
};

function makeGeoGrids(
  keyword1: string,
  keyword2: string,
  keyword3: string,
  avgRanks: [number | null, number | null, number | null],
): GeoGridFixture[] {
  return [
    {
      keyword: keyword1,
      snapshots: [
        {
          date: "2026-06-01",
          avg_rank: avgRanks[0] != null ? (avgRanks[0] as number) + 0.3 : null,
        },
        { date: "2026-07-01", avg_rank: avgRanks[0] },
      ],
    },
    {
      keyword: keyword2,
      snapshots: [
        {
          date: "2026-06-01",
          avg_rank: avgRanks[1] != null ? (avgRanks[1] as number) + 0.5 : null,
        },
        { date: "2026-07-01", avg_rank: avgRanks[1] },
      ],
    },
    {
      keyword: keyword3,
      snapshots: [
        {
          date: "2026-06-01",
          avg_rank: avgRanks[2] != null ? (avgRanks[2] as number) + 0.2 : null,
        },
        { date: "2026-07-01", avg_rank: avgRanks[2] },
      ],
    },
  ];
}

export const DASHBOARD_GEO_GRIDS: Record<string, GeoGridFixture[]> = {
  "baptist-memphis": makeGeoGrids(
    "hospital near me",
    "emergency room memphis",
    "Baptist hospital Memphis",
    [2.1, 1.8, 1.3],
  ),
  "baptist-collierville": makeGeoGrids(
    "hospital near me",
    "Baptist Collierville",
    "emergency room near me",
    [3.2, 2.5, 4.8],
  ),
  "baptist-desoto": makeGeoGrids(
    "hospital near me",
    "Baptist Southaven",
    "urgent care near me",
    [6.5, 5.1, 8.2],
  ),
  "baptist-north-mississippi": makeGeoGrids(
    "hospital near me",
    "Baptist Oxford MS",
    "orthopedic surgeon near me",
    [4.8, 3.9, 7.1],
  ),
  "baptist-golden-triangle": makeGeoGrids(
    "hospital near me",
    "Baptist Columbus MS",
    "primary care doctor",
    [9.2, 7.5, 11.0],
  ),
};

export const DASHBOARD_GRID_PREVIEWS: Record<string, GridPreviewFixture> = {
  "baptist-memphis": { preview: { pin_count: 49, keyword_count: 3 } },
  "baptist-collierville": { preview: { pin_count: 49, keyword_count: 3 } },
  "baptist-desoto": { preview: { pin_count: 49, keyword_count: 3 } },
  "baptist-north-mississippi": { preview: { pin_count: 49, keyword_count: 3 } },
  "baptist-golden-triangle": { preview: { pin_count: 49, keyword_count: 3 } },
};

export const DASHBOARD_ADDABLE: AddableCandidate[] = [
  {
    name: "Baptist Memorial Hospital - Tipton",
    cid: "11006",
    rating: 4.3,
    votes: 280,
    near: "Covington, TN",
    source: "dataforseo",
  },
  {
    name: "Baptist Medical Group - Germantown",
    cid: "11007",
    rating: 4.0,
    votes: 150,
    near: "Germantown, TN",
    source: "dataforseo",
  },
  {
    name: "Baptist Memorial Hospital - Crittenden",
    cid: "11008",
    rating: 3.8,
    votes: 95,
    near: "West Memphis, AR",
    source: "dataforseo",
  },
];

export const STUB_NOTIFICATIONS: BellItem[] = [
  { id: "n1", audience: "all" },
  { id: "n2", audience: "operator" },
  { id: "n3", audience: "all" },
  { id: "n4", audience: "all" },
];
