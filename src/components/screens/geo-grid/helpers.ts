/**
 * Geo-grid helpers — pure derivations shared by the geo-grid screen,
 * compare screen, and map. No fetching here.
 */

import type {
  BaptistLocation,
  DataSource,
  GeoGridFixture,
  GridPin,
  LocalAIFixture,
} from "@/lib/data/types";
import { SURFACES } from "@/lib/surfaces";

/* ------------------------------------------------------------------ */
/* Serialized shapes (server page → client screen props)               */
/* ------------------------------------------------------------------ */

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

export interface SnapshotPin {
  lat: number;
  lng: number;
  rank: number | null;
  local_finder_rank: number | null;
  organic_rank: number | null;
  [key: string]: unknown;
}

export type RankField = "rank" | "local_finder_rank" | "organic_rank";

export const RANK_FIELDS: {
  id: RankField;
  label: string;
  desc: string;
}[] = [
  {
    id: "rank",
    label: "Map Pack",
    desc: "Your position in Google's local 3-pack / map results at each point",
  },
  {
    id: "local_finder_rank",
    label: "Local Finder",
    desc: "Your rank in the expanded 'More places' list",
  },
  {
    id: "organic_rank",
    label: "Organic",
    desc: "Your classic blue-link organic position at that point",
  },
];

export const RANK_FIELD_LABEL: Record<RankField, string> = {
  rank: "Map Pack",
  local_finder_rank: "Local Finder",
  organic_rank: "Organic",
};

export interface SnapshotData {
  date: string;
  pins: SnapshotPin[];
  avg_rank: number | null;
  best_position: number | null;
  radius_miles: number;
  total_pins: number;
  position_distribution: Record<string, number>;
  competitors: CompetitorAgg[];
  snapshot_history: { date: string; avg_position: number }[];
  geoscan?: {
    atgr?: number;
    solv?: number;
    family_solv?: number | null;
    ai_mode_anchors?: Array<{ pin: number; present: boolean; cites_gbp_domain: boolean }>;
  };
}

export interface KeywordGrid {
  keyword: string;
  source: DataSource;
  pinsSource?: string;
  gridShape?: string;
  snapshots: SnapshotData[];
}

export interface GeoLocationSlim {
  slug: string;
  name: string;
  shortName: string;
  address?: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  cid: string | null;
  domain?: string;
  category?: string;
  facilityType: string;
  listingType: string;
  rating?: { value: number; votes: number } | null;
}

export interface ScanCostPreview {
  businessId: number;
  pinCount: number;
  keywordCount: number;
  refreshesPerMonth: number;
  checksPerMonth: number;
  fleetChecksPerMonth: number;
  fleetLocations: number;
  source: DataSource;
}

export interface SurfacePresence {
  surfaceId: string;
  checked: number;
  cited: number;
  partial: number;
  sample?: {
    cited: boolean | "partial";
    source_cited?: string | null;
    snippet?: string;
  } | null;
}

export interface LocalAISummary {
  source: DataSource;
  prompts: string[];
  surfaces: SurfacePresence[];
  aio: {
    present: boolean;
    cited: boolean | "partial";
    snippet?: string;
    source_cited?: string | null;
  } | null;
}

/* ------------------------------------------------------------------ */
/* Fixture → serialized grid                                           */
/* ------------------------------------------------------------------ */

function nu(v: unknown, fallback = 0): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

