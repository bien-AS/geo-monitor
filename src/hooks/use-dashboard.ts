"use client";

import { useMemo } from "react";
import { shortLocationName } from "@/lib/location-names";
import { SURFACES } from "@/lib/surfaces";
import { fmtDate } from "@/lib/format";
import type { LVIBand } from "@/lib/lvi";
import { LVI_BAND_LABEL } from "@/lib/lvi";
import type { FleetPin } from "@/components/maps/fleet-map";
import type {
  BaptistLocation,
  GeoGridFixture,
  LocalAIFixture,
  ReviewsFixture,
  CitationsFixture,
  GBPAuditFixture,
  GridPreviewFixture,
  LVIData,
  NAPData,
  AuditLogEntry,
  AddableCandidate,
} from "@/lib/data/types";
import type {
  L01AlertItem,
  L01BandRow,
  L01LocationCardData,
  L01Mover,
  L01SurfaceStat,
  L01TrendPoint,
} from "@/components/screens/l01/types";

import {
  DASHBOARD_LOCATIONS,
  DASHBOARD_LVI,
  DASHBOARD_NAP,
  DASHBOARD_AUDIT_LOG,
  DASHBOARD_ADDABLE,
  DASHBOARD_REVIEWS,
  DASHBOARD_CITATIONS,
  DASHBOARD_LOCAL_AI,
  DASHBOARD_GBP_AUDITS,
  DASHBOARD_GEO_GRIDS,
  DASHBOARD_GRID_PREVIEWS,
} from "@/lib/data/fixtures";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function citedWeight(cited: boolean | "partial"): number {
  return cited === true ? 1 : cited === "partial" ? 0.5 : 0;
}

function median(values: number[]): number {
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : Math.round((s[mid - 1] + s[mid]) / 2);
}

interface PerLocation {
  loc: BaptistLocation;
  reviews: ReviewsFixture | null;
  citations: CitationsFixture | null;
  localAI: LocalAIFixture | null;
  gbpAudit: GBPAuditFixture | null;
  grids: GeoGridFixture[];
  gridPreview: GridPreviewFixture | null;
}

export interface DashboardData {
  locations: BaptistLocation[];
  snapshotDate: string;
  listingCounts: { facility: number; department: number; practitioner: number };
  atRiskOrWorse: number;
  portfolioValue: number;
  portfolioBand: LVIBand;
  portfolioDelta: number;
  bands: L01BandRow[];
  up: L01Mover[];
  down: L01Mover[];
  insights: string;
  trendPoints: L01TrendPoint[];
  top3Pct: number;
  prevTop3Pct: number | null;
  gridsTop3: number;
  gridsWithAvg: number;
  fleetRating: number | null;
  fleetResponseRate: number | null;
  reviewTotal: number;
  zeroReviewCount: number;
  ratingSpark: number[];
  aiSharePct: number;
  aiCited: number;
  aiPartial: number;
  aiRows: number;
  surfaceStats: L01SurfaceStat[];
  chatbotPct: number;
  googlePct: number;
  alerts: L01AlertItem[];
  cards: L01LocationCardData[];
  pins: FleetPin[];
  auditEntries: AuditLogEntry[];
  addableCandidates: AddableCandidate[];
  auditCostUsd: number;
  promptCount: number;
  keywordGrids: number;
  rankChecks: number;
}

