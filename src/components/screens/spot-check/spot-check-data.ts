import type { DataSource } from "@/lib/data/types";
import { surfaceMixCost, type AISurface } from "@/lib/surfaces";

export interface EvidenceResult {
  prompt: string;
  surface: string;
  cited: boolean | "partial";
  source_cited: string | null;
  snippet: string;
  checked_at: string;
  cost: number;
  source: DataSource;
}

export interface EvidenceLocation {
  slug: string;
  name: string;
  city: string;
  state: string;
  domain: string | null;
  prompts: string[];
  results: EvidenceResult[];
}

export interface SpotResult {
  surface: string;
  cited: boolean | "partial";
  sourceCited: string | null;
  citedDomains: string[];
  snippet: string;
  checkedAt: string;
  cost: number;
  source: DataSource;
  real: boolean;
  responseMs: number;
}

export type DotStatus = "us" | "partial" | "competitor" | "notrun";

export interface RecentCheck {
  id: string;
  prompt: string;
  city: string;
  state: string;
  surfaces: string[];
  cost: number;
  citedCount: number;
  total: number;
  at: string;
  statuses: Record<string, DotStatus>;
  session: boolean;
}

export function hashStr(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

export const CO_CITED_POOL = [
  "healthgrades.com",
  "yelp.com",
  "webmd.com",
  "vitals.com",
  "zocdoc.com",
  "mayoclinic.org",
] as const;

function dedupe(list: string[]): string[] {
  return [...new Set(list)];
}

const CITED_SNIPPETS: Array<(place: string) => string> = [
  (place) =>
    `For this search in ${place}, Baptist Medical Group appears among the top recommended options (baptistmedicalclinic.org), noted for same-week availability and board-certified providers. Directory profiles on healthgrades.com corroborate the listing.`,
  (place) =>
    `Baptist Memorial Health Care operates several clinics serving ${place}; baptistmedicalclinic.org is cited directly as a source for hours, insurance participation and provider details in this answer.`,
  (place) =>
    `The answer names a Baptist clinic in ${place} as a strong option and links baptistmedicalclinic.org for scheduling, alongside third-party review context from national directories.`,
];

const PARTIAL_SNIPPETS: Array<(place: string) => string> = [
  (place) =>
    `A Baptist-affiliated provider near ${place} surfaces in this answer, but only through a third-party directory profile — the answer cites the directory, not a Baptist domain.`,
  (place) =>
    `The response mentions Baptist Medical Group in passing for ${place}, yet every linked source is a national directory; no Baptist-owned page is cited.`,
  (place) =>
    `Baptist appears inside an aggregator's "top providers" list for ${place}; the citation credit goes to the aggregator rather than baptistmedicalclinic.org.`,
];

const NOT_CITED_SNIPPETS: Array<(place: string) => string> = [
  (place) =>
    `Directory listings and national health publishers dominate this answer for ${place}; no Baptist location or domain is mentioned or cited.`,
  (place) =>
    `The answer for ${place} is built entirely from third-party review sites and general medical content — Baptist is absent from both the text and the source list.`,
  (place) =>
    `Competing providers surfaced via directories fill this response for ${place}. No Baptist mention; the citation slots go to aggregators.`,
];

export function simulateSpotResult(
  city: string,
  state: string,
  prompt: string,
  surface: AISurface,
): SpotResult {
  const key = `${city.trim().toLowerCase()}|${state.trim().toLowerCase()}|${prompt.trim().toLowerCase()}|${surface.id}`;
  const h = hashStr(key);
  const roll = h % 100;
  const cited: boolean | "partial" = roll < 24 ? true : roll < 48 ? "partial" : false;
  const place = state.trim() ? `${city.trim()}, ${state.trim()}` : city.trim();
  const pick = (shift: number) => CO_CITED_POOL[(h >>> shift) % CO_CITED_POOL.length];

  let sourceCited: string;
  let citedDomains: string[];
  let snippet: string;
  if (cited === true) {
    sourceCited = "baptistmedicalclinic.org";
    citedDomains = dedupe(["baptistmedicalclinic.org", pick(2), pick(7)]);
    snippet = CITED_SNIPPETS[h % CITED_SNIPPETS.length]!(place);
  } else if (cited === "partial") {
    sourceCited = pick(3);
    citedDomains = dedupe([pick(3), pick(9)]);
    snippet = PARTIAL_SNIPPETS[h % PARTIAL_SNIPPETS.length]!(place);
  } else {
    sourceCited = pick(4);
    citedDomains = dedupe([pick(4), pick(11), pick(17)]);
    snippet = NOT_CITED_SNIPPETS[h % NOT_CITED_SNIPPETS.length]!(place);
  }

  return {
    surface: surface.id,
    cited,
    sourceCited,
    citedDomains,
    snippet,
    checkedAt: new Date().toISOString(),
    cost: surface.cost,
    source: "synthetic",
    real: false,
    responseMs: 6000 + (h % 9000),
  };
}

export function replaySpotResult(r: EvidenceResult): SpotResult {
  const h = hashStr(`${r.prompt}|${r.surface}|replay`);
  return {
    surface: r.surface,
    cited: r.cited,
    sourceCited: r.source_cited,
    citedDomains: r.source_cited ? [r.source_cited] : [],
    snippet: r.snippet,
    checkedAt: r.checked_at,
    cost: r.cost,
    source: r.source,
    real: true,
    responseMs: 5000 + (h % 7000),
  };
}

export function fmtLatency(ms: number): string {
  const s = Math.round(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function dotStatusFor(result: SpotResult | undefined): DotStatus {
  if (!result) return "notrun";
  if (result.cited === true) return "us";
  if (result.cited === "partial") return "partial";
  return "competitor";
}

export const SUGGESTED_QUERIES = [
  "best family doctor in {city}",
  "walk in clinic near me open now",
  "do i need a referral for a rheumatologist",
  "pediatric ent {city}",
  "urgent care vs primary care",
  "flu shot cost without insurance",
  "best orthopedic surgeon near me",
  "emergency room wait times {city}",
] as const;

export const SEED_CHECK_COUNT = 12;
export const SEED_MONTH_SPEND = 0.84;

const ALL6 = ["perplexity", "chatgpt", "gemini", "claude", "ai-overviews", "ai-mode"];
const AFFORDABLE5 = ["perplexity", "chatgpt", "gemini", "claude", "ai-overviews"];
const CHATBOTS4 = ["perplexity", "chatgpt", "gemini", "claude"];

function seedRow(
  n: number,
  prompt: string,
  city: string,
  state: string,
  surfaces: string[],
  at: string,
  statuses: Record<string, DotStatus>,
): RecentCheck {
  return {
    id: `spot_${String(n).padStart(4, "0")}`,
    prompt,
    city,
    state,
    surfaces,
    cost: surfaceMixCost(surfaces),
    citedCount: Object.values(statuses).filter((s) => s === "us").length,
    total: surfaces.length,
    at,
    statuses,
    session: false,
  };
}

export const SEED_RECENT: RecentCheck[] = [
  seedRow(12, "best orthopedic surgeon near me", "Memphis", "TN", ALL6, "2026-07-12T09:42:00Z", {
    perplexity: "competitor",
    chatgpt: "us",
    gemini: "competitor",
    claude: "competitor",
    "ai-overviews": "us",
    "ai-mode": "competitor",
  }),
  seedRow(
    11,
    "pediatric ent Collierville",
    "Collierville",
    "TN",
    AFFORDABLE5,
    "2026-07-08T14:18:00Z",
    {
      perplexity: "us",
      chatgpt: "us",
      gemini: "competitor",
      claude: "us",
      "ai-overviews": "competitor",
      "ai-mode": "notrun",
    },
  ),
  seedRow(10, "urgent care vs primary care", "Southaven", "MS", CHATBOTS4, "2026-07-04T09:12:00Z", {
    perplexity: "competitor",
    chatgpt: "competitor",
    gemini: "competitor",
    claude: "us",
    "ai-overviews": "notrun",
    "ai-mode": "notrun",
  }),
  seedRow(
    9,
    "physical therapy after knee surgery Oxford",
    "Oxford",
    "MS",
    AFFORDABLE5,
    "2026-06-29T16:08:00Z",
    {
      perplexity: "competitor",
      chatgpt: "us",
      gemini: "competitor",
      claude: "partial",
      "ai-overviews": "us",
      "ai-mode": "notrun",
    },
  ),
  seedRow(
    8,
    "do i need a referral for a rheumatologist",
    "Columbus",
    "MS",
    AFFORDABLE5,
    "2026-06-22T11:34:00Z",
    {
      perplexity: "us",
      chatgpt: "competitor",
      gemini: "competitor",
      claude: "us",
      "ai-overviews": "us",
      "ai-mode": "notrun",
    },
  ),
  seedRow(
    7,
    "flu shot cost without insurance",
    "Memphis",
    "TN",
    ["perplexity", "chatgpt", "gemini", "ai-overviews"],
    "2026-06-16T08:18:00Z",
    {
      perplexity: "competitor",
      chatgpt: "competitor",
      gemini: "competitor",
      claude: "notrun",
      "ai-overviews": "us",
      "ai-mode": "notrun",
    },
  ),
];
