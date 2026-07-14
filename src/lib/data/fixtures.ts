import type { LocationNavItem } from "@/components/shell/location-selector";
import type { BellItem } from "@/components/shell/notification-bell";
import type {
  BaptistLocation,
  LVIData,
  NAPData,
  ReviewsFixture,
  Review,
  CitationsFixture,
  LocalAIFixture,
  GBPAuditFixture,
  GridPreviewFixture,
  GridSnapshot,
  GeoGridFixture,
  AuditLogEntry,
  AddableCandidate,
  CompetitorsFixture,
  KeywordsFixture,
  PostsFixture,
  CitationRow,
  CitationAggregator,
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
    facility_type: "primary_care",
    additional_categories: ["Medical clinic", "Family practice physician"],
    total_photos: 12,
    attributes: {
      accessibility: ["Wheelchair-accessible entrance", "Wheelchair-accessible restroom"],
      health_safety: ["Mask required", "Staff wear masks"],
      planning: ["Accepts new patients"],
      payments: ["Accepts credit cards"],
    },
    domain: "www.baptistmedicalclinic.org",
    website: "https://www.baptistmedicalclinic.org/locations/memphis",
    rating: { value: 4.2, votes_count: 1240 },
    phone: "(901) 226-5000",
    primary_category: "Medical clinic",
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
    facility_type: "primary_care",
    additional_categories: ["Family practice physician", "Walk-in clinic"],
    total_photos: 15,
    attributes: {
      accessibility: ["Wheelchair-accessible entrance", "Wheelchair-accessible restroom"],
      health_safety: ["Staff wear masks"],
      planning: ["Accepts new patients", "Appointment required"],
      payments: ["Accepts credit cards"],
      telehealth: ["Offers telehealth visits"],
    },
    domain: "www.baptistmedicalclinic.org",
    website: "https://www.baptistmedicalclinic.org/locations/collierville",
    rating: { value: 4.5, votes_count: 890 },
    phone: "(901) 861-9000",
    primary_category: "Medical clinic",
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
    facility_type: "primary_care",
    additional_categories: [],
    total_photos: 3,
    attributes: {
      accessibility: ["Wheelchair-accessible entrance"],
      planning: ["Accepts new patients"],
    },
    domain: "www.baptistmedicalclinic.org",
    website: "https://www.baptistonline.org/locations",
    rating: { value: 3.9, votes_count: 560 },
    phone: "(662) 772-4000",
    primary_category: "Medical clinic",
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
    facility_type: "primary_care",
    additional_categories: ["Medical clinic"],
    total_photos: 7,
    attributes: {
      accessibility: ["Wheelchair-accessible entrance"],
      health_safety: ["Staff wear masks"],
      planning: ["Accepts new patients"],
      payments: ["Accepts credit cards"],
    },
    domain: "www.baptistmedicalclinic.org",
    website: "https://www.baptistmedicalclinic.org/locations/oxford",
    rating: { value: 4.1, votes_count: 420 },
    phone: "(662) 636-1000",
    primary_category: "Medical clinic",
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
    facility_type: "primary_care",
    additional_categories: [],
    total_photos: 2,
    attributes: {
      accessibility: ["Wheelchair-accessible entrance"],
    },
    domain: "www.baptistmedicalclinic.org",
    website: "https://www.baptistonline.org/locations",
    rating: { value: 3.7, votes_count: 310 },
    phone: "(662) 244-1000",
    primary_category: "Medical clinic",
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
      canonical_value: "2520 5th St N, Columbus, MS 39705",
      observed: "2520 5th St N, Columbia, MS 39705",
      observed_value: "2520 5th St N, Columbia, MS 39705",
      severity: "critical",
      status: "open",
      detected_at: "2026-07-01",
      source: "dataforseo",
    },
    {
      slug: "baptist-desoto",
      directory: "yelp.com",
      field: "phone",
      canonical: "(662) 772-4000",
      canonical_value: "(662) 772-4000",
      observed: "(662) 772-4001",
      observed_value: "(662) 772-4001",
      severity: "moderate",
      status: "open",
      detected_at: "2026-06-28",
      source: "dataforseo",
    },
    {
      slug: "baptist-memphis",
      directory: "healthgrades.com",
      field: "phone",
      canonical: "(901) 226-5000",
      canonical_value: "(901) 226-5000",
      observed: "(901) 226-5001",
      observed_value: "(901) 226-5001",
      severity: "minor",
      status: "open",
      detected_at: "2026-06-15",
      source: "dataforseo",
    },
    {
      slug: "baptist-north-mississippi",
      directory: "google.com",
      field: "address",
      canonical: "1100 Belk Blvd, Oxford, MS 38655",
      canonical_value: "1100 Belk Blvd, Oxford, MS 38655",
      observed: "1100 Belk Boulevard, Oxford, MS 38655",
      observed_value: "1100 Belk Boulevard, Oxford, MS 38655",
      severity: "minor",
      status: "fixed",
      detected_at: "2026-05-20",
      source: "dataforseo",
    },
    {
      slug: "baptist-collierville",
      directory: "facebook.com",
      field: "name",
      canonical: "Baptist Memorial Hospital - Collierville",
      canonical_value: "Baptist Memorial Hospital - Collierville",
      observed: "Baptist Memorial Hospital Collierville",
      observed_value: "Baptist Memorial Hospital Collierville",
      severity: "moderate",
      status: "fix_queued",
      detected_at: "2026-06-10",
      source: "dataforseo",
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

const DASHBOARD_REVIEWS_BASE: Review[] = [
  {
    id: "r1",
    reviewer: { name: "James T." },
    rating: 5,
    text: "Outstanding care from the orthopedic team. Dr. Williams was thorough and the recovery plan was clearly explained.",
    date: "2026-07-08",
    status: "responded",
    platform: "google",
    sentiment: "positive",
    topics: ["staff", "doctor", "orthopedics"],
    reply: {
      text: "Thank you for your kind words, James. We're glad your experience with our orthopedic team was positive.",
      date: "2026-07-09",
      author: "Baptist Memorial Health Care",
    },
    source: "synthetic",
  },
  {
    id: "r2",
    reviewer: { name: "Maria S." },
    rating: 1,
    text: "Waited over 2 hours past my appointment time. No one communicated what was happening.",
    date: "2026-07-05",
    status: "handoff",
    platform: "google",
    sentiment: "critical",
    topics: ["wait times", "communication"],
    source: "synthetic",
  },
  {
    id: "r3",
    reviewer: { name: "Robert K." },
    rating: 4,
    text: "Good experience overall. The nursing staff was attentive and the facility is clean.",
    date: "2026-07-02",
    status: "responded",
    platform: "google",
    sentiment: "positive",
    topics: ["nurses", "cleanliness"],
    reply: {
      text: "Thank you, Robert. We appreciate you taking the time to share your experience and we're glad our team took good care of you.",
      date: "2026-07-03",
      author: "Baptist Memorial Health Care",
    },
    source: "synthetic",
  },
  {
    id: "r4",
    reviewer: { name: "Linda H." },
    rating: 2,
    text: "Billing department is impossible to reach. Been trying to resolve an incorrect charge for 3 weeks.",
    date: "2026-06-28",
    status: "unanswered",
    platform: "google",
    sentiment: "critical",
    topics: ["billing", "customer service"],
    source: "synthetic",
  },
];

function makeReviews(
  slug: string,
  avgRating: number,
  total: number,
  monthlyOverrides: Record<string, { count: number; avg: number }> = {},
): ReviewsFixture {
  return {
    slug,
    source: "synthetic",
    generated_at: "2026-07-10",
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
    reviews: DASHBOARD_REVIEWS_BASE,
  };
}

export const DASHBOARD_REVIEWS: Record<string, ReviewsFixture> = {
  "baptist-memphis": makeReviews("baptist-memphis", 4.2, 1240),
  "baptist-collierville": makeReviews("baptist-collierville", 4.5, 890),
  "baptist-desoto": {
    ...makeReviews("baptist-desoto", 3.9, 560),
    reviews: [
      ...DASHBOARD_REVIEWS_BASE,
      {
        id: "r5",
        reviewer: { name: "Pat D." },
        rating: 1,
        text: "Extremely disappointed. The referral process took forever and the front desk was rude.",
        date: "2026-07-07",
        status: "handoff",
        platform: "google",
        sentiment: "critical",
        topics: ["referrals", "front desk", "wait times"],
        source: "synthetic",
      },
    ],
  },
  "baptist-north-mississippi": makeReviews("baptist-north-mississippi", 4.1, 420),
  "baptist-golden-triangle": makeReviews("baptist-golden-triangle", 3.7, 310),
};

const AGGREGATORS: CitationAggregator[] = [
  {
    id: "agg-acxiom",
    name: "Acxiom",
    tagline: "Powers 400+ directory networks including Google, Apple Maps, and Bing",
    bl_publisher: "acxiom",
    status: "synced",
    last_synced: "2026-07-01",
    source: "synthetic",
  },
  {
    id: "agg-neustar",
    name: "Neustar Localeze",
    tagline: "Distributes to 100+ directories including Yelp, YP.com, and TripAdvisor",
    bl_publisher: "neustar",
    status: "synced",
    last_synced: "2026-06-28",
    source: "synthetic",
  },
  {
    id: "agg-factual",
    name: "Factual",
    tagline: "Supplies location data to Apple Maps, Facebook, and Foursquare",
    bl_publisher: "factual",
    status: "available",
    last_synced: null,
    source: "synthetic",
  },
  {
    id: "agg-infogroup",
    name: "Infogroup",
    tagline: "Feeds 300+ directories and navigation systems including Garmin and HERE",
    bl_publisher: "infogroup",
    status: "synced",
    last_synced: "2026-07-05",
    source: "synthetic",
  },
  {
    id: "agg-foursquare",
    name: "Foursquare",
    tagline: "Powers location data for Uber, Twitter, and 150,000+ apps",
    bl_publisher: "foursquare",
    status: "available",
    last_synced: null,
    source: "synthetic",
  },
  {
    id: "agg-data-axle",
    name: "Data Axle",
    tagline: "Distribution to 200+ sites including Superpages, Yellowpages, and Citysearch",
    bl_publisher: "dataaxle",
    status: "synced",
    last_synced: "2026-06-30",
    source: "synthetic",
  },
];

const HEALTHCARE_DIRECTORIES: CitationRow[] = [
  {
    directory: "Healthgrades",
    domain: "healthgrades.com",
    category: "health",
    authority: 91,
    authority_band: "very-high",
    listed: true,
    status: "present",
    field_match: { name: true, address: true, phone: true },
    last_checked: "2026-07-08",
    delta_since_last: "stable",
    source: "dataforseo",
    listing_url: "https://www.healthgrades.com/hospital-directory",
  },
  {
    directory: "Vitals",
    domain: "vitals.com",
    category: "health",
    authority: 85,
    authority_band: "very-high",
    listed: true,
    status: "present",
    field_match: { name: true, address: true, phone: true },
    last_checked: "2026-07-08",
    delta_since_last: "stable",
    source: "dataforseo",
  },
  {
    directory: "WebMD Care",
    domain: "doctor.webmd.com",
    category: "health",
    authority: 88,
    authority_band: "very-high",
    listed: true,
    status: "present",
    field_match: { name: true, address: true, phone: true },
    last_checked: "2026-07-08",
    delta_since_last: "stable",
    source: "dataforseo",
  },
  {
    directory: "RateMDs",
    domain: "ratemds.com",
    category: "health",
    authority: 72,
    authority_band: "high",
    listed: true,
    status: "present",
    field_match: { name: true, address: true, phone: true },
    last_checked: "2026-07-08",
    delta_since_last: "stable",
    source: "dataforseo",
  },
  {
    directory: "Zocdoc",
    domain: "zocdoc.com",
    category: "health",
    authority: 78,
    authority_band: "high",
    listed: true,
    status: "mismatch",
    field_match: { name: true, address: true, phone: false },
    nap_observed: {
      name: "Baptist Memorial Hospital - Memphis",
      address: "6019 Walnut Grove Rd, Memphis, TN",
      phone: "(901) 226-5001",
    },
    last_checked: "2026-07-08",
    delta_since_last: "changed",
    source: "dataforseo",
  },
  {
    directory: "NPI Registry",
    domain: "npiregistry.cms.hhs.gov",
    category: "health",
    authority: 95,
    authority_band: "very-high",
    listed: true,
    status: "present",
    field_match: { name: true, address: true, phone: true },
    last_checked: "2026-07-08",
    delta_since_last: "stable",
    source: "dataforseo",
  },
  {
    directory: "Medicare.gov",
    domain: "medicare.gov",
    category: "health",
    authority: 96,
    authority_band: "very-high",
    listed: true,
    status: "present",
    field_match: { name: true, address: true, phone: true },
    last_checked: "2026-07-08",
    delta_since_last: "stable",
    source: "dataforseo",
  },
  {
    directory: "CareDash",
    domain: "caredash.com",
    category: "health",
    authority: 62,
    authority_band: "medium",
    listed: false,
    status: "missing",
    last_checked: "2026-07-08",
    delta_since_last: "stable",
    source: "dataforseo",
  },
  {
    directory: "Sharecare",
    domain: "sharecare.com",
    category: "health",
    authority: 68,
    authority_band: "medium",
    listed: true,
    status: "present",
    field_match: { name: true, address: true, phone: true },
    last_checked: "2026-07-08",
    delta_since_last: "stable",
    source: "dataforseo",
  },
  {
    directory: "U.S. News Doctor Finder",
    domain: "health.usnews.com",
    category: "health",
    authority: 82,
    authority_band: "high",
    listed: true,
    status: "present",
    field_match: { name: true, address: true, phone: true },
    last_checked: "2026-07-08",
    delta_since_last: "stable",
    source: "dataforseo",
  },
  {
    directory: "DexCare",
    domain: "dexcare.com",
    category: "health",
    authority: 55,
    authority_band: "medium",
    listed: false,
    status: "missing",
    last_checked: "2026-07-08",
    delta_since_last: "stable",
    source: "dataforseo",
  },
  {
    directory: "NexHealth",
    domain: "nexhealth.com",
    category: "health",
    authority: 58,
    authority_band: "medium",
    listed: true,
    status: "duplicate",
    field_match: { name: false, address: true, phone: false },
    nap_observed: {
      name: "Baptist Memorial Health Care - Memphis",
      address: "6019 Walnut Grove Rd, Memphis, TN",
      phone: "(901) 226-0000",
    },
    last_checked: "2026-07-08",
    delta_since_last: "changed",
    source: "dataforseo",
  },
];

function tweakCitationForSlug(row: CitationRow, slug: string): CitationRow {
  const r = {
    ...row,
    field_match: row.field_match ? { ...row.field_match } : undefined,
    nap_observed: row.nap_observed ? { ...row.nap_observed } : undefined,
  };
  if (slug === "baptist-golden-triangle" && r.domain === "google.com") {
    return {
      ...r,
      status: "mismatch",
      field_match: { name: true, address: false, phone: true },
      nap_observed: {
        name: "Baptist Memorial Hospital - Golden Triangle",
        address: "2520 5th St N, Columbia, MS 39705",
        phone: "(662) 244-1000",
      },
    };
  }
  if (slug === "baptist-desoto" && r.status === "present") {
    const seed = slug.length + r.authority;
    if (seed % 5 === 0)
      return { ...r, status: "mismatch" as const, delta_since_last: "changed" as const };
  }
  return r;
}

const GENERAL_DIRECTORIES: CitationRow[] = [
  {
    directory: "Google Business Profile",
    domain: "google.com",
    category: "general",
    authority: 100,
    authority_band: "very-high",
    listed: true,
    status: "present",
    field_match: { name: true, address: true, phone: true },
    last_checked: "2026-07-08",
    delta_since_last: "stable",
    source: "dataforseo",
  },
  {
    directory: "Facebook",
    domain: "facebook.com",
    category: "general",
    authority: 95,
    authority_band: "very-high",
    listed: true,
    status: "present",
    field_match: { name: true, address: true, phone: true },
    last_checked: "2026-07-08",
    delta_since_last: "stable",
    source: "dataforseo",
  },
  {
    directory: "Yelp",
    domain: "yelp.com",
    category: "general",
    authority: 92,
    authority_band: "very-high",
    listed: true,
    status: "present",
    field_match: { name: true, address: true, phone: true },
    last_checked: "2026-07-08",
    delta_since_last: "stable",
    source: "dataforseo",
  },
  {
    directory: "Apple Maps",
    domain: "maps.apple.com",
    category: "general",
    authority: 94,
    authority_band: "very-high",
    listed: true,
    status: "present",
    field_match: { name: true, address: true, phone: true },
    last_checked: "2026-07-08",
    delta_since_last: "stable",
    source: "dataforseo",
  },
  {
    directory: "Bing",
    domain: "bing.com",
    category: "general",
    authority: 90,
    authority_band: "very-high",
    listed: true,
    status: "present",
    field_match: { name: true, address: true, phone: true },
    last_checked: "2026-07-08",
    delta_since_last: "stable",
    source: "dataforseo",
  },
  {
    directory: "Yellow Pages",
    domain: "yellowpages.com",
    category: "general",
    authority: 88,
    authority_band: "very-high",
    listed: true,
    status: "present",
    field_match: { name: true, address: true, phone: true },
    last_checked: "2026-07-08",
    delta_since_last: "stable",
    source: "dataforseo",
  },
  {
    directory: "BBB",
    domain: "bbb.org",
    category: "general",
    authority: 85,
    authority_band: "very-high",
    listed: true,
    status: "present",
    field_match: { name: true, address: true, phone: true },
    last_checked: "2026-07-08",
    delta_since_last: "stable",
    source: "dataforseo",
  },
  {
    directory: "Foursquare",
    domain: "foursquare.com",
    category: "general",
    authority: 82,
    authority_band: "high",
    listed: true,
    status: "present",
    field_match: { name: true, address: true, phone: true },
    last_checked: "2026-07-08",
    delta_since_last: "stable",
    source: "dataforseo",
  },
  {
    directory: "Superpages",
    domain: "superpages.com",
    category: "general",
    authority: 78,
    authority_band: "high",
    listed: true,
    status: "present",
    field_match: { name: true, address: true, phone: true },
    last_checked: "2026-07-08",
    delta_since_last: "stable",
    source: "dataforseo",
  },
  {
    directory: "YP.com",
    domain: "yellowpages.com",
    category: "general",
    authority: 80,
    authority_band: "high",
    listed: true,
    status: "present",
    field_match: { name: true, address: true, phone: true },
    last_checked: "2026-07-08",
    delta_since_last: "stable",
    source: "dataforseo",
  },
  {
    directory: "Citysearch",
    domain: "citysearch.com",
    category: "general",
    authority: 68,
    authority_band: "medium",
    listed: true,
    status: "present",
    field_match: { name: true, address: true, phone: true },
    last_checked: "2026-07-08",
    delta_since_last: "stable",
    source: "dataforseo",
  },
  {
    directory: "Merchant Circle",
    domain: "merchantcircle.com",
    category: "general",
    authority: 60,
    authority_band: "medium",
    listed: true,
    status: "missing",
    last_checked: "2026-07-08",
    delta_since_last: "stable",
    source: "dataforseo",
  },
  {
    directory: "Hotfrog",
    domain: "hotfrog.com",
    category: "general",
    authority: 52,
    authority_band: "medium",
    listed: false,
    status: "missing",
    last_checked: "2026-07-08",
    delta_since_last: "stable",
    source: "dataforseo",
  },
  {
    directory: "Manta",
    domain: "manta.com",
    category: "general",
    authority: 65,
    authority_band: "medium",
    listed: true,
    status: "present",
    field_match: { name: true, address: true, phone: true },
    last_checked: "2026-07-08",
    delta_since_last: "stable",
    source: "dataforseo",
  },
  {
    directory: "Chamber of Commerce",
    domain: "chamberofcommerce.com",
    category: "general",
    authority: 58,
    authority_band: "medium",
    listed: false,
    status: "missing",
    last_checked: "2026-07-08",
    delta_since_last: "stable",
    source: "dataforseo",
  },
  {
    directory: "eLocal",
    domain: "elocal.com",
    category: "general",
    authority: 48,
    authority_band: "low",
    listed: false,
    status: "missing",
    last_checked: "2026-07-08",
    delta_since_last: "stable",
    source: "dataforseo",
  },
  {
    directory: "Tupalo",
    domain: "tupalo.com",
    category: "general",
    authority: 42,
    authority_band: "low",
    listed: false,
    status: "missing",
    last_checked: "2026-07-08",
    delta_since_last: "stable",
    source: "dataforseo",
  },
  {
    directory: "Cylex",
    domain: "cylex.us.com",
    category: "general",
    authority: 45,
    authority_band: "low",
    listed: false,
    status: "missing",
    last_checked: "2026-07-08",
    delta_since_last: "stable",
    source: "dataforseo",
  },
  {
    directory: "MapQuest",
    domain: "mapquest.com",
    category: "general",
    authority: 72,
    authority_band: "high",
    listed: true,
    status: "present",
    field_match: { name: true, address: true, phone: true },
    last_checked: "2026-07-08",
    delta_since_last: "stable",
    source: "dataforseo",
  },
  {
    directory: "TomTom",
    domain: "tomtom.com",
    category: "general",
    authority: 75,
    authority_band: "high",
    listed: true,
    status: "present",
    field_match: { name: true, address: true, phone: true },
    last_checked: "2026-07-08",
    delta_since_last: "stable",
    source: "dataforseo",
  },
];

function makeCitationsData(slug: string): CitationsFixture {
  const healthcare = HEALTHCARE_DIRECTORIES.map((r) => tweakCitationForSlug(r, slug));
  const general = GENERAL_DIRECTORIES.map((r) => tweakCitationForSlug(r, slug));
  const rows = [...healthcare, ...general];

  const present = rows.filter((r) => r.status === "present").length;
  const mismatch = rows.filter((r) => r.status === "mismatch").length;
  const missing = rows.filter((r) => r.status === "missing").length;
  const duplicate = rows.filter((r) => r.status === "duplicate").length;

  return {
    slug,
    generated_at: "2026-07-10",
    source: "dataforseo",
    catalog_note: "DataForSEO business listings scan across 75+ directories",
    breakdown: { present, mismatch, missing, duplicate },
    aggregators: AGGREGATORS,
    rows,
  };
}

export const DASHBOARD_CITATIONS: Record<string, CitationsFixture> = {
  "baptist-memphis": makeCitationsData("baptist-memphis"),
  "baptist-collierville": makeCitationsData("baptist-collierville"),
  "baptist-desoto": makeCitationsData("baptist-desoto"),
  "baptist-north-mississippi": makeCitationsData("baptist-north-mississippi"),
  "baptist-golden-triangle": makeCitationsData("baptist-golden-triangle"),
};

function makeLocalAI(locationSlug: string, prompts: string[]): LocalAIFixture {
  const results: LocalAIFixture["results"] = [];
  const locationsWithCitations = ["baptist-memphis", "baptist-collierville"];
  const hasRealChecks = locationSlug !== "baptist-golden-triangle";
  const surfaces = [
    { id: "perplexity", cost: 0.015, category: "chatbot" as const },
    { id: "chatgpt", cost: 0.015, category: "chatbot" as const },
    { id: "gemini", cost: 0.015, category: "chatbot" as const },
    { id: "claude", cost: 0.015, category: "chatbot" as const },
    { id: "ai-overviews", cost: 0.005, category: "search" as const },
    { id: "ai-mode", cost: 0.02, category: "search" as const },
  ];

  for (const prompt of prompts) {
    for (const surface of surfaces) {
      const seed = prompt.length + surface.id.length + locationSlug.length;
      const roll = (seed * 7 + surface.id.charCodeAt(0)) % 100;
      const cited = roll > 65 ? true : roll > 30 ? "partial" : false;

      const rivals = [
        "healthgrades.com",
        "webmd.com",
        "mayoclinic.org",
        "ummc.edu",
        "healthline.com",
      ];
      const isCited =
        cited === true && locationsWithCitations.includes(locationSlug) && Math.random() > 0.3;
      const sourceCited = isCited
        ? "www.baptistmedicalclinic.org"
        : cited === false && Math.random() > 0.3
          ? rivals[roll % rivals.length]
          : null;

      const position =
        cited === true && Math.random() > 0.4
          ? Math.ceil(Math.random() * 5)
          : cited === "partial" && Math.random() > 0.5
            ? Math.ceil(3 + Math.random() * 7)
            : null;

      results.push({
        surface: surface.id,
        cited,
        prompt,
        position,
        source_cited: sourceCited,
        snippet:
          cited === true
            ? `${locationSlug.includes("memphis") ? "Baptist Memorial Hospital" : "Baptist"} appears in the response as a recommended provider for this query.`
            : cited === "partial"
              ? "The provider is mentioned briefly but without a direct link or citation."
              : undefined,
        checked_at: "2026-07-10",
        cost: surface.cost,
        source: hasRealChecks ? "dataforseo" : "synthetic",
        model:
          surface.id === "chatgpt"
            ? "gpt-4-turbo"
            : surface.id === "gemini"
              ? "gemini-pro"
              : undefined,
        note: hasRealChecks
          ? `Live check via DataForSEO SERP API — ${surface.id} ${surface.category === "chatbot" ? "chatbot" : "search"} surface`
          : undefined,
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
  "baptist-memphis": makeLocalAI("baptist-memphis", AI_PROMPTS),
  "baptist-collierville": makeLocalAI("baptist-collierville", AI_PROMPTS),
  "baptist-desoto": makeLocalAI("baptist-desoto", AI_PROMPTS),
  "baptist-north-mississippi": makeLocalAI("baptist-north-mississippi", AI_PROMPTS),
  "baptist-golden-triangle": makeLocalAI("baptist-golden-triangle", AI_PROMPTS),
};

export const DASHBOARD_GBP_AUDITS: Record<string, GBPAuditFixture> = {
  "baptist-memphis": {
    slug: "baptist-memphis",
    audit_status: "completed",
    source: "searchatlas",
    report_id: 14700,
    fetched_at: "2026-07-10",
    report: {
      report_id: 14700,
      business_name: "Baptist Memorial Hospital - Memphis",
      address: "6019 Walnut Grove Rd, Memphis, TN",
      website_uri: "https://www.baptistmedicalclinic.org/locations/memphis",
      audit_date: "2026-07-10",
      is_connected: true,
      is_verified: true,
      overall_score: 82,
      score_grade: "B",
      gbp_score: 78,
      citation_score: 72,
      category_scores: {
        profile_optimization: {
          score: 80,
          complete: 12,
          needs_attention: 3,
          incomplete: 1,
          total_items: 16,
        },
        photos_media: {
          score: 85,
          complete: 8,
          needs_attention: 2,
          incomplete: 0,
          total_items: 10,
        },
        technical_seo: {
          score: 75,
          complete: 6,
          needs_attention: 2,
          incomplete: 2,
          total_items: 10,
        },
        services_products: {
          score: 70,
          complete: 5,
          needs_attention: 3,
          incomplete: 2,
          total_items: 10,
        },
        reviews_reputation: {
          score: 88,
          complete: 9,
          needs_attention: 1,
          incomplete: 0,
          total_items: 10,
        },
        posts_updates: {
          score: 45,
          complete: 2,
          needs_attention: 3,
          incomplete: 5,
          total_items: 10,
        },
      },
      business_metrics_core: {
        posts: { value: 0, delta: null },
        qa: { value: 0, delta: null },
        reviews: { value: 1240, delta: 15 },
      },
    },
  },
  "baptist-collierville": {
    slug: "baptist-collierville",
    audit_status: "completed",
    source: "searchatlas",
    report_id: 14701,
    fetched_at: "2026-07-09",
    report: {
      report_id: 14701,
      business_name: "Baptist Memorial Hospital - Collierville",
      address: "1500 W Poplar Ave, Collierville, TN",
      website_uri: "https://www.baptistmedicalclinic.org/locations/collierville",
      audit_date: "2026-07-09",
      is_connected: true,
      is_verified: true,
      overall_score: 88,
      score_grade: "A",
      gbp_score: 85,
      citation_score: 80,
      category_scores: {
        profile_optimization: {
          score: 92,
          complete: 14,
          needs_attention: 2,
          incomplete: 0,
          total_items: 16,
        },
        photos_media: {
          score: 90,
          complete: 9,
          needs_attention: 1,
          incomplete: 0,
          total_items: 10,
        },
        technical_seo: {
          score: 82,
          complete: 7,
          needs_attention: 2,
          incomplete: 1,
          total_items: 10,
        },
        services_products: {
          score: 85,
          complete: 7,
          needs_attention: 2,
          incomplete: 1,
          total_items: 10,
        },
        reviews_reputation: {
          score: 95,
          complete: 10,
          needs_attention: 0,
          incomplete: 0,
          total_items: 10,
        },
        posts_updates: {
          score: 35,
          complete: 1,
          needs_attention: 4,
          incomplete: 5,
          total_items: 10,
        },
      },
      business_metrics_core: {
        posts: { value: 0, delta: null },
        qa: { value: 0, delta: null },
        reviews: { value: 890, delta: 22 },
      },
    },
  },
  "baptist-desoto": {
    slug: "baptist-desoto",
    audit_status: "processing",
    source: "searchatlas",
    report_id: 14702,
    fetched_at: "2026-07-10",
  },
  "baptist-north-mississippi": {
    slug: "baptist-north-mississippi",
    audit_status: "completed",
    source: "searchatlas",
    report_id: 14703,
    fetched_at: "2026-07-08",
    report: {
      report_id: 14703,
      business_name: "Baptist Memorial Hospital - North Mississippi",
      address: "1100 Belk Blvd, Oxford, MS",
      website_uri: "https://www.baptistmedicalclinic.org/locations/oxford",
      audit_date: "2026-07-08",
      is_connected: true,
      is_verified: true,
      overall_score: 74,
      score_grade: "C",
      gbp_score: 70,
      citation_score: 65,
      category_scores: {
        profile_optimization: {
          score: 72,
          complete: 10,
          needs_attention: 4,
          incomplete: 2,
          total_items: 16,
        },
        photos_media: {
          score: 68,
          complete: 5,
          needs_attention: 3,
          incomplete: 2,
          total_items: 10,
        },
        technical_seo: {
          score: 70,
          complete: 5,
          needs_attention: 3,
          incomplete: 2,
          total_items: 10,
        },
        services_products: {
          score: 55,
          complete: 3,
          needs_attention: 4,
          incomplete: 3,
          total_items: 10,
        },
        reviews_reputation: {
          score: 78,
          complete: 7,
          needs_attention: 2,
          incomplete: 1,
          total_items: 10,
        },
        posts_updates: {
          score: 40,
          complete: 1,
          needs_attention: 3,
          incomplete: 6,
          total_items: 10,
        },
      },
      business_metrics_core: {
        posts: { value: 0, delta: null },
        qa: { value: 0, delta: null },
        reviews: { value: 420, delta: 8 },
      },
    },
  },
  "baptist-golden-triangle": {
    slug: "baptist-golden-triangle",
    audit_status: "processing",
    source: "searchatlas",
    report_id: 14704,
    fetched_at: "2026-07-10",
  },
};

const MILES_PER_DEG_LAT = 69.172;

function buildLatticePins(
  centerLat: number,
  centerLng: number,
  rows = 10,
  cols = 10,
  spacingMiles = 1.0,
): Array<{ lat: number; lng: number; index: number }> {
  const milesPerDegLng = MILES_PER_DEG_LAT * Math.cos((centerLat * Math.PI) / 180);
  const pins: Array<{ lat: number; lng: number; index: number }> = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const kLat = (rows - 1) / 2 - r;
      const kLng = c - (cols - 1) / 2;
      pins.push({
        index: r * cols + c,
        lat: Math.round((centerLat + (kLat * spacingMiles) / MILES_PER_DEG_LAT) * 1e7) / 1e7,
        lng: Math.round((centerLng + (kLng * spacingMiles) / milesPerDegLng) * 1e7) / 1e7,
      });
    }
  }
  return pins;
}

function distanceMiles(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 3958.8;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function makeGeoGrids(
  centerLat: number,
  centerLng: number,
  keyword1: string,
  keyword2: string,
  keyword3: string,
  avgRanks: [number | null, number | null, number | null],
): GeoGridFixture[] {
  const pins = buildLatticePins(centerLat, centerLng);
  const centerIndex = 45;

  function makeKeywordFixture(keyword: string, avgRank: number | null): GeoGridFixture {
    const seed = hashStr(keyword);
    function pinRank(pin: { lat: number; lng: number }, cycle: number): number | null {
      if (avgRank == null) return null;
      const dist = distanceMiles(centerLat, centerLng, pin.lat, pin.lng);
      const baseBias = Math.min(dist * (avgRank / 100), 15);
      const t = ((seed + pin.lat * 10000 + pin.lng * 10000) % 1000) / 1000;
      const jitter = (t - 0.5) * (avgRank / 2) * 2;
      const improvement = cycle * (avgRank * 0.03 + 0.1);
      const rank = avgRank + baseBias + jitter - improvement;
      const r = Math.round(Math.max(1, Math.min(20, rank)));
      return r <= 20 ? r : null;
    }

    function makeSnapshot(cycle: number): GridSnapshot {
      const sp = pins.map((p) => {
        const rank = pinRank(p, cycle);
        return {
          lat: p.lat,
          lng: p.lng,
          rank,
          local_finder_rank: rank != null ? Math.min(20, rank + 1) : null,
          organic_rank: rank != null ? Math.min(20, rank + 2) : null,
        };
      });
      const ranks = sp.map((p) => p.rank);
      const found = ranks.filter((r): r is number => r != null);
      const dist: Record<string, number> = {
        "1-3": 0,
        "4-7": 0,
        "8-20": 0,
        "20+": 0,
      };
      for (const r of ranks) {
        if (r == null) dist["20+"]++;
        else if (r <= 3) dist["1-3"]++;
        else if (r <= 7) dist["4-7"]++;
        else dist["8-20"]++;
      }
      return {
        date: cycle === 0 ? "2026-06-01" : "2026-07-01",
        pins: sp,
        avg_rank: found.length
          ? Math.round((found.reduce((s, v) => s + v, 0) / found.length) * 10) / 10
          : null,
        best_position: found.length ? Math.min(...found) : null,
        radius_miles: 5,
        total_pins: sp.length,
        position_distribution: dist,
        competitors: [],
        snapshot_history: [],
      };
    }

    return {
      keyword,
      source: "dataforseo",
      grid_shape: "square-10x10",
      snapshots: [makeSnapshot(0), makeSnapshot(1)],
    };
  }

  return [
    makeKeywordFixture(keyword1, avgRanks[0]),
    makeKeywordFixture(keyword2, avgRanks[1]),
    makeKeywordFixture(keyword3, avgRanks[2]),
  ];
}

export const DASHBOARD_GEO_GRIDS: Record<string, GeoGridFixture[]> = {
  "baptist-memphis": makeGeoGrids(
    35.1375,
    -89.9792,
    "hospital near me",
    "emergency room memphis",
    "Baptist hospital Memphis",
    [2.1, 1.8, 1.3],
  ),
  "baptist-collierville": makeGeoGrids(
    35.042,
    -89.6645,
    "hospital near me",
    "Baptist Collierville",
    "emergency room near me",
    [3.2, 2.5, 4.8],
  ),
  "baptist-desoto": makeGeoGrids(
    34.9436,
    -89.9783,
    "hospital near me",
    "Baptist Southaven",
    "urgent care near me",
    [6.5, 5.1, 8.2],
  ),
  "baptist-north-mississippi": makeGeoGrids(
    34.3597,
    -89.5261,
    "hospital near me",
    "Baptist Oxford MS",
    "orthopedic surgeon near me",
    [4.8, 3.9, 7.1],
  ),
  "baptist-golden-triangle": makeGeoGrids(
    33.4957,
    -88.4273,
    "hospital near me",
    "Baptist Columbus MS",
    "primary care doctor",
    [9.2, 7.5, 11.0],
  ),
};

export const DASHBOARD_GRID_PREVIEWS: Record<string, GridPreviewFixture> = {
  "baptist-memphis": { preview: { pin_count: 100, keyword_count: 3 } },
  "baptist-collierville": { preview: { pin_count: 100, keyword_count: 3 } },
  "baptist-desoto": { preview: { pin_count: 100, keyword_count: 3 } },
  "baptist-north-mississippi": { preview: { pin_count: 100, keyword_count: 3 } },
  "baptist-golden-triangle": { preview: { pin_count: 100, keyword_count: 3 } },
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
    generated_at: "2026-07-10",
    keywords: [
      {
        keyword: "hospital near me",
        status: "scanned",
        added_at: "2026-02-15",
        volume_est: 1200,
        competition: "high",
        in_geo_grid: true,
        in_local_ai: true,
        in_competitive: true,
        source: "dataforseo",
      },
      {
        keyword: "emergency room memphis",
        status: "scanned",
        added_at: "2026-02-15",
        volume_est: 880,
        competition: "high",
        in_geo_grid: true,
        in_local_ai: true,
        in_competitive: true,
        source: "dataforseo",
      },
      {
        keyword: "Baptist hospital Memphis",
        status: "scanned",
        added_at: "2026-02-15",
        volume_est: 980,
        competition: "medium",
        in_geo_grid: true,
        in_local_ai: true,
        in_competitive: false,
        source: "dataforseo",
      },
      {
        keyword: "orthopedic surgeon memphis",
        status: "scanned",
        added_at: "2026-03-01",
        volume_est: 640,
        competition: "high",
        in_geo_grid: true,
        in_local_ai: true,
        in_competitive: true,
        source: "dataforseo",
      },
      {
        keyword: "cardiology memphis tn",
        status: "scanned",
        added_at: "2026-03-01",
        volume_est: 520,
        competition: "medium",
        in_geo_grid: true,
        in_local_ai: false,
        in_competitive: true,
        source: "dataforseo",
      },
      {
        keyword: "primary care memphis",
        status: "not_scanned",
        added_at: "2026-04-01",
        volume_est: 450,
        competition: "low",
        in_geo_grid: false,
        in_local_ai: true,
        in_competitive: true,
        source: "dataforseo",
      },
      {
        keyword: "urgent care near me",
        status: "not_scanned",
        added_at: "2026-04-15",
        volume_est: 780,
        competition: "high",
        in_geo_grid: false,
        in_local_ai: false,
        in_competitive: false,
        source: "dataforseo",
      },
    ],
  },
  "baptist-collierville": {
    slug: "baptist-collierville",
    max_keywords: 20,
    generated_at: "2026-07-10",
    keywords: [
      {
        keyword: "hospital near me",
        status: "scanned",
        added_at: "2026-02-15",
        volume_est: 1200,
        competition: "high",
        in_geo_grid: true,
        in_local_ai: true,
        in_competitive: true,
        source: "dataforseo",
      },
      {
        keyword: "Baptist Collierville",
        status: "scanned",
        added_at: "2026-02-15",
        volume_est: 560,
        competition: "low",
        in_geo_grid: true,
        in_local_ai: true,
        in_competitive: false,
        source: "dataforseo",
      },
      {
        keyword: "emergency room near me",
        status: "scanned",
        added_at: "2026-02-15",
        volume_est: 950,
        competition: "high",
        in_geo_grid: true,
        in_local_ai: true,
        in_competitive: true,
        source: "dataforseo",
      },
      {
        keyword: "collierville hospital",
        status: "scanned",
        added_at: "2026-03-01",
        volume_est: 320,
        competition: "medium",
        in_geo_grid: true,
        in_local_ai: false,
        in_competitive: false,
        source: "dataforseo",
      },
      {
        keyword: "orthopedic collierville",
        status: "not_scanned",
        added_at: "2026-03-15",
        volume_est: 180,
        competition: "low",
        in_geo_grid: false,
        in_local_ai: false,
        in_competitive: true,
        source: "dataforseo",
      },
    ],
  },
  "baptist-desoto": {
    slug: "baptist-desoto",
    max_keywords: 20,
    generated_at: "2026-07-10",
    keywords: [
      {
        keyword: "hospital near me",
        status: "scanned",
        added_at: "2026-02-15",
        volume_est: 1200,
        competition: "high",
        in_geo_grid: true,
        in_local_ai: true,
        in_competitive: true,
        source: "dataforseo",
      },
      {
        keyword: "Baptist Southaven",
        status: "scanned",
        added_at: "2026-02-15",
        volume_est: 340,
        competition: "low",
        in_geo_grid: true,
        in_local_ai: false,
        in_competitive: false,
        source: "dataforseo",
      },
      {
        keyword: "urgent care near me",
        status: "scanned",
        added_at: "2026-03-01",
        volume_est: 780,
        competition: "high",
        in_geo_grid: true,
        in_local_ai: true,
        in_competitive: true,
        source: "dataforseo",
      },
      {
        keyword: "southaven hospital",
        status: "not_scanned",
        added_at: "2026-03-15",
        volume_est: 220,
        competition: "medium",
        in_geo_grid: false,
        in_local_ai: false,
        in_competitive: false,
        source: "dataforseo",
      },
      {
        keyword: "desoto county hospital",
        status: "not_scanned",
        added_at: "2026-04-01",
        volume_est: 150,
        competition: "low",
        in_geo_grid: false,
        in_local_ai: false,
        in_competitive: false,
        source: "dataforseo",
      },
    ],
  },
  "baptist-north-mississippi": {
    slug: "baptist-north-mississippi",
    max_keywords: 20,
    generated_at: "2026-07-10",
    keywords: [
      {
        keyword: "hospital near me",
        status: "scanned",
        added_at: "2026-02-15",
        volume_est: 1200,
        competition: "high",
        in_geo_grid: true,
        in_local_ai: true,
        in_competitive: true,
        source: "dataforseo",
      },
      {
        keyword: "Baptist Oxford MS",
        status: "scanned",
        added_at: "2026-02-15",
        volume_est: 380,
        competition: "low",
        in_geo_grid: true,
        in_local_ai: false,
        in_competitive: false,
        source: "dataforseo",
      },
      {
        keyword: "orthopedic surgeon near me",
        status: "scanned",
        added_at: "2026-03-01",
        volume_est: 720,
        competition: "high",
        in_geo_grid: true,
        in_local_ai: true,
        in_competitive: true,
        source: "dataforseo",
      },
      {
        keyword: "oxford ms hospital",
        status: "not_scanned",
        added_at: "2026-03-15",
        volume_est: 260,
        competition: "medium",
        in_geo_grid: false,
        in_local_ai: false,
        in_competitive: false,
        source: "dataforseo",
      },
    ],
  },
  "baptist-golden-triangle": {
    slug: "baptist-golden-triangle",
    max_keywords: 20,
    generated_at: "2026-07-10",
    keywords: [
      {
        keyword: "hospital near me",
        status: "scanned",
        added_at: "2026-02-15",
        volume_est: 1200,
        competition: "high",
        in_geo_grid: true,
        in_local_ai: true,
        in_competitive: true,
        source: "dataforseo",
      },
      {
        keyword: "Baptist Columbus MS",
        status: "scanned",
        added_at: "2026-02-15",
        volume_est: 310,
        competition: "low",
        in_geo_grid: true,
        in_local_ai: false,
        in_competitive: false,
        source: "dataforseo",
      },
      {
        keyword: "primary care doctor",
        status: "scanned",
        added_at: "2026-03-01",
        volume_est: 560,
        competition: "medium",
        in_geo_grid: true,
        in_local_ai: true,
        in_competitive: true,
        source: "dataforseo",
      },
      {
        keyword: "columbus ms hospital",
        status: "not_scanned",
        added_at: "2026-03-15",
        volume_est: 200,
        competition: "medium",
        in_geo_grid: false,
        in_local_ai: false,
        in_competitive: false,
        source: "dataforseo",
      },
      {
        keyword: "golden triangle hospital",
        status: "not_scanned",
        added_at: "2026-04-01",
        volume_est: 140,
        competition: "low",
        in_geo_grid: false,
        in_local_ai: false,
        in_competitive: false,
        source: "dataforseo",
      },
    ],
  },
};

export const DASHBOARD_POSTS: Record<string, PostsFixture> = {
  "baptist-memphis": {
    slug: "baptist-memphis",
    generated_at: "2026-07-10",
    source: "synthetic",
    posts: [
      {
        id: "post-mem-1",
        type: "whats_new",
        title: "Now welcoming new patients for primary care",
        body: "Baptist Memorial Hospital - Memphis is currently welcoming new patients at our Walnut Grove campus. Our team can help with scheduling, insurance questions, and finding an appointment time that works for you and your family. Same-week availability is often open for routine visits.",
        cta: { label: "Learn more", url: "https://www.baptistmedicalclinic.org/locations/memphis" },
        status: "published",
        published_at: "2026-07-08T14:00:00Z",
        source: "synthetic",
      },
      {
        id: "post-mem-2",
        type: "event",
        title: "Community wellness event at Baptist Memphis",
        body: "Join us for a community wellness event in Memphis. Stop by for free blood pressure checks, wellness resources, and a chance to meet members of the Baptist Memorial Hospital care team. Saturday, August 15 from 9 AM to noon in the main lobby.",
        cta: { label: "Learn more", url: "https://www.baptistmedicalclinic.org/locations/memphis" },
        status: "scheduled",
        scheduled_for: "2026-08-10T14:00:00Z",
        source: "synthetic",
      },
      {
        id: "post-mem-3",
        type: "screening",
        title: "A reminder about preventive screenings",
        body: "Routine screenings are one of the simplest ways to stay ahead of your health. Many take only minutes, and early awareness gives you and your care team more options. Ask Baptist Memorial Hospital in Memphis which screenings are recommended for your age and history.",
        cta: {
          label: "Book appointment",
          url: "https://www.baptistmedicalclinic.org/locations/memphis",
        },
        status: "published",
        published_at: "2026-06-22T14:00:00Z",
        source: "synthetic",
      },
      {
        id: "post-mem-4",
        type: "offer",
        title: "Sports physicals season is here",
        body: "Back-to-school season means sports physicals, and Baptist Memorial Hospital - Memphis makes them easy. Appointments are quick, and our team can complete the forms your school or league requires. Call ahead to confirm walk-in hours, or schedule a time that fits your family's calendar.",
        cta: {
          label: "Book appointment",
          url: "https://www.baptistmedicalclinic.org/locations/memphis",
        },
        status: "pending_approval",
        source: "synthetic",
      },
      {
        id: "post-mem-5",
        type: "provider_announcement",
        title: "Our orthopedic team is growing",
        body: "Baptist Memorial Hospital - Memphis is preparing to welcome a new orthopedic surgeon to our Memphis office. New appointment slots will open in the coming weeks, and our front desk can add you to the interest list today.",
        cta: { label: "Learn more", url: "https://www.baptistmedicalclinic.org/locations/memphis" },
        status: "draft",
        source: "synthetic",
      },
      {
        id: "post-mem-6",
        type: "health_observance",
        title: "A health observance worth your attention",
        body: "National health observances are a helpful nudge to check in on your own wellness routine. This month, take a moment to review preventive care basics — routine checkups, screenings, and healthy habits. The care team at Baptist Memorial Hospital in Memphis can help you decide which steps make sense for you.",
        cta: { label: "Learn more", url: "https://www.baptistmedicalclinic.org/locations/memphis" },
        status: "published",
        published_at: "2026-05-15T14:00:00Z",
        source: "synthetic",
      },
      {
        id: "post-mem-7",
        type: "whats_new",
        title: "Expanded walk-in hours now available",
        body: "We've heard your feedback and are expanding our walk-in hours. Starting next month, Baptist Memorial Hospital - Memphis will offer extended evening hours Monday through Thursday. No appointment necessary for urgent but non-emergency visits.",
        cta: { label: "Learn more", url: "https://www.baptistmedicalclinic.org/locations/memphis" },
        status: "draft",
        source: "synthetic",
      },
    ],
  },
  "baptist-collierville": {
    slug: "baptist-collierville",
    generated_at: "2026-07-10",
    source: "synthetic",
    posts: [
      {
        id: "post-col-1",
        type: "whats_new",
        title: "Telehealth visits now available at Baptist Collierville",
        body: "Baptist Memorial Hospital - Collierville now offers telehealth visits for many common conditions. Connect with a provider from the comfort of your home for follow-ups, medication management, and initial consultations.",
        cta: {
          label: "Learn more",
          url: "https://www.baptistmedicalclinic.org/locations/collierville",
        },
        status: "published",
        published_at: "2026-07-09T14:00:00Z",
        source: "synthetic",
      },
      {
        id: "post-col-2",
        type: "event",
        title: "Flu shot clinic at Collierville campus",
        body: "Protect yourself and your family this flu season. Baptist Memorial Hospital - Collierville is hosting a drive-through flu shot clinic on Saturday, September 12 from 8 AM to 2 PM. No appointment necessary.",
        cta: {
          label: "Learn more",
          url: "https://www.baptistmedicalclinic.org/locations/collierville",
        },
        status: "scheduled",
        scheduled_for: "2026-09-05T14:00:00Z",
        source: "synthetic",
      },
      {
        id: "post-col-3",
        type: "screening",
        title: "Heart health screening available this month",
        body: "February is Heart Health Month. Baptist Memorial Hospital - Collierville is offering discounted heart health screenings including lipid panels and blood pressure checks. Call to schedule your appointment today.",
        cta: {
          label: "Book appointment",
          url: "https://www.baptistmedicalclinic.org/locations/collierville",
        },
        status: "published",
        published_at: "2026-06-18T14:00:00Z",
        source: "synthetic",
      },
      {
        id: "post-col-4",
        type: "offer",
        title: "New patient welcome package",
        body: "Switching to Baptist Memorial Hospital - Collierville? New patients receive a complimentary wellness consultation and access to our online patient portal. Our care coordinators will help you transfer your records seamlessly.",
        cta: {
          label: "Learn more",
          url: "https://www.baptistmedicalclinic.org/locations/collierville",
        },
        status: "published",
        published_at: "2026-07-01T14:00:00Z",
        source: "synthetic",
      },
      {
        id: "post-col-5",
        type: "provider_announcement",
        title: "New cardiologist joins Collierville team",
        body: "Baptist Memorial Hospital - Collierville is pleased to welcome a board-certified cardiologist to our medical staff. The new provider brings over 15 years of experience and will begin seeing patients in August.",
        cta: {
          label: "Learn more",
          url: "https://www.baptistmedicalclinic.org/locations/collierville",
        },
        status: "pending_approval",
        source: "synthetic",
      },
      {
        id: "post-col-6",
        type: "health_observance",
        title: "National Diabetes Awareness resources",
        body: "In recognition of Diabetes Awareness Month, Baptist Memorial Hospital - Collierville is sharing free educational resources and hosting a Q&A session with our diabetes educators. Learn about prevention, management, and the latest treatment options.",
        cta: {
          label: "Learn more",
          url: "https://www.baptistmedicalclinic.org/locations/collierville",
        },
        status: "draft",
        source: "synthetic",
      },
    ],
  },
  "baptist-desoto": {
    slug: "baptist-desoto",
    generated_at: "2026-07-10",
    source: "synthetic",
    posts: [
      {
        id: "post-des-1",
        type: "whats_new",
        title: "Baptist DeSoto expands urgent care services",
        body: "Baptist Memorial Hospital - DeSoto is expanding its urgent care department to better serve the Southaven community. New exam rooms and additional staff will help reduce wait times and improve the patient experience.",
        cta: { label: "Learn more", url: "https://www.baptistonline.org/locations" },
        status: "published",
        published_at: "2026-07-05T14:00:00Z",
        source: "synthetic",
      },
      {
        id: "post-des-2",
        type: "event",
        title: "Blood drive at Baptist DeSoto",
        body: "Give the gift of life. Baptist Memorial Hospital - DeSoto is partnering with Vitalant for a community blood drive on Friday, July 24 from 10 AM to 4 PM in the hospital conference center. All donors receive a free wellness screening.",
        cta: { label: "Learn more", url: "https://www.baptistonline.org/locations" },
        status: "scheduled",
        scheduled_for: "2026-07-18T14:00:00Z",
        source: "synthetic",
      },
      {
        id: "post-des-3",
        type: "screening",
        title: "Free blood pressure checks every Wednesday",
        body: "Baptist Memorial Hospital - DeSoto now offers free blood pressure checks every Wednesday from 9 AM to 11 AM in the main lobby. No appointment needed. Know your numbers and take control of your heart health.",
        cta: { label: "Book appointment", url: "https://www.baptistonline.org/locations" },
        status: "published",
        published_at: "2026-06-10T14:00:00Z",
        source: "synthetic",
      },
      {
        id: "post-des-4",
        type: "offer",
        title: "Mammogram appointments available next week",
        body: "Early detection saves lives. Baptist Memorial Hospital - DeSoto has mammogram openings next week. Most insurance plans cover annual screening mammograms at no cost. Call to schedule yours today.",
        cta: { label: "Book appointment", url: "https://www.baptistonline.org/locations" },
        status: "pending_approval",
        source: "synthetic",
      },
      {
        id: "post-des-5",
        type: "health_observance",
        title: "Mental Health Awareness resources available",
        body: "Your mental health matters. Baptist Memorial Hospital - DeSoto offers behavioral health services including counseling and psychiatric care. Reach out to our care team to learn about available resources and support groups in the Southaven area.",
        cta: { label: "Learn more", url: "https://www.baptistonline.org/locations" },
        status: "draft",
        source: "synthetic",
      },
      {
        id: "post-des-6",
        type: "provider_announcement",
        title: "New family medicine provider now accepting patients",
        body: "Baptist Memorial Hospital - DeSoto is excited to welcome a new family medicine provider to our Southaven team. The provider is now accepting patients of all ages and offers same-day appointments for acute needs.",
        cta: { label: "Learn more", url: "https://www.baptistonline.org/locations" },
        status: "published",
        published_at: "2026-05-28T14:00:00Z",
        source: "synthetic",
      },
      {
        id: "post-des-7",
        type: "whats_new",
        title: "Updated visitor policy effective immediately",
        body: "Baptist Memorial Hospital - DeSoto has updated its visitor policy to reflect current health guidelines. Please review the new policy before your next visit at our website or call the front desk with questions.",
        cta: { label: "Learn more", url: "https://www.baptistonline.org/locations" },
        status: "draft",
        source: "synthetic",
      },
    ],
  },
  "baptist-north-mississippi": {
    slug: "baptist-north-mississippi",
    generated_at: "2026-07-10",
    source: "synthetic",
    posts: [
      {
        id: "post-nms-1",
        type: "whats_new",
        title: "Baptist North Mississippi recognized for patient safety",
        body: "Baptist Memorial Hospital - North Mississippi has been recognized by Healthgrades for excellence in patient safety. This award reflects our team's dedication to providing the highest standard of care to the Oxford community.",
        cta: { label: "Learn more", url: "https://www.baptistmedicalclinic.org/locations/oxford" },
        status: "published",
        published_at: "2026-07-06T14:00:00Z",
        source: "synthetic",
      },
      {
        id: "post-nms-2",
        type: "event",
        title: "Diabetes education workshop in Oxford",
        body: "Join Baptist Memorial Hospital - North Mississippi for a free diabetes education workshop. Learn about nutrition, glucose monitoring, and lifestyle strategies from our certified diabetes educators. Tuesday, August 4 at 6 PM.",
        cta: { label: "Learn more", url: "https://www.baptistmedicalclinic.org/locations/oxford" },
        status: "scheduled",
        scheduled_for: "2026-07-28T14:00:00Z",
        source: "synthetic",
      },
      {
        id: "post-nms-3",
        type: "screening",
        title: "Know your numbers: cholesterol screening event",
        body: "High cholesterol has no symptoms, but it raises your risk for heart disease. Baptist Memorial Hospital - North Mississippi is offering low-cost cholesterol screenings throughout July. Fasting not required for the basic panel.",
        cta: {
          label: "Book appointment",
          url: "https://www.baptistmedicalclinic.org/locations/oxford",
        },
        status: "published",
        published_at: "2026-07-02T14:00:00Z",
        source: "synthetic",
      },
      {
        id: "post-nms-4",
        type: "offer",
        title: "Summer wellness check-up special",
        body: "Stay on top of your health this summer. Baptist Memorial Hospital - North Mississippi is offering comprehensive wellness check-ups with flexible scheduling. Most insurance plans accepted with minimal co-pays.",
        cta: {
          label: "Book appointment",
          url: "https://www.baptistmedicalclinic.org/locations/oxford",
        },
        status: "pending_approval",
        source: "synthetic",
      },
      {
        id: "post-nms-5",
        type: "health_observance",
        title: "Stroke awareness: know the signs",
        body: "May is Stroke Awareness Month. Baptist Memorial Hospital - North Mississippi reminds the Oxford community to learn the FAST signs: Face drooping, Arm weakness, Speech difficulty, Time to call 911. Early treatment saves lives.",
        cta: { label: "Learn more", url: "https://www.baptistmedicalclinic.org/locations/oxford" },
        status: "published",
        published_at: "2026-05-12T14:00:00Z",
        source: "synthetic",
      },
      {
        id: "post-nms-6",
        type: "provider_announcement",
        title: "Pediatric care expanding in Oxford",
        body: "Baptist Memorial Hospital - North Mississippi is expanding its pediatric services. A new pediatric nurse practitioner will join the team this fall, adding capacity for well-child visits, immunizations, and acute care.",
        cta: { label: "Learn more", url: "https://www.baptistmedicalclinic.org/locations/oxford" },
        status: "draft",
        source: "synthetic",
      },
    ],
  },
  "baptist-golden-triangle": {
    slug: "baptist-golden-triangle",
    generated_at: "2026-07-10",
    source: "synthetic",
    posts: [
      {
        id: "post-gt-1",
        type: "whats_new",
        title: "Baptist Golden Triangle adds weekend appointments",
        body: "To better serve the Columbus community, Baptist Memorial Hospital - Golden Triangle now offers Saturday appointments for primary care and urgent care visits. Call our scheduling line to book your weekend visit.",
        cta: { label: "Learn more", url: "https://www.baptistonline.org/locations" },
        status: "published",
        published_at: "2026-07-07T14:00:00Z",
        source: "synthetic",
      },
      {
        id: "post-gt-2",
        type: "event",
        title: "Community health fair at Golden Triangle",
        body: "Baptist Memorial Hospital - Golden Triangle invites the Columbus community to our annual health fair. Free screenings, wellness information, and meet-and-greet with providers. Saturday, September 19 from 9 AM to 1 PM.",
        cta: { label: "Learn more", url: "https://www.baptistonline.org/locations" },
        status: "scheduled",
        scheduled_for: "2026-09-12T14:00:00Z",
        source: "synthetic",
      },
      {
        id: "post-gt-3",
        type: "screening",
        title: "Colon cancer screening saves lives",
        body: "March is Colorectal Cancer Awareness Month. Baptist Memorial Hospital - Golden Triangle encourages adults 45 and older to talk with their provider about screening options. Early detection leads to better outcomes.",
        cta: { label: "Book appointment", url: "https://www.baptistonline.org/locations" },
        status: "published",
        published_at: "2026-06-20T14:00:00Z",
        source: "synthetic",
      },
      {
        id: "post-gt-4",
        type: "offer",
        title: "Referral to a specialist made easy",
        body: "Need to see a specialist? Baptist Memorial Hospital - Golden Triangle's referral coordinators will handle the paperwork and find you an appointment that fits your schedule. Call our referral desk during business hours.",
        cta: { label: "Learn more", url: "https://www.baptistonline.org/locations" },
        status: "draft",
        source: "synthetic",
      },
      {
        id: "post-gt-5",
        type: "health_observance",
        title: "Vaccination awareness: stay protected",
        body: "August is National Immunization Awareness Month. Baptist Memorial Hospital - Golden Triangle reminds patients to check that their vaccinations are up to date. Flu shots will be available beginning in September.",
        cta: { label: "Learn more", url: "https://www.baptistonline.org/locations" },
        status: "scheduled",
        scheduled_for: "2026-08-01T14:00:00Z",
        source: "synthetic",
      },
    ],
  },
};

export const STUB_NOTIFICATIONS: BellItem[] = [
  { id: "n1", audience: "all" },
  { id: "n2", audience: "operator" },
  { id: "n3", audience: "all" },
  { id: "n4", audience: "all" },
];

export const DASHBOARD_KEYWORD_TEMPLATES: Record<string, string[]> = {
  primary_care: [
    "primary care {city}",
    "family doctor {city}",
    "general practitioner {metro}",
    "walk-in clinic {city}",
    "internal medicine {city}",
    "preventive care {city}",
    "annual physical {city}",
  ],
  internal_medicine: ["internal medicine {city}", "internist {city}", "adult primary care {city}"],
  surgical: ["general surgeon {city}", "surgical center {metro}"],
};
