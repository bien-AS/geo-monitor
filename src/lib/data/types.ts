import type { LVIBand } from "@/lib/lvi";

export type DataSource = "searchatlas" | "dataforseo" | "synthetic";
export type AuditVerb = "create" | "approve" | "update" | "delete" | "read";

export type AuditLogEntry = {
  id: string;
  ts: string;
  actor: string;
  action: string;
  verb: AuditVerb;
  resource: string;
  detail?: string;
  role: string;
  demo: boolean;
  source: DataSource;
  location_slug?: string;
};

export type BaptistLocation = {
  slug: string;
  name: string;
  city: string;
  state: string;
  address?: string;
  cid: string | null;
  place_id: string | null;
  lat: number | null;
  lng: number | null;
  listing_type: "facility" | "department" | "practitioner";
  rating?: { value: number; votes_count: number } | null;
  website?: string | null;
  phone?: string | null;
  primary_category?: string;
  is_claimed?: boolean;
  work_time?: {
    timetable?: Record<
      string,
      Array<{
        open: { hour: number; minute?: number };
        close: { hour: number; minute?: number };
      }> | null
    >;
  };
  check_url?: string | null;
};

export interface LocationLVI {
  value: number;
  band: LVIBand;
  delta: number;
  components: Record<string, number>;
  spark: number[];
}

export interface LVIData {
  portfolio: {
    value: number;
    band: LVIBand;
    delta: number;
    spark: number[];
  };
  locations: Record<string, LocationLVI>;
  generated_at: string;
}

export interface NAPDrift {
  slug: string;
  directory: string;
  field: string;
  canonical: string;
  observed: string;
  severity: string;
  status: "open" | "resolved";
  detected_at: string;
}

export interface NAPData {
  drifts: NAPDrift[];
}

export interface ReviewSummary {
  total: number;
  avg_rating: number | null;
  response_rate: number;
  monthly: Record<string, { count: number; avg: number }>;
}

export interface ReviewRow {
  id: string;
  reviewer: string;
  rating: number;
  text: string;
  date: string;
  status: string;
  response?: string;
  sentiment?: string;
}

export interface ReviewsFixture {
  summary: ReviewSummary;
  reviews: ReviewRow[];
}

export interface CitationsBreakdown {
  present: number;
  mismatch: number;
  missing: number;
  duplicate: number;
}

export interface CitationsFixture {
  breakdown: CitationsBreakdown;
}

export interface LocalAIResult {
  surface: string;
  cited: boolean | "partial";
  prompt: string;
}

export interface LocalAIFixture {
  prompts: string[];
  results: LocalAIResult[];
}

export interface GBPAuditReport {
  overall_score: number | null;
  score_grade?: string;
  gbp_score?: number | null;
  citation_score?: number | null;
  is_verified?: boolean;
}

export interface GBPAuditFixture {
  audit_status: string;
  source?: DataSource;
  report?: GBPAuditReport;
  report_id?: number;
}

export interface GridPreviewFixture {
  preview: { pin_count: number; keyword_count: number };
}

export interface GridPin {
  rank?: number | null;
}

export interface GridSnapshot {
  date: string;
  avg_rank: number | null;
  pins?: GridPin[];
}

export interface GeoGridFixture {
  keyword: string;
  source?: DataSource;
  snapshots: GridSnapshot[];
}

export interface Competitor {
  name: string;
  cid?: string;
  rating?: number;
  votes?: number;
  distance_mi?: number;
  map_pack_wins?: number;
  source: DataSource;
}

export interface CompetitorsFixture {
  slug: string;
  source?: DataSource;
  competitors: Competitor[];
}

export interface TrackedKeyword {
  keyword: string;
  status: "scanned" | "not_scanned";
}

export interface KeywordsFixture {
  slug: string;
  max_keywords: number;
  keywords: TrackedKeyword[];
}

export interface AddableCandidate {
  name: string;
  cid: string;
  rating: number | null;
  votes: number | null;
  near: string;
  source: string;
}
