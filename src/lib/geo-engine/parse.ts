/**
 * SERP item parsing + entity-family matching. Defensive by design:
 * absent features are normal outcomes, never errors.
 */

import type { EntityFamily } from "@/lib/data/types";

export interface MapsPinResult {
  primaryRank: number | null;
  familyRank: number | null;
  matchedCid: string | null;
  familySlotsTop3: number;
  top20: CompetitorHit[];
}

export interface CompetitorHit {
  cid: string;
  title: string;
  rank: number;
  rating: number | null;
  reviews: number | null;
  category: string | null;
}

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}
function num(v: unknown): number | null {
  return typeof v === "number" ? v : null;
}

const STREET_ABBREV: Record<string, string> = {
  north: "n",
  south: "s",
  east: "e",
  west: "w",
  street: "st",
  drive: "dr",
  road: "rd",
  avenue: "ave",
  boulevard: "blvd",
  parkway: "pkwy",
  highway: "hwy",
  lane: "ln",
  court: "ct",
  circle: "cir",
  place: "pl",
  suite: "",
  ste: "",
  level: "",
  floor: "",
};

export function streetKey(address: string): string {
  const first = address.split(",")[0] ?? "";
  const tokens = first
    .toLowerCase()
    .replace(/[#.]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((t) => (t in STREET_ABBREV ? STREET_ABBREV[t] : t))
    .filter(Boolean);
  return tokens.slice(0, 3).join(" ");
}

function isFamily(item: Record<string, unknown>, fam: EntityFamily): boolean {
  const cid = str(item.cid);
  if (cid && (cid === fam.primaryCid || fam.memberCids.has(cid))) return true;
  const address = str(item.address);
  if (fam.addressFragment && address && streetKey(address) === streetKey(fam.addressFragment))
    return true;
  const domain = str(item.domain);
  return fam.domains.some((d) => domain.endsWith(d));
}

export function parseMapsItems(
  items: Array<Record<string, unknown>>,
  fam: EntityFamily,
): MapsPinResult {
  const out: MapsPinResult = {
    primaryRank: null,
    familyRank: null,
    matchedCid: null,
    familySlotsTop3: 0,
    top20: [],
  };
  for (const item of items) {
    if (item.type !== "maps_search") continue;
    const rank = num(item.rank_group);
    if (rank == null) continue;
    const cid = str(item.cid);
    if (rank <= 20) {
      const rating = item.rating as { value?: number; votes_count?: number } | undefined;
      out.top20.push({
        cid,
        title: str(item.title),
        rank,
        rating: rating?.value ?? null,
        reviews: rating?.votes_count ?? null,
        category: str(item.category) || null,
      });
    }
    if (cid === fam.primaryCid && out.primaryRank == null) out.primaryRank = rank;
    if (isFamily(item, fam)) {
      if (out.familyRank == null || rank < out.familyRank) {
        out.familyRank = rank;
        out.matchedCid = cid || out.matchedCid;
      }
      if (rank <= 3) out.familySlotsTop3++;
    }
  }
  return out;
}

export interface OrganicPinResult {
  organicRank: number | null;
  matchedUrl: string | null;
  localPackRank: number | null;
  aiOverviewPresent: boolean;
  aiOverviewCitesFamily: boolean;
  aiReferenceDomains: string[];
}

export function parseOrganicItems(
  items: Array<Record<string, unknown>>,
  fam: EntityFamily,
): OrganicPinResult {
  const out: OrganicPinResult = {
    organicRank: null,
    matchedUrl: null,
    localPackRank: null,
    aiOverviewPresent: false,
    aiOverviewCitesFamily: false,
    aiReferenceDomains: [],
  };
  for (const item of items) {
    if (item.type === "organic") {
      const domain = str(item.domain);
      if (out.organicRank == null && fam.domains.some((d) => domain.endsWith(d))) {
        out.organicRank = num(item.rank_group);
        out.matchedUrl = str(item.url) || null;
      }
    } else if (item.type === "local_pack") {
      if (
        out.localPackRank == null &&
        (str(item.cid) === fam.primaryCid || fam.domains.some((d) => str(item.domain).endsWith(d)))
      ) {
        out.localPackRank = num(item.rank_group);
      }
    } else if (item.type === "ai_overview") {
      out.aiOverviewPresent = true;
      const elements = (item.items ?? []) as Array<Record<string, unknown>>;
      for (const el of elements) {
        const refs = (el.references ?? []) as Array<Record<string, unknown>>;
        for (const ref of refs) {
          const d = str(ref.domain);
          if (d && !out.aiReferenceDomains.includes(d)) out.aiReferenceDomains.push(d);
          if (fam.domains.some((x) => d.endsWith(x))) out.aiOverviewCitesFamily = true;
        }
      }
    }
  }
  return out;
}

export interface AiModePinResult {
  present: boolean;
  citesFamily: boolean;
  referenceDomains: string[];
  snippet: string | null;
}

export function parseAiModeItems(
  items: Array<Record<string, unknown>>,
  fam: EntityFamily,
): AiModePinResult {
  const out: AiModePinResult = {
    present: false,
    citesFamily: false,
    referenceDomains: [],
    snippet: null,
  };
  const walk = (nodes: Array<Record<string, unknown>>) => {
    for (const node of nodes) {
      out.present = true;
      if (!out.snippet && typeof node.text === "string" && node.text.trim()) {
        out.snippet = node.text.slice(0, 280);
      }
      const refs = (node.references ?? []) as Array<Record<string, unknown>>;
      for (const ref of refs) {
        const d = str(ref.domain);
        if (d && !out.referenceDomains.includes(d)) out.referenceDomains.push(d);
        if (fam.domains.some((x) => d.endsWith(x))) out.citesFamily = true;
      }
      if (Array.isArray(node.items)) walk(node.items as Array<Record<string, unknown>>);
    }
  };
  walk(items);
  return out;
}

export function parseLocalFinderItems(
  items: Array<Record<string, unknown>>,
  fam: EntityFamily,
): { finderRank: number | null } {
  for (const item of items) {
    if (item.type !== "local_pack") continue;
    if (item.is_paid === true) continue;
    if (str(item.cid) === fam.primaryCid) {
      return { finderRank: num(item.rank_group) };
    }
  }
  return { finderRank: null };
}
