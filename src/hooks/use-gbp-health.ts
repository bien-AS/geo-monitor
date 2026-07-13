"use client";

import { useMemo } from "react";
import { buildScorecard, scorecardScore } from "@/lib/scorecard";
import { buildChangeList } from "@/components/screens/gbp-health/changes";
import { composeProposals } from "@/components/screens/gbp-health/proposals";
import { shortName } from "@/components/screens/gbp-health/short-name";
import type {
  BaptistLocation,
  ScorecardItem,
  GBPAuditFixture,
  CitationsFixture,
  NAPFile,
  AuditLogFile,
  LocationsFile,
} from "@/lib/data/types";
import type { ProfileChange } from "@/components/screens/gbp-health/changes";
import type { ItemProposal } from "@/components/screens/gbp-health/proposals";
import {
  DASHBOARD_LOCATIONS,
  DASHBOARD_GBP_AUDITS,
  DASHBOARD_CITATIONS,
  DASHBOARD_NAP,
  DASHBOARD_AUDIT_LOG,
  DASHBOARD_KEYWORD_TEMPLATES,
} from "@/lib/data/fixtures";

export interface GBPHealthData {
  location: BaptistLocation;
  locations: BaptistLocation[];
  locationsFile: LocationsFile;
  audit: GBPAuditFixture | null;
  citations: CitationsFixture | null;
  nap: NAPFile | null;
  auditLog: AuditLogFile | null;
  items: ScorecardItem[];
  composite: number | null;
  proposals: Record<string, ItemProposal>;
  changes: ProfileChange[];
  phoneSiblings: string[];
  genCtx: {
    locationName: string;
    shortName: string;
    city: string;
    state: string;
    facilityLabel: string;
    serviceSeeds: string[];
  };
  processing: boolean;
  fixtureEntries: AuditLogFile["entries"];
}

function facilityLabel(ftype: string): string {
  return ftype
    .replace(/^specialty_/, "")
    .replace(/_/g, " ")
    .replace(/\bent\b/i, "ENT")
    .replace(/\bmfm\b/i, "maternal-fetal medicine")
    .replace(/\bpmr\b/i, "physical medicine & rehabilitation");
}

function compute(slug: string): GBPHealthData | null {
  const location = (DASHBOARD_LOCATIONS as BaptistLocation[]).find((l) => l.slug === slug);
  if (!location) return null;
  const locations = DASHBOARD_LOCATIONS as BaptistLocation[];

  const locationsFile: LocationsFile = {
    generated_at: "2026-07-10",
    source_note: "Fixture data for as-baptist-local",
    keyword_templates: DASHBOARD_KEYWORD_TEMPLATES,
    locations,
  };

  const audit: GBPAuditFixture | null = DASHBOARD_GBP_AUDITS[slug] ?? null;
  const citations: CitationsFixture | null = DASHBOARD_CITATIONS[slug] ?? null;
  const nap: NAPFile = {
    generated_at: "2026-07-10",
    source_note: "Canonical NAP + observed drifts",
    canonical: {},
    drifts: DASHBOARD_NAP.drifts,
  };
  const auditLog: AuditLogFile = {
    generated_at: "2026-07-10",
    entries: DASHBOARD_AUDIT_LOG,
  };

  const fleetPhones = new Map<string, number>();
  for (const l of locations) {
    if (l.phone) fleetPhones.set(l.phone, (fleetPhones.get(l.phone) ?? 0) + 1);
  }
  const phoneSiblings = location.phone
    ? locations
        .filter((l) => l.slug !== slug && l.phone === location.phone)
        .map((l) => shortName(l.name))
    : [];

  const items = buildScorecard({ location, audit, citations, nap, fleetPhones });
  const composite = scorecardScore(items);
  const proposals = composeProposals({
    location,
    items,
    nap,
    citations,
    keywordTemplates: locationsFile.keyword_templates,
    phoneSiblings,
  });
  const changes = buildChangeList({ slug, nap, auditLog });

  const fl = facilityLabel(location.facility_type ?? "primary_care");
  const genCtx = {
    locationName: location.name,
    shortName: shortName(location.name),
    city: location.city,
    state: location.state,
    facilityLabel: fl === "primary care" ? "primary care" : fl,
    serviceSeeds: (
      locationsFile.keyword_templates?.[location.facility_type ?? "primary_care"] ?? []
    )
      .map((kw) => kw.replace("{city}", location.city).replace("{metro}", `${location.city} metro`))
      .filter((kw) => !kw.includes("near me")),
  };

  const processing = audit?.audit_status === "processing";

  return {
    location,
    locations,
    locationsFile,
    audit,
    citations,
    nap,
    auditLog,
    items,
    composite,
    proposals,
    changes,
    phoneSiblings,
    genCtx,
    processing,
    fixtureEntries: auditLog.entries.filter((e) => e.location_slug === slug),
  };
}

export function useGBPHealth(slug: string) {
  const data = useMemo(() => compute(slug), [slug]);

  return {
    data,
    isLoading: false,
    error: null as Error | null,
  };
}
