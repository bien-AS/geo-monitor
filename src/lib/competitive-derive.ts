import type {
  BaptistLocation,
  CompetitorsFixture,
  DataSource,
  GeoGridFixture,
  LocalAIFixture,
} from "@/lib/data/types";
import { SURFACES } from "@/lib/surfaces";

/* ------------------------------------------------------------------ */
/* Serialized shapes (server page → client view props)                 */
/* ------------------------------------------------------------------ */

export interface KeywordPresence {
  keyword: string;
  gridSource: DataSource;
  date: string;
  appearances: number;
  totalPins: number;
  avgPosition: number;
  top3: number;
  rating: number | null;
  reviews: number | null;
}

export interface AIAnswerWins {
  domain: string;
  count: number;
  totalChecks: number;
}

export interface RivalRecord {
  id: string;
  name: string;
  isYou: boolean;
  category: string | null;
  rating: number | null;
  votes: number | null;
  ratingSource: DataSource | null;
  distanceMi: number | null;
  googleCid: string | null;
  rosterSource: DataSource | null;
  mapPackWins: number | null;
  aiCitations: number | null;
  gridPresence: KeywordPresence[];
  aiAnswerWins: AIAnswerWins | null;
}

export interface LeaderboardRow {
  rivalId: string | null;
  name: string;
  isYou: boolean;
  category: string | null;
  appearances: number;
  totalPins: number;
  avgPosition: number;
  top3: number;
  rating: number | null;
  reviews: number | null;
}

export interface KeywordBoard {
  keyword: string;
  date: string;
  source: DataSource;
  totalPins: number;
  radiusMiles: number;
  rows: LeaderboardRow[];
}

export interface AIAnswerCell {
  surfaceId: string;
  domain: string | null;
  baptistCited: "yes" | "partial" | "no";
  position: number | null;
  source: DataSource;
  snippet?: string;
}

export interface AIPromptRow {
  prompt: string;
  cells: AIAnswerCell[];
}

export interface DomainTally {
  domain: string;
  isBaptist: boolean;
  count: number;
}

export interface AIBattleData {
  prompts: AIPromptRow[];
  chatbotTally: DomainTally[];
  chatbotChecks: number;
  searchTally: DomainTally[];
  searchChecks: number;
  sources: DataSource[];
}

export interface CompetitiveModel {
  you: RivalRecord;
  rivals: RivalRecord[];
  boards: KeywordBoard[];
  ai: AIBattleData | null;
  rosterSource: DataSource | null;
  lastScan: string | null;
}

/* ------------------------------------------------------------------ */
/* Matching helpers                                                    */
/* ------------------------------------------------------------------ */

