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

export type ListingType = "facility" | "department" | "practitioner";

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
  listing_type: ListingType;
  facility_type?: string;
  additional_categories?: string[];
  total_photos?: number;
  attributes?: Record<string, string[]>;
  domain?: string;
  zip?: string;
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
  field: "name" | "address" | "phone" | "website";
  canonical: string;
  canonical_value?: string;
  observed: string;
  observed_value?: string;
  severity: "critical" | "moderate" | "minor" | string;
  status: "open" | "resolved" | "fix_queued" | "fixed";
  detected_at: string;
  source?: DataSource;
}

export interface NAPData {
  drifts: NAPDrift[];
}

export interface NAPFile {
  generated_at: string;
  source_note: string;
  canonical: Record<
    string,
    { name: string; address: string; phone: string; website?: string; source: DataSource }
  >;
  drifts: NAPDrift[];
}

export type ReviewSentiment = "positive" | "neutral" | "negative" | "critical";
export type ReviewStatus = "unanswered" | "draft" | "responded" | "handoff";

export interface Review {
  id: string;
  platform: "google" | "healthgrades" | "vitals" | "facebook";
  rating: number;
  reviewer: { name: string; localGuide?: boolean };
  date: string;
  text: string;
  sentiment: ReviewSentiment;
  topics: string[];
  status: ReviewStatus;
  reply?: { text: string; date: string; author: string };
  draft?: { text: string; phi_flags: string[] };
  source: DataSource;
}

export interface ReviewSummary {
  total: number;
  avg_rating: number | null;
  response_rate: number;
  monthly: Record<string, { count: number; avg: number }>;
}

export interface AuditCategoryScore {
  score: number | null;
  complete: number;
  needs_attention: number;
  incomplete: number;
  total_items: number;
}

export interface GBPAuditReport {
  overall_score: number | null;
  score_grade?: string;
  gbp_score?: number | null;
  citation_score?: number | null;
  is_verified?: boolean;
  report_id?: number;
  business_name?: string;
  address?: string;
  website_uri?: string | null;
  audit_date?: string;
  is_connected?: boolean;
  category_scores?: Record<string, AuditCategoryScore>;
  key_insights?: unknown;
  business_metrics_core?: Record<string, { value: number | null; delta: number | null }>;
  keyword_rankings_summary?: Record<string, unknown>;
  competitor_benchmark?: unknown;
}

export interface GBPAuditFixture {
  slug?: string;
  audit_status: string;
  source?: DataSource;
  report?: GBPAuditReport;
  report_id?: number;
  fetched_at?: string;
}

/* ------------------------------------------------------------------ */
/* 16-point healthcare scorecard                                      */
/* ------------------------------------------------------------------ */

export interface ScorecardItem {
  id: string;
  n: number;
  label: string;
  status: "pass" | "attention" | "fail" | "unknown";
  detail: string;
  source: DataSource;
  action?: string;
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
  slug: string;
  source: DataSource;
  generated_at: string;
  summary: ReviewSummary;
  reviews: Review[];
}

export interface CitationsBreakdown {
  present: number;
  mismatch: number;
  missing: number;
  duplicate: number;
}

export type CitationStatus = "present" | "mismatch" | "missing" | "duplicate";
export type CitationPipelineStatus =
  "recommended" | "queued" | "ordered" | "submitted" | "live" | "indexing" | "index_checking";
export type IndexationStatus = "indexed" | "not_indexed" | "not_checked" | "checking";

export interface CitationAggregator {
  id: string;
  name: string;
  tagline: string;
  bl_publisher: string;
  status: "synced" | "available";
  last_synced: string | null;
  source: DataSource;
}

export interface CitationRow {
  directory: string;
  domain: string;
  category: "general" | "health";
  authority: number;
  authority_band: "very-high" | "high" | "medium" | "low";
  listed: boolean;
  status: CitationStatus;
  nap_observed?: { name: string; address: string; phone: string };
  field_match?: { name: boolean; address: boolean; phone: boolean };
  last_checked: string;
  delta_since_last: "stable" | "changed" | "fixed";
  source: DataSource;
  pipeline_status?: CitationPipelineStatus;
  indexation?: IndexationStatus;
  listing_url?: string;
}

export interface CitationsFixture {
  slug?: string;
  generated_at?: string;
  source?: DataSource;
  catalog_note?: string;
  breakdown: CitationsBreakdown;
  aggregators?: CitationAggregator[];
  rows?: CitationRow[];
}

export interface NAP {
  name: string;
  address: string;
  phone: string;
  website?: string;
}

export interface LocalAIResult {
  surface: string;
  cited: boolean | "partial";
  prompt: string;
  source?: DataSource;
  source_cited?: string | null;
  snippet?: string;
}

export interface LocalAIFixture {
  prompts: string[];
  results: LocalAIResult[];
}

export interface GridPreviewFixture {
  preview: { pin_count: number; keyword_count: number };
}

export interface GridPin {
  lat: number;
  lng: number;
  rank?: number | null;
  pinColor?: string;
  pinLabel?: string;
  local_finder_rank?: number | null;
  organic_rank?: number | null;
}

export interface CompetitorAgg {
  title: string;
  data_cid?: string;
  appearances: number;
  avg_position: number;
  top3_count: number;
  rating?: number | null;
  reviews?: number | null;
  category?: string | null;
  is_family?: boolean;
}

export interface GridSnapshot {
  date: string;
  avg_rank: number | null;
  best_position?: number | null;
  radius_miles?: number;
  total_pins?: number;
  position_distribution?: Record<string, number>;
  pins?: GridPin[];
  competitors?: CompetitorAgg[];
  snapshot_history?: { date: string; avg_position: number }[];
  geoscan?: {
    atgr?: number;
    solv?: number;
    family_solv?: number | null;
    scan_id?: string;
    provider?: string;
    queue?: string;
  };
}

export interface GeoGridFixture {
  keyword: string;
  source?: DataSource;
  grid_shape?: string;
  snapshots: GridSnapshot[];
}

export interface EntityFamily {
  primaryCid: string;
  memberCids: Set<string>;
  addressFragment: string;
  domains: string[];
}

export interface CompetitorHit {
  cid: string;
  title: string;
  rank: number;
  rating: number | null;
  reviews: number | null;
  category: string | null;
}

export interface WhoWinsFixture {
  slug: string;
  keyword: string;
  winners: Array<{ cell_index: number; winner_cid: string; winner_name: string }>;
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
  added_at?: string;
  volume_est?: number;
  competition?: "low" | "medium" | "high";
  in_geo_grid?: boolean;
  in_local_ai?: boolean;
  in_competitive?: boolean;
  source?: DataSource;
}

export interface KeywordsFixture {
  slug: string;
  max_keywords: number;
  generated_at?: string;
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

/* ------------------------------------------------------------------ */
/* Audit log file                                                     */
/* ------------------------------------------------------------------ */

export interface AuditLogFile {
  generated_at: string;
  entries: AuditLogEntry[];
}

/* ------------------------------------------------------------------ */
/* Location files (keyword templates)                                 */
/* ------------------------------------------------------------------ */

export interface LocationsFile {
  generated_at: string;
  source_note: string;
  keyword_templates: Record<string, string[]>;
  locations: BaptistLocation[];
}
