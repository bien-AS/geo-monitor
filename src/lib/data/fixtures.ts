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
  CompetitorsFixture,
  KeywordsFixture,
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
    address: "6019 Walnut Grove Rd",
    city: "Memphis",
    state: "TN",
    cid: "11001",
    place_id: null,
    lat: 35.1375,
    lng: -89.9792,
    listing_type: "facility",
    rating: { value: 4.2, votes_count: 1240 },
    phone: "(901) 226-5000",
    primary_category: "Hospital",
    is_claimed: true,
    work_time: {
      timetable: {
        monday: [{ open: { hour: 0 }, close: { hour: 24 } }],
        tuesday: [{ open: { hour: 0 }, close: { hour: 24 } }],
        wednesday: [{ open: { hour: 0 }, close: { hour: 24 } }],
        thursday: [{ open: { hour: 0 }, close: { hour: 24 } }],
        friday: [{ open: { hour: 0 }, close: { hour: 24 } }],
        saturday: [{ open: { hour: 0 }, close: { hour: 24 } }],
        sunday: [{ open: { hour: 0 }, close: { hour: 24 } }],
      },
    },
    check_url: "https://www.google.com/maps?cid=11001",
  },
  {
    slug: "baptist-collierville",
    name: "Baptist Memorial Hospital - Collierville",
    address: "1500 W Poplar Ave",
    city: "Collierville",
    state: "TN",
    cid: "11002",
    place_id: null,
    lat: 35.042,
    lng: -89.6645,
    listing_type: "facility",
    rating: { value: 4.5, votes_count: 890 },
    phone: "(901) 861-9000",
    primary_category: "Hospital",
    is_claimed: true,
    work_time: {
      timetable: {
        monday: [{ open: { hour: 0 }, close: { hour: 24 } }],
        tuesday: [{ open: { hour: 0 }, close: { hour: 24 } }],
        wednesday: [{ open: { hour: 0 }, close: { hour: 24 } }],
        thursday: [{ open: { hour: 0 }, close: { hour: 24 } }],
        friday: [{ open: { hour: 0 }, close: { hour: 24 } }],
        saturday: [{ open: { hour: 8 }, close: { hour: 17 } }],
        sunday: [],
      },
    },
    check_url: "https://www.google.com/maps?cid=11002",
  },
  {
    slug: "baptist-desoto",
    name: "Baptist Memorial Hospital - DeSoto",
    address: "7601 Southcrest Pkwy",
    city: "Southaven",
    state: "MS",
    cid: "11003",
    place_id: null,
    lat: 34.9436,
    lng: -89.9783,
    listing_type: "facility",
    rating: { value: 3.9, votes_count: 560 },
    phone: "(662) 772-4000",
    primary_category: "Hospital",
    is_claimed: true,
    work_time: {
      timetable: {
        monday: [{ open: { hour: 0 }, close: { hour: 24 } }],
        tuesday: [{ open: { hour: 0 }, close: { hour: 24 } }],
        wednesday: [{ open: { hour: 0 }, close: { hour: 24 } }],
        thursday: [{ open: { hour: 0 }, close: { hour: 24 } }],
        friday: [{ open: { hour: 0 }, close: { hour: 24 } }],
        saturday: [{ open: { hour: 0 }, close: { hour: 24 } }],
        sunday: [{ open: { hour: 0 }, close: { hour: 24 } }],
      },
    },
    check_url: "https://www.google.com/maps?cid=11003",
  },
  {
    slug: "baptist-north-mississippi",
    name: "Baptist Memorial Hospital - North Mississippi",
    address: "1100 Belk Blvd",
    city: "Oxford",
    state: "MS",
    cid: "11004",
    place_id: null,
    lat: 34.3597,
    lng: -89.5261,
    listing_type: "facility",
    rating: { value: 4.1, votes_count: 420 },
    phone: "(662) 636-1000",
    primary_category: "Hospital",
    is_claimed: true,
    work_time: {
      timetable: {
        monday: [{ open: { hour: 0 }, close: { hour: 24 } }],
        tuesday: [{ open: { hour: 0 }, close: { hour: 24 } }],
        wednesday: [{ open: { hour: 0 }, close: { hour: 24 } }],
        thursday: [{ open: { hour: 0 }, close: { hour: 24 } }],
        friday: [{ open: { hour: 0 }, close: { hour: 24 } }],
        saturday: [{ open: { hour: 0 }, close: { hour: 24 } }],
        sunday: [{ open: { hour: 0 }, close: { hour: 24 } }],
      },
    },
    check_url: "https://www.google.com/maps?cid=11004",
  },
  {
    slug: "baptist-golden-triangle",
    name: "Baptist Memorial Hospital - Golden Triangle",
    address: "2520 5th St N",
    city: "Columbus",
    state: "MS",
    cid: "11005",
    place_id: null,
    lat: 33.4957,
    lng: -88.4273,
    listing_type: "facility",
    rating: { value: 3.7, votes_count: 310 },
    phone: "(662) 244-1000",
    primary_category: "Hospital",
    is_claimed: true,
    work_time: {
      timetable: {
        monday: [{ open: { hour: 0 }, close: { hour: 24 } }],
        tuesday: [{ open: { hour: 0 }, close: { hour: 24 } }],
        wednesday: [{ open: { hour: 0 }, close: { hour: 24 } }],
        thursday: [{ open: { hour: 0 }, close: { hour: 24 } }],
        friday: [{ open: { hour: 0 }, close: { hour: 24 } }],
        saturday: [{ open: { hour: 8 }, close: { hour: 12 } }],
        sunday: [],
      },
    },
    check_url: "https://www.google.com/maps?cid=11005",
  },
];