export function normName(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function namesMatch(a: string, b: string): boolean {
  if (a.length === 0 || b.length === 0) return false;
  return a === b || a.includes(b) || b.includes(a);
}

function shortName(name: string): string {
  return name.replace(/^Baptist Medical Group\s*[-|–]\s*/i, "").trim();
}

function isYouEntry(title: string, cid: string | undefined, location: BaptistLocation): boolean {
  if (cid && location.cid && cid === location.cid) return true;
  const t = normName(title);
  return t === normName(location.name) || t.includes(normName(shortName(location.name)));
}

function domainMatchesRival(domain: string, rivalNorm: string): boolean {
  const root = domain.split(".")[0]?.replace(/[^a-z0-9]/g, "") ?? "";
  if (root.length < 4) return false;
  return rivalNorm.includes(root) || root.includes(rivalNorm);
}

const isBaptistDomain = (domain: string) => domain.toLowerCase().includes("baptist");

/* ------------------------------------------------------------------ */
/* Raw grid competitor rows                                           */
/* ------------------------------------------------------------------ */

interface RawAgg {
  title: string;
  data_cid?: string;
  appearances?: number;
  total_pins?: number;
  avg_position?: number;
  top3_count?: number;
  rating?: number | null;
  reviews?: number | null;
  category?: string | null;
}

const asNum = (v: unknown, fallback = 0): number =>
  typeof v === "number" && Number.isFinite(v) ? v : fallback;

/* ------------------------------------------------------------------ */
/* Main derivation                                                     */
/* ------------------------------------------------------------------ */

export function deriveCompetitiveModel({
  location,
  competitorsFx,
  grids,
  localAI,
}: {
  location: BaptistLocation;
  competitorsFx: CompetitorsFixture | null;
  grids: GeoGridFixture[];
  localAI: LocalAIFixture | null;
}): CompetitiveModel {
  const rivals: (RivalRecord & { _norm: string; _cids: Set<string> })[] = [];

  const findRival = (name: string, cid?: string | null) => {
    const n = normName(name);
    return rivals.find((r) => (cid && r._cids.has(cid)) || namesMatch(r._norm, n));
  };

  for (const c of competitorsFx?.competitors ?? []) {
    if (isYouEntry(c.name, c.cid, location)) continue;
    rivals.push({
      id: normName(c.name),
      name: c.name,
      isYou: false,
      category: c.category ?? null,
      rating: c.rating ?? null,
      votes: c.votes ?? null,
      ratingSource: c.rating != null ? c.source : null,
      distanceMi: c.distance_mi ?? null,
      googleCid: c.source === "dataforseo" && c.cid ? c.cid : null,
      rosterSource: c.source,
      mapPackWins: c.map_pack_wins ?? null,
      aiCitations: c.ai_citations ?? null,
      gridPresence: [],
      aiAnswerWins: null,
      _norm: normName(c.name),
      _cids: new Set(c.cid ? [c.cid] : []),
    });
  }

  const youRecord: RivalRecord = {
    id: "you",
    name: location.name,
    isYou: true,
    category: location.primary_category ?? null,
    rating: location.rating?.value ?? null,
    votes: location.rating?.votes_count ?? null,
    ratingSource: location.rating ? (location.source ?? null) : null,
    distanceMi: 0,
    googleCid: location.cid ?? null,
    rosterSource: location.source ?? null,
    mapPackWins: null,
    aiCitations: null,
    gridPresence: [],
    aiAnswerWins: null,
  };

  const boards: KeywordBoard[] = [];
  let lastScan: string | null = null;

  for (const grid of grids) {
    const snap = [...grid.snapshots].sort((a, b) => String(a.date).localeCompare(String(b.date)))[
      grid.snapshots.length - 1
    ];
    if (!snap) continue;
    if (!lastScan || String(snap.date) > lastScan) lastScan = String(snap.date);

    const raw = snap as unknown as Record<string, unknown>;
    const comps = (raw.competitors as RawAgg[] | undefined) ?? [];
    const pinArr = (raw as { pins?: unknown[] }).pins;
    const totalPinsNum = asNum(raw.total_pins, pinArr ? pinArr.length : 0);
    const totalPins = totalPinsNum > 0 ? totalPinsNum : 1;
    const radiusMiles = asNum(raw.radius_miles, 3);

    const rows: LeaderboardRow[] = [];
    for (const c of comps) {
      const presence: KeywordPresence = {
        keyword: grid.keyword,
        gridSource: grid.source ?? "synthetic",
        date: String(snap.date),
        appearances: asNum(c.appearances),
        totalPins: asNum(c.total_pins, totalPins),
        avgPosition: asNum(c.avg_position),
        top3: asNum(c.top3_count),
        rating: c.rating ?? null,
        reviews: c.reviews ?? null,
      };

      if (isYouEntry(c.title, c.data_cid, location)) {
        youRecord.gridPresence.push(presence);
        rows.push({
          rivalId: "you",
          name: c.title,
          isYou: true,
          category: c.category ?? null,
          appearances: presence.appearances,
          totalPins: presence.totalPins,
          avgPosition: presence.avgPosition,
          top3: presence.top3,
          rating: c.rating ?? null,
          reviews: c.reviews ?? null,
        });
        continue;
      }

      let rival = findRival(c.title, c.data_cid);
      if (!rival) {
        rival = {
          id: normName(c.title),
          name: c.title,
          isYou: false,
          category: c.category ?? null,
          rating: null,
          votes: null,
          ratingSource: null,
          distanceMi: null,
          googleCid: null,
          rosterSource: null,
          mapPackWins: null,
          aiCitations: null,
          gridPresence: [],
          aiAnswerWins: null,
          _norm: normName(c.title),
          _cids: new Set(c.data_cid ? [c.data_cid] : []),
        };
        rivals.push(rival);
      }
      if (c.data_cid) rival._cids.add(c.data_cid);
      if (!rival.googleCid && grid.source === "searchatlas" && c.data_cid) {
        rival.googleCid = c.data_cid;
      }
      if (rival.rating == null && c.rating != null) {
        rival.rating = c.rating;
        rival.votes = c.reviews ?? null;
        rival.ratingSource = grid.source ?? null;
      }
      if (!rival.category && c.category) rival.category = c.category;
      rival.gridPresence.push(presence);

      rows.push({
        rivalId: rival.id,
        name: c.title,
        isYou: false,
        category: c.category ?? null,
        appearances: presence.appearances,
        totalPins: presence.totalPins,
        avgPosition: presence.avgPosition,
        top3: presence.top3,
        rating: c.rating ?? null,
        reviews: c.reviews ?? null,
      });
    }

    rows.sort((a, b) => a.avgPosition - b.avgPosition);
    boards.push({
      keyword: grid.keyword,
      date: String(snap.date),
      source: grid.source ?? "synthetic",
      totalPins,
      radiusMiles,
      rows,
    });
  }

  const ai = deriveAIBattle(localAI);

  if (localAI && localAI.results.length > 0) {
    const totalChecks = localAI.results.length;
    for (const rival of rivals) {
      const counts = new Map<string, number>();
      for (const r of localAI.results) {
        const d = r.source_cited;
        if (d && domainMatchesRival(d, rival._norm)) {
          counts.set(d, (counts.get(d) ?? 0) + 1);
        }
      }
      const best = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
      if (best) {
        rival.aiAnswerWins = {
          domain: best[0],
          count: [...counts.values()].reduce((s, n) => s + n, 0),
          totalChecks,
        };
      }
    }
  }

  const gridTop3 = (r: RivalRecord) => r.gridPresence.reduce((s, k) => s + k.top3, 0);
  rivals.sort(
    (a, b) =>
      gridTop3(b) - gridTop3(a) ||
      (b.mapPackWins ?? -1) - (a.mapPackWins ?? -1) ||
      (b.aiAnswerWins?.count ?? 0) - (a.aiAnswerWins?.count ?? 0) ||
      (b.aiCitations ?? -1) - (a.aiCitations ?? -1) ||
      (b.votes ?? 0) - (a.votes ?? 0),
  );

  return {
    you: youRecord,
    rivals: rivals.map(({ _norm: _n, _cids: _c, ...r }) => r),
    boards,
    ai,
    rosterSource: competitorsFx?.source ?? null,
    lastScan,
  };
}

/* ------------------------------------------------------------------ */
/* AI battle                                                           */
/* ------------------------------------------------------------------ */

export function deriveAIBattle(fx: LocalAIFixture | null): AIBattleData | null {
  if (!fx || fx.results.length === 0) return null;

  const chatbotIds = new Set(SURFACES.filter((s) => s.category === "chatbot").map((s) => s.id));

  const prompts: AIPromptRow[] = fx.prompts.map((prompt) => ({
    prompt,
    cells: SURFACES.flatMap((surface) => {
      const r = fx.results.find((x) => x.prompt === prompt && x.surface === surface.id);
      if (!r) return [];
      const cell: AIAnswerCell = {
        surfaceId: surface.id,
        domain: r.source_cited ?? null,
        baptistCited: r.cited === true ? "yes" : r.cited === "partial" ? "partial" : "no",
        position: r.position ?? null,
        source: r.source ?? "synthetic",
        snippet: r.snippet,
      };
      return [cell];
    }),
  }));

  const tally = (group: "chatbot" | "search") => {
    const counts = new Map<string, number>();
    let checks = 0;
    for (const r of fx.results) {
      const inChat = chatbotIds.has(r.surface);
      if (group === "chatbot" ? !inChat : inChat) continue;
      checks += 1;
      if (r.source_cited) {
        counts.set(r.source_cited, (counts.get(r.source_cited) ?? 0) + 1);
      }
    }
    const rows: DomainTally[] = [...counts.entries()]
      .map(([domain, count]) => ({
        domain,
        count,
        isBaptist: isBaptistDomain(domain),
      }))
      .sort((a, b) => b.count - a.count);
    return { rows, checks };
  };

  const chat = tally("chatbot");
  const search = tally("search");

  const seen = new Set<DataSource>();
  const sources: DataSource[] = [];
  for (const r of fx.results) {
    if (!seen.has(r.source ?? "synthetic")) {
      seen.add(r.source ?? "synthetic");
      sources.push(r.source ?? "synthetic");
    }
  }

  return {
    prompts,
    chatbotTally: chat.rows,
    chatbotChecks: chat.checks,
    searchTally: search.rows,
    searchChecks: search.checks,
    sources,
  };
}