export function serializeGrid(fixture: GeoGridFixture): KeywordGrid {
  const snapshots = [...fixture.snapshots]
    .sort((a, b) => String(a.date).localeCompare(String(b.date)))
    .map((s): SnapshotData => {
      const raw = s as unknown as Record<string, unknown>;
      return {
        date: s.date,
        pins: (s.pins ?? []).map((p): SnapshotPin => {
          const px = p as GridPin & {
            local_finder_rank?: number;
            organic_rank?: number;
          };
          return {
            lat: p.lat,
            lng: p.lng,
            rank: p.rank ?? null,
            local_finder_rank: px.local_finder_rank ?? null,
            organic_rank: px.organic_rank ?? null,
          };
        }),
        avg_rank:
          typeof raw.avg_rank === "number" && Number.isFinite(raw.avg_rank) ? raw.avg_rank : null,
        best_position: typeof raw.best_position === "number" ? raw.best_position : null,
        radius_miles: nu(raw.radius_miles, 1),
        total_pins: nu(raw.total_pins, (s.pins ?? []).length),
        position_distribution: (raw.position_distribution as Record<string, number>) ?? {},
        competitors: ((raw.competitors as CompetitorAgg[]) ?? []).map((c) => ({
          title: c.title,
          data_cid: c.data_cid,
          appearances: nu(c.appearances),
          avg_position: nu(c.avg_position),
          top3_count: nu(c.top3_count),
          rating: c.rating ?? null,
          reviews: c.reviews ?? null,
          category: c.category ?? null,
          ...(typeof (c as { is_family?: unknown }).is_family === "boolean"
            ? { is_family: (c as { is_family: boolean }).is_family }
            : {}),
        })),
        snapshot_history: (raw.snapshot_history as { date: string; avg_position: number }[]) ?? [],
        ...(raw.geoscan && typeof raw.geoscan === "object"
          ? { geoscan: raw.geoscan as SnapshotData["geoscan"] }
          : {}),
      };
    });
  const fx = fixture as GeoGridFixture & { pins_source?: string };
  return {
    keyword: fixture.keyword,
    source: fixture.source ?? "synthetic",
    pinsSource: fx.pins_source,
    gridShape: fixture.grid_shape,
    snapshots,
  };
}

/* ------------------------------------------------------------------ */
/* Scan focus areas: 10x10 default, 5x5 alternative                    */
/* ------------------------------------------------------------------ */

export type GridSize = "10x10" | "5x5";

export interface GridSizeMeta {
  id: GridSize;
  side: number;
  pins: number;
  sqMi: number;
  halfExtentMiles: number;
  salesLine: string;
}

export const GRID_SIZES: GridSizeMeta[] = [
  {
    id: "10x10",
    side: 10,
    pins: 100,
    sqMi: 100,
    halfExtentMiles: 5,
    salesLine: "Full-catchment coverage — hospital catchments outrun a 5x5 focus area",
  },
  {
    id: "5x5",
    side: 5,
    pins: 25,
    sqMi: 25,
    halfExtentMiles: 2.5,
    salesLine: "Tight neighborhood focus around the facility",
  },
];

export function gridSizeMeta(id: GridSize): GridSizeMeta {
  return GRID_SIZES.find((g) => g.id === id) ?? GRID_SIZES[0];
}

export function isSquareGrid(grid: KeywordGrid): boolean {
  return Boolean(grid.gridShape?.startsWith("square"));
}

export function scanChecksPerMonth(pins: number, keywords: number, refreshesPerMonth = 4): number {
  return pins * keywords * refreshesPerMonth;
}

export function centralWindowIndices(pinCount: number): number[] | null {
  const side = Math.round(Math.sqrt(pinCount));
  if (side * side !== pinCount || side < 5) return null;
  const start = Math.floor((side - 5) / 2);
  const idx: number[] = [];
  for (let row = start; row < start + 5; row++) {
    for (let col = start; col < start + 5; col++) {
      idx.push(row * side + col);
    }
  }
  return idx;
}

export function windowSnapshot(snapshot: SnapshotData): SnapshotData {
  const idx = centralWindowIndices(snapshot.pins.length);
  if (!idx) return snapshot;
  const pins = idx.map((i) => snapshot.pins[i]);
  const ranked = pins.map((p) => p.rank).filter((r): r is number => r != null);
  const counts: Record<string, number> = {
    "1-3": 0,
    "4-7": 0,
    "8-20": 0,
    "20+": 0,
  };
  pins.forEach((p) => {
    const r = p.rank;
    const key = r == null || r > 20 ? "20+" : r <= 3 ? "1-3" : r <= 7 ? "4-7" : "8-20";
    counts[key] += 1;
  });
  return {
    ...snapshot,
    pins,
    total_pins: pins.length,
    avg_rank: ranked.length
      ? Math.round((ranked.reduce((s, v) => s + v, 0) / ranked.length) * 10) / 10
      : snapshot.avg_rank,
    best_position: ranked.length ? Math.min(...ranked) : null,
    position_distribution: counts,
  };
}

