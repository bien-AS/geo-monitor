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
};

export type BaptistLocation = {
  slug: string;
  name: string;
  city: string;
  state: string;
  cid: string | null;
  place_id: string | null;
  lat: number | null;
  lng: number | null;
  listing_type: "facility" | "department" | "practitioner";
  rating?: { value: number; votes_count: number } | null;
  website?: string | null;
};

export interface LVIData {
  portfolio: {
    value: number;
    band: LVIBand;
    delta: number;
    spark: number[];
  };
  locations: Record<string, { value: number; band: LVIBand; delta: number; spark: number[] }>;
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

export interface GBPAuditFixture {
  audit_status: string;
}

export interface GridPreviewFixture {
  preview: { pin_count: number; keyword_count: number };
}

export interface GeoGridFixture {
  keyword: string;
  snapshots: Array<{ date: string; avg_rank: number | null }>;
}

export interface AddableCandidate {
  name: string;
  cid: string;
  rating: number | null;
  votes: number | null;
  near: string;
  source: string;
}
