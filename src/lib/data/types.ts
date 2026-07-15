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

export type WorkspaceUserRole = "as_admin" | "as_staff" | "client_admin" | "client_user";
export type WorkspaceUserStatus = "active" | "pending";

export type WorkspaceUser = {
  id: string;
  name: string;
  email: string;
  role: WorkspaceUserRole;
  status: WorkspaceUserStatus;
  last_active?: string;
  joined_at?: string;
  invited_at?: string;
  invited_by?: string;
  invite_token?: string;
  source: DataSource;
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
  source?: DataSource;
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

export type PostType =
  "whats_new" | "event" | "offer" | "health_observance" | "provider_announcement" | "screening";

export type PostStatus = "draft" | "pending_approval" | "scheduled" | "published";

export interface GBPPost {
  id: string;
  type: PostType;
  title: string;
  body: string;
  cta?: { label: string; url: string };
  media_desc?: string;
  image_url?: string;
  image_label?: string;
  status: PostStatus;
  scheduled_for?: string;
  published_at?: string;
  source: DataSource;
}

export interface PostsFixture {
  slug: string;
  generated_at: string;
  source: DataSource;
  posts: GBPPost[];
}

export interface LocalAIResult {
  surface: string;
  cited: boolean | "partial";
  prompt: string;
  position?: number | null;
  source?: DataSource;
  source_cited?: string | null;
  snippet?: string;
  checked_at?: string;
  cost?: number;
  model?: string;
  note?: string;
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
  ai_citations?: number;
  category?: string;
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

/* ------------------------------------------------------------------ */
/* Content Studio (PAA)                                               */
/* ------------------------------------------------------------------ */

export type ArticleStatus = "brief" | "drafting" | "optimizing" | "ready";

export interface ContentTerm {
  term: string;
  weight: number;
  required: number;
}

export interface ContentArticle {
  id: string;
  title: string;
  target_keyword: string;
  location_slug: string | null;
  status: ArticleStatus;
  intent: string;
  updated_at: string;
  author: string;
  terms: ContentTerm[];
  questions: string[];
  body_md: string;
  source: DataSource;
}

export interface ContentFixture {
  source: DataSource;
  generated_at: string;
  note: string;
  articles: ContentArticle[];
}

/* ------------------------------------------------------------------ */
/* NW-method term models                                              */
/* ------------------------------------------------------------------ */

export interface TermModelBasicTerm {
  term: string;
  presence_pct: number;
  avg_uses: number;
  min: number;
  max: number;
  weight: number;
}

export interface TermModelExtendedTerm {
  term: string;
  presence_pct: number;
  target: number;
}

export interface TermModelMetaTerm {
  term: string;
  pct: number;
}

export interface TermModel {
  query: string;
  slug: string;
  location_name: string;
  language_code: string;
  fetched_at: string;
  source: string;
  serp: Array<{ position: number; url: string; title: string; domain: string }>;
  scraped_count: number;
  competitor_words: { median: number; p25: number; p75: number };
  target_score: number;
  readability_target: number;
  basic_terms: TermModelBasicTerm[];
  extended_terms: TermModelExtendedTerm[];
  title_terms: TermModelMetaTerm[];
  description_terms: TermModelMetaTerm[];
}

export interface TermModelIndexEntry {
  slug: string;
  query: string;
  article_ids: string[];
  location_slug: string | null;
}

export interface TermModelIndex {
  generated_at: string;
  source: string;
  models: TermModelIndexEntry[];
}

/* ------------------------------------------------------------------ */
/* PAA opportunity pools                                              */
/* ------------------------------------------------------------------ */

export type PaaSurfaceSource = "serp_paa" | "ai_overview" | "ai_mode";

export interface PaaPoolItem {
  question: string;
  source_surface: PaaSurfaceSource;
  seen_on_keyword: string;
  rival_domain?: string | null;
}

export interface PaaOpportunityPool {
  slug: string;
  fetched_at: string;
  source: string;
  location_name: string;
  items: PaaPoolItem[];
}

/* ------------------------------------------------------------------ */
/* Action Center                                                       */
/* ------------------------------------------------------------------ */

export type RecStatus = "backlog" | "in_approval" | "published";

export interface ActionRec {
  id: string;
  kind: "nap_drift" | "citations" | "ai_gap" | "reviews" | "gbp_content";
  title: string;
  location_slug: string;
  location_name: string;
  severity: "high" | "medium" | "low";
  impact: string;
  evidence: string[];
  methodology: string;
  generate_href: string;
  generate_label: string;
  status: RecStatus;
  published_at?: string;
  outcome?: string;
  measure_window?: "14d" | "30d" | "90d";
}

/* ------------------------------------------------------------------ */
/* Notifications                                                       */
/* ------------------------------------------------------------------ */

export type NotificationSeverity = "info" | "success" | "warning" | "error";

export type NotificationKind =
  | "rank_drop"
  | "review"
  | "nap_drift"
  | "run"
  | "ai_visibility"
  | "citations"
  | "posts"
  | "gbp_health";

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  severity: NotificationSeverity;
  title: string;
  body: string;
  ts: string;
  href: string;
  location_slug: string | null;
  /** "operator" rows are agency-only; "all" rows render for every role. */
  audience: "all" | "operator";
  source: DataSource;
}

/* ------------------------------------------------------------------ */
/* Run receipts                                                        */
/* ------------------------------------------------------------------ */

export type RunStatus = "succeeded" | "failed" | "partial" | "running";
export type RunTrigger = "manual" | "scheduled" | "system";

export interface RunStep {
  name: string;
  status: RunStatus;
  duration_s: number;
  detail: string;
}

export interface RunLogLine {
  ts: string;
  level: "info" | "warn" | "error";
  msg: string;
}

export interface RunReceipt {
  id: string;
  kind: string;
  label: string;
  trigger: RunTrigger;
  triggered_by: string;
  status: RunStatus;
  started_at: string;
  duration_s: number;
  provider: string;
  calls: number;
  errors: number;
  cost_usd: number;
  cost_note: string;
  location_scope: string;
  source: DataSource;
  steps: RunStep[];
  artifacts: Array<{ label: string; href: string }>;
  log: RunLogLine[];
}

export interface RunsFixture {
  source: DataSource;
  generated_at: string;
  note: string;
  runs: RunReceipt[];
}

/* ------------------------------------------------------------------ */
/* Reports library                                                     */
/* ------------------------------------------------------------------ */

export interface ReportArtifact {
  id: string;
  kind: string;
  title: string;
  description: string;
  scope: string;
  format: "PDF" | "CSV" | "XLSX" | "ZIP";
  created_at: string;
  created_by: string;
  size_kb: number;
  href: string;
  source: DataSource;
}

export interface ReportsFixture {
  source: DataSource;
  generated_at: string;
  note: string;
  reports: ReportArtifact[];
}

/* ------------------------------------------------------------------ */
/* Knowledge Base / Location Profile                                   */
/* ------------------------------------------------------------------ */

export interface KBField {
  id: string;
  label: string;
  value: string | null;
  source: DataSource;
  missingNote?: string;
  editable?: boolean;
}

export interface KBGroup {
  id: string;
  title: string;
  description: string;
  fields: KBField[];
}

export interface KBVersion {
  version: number;
  label: string;
  actor: string;
  at: string;
  fieldCount: number;
}

/* ------------------------------------------------------------------ */
/* Location profile sections                                           */
/* ------------------------------------------------------------------ */

export interface ProfileField {
  id: string;
  label: string;
  value: string;
  hint?: string;
  locked?: boolean;
}

export interface LocationProfileSections {
  brandVoice: ProfileField[];
  audience: ProfileField[];
  servicesGeo: ProfileField[];
  compliance: ProfileField[];
}

/* ------------------------------------------------------------------ */
/* Location file (keyword templates)                                   */
/* ------------------------------------------------------------------ */

export interface LocationsFile {
  generated_at: string;
  source_note: string;
  keyword_templates: Record<string, string[]>;
  locations: BaptistLocation[];
}
