import type {
  CompetitorsFixture,
  DataSource,
  LocalAIFixture,
  LocalAIResult,
} from "@/lib/data/types";
import { surfaceById, type AISurface } from "@/lib/surfaces";
import type { BaptistLocation } from "@/lib/data/types";

export interface AICheckRow {
  prompt: string;
  surface: string;
  cited: boolean | "partial";
  position: number | null;
  sourceCited: string | null;
  snippet?: string;
  checkedAt: string;
  cost: number;
  source: DataSource;
  model?: string;
  note?: string;
}

export interface LocalAILocationSlim {
  slug: string;
  name: string;
  shortName: string;
  address: string;
  city: string;
  state: string;
  listingType: string;
  category?: string;
  gbpDomain?: string;
  rating?: { value: number; votes: number } | null;
}

export interface CompetitorSlim {
  name: string;
  rating?: number | null;
  votes?: number | null;
  category?: string | null;
  distanceMi?: number | null;
  aiCitations?: number | null;
}

export function normalizeDomain(d?: string | null): string | undefined {
  if (!d) return undefined;
  const out = d
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/[/?#].*$/, "");
  return out || undefined;
}

function stripBrandPrefix(name: string): string {
  return name.replace(/^Baptist Medical Group\s*[-|\u2013]\s*/i, "").trim();
}

export function slimLocalAILocation(loc: BaptistLocation): LocalAILocationSlim {
  return {
    slug: loc.slug,
    name: loc.name,
    shortName: stripBrandPrefix(loc.name),
    address: loc.address ?? "",
    city: loc.city,
    state: loc.state,
    listingType: loc.listing_type,
    category: loc.primary_category,
    gbpDomain: normalizeDomain(loc.domain ?? loc.website),
    rating: loc.rating ? { value: loc.rating.value, votes: loc.rating.votes_count } : null,
  };
}

export function serializeResults(fx: LocalAIFixture): AICheckRow[] {
  return fx.results.map((r) => {
    const extra = r as LocalAIResult & { model?: string; note?: string };
    return {
      prompt: r.prompt,
      surface: r.surface,
      cited: r.cited,
      position: r.position ?? null,
      sourceCited: normalizeDomain(r.source_cited) ?? null,
      snippet: r.snippet,
      checkedAt: r.checked_at ?? "2026-07-10",
      cost: r.cost ?? 0,
      source: r.source ?? "synthetic",
      model: extra.model,
      note: extra.note,
    };
  });
}

export function slimCompetitors(fx: CompetitorsFixture | null): CompetitorSlim[] {
  return (fx?.competitors ?? []).map((c) => ({
    name: c.name,
    rating: c.rating ?? null,
    votes: c.votes ?? null,
    category: null,
    distanceMi: c.distance_mi ?? null,
    aiCitations: c.map_pack_wins ?? null,
  }));
}

export function rowFor(rows: AICheckRow[], prompt: string, surfaceId: string): AICheckRow | null {
  return rows.find((r) => r.prompt === prompt && r.surface === surfaceId) ?? null;
}

export interface GroupShare {
  cited: number;
  partial: number;
  missed: number;
  cells: number;
  pct: number;
}

export function groupShare(rows: AICheckRow[], surfaces: readonly AISurface[]): GroupShare {
  const ids = new Set(surfaces.map((s) => s.id));
  const g = rows.filter((r) => ids.has(r.surface));
  const cited = g.filter((r) => r.cited === true).length;
  const partial = g.filter((r) => r.cited === "partial").length;
  return {
    cited,
    partial,
    missed: g.length - cited - partial,
    cells: g.length,
    pct: g.length > 0 ? Math.round((cited / g.length) * 100) : 0,
  };
}

export function promptWinRate(
  rows: AICheckRow[],
  prompt: string,
): { cited: number; checked: number } {
  const g = rows.filter((r) => r.prompt === prompt);
  return {
    cited: g.filter((r) => r.cited === true).length,
    checked: g.length,
  };
}

export function totalCheckCost(rows: AICheckRow[]): number {
  return rows.reduce((sum, r) => sum + r.cost, 0);
}

export function lastCheckedAt(rows: AICheckRow[]): string | null {
  if (rows.length === 0) return null;
  return rows.reduce((max, r) => (r.checkedAt > max ? r.checkedAt : max), rows[0].checkedAt);
}

export function liveRowCount(rows: AICheckRow[]): number {
  return rows.filter((r) => r.source !== "synthetic").length;
}

export function dominantSource(rows: AICheckRow[]): DataSource {
  const tally = new Map<DataSource, number>();
  rows.forEach((r) => tally.set(r.source, (tally.get(r.source) ?? 0) + 1));
  return [...tally.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "synthetic";
}

export function isBaptistDomain(domain?: string | null): boolean {
  return Boolean(domain && /baptist/i.test(domain));
}

export interface SourceMixEntry {
  domain: string;
  count: number;
  isBaptist: boolean;
  isGbpListed: boolean;
  hits: AICheckRow[];
}

export function citedSourceMix(rows: AICheckRow[], gbpDomain?: string): SourceMixEntry[] {
  const byDomain = new Map<string, AICheckRow[]>();
  for (const r of rows) {
    if (!r.sourceCited) continue;
    const list = byDomain.get(r.sourceCited) ?? [];
    list.push(r);
    byDomain.set(r.sourceCited, list);
  }
  return [...byDomain.entries()]
    .map(([domain, hits]) => ({
      domain,
      count: hits.length,
      isBaptist: isBaptistDomain(domain),
      isGbpListed: gbpDomain != null && domain === gbpDomain,
      hits,
    }))
    .sort((a, b) => b.count - a.count || a.domain.localeCompare(b.domain));
}

export interface FragmentationFinding {
  baptistDomains: { domain: string; count: number; isGbpListed: boolean }[];
  gbpDomain?: string;
  offDomainChecks: number;
  hasLiveEvidence: boolean;
}

export function domainFragmentation(
  mix: SourceMixEntry[],
  gbpDomain?: string,
): FragmentationFinding | null {
  const baptist = mix.filter((m) => m.isBaptist);
  if (baptist.length < 2) return null;
  const off = baptist.filter((m) => !m.isGbpListed);
  return {
    baptistDomains: baptist.map((m) => ({
      domain: m.domain,
      count: m.count,
      isGbpListed: m.isGbpListed,
    })),
    gbpDomain,
    offDomainChecks: off.reduce((sum, m) => sum + m.count, 0),
    hasLiveEvidence: off.some((m) => m.hits.some((h) => h.source !== "synthetic")),
  };
}

export interface ContentGap {
  prompt: string;
  missedSurfaceIds: string[];
  partialSurfaceIds: string[];
  topRival: { domain: string; count: number } | null;
}

export function contentGaps(prompts: string[], rows: AICheckRow[]): ContentGap[] {
  return prompts
    .map((prompt) => {
      const g = rows.filter((r) => r.prompt === prompt);
      const missed = g.filter((r) => r.cited === false);
      const partial = g.filter((r) => r.cited === "partial");
      const rivalCounts = new Map<string, number>();
      for (const m of missed) {
        if (!m.sourceCited || isBaptistDomain(m.sourceCited)) continue;
        rivalCounts.set(m.sourceCited, (rivalCounts.get(m.sourceCited) ?? 0) + 1);
      }
      const topRival =
        [...rivalCounts.entries()]
          .sort((a, b) => b[1] - a[1])
          .map(([domain, count]) => ({ domain, count }))[0] ?? null;
      return {
        prompt,
        missedSurfaceIds: missed.map((r) => r.surface),
        partialSurfaceIds: partial.map((r) => r.surface),
        topRival,
      };
    })
    .filter((gap) => gap.missedSurfaceIds.length > 0)
    .sort((a, b) => b.missedSurfaceIds.length - a.missedSurfaceIds.length);
}

export interface HeadlineWin {
  surfaceId: string;
  prompt: string;
  position: number | null;
  live: boolean;
  domain: string | null;
}

export function bestWin(rows: AICheckRow[]): HeadlineWin | null {
  const wins = rows
    .filter((r) => r.cited === true)
    .sort(
      (a, b) =>
        (a.position ?? 99) - (b.position ?? 99) ||
        Number(b.source !== "synthetic") - Number(a.source !== "synthetic"),
    );
  const top = wins[0];
  if (!top) return null;
  return {
    surfaceId: top.surface,
    prompt: top.prompt,
    position: top.position,
    live: top.source !== "synthetic",
    domain: top.sourceCited,
  };
}

export interface RivalSummary {
  domain: string;
  count: number;
  surfaceIds: string[];
}

export function topRivalDomain(rows: AICheckRow[]): RivalSummary | null {
  const byDomain = new Map<string, AICheckRow[]>();
  for (const r of rows) {
    if (!r.sourceCited || isBaptistDomain(r.sourceCited)) continue;
    const list = byDomain.get(r.sourceCited) ?? [];
    list.push(r);
    byDomain.set(r.sourceCited, list);
  }
  const top = [...byDomain.entries()].sort((a, b) => b[1].length - a[1].length)[0];
  if (!top) return null;
  return {
    domain: top[0],
    count: top[1].length,
    surfaceIds: [...new Set(top[1].map((r) => r.surface))],
  };
}

export interface SerpPreviewData {
  query: string;
  asOf: string;
  aiOverview: {
    present: boolean;
    answer: string;
    sources: { domain: string; isYou?: boolean }[];
    youCited: boolean;
  };
  mapPack: Array<{
    name: string;
    isYou?: boolean;
    rating: number | null;
    reviews: number | null;
    category: string | null;
    address?: string;
    rank?: number;
  }>;
  yourMapPackRank: number | null;
  localFinder: Array<{
    name: string;
    isYou?: boolean;
    rating: number | null;
    reviews: number | null;
    category: string | null;
    address?: string;
    rank?: number;
  }>;
  organic: { title: string; url: string; isYou?: boolean }[];
  source: DataSource;
  sourceNote: string;
  refreshCost?: number;
}

export function buildSerpPreview(
  row: AICheckRow,
  location: LocalAILocationSlim,
  competitors: CompetitorSlim[],
  mix: SourceMixEntry[],
): SerpPreviewData {
  const youCited = row.cited === true;
  const yourRank = row.position ?? null;

  const pool = [...competitors].sort(
    (a, b) =>
      Number(b.rating != null) - Number(a.rating != null) ||
      (b.aiCitations ?? 0) - (a.aiCitations ?? 0) ||
      (b.votes ?? 0) - (a.votes ?? 0),
  );

  const you = {
    name: location.name,
    isYou: true as const,
    rating: location.rating?.value ?? null,
    reviews: location.rating?.votes ?? null,
    category: location.category ?? null,
    address: location.address,
  };

  const rivalBiz = (c: CompetitorSlim) => ({
    name: c.name,
    isYou: false as const,
    rating: c.rating ?? null,
    reviews: c.votes ?? null,
    category: c.category ?? null,
  });

  const finderLen = Math.min(pool.length + 1, 6);
  const finder: Array<{
    name: string;
    isYou?: boolean;
    rating: number | null;
    reviews: number | null;
    category: string | null;
    address?: string;
    rank?: number;
  }> = [];
  let poolIdx = 0;
  for (let rank = 1; rank <= finderLen; rank++) {
    const youHere = yourRank === rank || (yourRank == null && rank === finderLen);
    if (youHere) {
      finder.push({ ...you, rank });
    } else {
      const c = pool[poolIdx++];
      if (c) finder.push({ ...rivalBiz(c), rank });
    }
  }
  const mapPack = finder.slice(0, 3);

  const sources: { domain: string; isYou?: boolean }[] = [];
  const pushSource = (d?: string | null) => {
    const dom = normalizeDomain(d);
    if (!dom || sources.some((s) => s.domain === dom)) return;
    sources.push({ domain: dom, isYou: isBaptistDomain(dom) });
  };
  pushSource(row.sourceCited);
  if (youCited) pushSource(location.gbpDomain);
  mix
    .filter((m) => !m.isBaptist)
    .slice(0, 3)
    .forEach((m) => pushSource(m.domain));

  const organic: { title: string; url: string; isYou?: boolean }[] = [];
  const rivalDomain = !isBaptistDomain(row.sourceCited)
    ? row.sourceCited
    : (mix.find((m) => !m.isBaptist)?.domain ?? null);
  if (rivalDomain) {
    organic.push({
      title: `Best ${location.category ?? "clinics"} near ${location.city}, ${location.state}`,
      url: `https://www.${rivalDomain}/`,
    });
  }
  if (location.gbpDomain) {
    organic.push({
      title: location.name,
      url: `https://www.${location.gbpDomain}/`,
      isYou: true,
    });
  }
  const secondRival = mix.filter((m) => !m.isBaptist && m.domain !== rivalDomain)[0];
  if (secondRival) {
    organic.push({
      title: `${location.category ?? "Clinics"} in ${location.city}, ${location.state} — compare providers`,
      url: `https://www.${secondRival.domain}/`,
    });
  }

  const surface = surfaceById(row.surface);

  return {
    query: row.prompt,
    asOf: row.checkedAt,
    aiOverview: {
      present: true,
      answer:
        row.snippet ??
        "The stored check kept the citation outcome only — no answer text was retained.",
      sources,
      youCited,
    },
    mapPack: mapPack as SerpPreviewData["mapPack"],
    yourMapPackRank: yourRank,
    localFinder: finder as SerpPreviewData["localFinder"],
    organic,
    source: row.source,
    sourceNote:
      row.source === "synthetic"
        ? "Synthetic demo check — SERP units composed from the stored check + competitor aggregates"
        : "Live provider AI check — SERP units composed from the stored check + competitor aggregates",
    refreshCost: surface?.cost,
  };
}
