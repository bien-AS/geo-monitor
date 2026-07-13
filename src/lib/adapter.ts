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
} from "@/lib/data/fixtures";

export interface Adapter {
  getLocations: () => Promise<BaptistLocation[]>;
  getNotifications: () => Promise<{ notifications: BellItem[] }>;
  getLVI: () => Promise<LVIData>;
  getNAP: () => Promise<NAPData>;
  getAuditLog: () => Promise<{ entries: AuditLogEntry[] }>;
  getAddableLocations: () => Promise<{ candidates: AddableCandidate[] }>;
  getReviews: (slug: string) => Promise<ReviewsFixture | null>;
  getCitations: (slug: string) => Promise<CitationsFixture | null>;
  getLocalAI: (slug: string) => Promise<LocalAIFixture | null>;
  getGBPAudit: (slug: string) => Promise<GBPAuditFixture | null>;
  getGeoGrids: (slug: string) => Promise<GeoGridFixture[]>;
  getGridPreview: (slug: string) => Promise<GridPreviewFixture | null>;
}

export function getAdapter(): Adapter {
  return {
    async getLocations() {
      return DASHBOARD_LOCATIONS;
    },
    async getNotifications() {
      return { notifications: STUB_NOTIFICATIONS };
    },
    async getLVI() {
      return DASHBOARD_LVI;
    },
    async getNAP() {
      return DASHBOARD_NAP;
    },
    async getAuditLog() {
      return { entries: DASHBOARD_AUDIT_LOG };
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
  };
}