function makeLVI(
  value: number,
  band: "elite" | "healthy" | "at-risk" | "critical",
  delta: number,
  spark: number[],
  components: Record<string, number>,
) {
  return { value, band, delta, spark, components } as const;
}

export const DASHBOARD_LVI: LVIData = {
  generated_at: "2026-07-10",
  portfolio: {
    value: 64,
    band: "healthy",
    delta: 3,
    spark: [58, 60, 59, 61, 63, 64],
  },
  locations: {
    "baptist-memphis": makeLVI(72, "healthy", 4, [64, 66, 68, 70, 71, 72], {
      geo_grid_rank: 82,
      gbp_health: 78,
      review_health: 75,
      review_response: 65,
      nap_integrity: 88,
      citation_coverage: 72,
      local_ai_citation: 55,
      posts_cadence: 60,
      photo_freshness: 70,
    }),
    "baptist-collierville": makeLVI(78, "healthy", 2, [72, 73, 75, 77, 78, 78], {
      geo_grid_rank: 85,
      gbp_health: 82,
      review_health: 88,
      review_response: 72,
      nap_integrity: 90,
      citation_coverage: 68,
      local_ai_citation: 60,
      posts_cadence: 65,
      photo_freshness: 75,
    }),
    "baptist-desoto": makeLVI(55, "at-risk", -3, [60, 58, 57, 56, 55, 55], {
      geo_grid_rank: 48,
      gbp_health: 55,
      review_health: 58,
      review_response: 42,
      nap_integrity: 45,
      citation_coverage: 52,
      local_ai_citation: 40,
      posts_cadence: 35,
      photo_freshness: 50,
    }),
    "baptist-north-mississippi": makeLVI(62, "healthy", 5, [52, 54, 55, 58, 60, 62], {
      geo_grid_rank: 58,
      gbp_health: 65,
      review_health: 62,
      review_response: 55,
      nap_integrity: 72,
      citation_coverage: 60,
      local_ai_citation: 48,
      posts_cadence: 50,
      photo_freshness: 55,
    }),
    "baptist-golden-triangle": makeLVI(41, "at-risk", -2, [45, 44, 43, 42, 41, 41], {
      geo_grid_rank: 32,
      gbp_health: 40,
      review_health: 45,
      review_response: 38,
      nap_integrity: 25,
      citation_coverage: 35,
      local_ai_citation: 30,
      posts_cadence: 28,
      photo_freshness: 35,
    }),
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
      sentiment: "positive",
    },
    {
      id: "r2",
      reviewer: "Maria S.",
      rating: 1,
      text: "Waited over 2 hours past my appointment time. No one communicated what was happening.",
      date: "2026-07-05",
      status: "handoff",
      sentiment: "critical",
    },
    {
      id: "r3",
      reviewer: "Robert K.",
      rating: 4,
      text: "Good experience overall. The nursing staff was attentive and the facility is clean.",
      date: "2026-07-02",
      status: "answered",
      sentiment: "positive",
    },
    {
      id: "r4",
      reviewer: "Linda H.",
      rating: 2,
      text: "Billing department is impossible to reach. Been trying to resolve an incorrect charge for 3 weeks.",
      date: "2026-06-28",
      status: "unanswered",
      sentiment: "critical",
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
        sentiment: "critical",
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
  "baptist-memphis": {
    audit_status: "completed",
    source: "searchatlas",
    report_id: 14700,
    report: {
      overall_score: 82,
      score_grade: "B",
      gbp_score: 78,
      citation_score: 72,
      is_verified: true,
    },
  },
  "baptist-collierville": {
    audit_status: "completed",
    source: "searchatlas",
    report_id: 14701,
    report: {
      overall_score: 88,
      score_grade: "A",
      gbp_score: 85,
      citation_score: 80,
      is_verified: true,
    },
  },
  "baptist-desoto": {
    audit_status: "processing",
    source: "searchatlas",
    report_id: 14702,
  },
  "baptist-north-mississippi": {
    audit_status: "completed",
    source: "searchatlas",
    report_id: 14703,
    report: {
      overall_score: 74,
      score_grade: "C",
      gbp_score: 70,
      citation_score: 65,
      is_verified: true,
    },
  },
  "baptist-golden-triangle": {
    audit_status: "processing",
    source: "searchatlas",
    report_id: 14704,
  },
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
      source: "dataforseo",
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
      source: "dataforseo",
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
      source: "dataforseo",
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

export const DASHBOARD_COMPETITORS: Record<string, CompetitorsFixture> = {
  "baptist-memphis": {
    slug: "baptist-memphis",
    competitors: [
      {
        name: "Methodist University Hospital",
        cid: "c01",
        rating: 4.1,
        votes: 980,
        distance_mi: 3.2,
        map_pack_wins: 45,
        source: "dataforseo",
      },
      {
        name: "Regional One Health",
        cid: "c02",
        rating: 3.8,
        votes: 720,
        distance_mi: 4.5,
        map_pack_wins: 30,
        source: "dataforseo",
      },
      {
        name: "St. Jude Children's Research Hospital",
        cid: "c03",
        rating: 4.8,
        votes: 2100,
        distance_mi: 2.8,
        map_pack_wins: 58,
        source: "dataforseo",
      },
    ],
  },
  "baptist-collierville": {
    slug: "baptist-collierville",
    competitors: [
      {
        name: "Methodist Le Bonheur Germantown",
        cid: "c04",
        rating: 4.3,
        votes: 650,
        distance_mi: 5.1,
        map_pack_wins: 38,
        source: "dataforseo",
      },
      {
        name: "Saint Francis Hospital - Bartlett",
        cid: "c05",
        rating: 4.0,
        votes: 480,
        distance_mi: 8.2,
        source: "dataforseo",
      },
    ],
  },
  "baptist-desoto": {
    slug: "baptist-desoto",
    competitors: [
      {
        name: "Methodist Olive Branch Hospital",
        cid: "c06",
        rating: 4.2,
        votes: 320,
        distance_mi: 7.5,
        map_pack_wins: 25,
        source: "dataforseo",
      },
    ],
  },
  "baptist-north-mississippi": {
    slug: "baptist-north-mississippi",
    competitors: [
      {
        name: "North Mississippi Medical Center",
        cid: "c07",
        rating: 4.0,
        votes: 580,
        distance_mi: 1.2,
        map_pack_wins: 42,
        source: "dataforseo",
      },
      {
        name: "OCH Regional Medical Center",
        cid: "c08",
        rating: 3.6,
        votes: 210,
        distance_mi: 25.0,
        source: "dataforseo",
      },
    ],
  },
  "baptist-golden-triangle": {
    slug: "baptist-golden-triangle",
    competitors: [
      {
        name: "Baptist Memorial Hospital - Attala",
        cid: "c09",
        rating: 3.5,
        votes: 95,
        distance_mi: 12.0,
        source: "dataforseo",
      },
    ],
  },
};

export const DASHBOARD_KEYWORDS: Record<string, KeywordsFixture> = {
  "baptist-memphis": {
    slug: "baptist-memphis",
    max_keywords: 20,
    keywords: [
      { keyword: "hospital near me", status: "scanned" },
      { keyword: "emergency room memphis", status: "scanned" },
      { keyword: "Baptist hospital Memphis", status: "scanned" },
      { keyword: "orthopedic surgeon memphis", status: "scanned" },
      { keyword: "cardiology memphis tn", status: "scanned" },
      { keyword: "primary care memphis", status: "not_scanned" },
      { keyword: "urgent care near me", status: "not_scanned" },
    ],
  },
  "baptist-collierville": {
    slug: "baptist-collierville",
    max_keywords: 20,
    keywords: [
      { keyword: "hospital near me", status: "scanned" },
      { keyword: "Baptist Collierville", status: "scanned" },
      { keyword: "emergency room near me", status: "scanned" },
      { keyword: "collierville hospital", status: "scanned" },
      { keyword: "orthopedic collierville", status: "not_scanned" },
    ],
  },
  "baptist-desoto": {
    slug: "baptist-desoto",
    max_keywords: 20,
    keywords: [
      { keyword: "hospital near me", status: "scanned" },
      { keyword: "Baptist Southaven", status: "scanned" },
      { keyword: "urgent care near me", status: "scanned" },
      { keyword: "southaven hospital", status: "not_scanned" },
      { keyword: "desoto county hospital", status: "not_scanned" },
    ],
  },
  "baptist-north-mississippi": {
    slug: "baptist-north-mississippi",
    max_keywords: 20,
    keywords: [
      { keyword: "hospital near me", status: "scanned" },
      { keyword: "Baptist Oxford MS", status: "scanned" },
      { keyword: "orthopedic surgeon near me", status: "scanned" },
      { keyword: "oxford ms hospital", status: "not_scanned" },
    ],
  },
  "baptist-golden-triangle": {
    slug: "baptist-golden-triangle",
    max_keywords: 20,
    keywords: [
      { keyword: "hospital near me", status: "scanned" },
      { keyword: "Baptist Columbus MS", status: "scanned" },
      { keyword: "primary care doctor", status: "scanned" },
      { keyword: "columbus ms hospital", status: "not_scanned" },
      { keyword: "golden triangle hospital", status: "not_scanned" },
    ],
  },
};

export const STUB_NOTIFICATIONS: BellItem[] = [
  { id: "n1", audience: "all" },
  { id: "n2", audience: "operator" },
  { id: "n3", audience: "all" },
  { id: "n4", audience: "all" },
];