/* ------------------------------------------------------------------ */
/* Coverage footprint                                                  */
/* ------------------------------------------------------------------ */

export function outlineForPins(pins: { lat: number; lng: number }[]): {
  feature: GeoJSON.Feature<GeoJSON.Polygon>;
  fitRadiusMiles: number;
} | null {
  if (pins.length < 2) return null;
  const lats = [...new Set(pins.map((p) => p.lat))].sort((a, b) => a - b);
  const lngs = [...new Set(pins.map((p) => p.lng))].sort((a, b) => a - b);
  const step = (vals: number[], fallback: number) => {
    const diffs: number[] = [];
    for (let i = 1; i < vals.length; i++) {
      const d = vals[i] - vals[i - 1];
      if (d > 1e-9) diffs.push(d);
    }
    if (diffs.length === 0) return fallback;
    diffs.sort((a, b) => a - b);
    return diffs[Math.floor(diffs.length / 2)];
  };
  const midLat = (lats[0] + lats[lats.length - 1]) / 2;
  const padLat = step(lats, 1 / 69) / 2;
  const padLng = step(lngs, 1 / (69 * Math.cos((midLat * Math.PI) / 180))) / 2;
  const minLat = lats[0] - padLat;
  const maxLat = lats[lats.length - 1] + padLat;
  const minLng = lngs[0] - padLng;
  const maxLng = lngs[lngs.length - 1] + padLng;
  const ring: [number, number][] = [
    [minLng, minLat],
    [maxLng, minLat],
    [maxLng, maxLat],
    [minLng, maxLat],
    [minLng, minLat],
  ];
  const halfEdgeMiles = ((maxLat - minLat) / 2) * 69;
  return {
    feature: {
      type: "Feature",
      properties: {},
      geometry: { type: "Polygon", coordinates: [ring] },
    },
    fitRadiusMiles: halfEdgeMiles + 0.3,
  };
}

export function squareOutline(
  center: { lat: number; lng: number },
  halfMiles: number,
): GeoJSON.Feature<GeoJSON.Polygon> {
  const dLat = halfMiles / 69;
  const dLng = halfMiles / (69 * Math.cos((center.lat * Math.PI) / 180));
  const ring: [number, number][] = [
    [center.lng - dLng, center.lat - dLat],
    [center.lng + dLng, center.lat - dLat],
    [center.lng + dLng, center.lat + dLat],
    [center.lng - dLng, center.lat + dLat],
    [center.lng - dLng, center.lat - dLat],
  ];
  return {
    type: "Feature",
    properties: {},
    geometry: { type: "Polygon", coordinates: [ring] },
  };
}

export function proposalLattice(
  center: { lat: number; lng: number },
  size: GridSize,
  spacingMiles = 1.0,
): { lat: number; lng: number }[] {
  const { side } = gridSizeMeta(size);
  const latStep = spacingMiles / 69;
  const lngStep = spacingMiles / (69 * Math.cos((center.lat * Math.PI) / 180));
  const half = (side - 1) / 2;
  const pts: { lat: number; lng: number }[] = [];
  for (let row = 0; row < side; row++) {
    for (let col = 0; col < side; col++) {
      pts.push({
        lat: center.lat + (half - row) * latStep,
        lng: center.lng + (col - half) * lngStep,
      });
    }
  }
  return pts;
}

/* ------------------------------------------------------------------ */
/* Location slim                                                       */
/* ------------------------------------------------------------------ */

function stripBrandPrefix(name: string): string {
  return name.replace(/^Baptist Medical Group\s*[-|–]\s*/i, "").trim();
}