function compute(deps: {
  locations: BaptistLocation[];
  lviFile: LVIData;
  napFile: NAPData;
  auditLog: AuditLogEntry[];
  addable: AddableCandidate[];
  reviewsMap: Record<string, ReviewsFixture | undefined>;
  citationsMap: Record<string, CitationsFixture | undefined>;
  localAIMap: Record<string, LocalAIFixture | undefined>;
  gbpAuditsMap: Record<string, GBPAuditFixture | undefined>;
  geoGridsMap: Record<string, GeoGridFixture[] | undefined>;
  gridPreviewsMap: Record<string, GridPreviewFixture | undefined>;
}): DashboardData {
  const {
    locations,
    lviFile,
    napFile,
    auditLog,
    addable,
    reviewsMap,
    citationsMap,
    localAIMap,
    gbpAuditsMap,
    geoGridsMap,
    gridPreviewsMap,
  } = deps;

  const perLocation: PerLocation[] = locations.map((loc) => ({
    loc,
    reviews: reviewsMap[loc.slug] ?? null,
    citations: citationsMap[loc.slug] ?? null,
    localAI: localAIMap[loc.slug] ?? null,
    gbpAudit: gbpAuditsMap[loc.slug] ?? null,
    grids: geoGridsMap[loc.slug] ?? [],
    gridPreview: gridPreviewsMap[loc.slug] ?? null,
  }));

  const portfolio = lviFile?.portfolio ?? {
    value: 0,
    band: "critical" as LVIBand,
    delta: 0,
    spark: [] as number[],
  };
  const lviBySlug = lviFile?.locations ?? {};
  const snapshotDate = fmtDate(lviFile?.generated_at ?? new Date().toISOString());

  const bandOrder: LVIBand[] = ["elite", "healthy", "at-risk", "critical"];
  const bandCounts = new Map<LVIBand, number>(bandOrder.map((b) => [b, 0]));
  for (const loc of locations) {
    const v = lviBySlug[loc.slug];
    if (v) bandCounts.set(v.band, (bandCounts.get(v.band) ?? 0) + 1);
  }
  const bands: L01BandRow[] = bandOrder.map((band) => ({
    band,
    label: LVI_BAND_LABEL[band],
    count: bandCounts.get(band) ?? 0,
    pct: locations.length ? Math.round(((bandCounts.get(band) ?? 0) / locations.length) * 100) : 0,
  }));

  const toMover = (loc: BaptistLocation): L01Mover | null => {
    const v = lviBySlug[loc.slug];
    if (!v) return null;
    return {
      slug: loc.slug,
      shortName: shortLocationName(loc.name),
      city: `${loc.city}, ${loc.state}`,
      lvi: v.value,
      band: v.band,
      delta: v.delta,
      spark: v.spark,
    };
  };
  const movers: L01Mover[] = locations.map(toMover).filter((m): m is L01Mover => m !== null);
  const up: L01Mover[] = [...movers]
    .filter((m) => m.delta > 0)
    .sort((a, b) => b.delta - a.delta || b.lvi - a.lvi)
    .slice(0, 3);
  const down: L01Mover[] = [...movers]
    .filter((m) => m.delta < 0)
    .sort((a, b) => a.delta - b.delta || a.lvi - b.lvi)
    .slice(0, 3);

  const sparkLen = portfolio.spark.length;
  const genDate = new Date(lviFile?.generated_at ?? Date.now());
  const trendPoints: L01TrendPoint[] = portfolio.spark.map((v: number, i: number) => {
    const d = new Date(genDate);
    d.setMonth(d.getMonth() - (sparkLen - 1 - i));
    const perIndex: number[] = movers
      .map((m) => m.spark[i])
      .filter((x): x is number => typeof x === "number");
    return {
      month: MONTHS[d.getMonth()],
      portfolio: v,
      median: perIndex.length ? median(perIndex) : v,
    };
  });

  const allGrids: GeoGridFixture[] = perLocation.flatMap((p) => p.grids);
  let gridsWithAvg = 0;
  let gridsTop3 = 0;
  let prevWithAvg = 0;
  let prevTop3 = 0;
  for (const g of allGrids) {
    const latest = g.snapshots[g.snapshots.length - 1];
    const latestAvg = latest?.avg_rank;
    if (typeof latestAvg === "number") {
      gridsWithAvg++;
      if (latestAvg <= 3) gridsTop3++;
    }
    const prev = g.snapshots[g.snapshots.length - 2];
    const prevAvg = prev?.avg_rank;
    if (typeof prevAvg === "number") {
      prevWithAvg++;
      if (prevAvg <= 3) prevTop3++;
    }
  }
  const top3Pct = gridsWithAvg ? Math.round((gridsTop3 / gridsWithAvg) * 100) : 0;
  const prevTop3Pct = prevWithAvg ? Math.round((prevTop3 / prevWithAvg) * 100) : null;

  let ratingWeighted = 0;
  let ratingCount = 0;
  let responseWeighted = 0;
  let reviewTotal = 0;
  let zeroReviewCount = 0;
  const monthly = new Map<string, { count: number; sum: number }>();
  for (const { reviews } of perLocation) {
    const s = reviews?.summary;
    if (!s) continue;
    reviewTotal += s.total;
    if (s.avg_rating != null && s.total > 0) {
      ratingWeighted += s.avg_rating * s.total;
      ratingCount += s.total;
      responseWeighted += s.response_rate * s.total;
    } else {
      zeroReviewCount++;
    }
    for (const [month, m] of Object.entries(s.monthly ?? {})) {
      const agg = monthly.get(month) ?? { count: 0, sum: 0 };
      agg.count += m.count;
      agg.sum += m.avg * m.count;
      monthly.set(month, agg);
    }
  }
  const fleetRating = ratingCount ? ratingWeighted / ratingCount : null;
  const fleetResponseRate = ratingCount ? Math.round(responseWeighted / ratingCount) : null;
  const ratingSpark = [...monthly.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => Number((v.sum / v.count).toFixed(2)));

  const surfaceAgg = new Map<
    string,
    { cited: number; partial: number; total: number; weight: number }
  >();
  let aiRows = 0;
  let aiWeight = 0;
  let aiCited = 0;
  let aiPartial = 0;
  let promptCount = 0;
  const aiPctBySlug = new Map<string, number>();
  for (const { loc, localAI } of perLocation) {
    const fixture = localAI;
    if (!fixture) continue;
    promptCount = Math.max(promptCount, fixture.prompts.length);
    let locWeight = 0;
    for (const r of fixture.results) {
      const w = citedWeight(r.cited);
      aiRows++;
      aiWeight += w;
      locWeight += w;
      if (r.cited === true) aiCited++;
      if (r.cited === "partial") aiPartial++;
      const agg = surfaceAgg.get(r.surface) ?? {
        cited: 0,
        partial: 0,
        total: 0,
        weight: 0,
      };
      agg.total++;
      agg.weight += w;
      if (r.cited === true) agg.cited++;
      if (r.cited === "partial") agg.partial++;
      surfaceAgg.set(r.surface, agg);
    }
    aiPctBySlug.set(
      loc.slug,
      fixture.results.length ? Math.round((locWeight / fixture.results.length) * 100) : 0,
    );
  }
  const aiSharePct = aiRows ? Math.round((aiWeight / aiRows) * 100) : 0;
  const surfaceStats: L01SurfaceStat[] = SURFACES.map((s) => {
    const agg = surfaceAgg.get(s.id);
    return {
      id: s.id,
      pct: agg?.total ? (agg.weight / agg.total) * 100 : 0,
      cited: agg?.cited ?? 0,
      partial: agg?.partial ?? 0,
      total: agg?.total ?? 0,
    };
  });
  const groupPct = (category: "chatbot" | "search-feature"): number => {
    const ids = SURFACES.filter((s) => s.category === category).map((s) => s.id);
    let w = 0;
    let n = 0;
    for (const id of ids) {
      const agg = surfaceAgg.get(id);
      if (agg) {
        w += agg.weight;
        n += agg.total;
      }
    }
    return n ? Math.round((w / n) * 100) : 0;
  };

  const openDrifts = (napFile?.drifts ?? []).filter((d) => d.status === "open");
  const openDriftSlugs = new Set(openDrifts.map((d) => d.slug));
  const worstDriftSlug = openDrifts[0]?.slug;

  const processingAudits = perLocation.filter((p) => p.gbpAudit?.audit_status === "processing");
  const completedAudits = perLocation.length - processingAudits.length;
  const pilotProcessing = processingAudits[0];

  let handoffCount = 0;
  let handoffSlug: string | null = null;
  let unansweredNegative = 0;
  for (const { loc, reviews } of perLocation) {
    for (const r of reviews?.reviews ?? []) {
      if (r.status === "handoff") {
        handoffCount++;
        handoffSlug = handoffSlug ?? loc.slug;
      }
      if (r.status === "unanswered" && r.rating <= 2) unansweredNegative++;
    }
  }

  const worstMover = down[0];
  const alerts: L01AlertItem[] = [
    {
      id: "reviews",
      eyebrow: "Reviews · critical",
      tone: "error",
      count: String(handoffCount),
      line: "1★ critical review in patient-relations handoff at Carthage Primary Care.",
      secondary: `${unansweredNegative} unanswered 1–2★ reviews fleet-wide`,
      href: `/locations/${handoffSlug ?? locations[0]?.slug}/reviews`,
      linkLabel: "Open review workspace",
    },
    {
      id: "nap",
      eyebrow: "NAP drift · open",
      tone: "warning",
      count: String(openDrifts.length),
      line: `Open drifts across ${openDriftSlugs.size} locations — worst: Golden Triangle, a live Google address typo ("Columbia").`,
      secondary: `${openDrifts[0]?.severity ?? "moderate"} severity · detected ${openDrifts[0]?.detected_at ?? "—"}`,
      href: `/locations/${worstDriftSlug ?? locations[0]?.slug}/citations`,
      linkLabel: "Review NAP drift",
    },
    {
      id: "lvi",
      eyebrow: "LVI movers · slipping",
      tone: "warning",
      count: worstMover ? `${worstMover.delta}` : "0",
      line: worstMover
        ? `${worstMover.shortName} slipped most this cycle${
            down.length > 1
              ? ` · ${down
                  .slice(1)
                  .map((m) => `${m.shortName} ${m.delta}`)
                  .join(" · ")}`
              : ""
          }.`
        : "No locations slipped this cycle.",
      secondary: `${down.length} locations declined vs last cycle`,
      href: `/locations/${worstMover?.slug ?? locations[0]?.slug}`,
      linkLabel: "Open location overview",
    },
    {
      id: "audits",
      eyebrow: "GBP audits · processing",
      tone: "info",
      count: String(processingAudits.length),
      line: `of ${locations.length} fleet audits still processing at Search Atlas — scores land as they complete.`,
      secondary: `${completedAudits} completed · pilot report refreshing`,
      href: `/locations/${pilotProcessing?.loc.slug ?? locations[0]?.slug}/gbp-health`,
      linkLabel: "Open GBP health",
    },
  ];

  const cards: L01LocationCardData[] = perLocation
    .map(({ loc, grids, citations }): L01LocationCardData | null => {
      const v = lviBySlug[loc.slug];
      if (!v) return null;
      const avgs: number[] = grids
        .map((g) => g.snapshots[g.snapshots.length - 1]?.avg_rank)
        .filter((x): x is number => typeof x === "number");
      const citTotal = citations
        ? citations.breakdown.present +
          citations.breakdown.mismatch +
          citations.breakdown.missing +
          citations.breakdown.duplicate
        : 0;
      return {
        slug: loc.slug,
        shortName: shortLocationName(loc.name),
        city: loc.city,
        state: loc.state,
        listingType: loc.listing_type,
        lvi: v.value,
        band: v.band,
        delta: v.delta,
        spark: v.spark,
        gbpHealth: null,
        avgRank: avgs.length ? avgs.reduce((a, b) => a + b, 0) / avgs.length : null,
        citationsPct:
          citations && citTotal ? Math.round((citations.breakdown.present / citTotal) * 100) : null,
        rating: loc.rating?.value ?? null,
        ratingVotes: loc.rating?.votes_count ?? null,
        aiPct: aiPctBySlug.get(loc.slug) ?? null,
      };
    })
    .filter((c): c is L01LocationCardData => c !== null);

  const pins: FleetPin[] = locations
    .filter((l) => l.lat != null && l.lng != null)
    .map((l) => {
      const v = lviBySlug[l.slug];
      const topAlert =
        l.slug === "baptist-golden-triangle"
          ? "Open NAP drift — live Google address typo"
          : l.slug === handoffSlug
            ? "Critical review in patient-relations handoff"
            : undefined;
      return {
        slug: l.slug,
        name: l.name,
        city: `${l.city}, ${l.state}`,
        lat: l.lat as number,
        lng: l.lng as number,
        lvi: v?.value,
        band: v?.band,
        topAlert,
      };
    });

  const perPromptCost = SURFACES.reduce((s, x) => s + x.cost, 0);
  const auditCostUsd = locations.length * promptCount * perPromptCost;
  const rankChecks = perLocation.reduce((sum, p) => {
    if (p.gridPreview) {
      return sum + p.gridPreview.preview.pin_count * p.gridPreview.preview.keyword_count;
    }
    return sum + p.grids.length * 49;
  }, 0);

  const listingCounts = { facility: 0, department: 0, practitioner: 0 };
  for (const l of locations) {
    listingCounts[l.listing_type]++;
  }
  const atRiskOrWorse = (bandCounts.get("at-risk") ?? 0) + (bandCounts.get("critical") ?? 0);

  const insights = [
    `Portfolio LVI rose ${portfolio.delta >= 0 ? "+" : ""}${portfolio.delta} pts to ${portfolio.value} this cycle. `,
    `Map-pack coverage improved — top-3 share moved ${prevTop3Pct ?? "—"}% → ${top3Pct}% of keyword grids — but ${down.length} locations slipped, worst ${down[0]?.shortName ?? "—"} (${down[0]?.delta ?? 0}). `,
    `Golden Triangle's slide tracks a live Google address typo still open in NAP drift. `,
    `Local AI citation is the weakest fleet pillar at ${aiSharePct}%. `,
    `Reviews hold at ${fleetRating?.toFixed(1) ?? "—"}★ fleet-wide, but response rate sits at ${fleetResponseRate ?? "—"}%.`,
  ].join("");

  return {
    locations,
    snapshotDate,
    listingCounts,
    atRiskOrWorse,
    portfolioValue: portfolio.value,
    portfolioBand: portfolio.band,
    portfolioDelta: portfolio.delta,
    bands,
    up,
    down,
    insights,
    trendPoints,
    top3Pct,
    prevTop3Pct,
    gridsTop3,
    gridsWithAvg,
    fleetRating,
    fleetResponseRate,
    reviewTotal,
    zeroReviewCount,
    ratingSpark,
    aiSharePct,
    aiCited,
    aiPartial,
    aiRows,
    surfaceStats,
    chatbotPct: groupPct("chatbot"),
    googlePct: groupPct("search-feature"),
    alerts,
    cards,
    pins,
    auditEntries: auditLog,
    addableCandidates: addable,
    auditCostUsd,
    promptCount,
    keywordGrids: allGrids.length,
    rankChecks,
  };
}

export function useDashboard() {
  const data = useMemo(() => {
    return compute({
      locations: DASHBOARD_LOCATIONS as BaptistLocation[],
      lviFile: DASHBOARD_LVI as LVIData,
      napFile: DASHBOARD_NAP as NAPData,
      auditLog: DASHBOARD_AUDIT_LOG as AuditLogEntry[],
      addable: DASHBOARD_ADDABLE as AddableCandidate[],
      reviewsMap: DASHBOARD_REVIEWS as Record<string, ReviewsFixture | undefined>,
      citationsMap: DASHBOARD_CITATIONS as Record<string, CitationsFixture | undefined>,
      localAIMap: DASHBOARD_LOCAL_AI as Record<string, LocalAIFixture | undefined>,
      gbpAuditsMap: DASHBOARD_GBP_AUDITS as Record<string, GBPAuditFixture | undefined>,
      geoGridsMap: DASHBOARD_GEO_GRIDS as Record<string, GeoGridFixture[] | undefined>,
      gridPreviewsMap: DASHBOARD_GRID_PREVIEWS as Record<string, GridPreviewFixture | undefined>,
    });
  }, []);

  return { data, isLoading: false, error: null as Error | null };
}
