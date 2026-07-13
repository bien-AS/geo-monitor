import { STUB_LOCATIONS, STUB_NOTIFICATIONS } from "@/lib/data/fixtures";
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

import {
  DASHBOARD_LOCATIONS,
  DASHBOARD_LVI,
  DASHBOARD_NAP,
  DASHBOARD_REVIEWS,
  DASHBOARD_CITATIONS,
  DASHBOARD_LOCAL_AI,
  DASHBOARD_GBP_AUDITS,
  DASHBOARD_GEO_GRIDS,
  DASHBOARD_GRID_PREVIEWS,
  DASHBOARD_AUDIT_LOG,
  DASHBOARD_ADDABLE,
  DASHBOARD_COMPETITORS,
  DASHBOARD_KEYWORDS,
  DASHBOARD_KEYWORD_TEMPLATES,
} from "@/lib/data/fixtures";
import type { LocationsFile, AuditLogFile, NAPFile } from "@/lib/data/types";

export interface Adapter {
  getLocations: () => Promise<BaptistLocation[]>;
  getLocation: (slug: string) => Promise<BaptistLocation | null>;
  getLocationsFile: () => Promise<LocationsFile>;
  getNotifications: () => Promise<{ notifications: BellItem[] }>;
  getLVI: () => Promise<LVIData>;
  getNAP: () => Promise<NAPFile>;
  getAuditLog: () => Promise<AuditLogFile>;
  getAddableLocations: () => Promise<{ candidates: AddableCandidate[] }>;
  getReviews: (slug: string) => Promise<ReviewsFixture | null>;
  getCitations: (slug: string) => Promise<CitationsFixture | null>;
  getLocalAI: (slug: string) => Promise<LocalAIFixture | null>;
  getGBPAudit: (slug: string) => Promise<GBPAuditFixture | null>;
  getGeoGrids: (slug: string) => Promise<GeoGridFixture[]>;
  getGridPreview: (slug: string) => Promise<GridPreviewFixture | null>;
  getCompetitors: (slug: string) => Promise<CompetitorsFixture | null>;
  getKeywords: (slug: string) => Promise<KeywordsFixture | null>;
}

export function getAdapter(): Adapter {
  return {
    async getLocations() {
      return DASHBOARD_LOCATIONS;
    },
    async getLocation(slug) {
      return DASHBOARD_LOCATIONS.find((l) => l.slug === slug) ?? null;
    },
    async getLocationsFile() {
      return {
        generated_at: "2026-07-10",
        source_note: "Fixture data for as-baptist-local",
        keyword_templates: DASHBOARD_KEYWORD_TEMPLATES,
        locations: DASHBOARD_LOCATIONS,
      };
    },
    async getNotifications() {
      return { notifications: STUB_NOTIFICATIONS };
    },
    async getLVI() {
      return DASHBOARD_LVI;
    },
    async getNAP() {
      return {
        generated_at: "2026-07-10",
        source_note: "Canonical NAP + observed drifts from DataForSEO",
        canonical: {},
        drifts: DASHBOARD_NAP.drifts,
      };
    },
    async getAuditLog() {
      return { generated_at: "2026-07-10", entries: DASHBOARD_AUDIT_LOG };
    },
    async getAddableLocations() {
      return { candidates: DASHBOARD_ADDABLE };
    },
    async getReviews(slug) {
      return DASHBOARD_REVIEWS[slug] ?? null;
    },
    async getCitations(slug) {
      return DASHBOARD_CITATIONS[slug] ?? null;
    },
    async getLocalAI(slug) {
      return DASHBOARD_LOCAL_AI[slug] ?? null;
    },
    async getGBPAudit(slug) {
      return DASHBOARD_GBP_AUDITS[slug] ?? null;
    },
    async getGeoGrids(slug) {
      return DASHBOARD_GEO_GRIDS[slug] ?? [];
    },
    async getGridPreview(slug) {
      return DASHBOARD_GRID_PREVIEWS[slug] ?? null;
    },
    async getCompetitors(slug) {
      return DASHBOARD_COMPETITORS[slug] ?? null;
    },
    async getKeywords(slug) {
      return DASHBOARD_KEYWORDS[slug] ?? null;
    },
  };
}