export function slimLocation(loc: BaptistLocation): GeoLocationSlim | null {
  if (loc.lat == null || loc.lng == null) return null;
  return {
    slug: loc.slug,
    name: loc.name,
    shortName: stripBrandPrefix(loc.name),
    address: loc.address,
    city: loc.city,
    state: loc.state,
    lat: loc.lat,
    lng: loc.lng,
    cid: loc.cid,
    category: loc.primary_category,
    facilityType: loc.listing_type,
    listingType: loc.listing_type,
    rating: loc.rating ? { value: loc.rating.value, votes: loc.rating.votes_count } : null,
  };
}

/* ------------------------------------------------------------------ */
/* Local AI summary                                                    */
/* ------------------------------------------------------------------ */

export function summarizeLocalAI(fx: LocalAIFixture | null): LocalAISummary | null {
  if (!fx || fx.results.length === 0) return null;

  const surfaces: SurfacePresence[] = SURFACES.map((surface) => {
    const results = fx.results.filter((r) => r.surface === surface.id);
    const withSnippet =
      results.find((r) => r.cited === true && r.snippet) ??
      results.find((r) => r.cited !== false) ??
      results[0] ??
      null;
    return {
      surfaceId: surface.id,
      checked: results.length,
      cited: results.filter((r) => r.cited === true).length,
      partial: results.filter((r) => r.cited === "partial").length,
      sample: withSnippet
        ? {
            cited: withSnippet.cited,
            source_cited: withSnippet.source_cited ?? null,
            snippet: withSnippet.snippet,
          }
        : null,
    };
  });

  const aioResults = fx.results.filter((r) => r.surface === "ai-overviews");
  const aioBest =
    aioResults.find((r) => r.cited === true && r.snippet) ??
    aioResults.find((r) => r.cited !== false) ??
    aioResults[0] ??
    null;

  const tally = new Map<DataSource, number>();
  fx.results.forEach((r) =>
    tally.set(r.source ?? "synthetic", (tally.get(r.source ?? "synthetic") ?? 0) + 1),
  );
  const source = [...tally.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "synthetic";

  return {
    source,
    prompts: fx.prompts,
    surfaces,
    aio: aioBest
      ? {
          present: true,
          cited: aioBest.cited,
          snippet: aioBest.snippet,
          source_cited: aioBest.source_cited ?? null,
        }
      : null,
  };
}

/* ------------------------------------------------------------------ */
/* Geometry: cell labels, distance, bearing                            */
/* ------------------------------------------------------------------ */

const ROW_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function cellLabels(pins: { lat: number; lng: number }[]): string[] {
  const latKeys = [...new Set(pins.map((p) => p.lat.toFixed(4)))].sort(
    (a, b) => Number(b) - Number(a),
  );
  const lngKeys = [...new Set(pins.map((p) => p.lng.toFixed(4)))].sort(
    (a, b) => Number(a) - Number(b),
  );
  return pins.map((p) => {
    const row = latKeys.indexOf(p.lat.toFixed(4));
    const col = lngKeys.indexOf(p.lng.toFixed(4));
    const letter = ROW_LETTERS[Math.min(row, ROW_LETTERS.length - 1)] ?? "A";
    return `${letter}${col + 1}`;
  });
}

export function distanceMiles(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 3958.8;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function bearingLabel(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
): string {
  const dLat = toLat - fromLat;
  const dLng = toLng - fromLng;
  if (Math.abs(dLat) < 1e-6 && Math.abs(dLng) < 1e-6) return "at center";
  const angle = (Math.atan2(dLng, dLat) * 180) / Math.PI;
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const idx = Math.round(((angle + 360) % 360) / 45) % 8;
  return dirs[idx];
}

/* ------------------------------------------------------------------ */
/* Per-field stats                                                     */
/* ------------------------------------------------------------------ */

export interface FieldStats {
  avg: number | null;
  best: number | null;
  distribution: { key: string; label: string; color: string; count: number; pct: number }[];
  top3Count: number;
  top3Pct: number;
  number1Count: number;
  ranked: number;
  total: number;
}

export function hasDerivedRanks(snapshot: SnapshotData): boolean {
  return snapshot.pins.some((p) => p.local_finder_rank != null || p.organic_rank != null);
}

export function fieldStats(snapshot: SnapshotData, field: RankField): FieldStats {
  const total = Math.max(1, snapshot.total_pins);
  if (field === "rank") {
    const top3 = snapshot.position_distribution["1-3"] ?? 0;
    return {
      avg: snapshot.avg_rank,
      best: snapshot.best_position,
      distribution: distributionCounts(snapshot),
      top3Count: top3,
      top3Pct: (top3 / total) * 100,
      number1Count: snapshot.pins.filter((p) => p.rank === 1).length,
      ranked: snapshot.pins.filter((p) => p.rank != null).length,
      total,
    };
  }
  const values = snapshot.pins.map((p) => p[field]);
  const ranked = values.filter((v): v is number => v != null);
  const bucket = (v: number | null) =>
    v == null ? "20+" : v <= 3 ? "1-3" : v <= 7 ? "4-7" : v <= 20 ? "8-20" : "20+";
  const counts: Record<string, number> = { "1-3": 0, "4-7": 0, "8-20": 0, "20+": 0 };
  values.forEach((v) => {
    counts[bucket(v)] += 1;
  });
  const top3 = counts["1-3"];
  return {
    avg: ranked.length
      ? Math.round((ranked.reduce((s, v) => s + v, 0) / ranked.length) * 10) / 10
      : null,
    best: ranked.length ? Math.min(...ranked) : null,
    distribution: DISTRIBUTION_BUCKETS.map((b) => ({
      ...b,
      count: counts[b.key],
      pct: (counts[b.key] / total) * 100,
    })),
    top3Count: top3,
    top3Pct: (top3 / total) * 100,
    number1Count: values.filter((v) => v === 1).length,
    ranked: ranked.length,
    total,
  };
}

export function fieldMapPins(snapshot: SnapshotData, field: RankField): GridPin[] {
  if (field === "rank")
    return snapshot.pins.map((p) => ({
      lat: p.lat,
      lng: p.lng,
      rank: p.rank,
    }));
  return snapshot.pins.map((p) => ({
    lat: p.lat,
    lng: p.lng,
    rank: p[field],
  }));
}

/* ------------------------------------------------------------------ */
/* Cycle deltas                                                        */
/* ------------------------------------------------------------------ */

export type PinChange = "improved" | "declined" | "unchanged";

export interface PinDelta {
  index: number;
  a: number | null;
  b: number | null;
  change: PinChange;
  gained: number | null;
}

const UNRANKED_EFFECTIVE = 25;

export function computeDeltas(
  a: SnapshotData,
  b: SnapshotData,
  field: RankField = "rank",
): PinDelta[] {
  const key = (p: { lat: number; lng: number }) => `${p.lat.toFixed(4)},${p.lng.toFixed(4)}`;
  const aByKey = new Map(a.pins.map((p) => [key(p), p]));
  return b.pins.map((pb, index) => {
    const pa = aByKey.get(key(pb)) ?? a.pins[index] ?? null;
    const rankA = pa ? pa[field] : null;
    const rankB = pb[field];
    const effA = rankA ?? UNRANKED_EFFECTIVE;
    const effB = rankB ?? UNRANKED_EFFECTIVE;
    const gained = rankA == null && rankB == null ? null : effA - effB;
    const change: PinChange = effB < effA ? "improved" : effB > effA ? "declined" : "unchanged";
    return { index, a: rankA, b: rankB, change, gained };
  });
}

export const DELTA_COLOR: Record<PinChange, string> = {
  improved: "#1D9E75",
  declined: "#A32D2D",
  unchanged: "#7d8a9b",
};

export interface DiffMapFeed {
  pins: GridPin[];
  cellIndex: number[];
  counts: { improved: number; declined: number; unchanged: number };
}

export function diffMapFeed(deltas: PinDelta[], bPins: SnapshotData["pins"]): DiffMapFeed {
  const pins: GridPin[] = [];
  const cellIndex: number[] = [];
  const counts = { improved: 0, declined: 0, unchanged: 0 };
  deltas.forEach((d) => {
    counts[d.change] += 1;
    const p = bPins[d.index];
    const label =
      d.change === "unchanged" || d.gained == null
        ? "="
        : d.gained > 0
          ? `+${d.gained}`
          : `${d.gained}`;
    pins.push({
      lat: p.lat,
      lng: p.lng,
      rank: d.b,
      pinColor: DELTA_COLOR[d.change],
      pinLabel: label,
    });
    cellIndex.push(d.index);
  });
  return { pins, cellIndex, counts };
}

/* ------------------------------------------------------------------ */
/* Competitor helpers                                                  */
/* ------------------------------------------------------------------ */

export function isYouCompetitor(comp: CompetitorAgg, location: GeoLocationSlim): boolean {
  if (comp.data_cid && location.cid && comp.data_cid === location.cid) return true;
  const t = comp.title.toLowerCase();
  return (
    t === location.name.toLowerCase() ||
    t.includes(location.shortName.toLowerCase()) ||
    (t.startsWith("baptist") &&
      location.name.toLowerCase().startsWith("baptist") &&
      t.includes(location.city.toLowerCase()))
  );
}

export function nonBaptistRivals(
  snapshot: SnapshotData,
  location: GeoLocationSlim,
): CompetitorAgg[] {
  return snapshot.competitors
    .filter(
      (c) => !isYouCompetitor(c, location) && c.is_family !== true && !/baptist|bmg/i.test(c.title),
    )
    .sort((a, b) => a.avg_position - b.avg_position);
}

/* ------------------------------------------------------------------ */
/* PAA composition (synthetic)                                         */
/* ------------------------------------------------------------------ */

function hashInt(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export function keywordTopic(keyword: string, city: string): string {
  const drop = new Set([
    "near",
    "me",
    "ms",
    "tn",
    city.toLowerCase(),
    ...city.toLowerCase().split(/\s+/),
  ]);
  const words = keyword
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => !drop.has(w));
  return words.length > 0 ? words.join(" ") : keyword.toLowerCase();
}

export interface PaaQuestion {
  id: string;
  question: string;
  volume: number;
}

export function composePaaQuestions(keyword: string, location: GeoLocationSlim): PaaQuestion[] {
  const topic = keywordTopic(keyword, location.city);
  const place = /clinic|center|associates|group/.test(topic);
  const seeTopic = place ? `visit a ${topic}` : `see a ${topic}`;
  const { city, state, shortName } = location;
  const questions = [
    `Who is the best ${topic} near ${city}, ${state}?`,
    `How do I get a same-day appointment ${place ? `at a ${topic}` : `with a ${topic}`} in ${city}?`,
    `What does it cost to ${seeTopic} without insurance in ${state}?`,
    `Is ${shortName} accepting new patients?`,
    `Do I need a referral to ${seeTopic} in ${state}?`,
    `What insurance plans are accepted for ${topic} visits in ${city}?`,
  ];
  return questions.map((question, i) => ({
    id: `paa-${hashInt(keyword + question)}`,
    question,
    volume: 40 + (hashInt(question + city) % 12) * 40 + i * 10,
  }));
}

export function paaGeoBreadth(question: string, totalCells: number): number {
  const min = Math.max(3, Math.round(totalCells * 0.2));
  const max = Math.max(min + 1, Math.round(totalCells * 0.8));
  return min + (hashInt(question) % (max - min + 1));
}

/* ------------------------------------------------------------------ */
/* Export builders                                                     */
/* ------------------------------------------------------------------ */

function csvCell(v: string | number | null | undefined): string {
  if (v == null) return "";
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function buildScanCsv(
  grids: KeywordGrid[],
  opts: { keywords: string[]; allCycles: boolean },
): string {
  const withDerived = grids.some((g) => g.snapshots.some((s) => hasDerivedRanks(s)));
  const rows: string[] = [
    `keyword,grid_size,cycle_date,cell,lat,lng,rank_map_pack${withDerived ? ",rank_local_finder,rank_organic" : ""}`,
  ];
  for (const grid of grids) {
    if (!opts.keywords.includes(grid.keyword)) continue;
    const cycles = opts.allCycles ? grid.snapshots : grid.snapshots.slice(-1);
    for (const snap of cycles) {
      const labels = cellLabels(snap.pins);
      snap.pins.forEach((p, i) => {
        const base = [
          csvCell(grid.keyword),
          csvCell(grid.gridShape ?? "circle"),
          csvCell(snap.date),
          csvCell(labels[i]),
          csvCell(p.lat),
          csvCell(p.lng),
          csvCell(p.rank ?? "NR"),
        ];
        if (withDerived) {
          base.push(csvCell(p.local_finder_rank ?? "NR"), csvCell(p.organic_rank ?? "NR"));
        }
        rows.push(base.join(","));
      });
    }
  }
  return rows.join("\n");
}

export function buildDiffCsv(keyword: string, a: SnapshotData, b: SnapshotData): string {
  const deltas = computeDeltas(a, b);
  const labels = cellLabels(b.pins);
  const rows: string[] = [
    `keyword,cell,lat,lng,rank_${a.date},rank_${b.date},positions_gained,change`,
  ];
  deltas.forEach((d) => {
    const p = b.pins[d.index];
    rows.push(
      [
        csvCell(keyword),
        csvCell(labels[d.index]),
        csvCell(p.lat),
        csvCell(p.lng),
        csvCell(d.a ?? "NR"),
        csvCell(d.b ?? "NR"),
        csvCell(d.gained ?? ""),
        csvCell(d.change),
      ].join(","),
    );
  });
  return rows.join("\n");
}

export function buildScanJson(
  location: GeoLocationSlim,
  grids: KeywordGrid[],
  opts: {
    keywords: string[];
    allCycles: boolean;
    includeAggregates: boolean;
    includeCompetitors: boolean;
  },
): string {
  const payload = {
    export_type: "geo-grid snapshot export",
    generated_at: new Date().toISOString(),
    location: {
      slug: location.slug,
      name: location.name,
      address: location.address,
      lat: location.lat,
      lng: location.lng,
    },
    grids: grids
      .filter((g) => opts.keywords.includes(g.keyword))
      .map((g) => ({
        keyword: g.keyword,
        source: g.source,
        ...(g.pinsSource ? { pins_source: g.pinsSource } : {}),
        cycles: (opts.allCycles ? g.snapshots : g.snapshots.slice(-1)).map((s) => ({
          date: s.date,
          ...(opts.includeAggregates
            ? {
                avg_rank: s.avg_rank,
                best_position: s.best_position,
                radius_miles: s.radius_miles,
                total_pins: s.total_pins,
                position_distribution: s.position_distribution,
              }
            : {}),
          ...(opts.includeCompetitors ? { competitors: s.competitors } : {}),
          pins: s.pins,
        })),
      })),
  };
  return JSON.stringify(payload, null, 2);
}

export function downloadBlob(filename: string, mime: string, content: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/* ------------------------------------------------------------------ */
/* Distribution helpers                                                */
/* ------------------------------------------------------------------ */

export const DISTRIBUTION_BUCKETS: {
  key: string;
  label: string;
  color: string;
}[] = [
  { key: "1-3", label: "Top 3", color: "#1D9E75" },
  { key: "4-7", label: "4–7", color: "#EAB308" },
  { key: "8-20", label: "8–20", color: "#EF9F27" },
  { key: "20+", label: "20+ / absent", color: "#A32D2D" },
];

export function distributionCounts(
  snapshot: SnapshotData,
): { key: string; label: string; color: string; count: number; pct: number }[] {
  const total = Math.max(1, snapshot.total_pins);
  return DISTRIBUTION_BUCKETS.map((b) => {
    const count = snapshot.position_distribution[b.key] ?? 0;
    return { ...b, count, pct: (count / total) * 100 };
  });
}

export function top3Pct(snapshot: SnapshotData): number {
  const top = snapshot.position_distribution["1-3"] ?? 0;
  return (top / Math.max(1, snapshot.total_pins)) * 100;
}
