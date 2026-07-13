"use client";

import { useMemo } from "react";
import { shortLocationName } from "@/lib/location-names";
import {
  SURFACES,
  CHATBOT_SURFACES,
  SEARCH_FEATURE_SURFACES,
  surfaceById,
  surfaceMixCost,
} from "@/lib/surfaces";
import { rankBand, type RankBand } from "@/lib/format";
import type {
  BaptistLocation,
  LocationLVI,
  DataSource,
  ReviewsFixture,
  CitationsFixture,
  LocalAIFixture,
  GBPAuditFixture,
  GeoGridFixture,
  GridPreviewFixture,
  CompetitorsFixture,
  KeywordsFixture,
} from "@/lib/data/types";
import type { AttentionItem } from "@/components/screens/l02/alerts-strip";
import type { SurfaceStat } from "@/components/screens/l02/ai-surface-snapshot";
import type {
  GBPCardStat,
  GeoCardStat,
  CitationsCardStat,
  ReviewsCardStat,
  LocalAICardStat,
  CompetitiveCardStat,
  KeywordsCardStat,
} from "@/components/screens/l02/hub-cards";
import type { RunAuditCost } from "@/components/screens/l02/run-audit-button";

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
  DASHBOARD_COMPETITORS,
  DASHBOARD_KEYWORDS,
} from "@/lib/data/fixtures";

function meanRank(snapshots: GeoGridFixture["snapshots"]): number | null {
  const ranks = snapshots.map((s) => s.avg_rank).filter((r): r is number => r !== null && r > 0);
  if (ranks.length === 0) return null;
  return Math.round((ranks.reduce((sum, r) => sum + r, 0) / ranks.length) * 10) / 10;
}

export interface LocationOverviewData {
  location: BaptistLocation;
  shortName: string;
  lvi: LocationLVI | null;
  lviSource: DataSource;
  snapshotDate: string;
  navLocations: Array<{ slug: string; name: string; city: string }>;
  gbp: GBPCardStat;
  geo: GeoCardStat;
  citations: CitationsCardStat;
  reviews: ReviewsCardStat;
  localAI: LocalAICardStat;
  competitive: CompetitiveCardStat;
  keywords?: KeywordsCardStat;
  aiStats: Record<string, SurfaceStat>;
  aiSource: DataSource;
  attention: AttentionItem[];
  auditCost: RunAuditCost;
  portfolioLVI: number | string;
  fleetLocationCount: number;
}

function compute(slug: string): LocationOverviewData | null {
  const location = (DASHBOARD_LOCATIONS as BaptistLocation[]).find((l) => l.slug === slug);
  if (!location) return null;

  const shortName = shortLocationName(location.name);
  const lviFile = DASHBOARD_LVI;
  const lvi = lviFile.locations[slug] ?? null;
  const snapshotDate = lviFile.generated_at;
  const navLocations = (DASHBOARD_LOCATIONS as BaptistLocation[]).map((l) => ({
    slug: l.slug,
    name: l.name,
    city: l.city,
  }));

  const audit: GBPAuditFixture | null = DASHBOARD_GBP_AUDITS[slug] ?? null;
  const grids: GeoGridFixture[] = DASHBOARD_GEO_GRIDS[slug] ?? [];
  const gridPreview: GridPreviewFixture | null = DASHBOARD_GRID_PREVIEWS[slug] ?? null;
  const reviewsFx: ReviewsFixture | null = DASHBOARD_REVIEWS[slug] ?? null;
  const citationsFx: CitationsFixture | null = DASHBOARD_CITATIONS[slug] ?? null;
  const localAIFx: LocalAIFixture | null = DASHBOARD_LOCAL_AI[slug] ?? null;
  const competitorsFx: CompetitorsFixture | null = DASHBOARD_COMPETITORS[slug] ?? null;
  const keywordsFx: KeywordsFixture | null = DASHBOARD_KEYWORDS[slug] ?? null;
  const napFile = DASHBOARD_NAP;

  const latestSnaps = grids
    .map((g) => g.snapshots[g.snapshots.length - 1])
    .filter((s) => Boolean(s));
  const prevSnaps = grids.map((g) => g.snapshots[g.snapshots.length - 2]).filter((s) => Boolean(s));

  const avgRank = meanRank(latestSnaps);
  const prevAvgRank = meanRank(prevSnaps);
  const geoDelta =
    avgRank != null && prevAvgRank != null
      ? Math.round((avgRank - prevAvgRank) * 10) / 10
      : undefined;

  const top3Count = latestSnaps.filter(
    (s) => s.avg_rank != null && s.avg_rank > 0 && s.avg_rank <= 3,
  ).length;
  const top3Pct =
    latestSnaps.length > 0 ? Math.round((top3Count / latestSnaps.length) * 100) : null;

  const reviewList = reviewsFx?.reviews ?? [];
  const unanswered = reviewList.filter((r) => r.status === "unanswered").length;
  const criticalReviews = reviewList.filter((r) => r.sentiment === "critical").length;
  const monthlyAvgSpark = Object.entries(reviewsFx?.summary.monthly ?? {})
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => v.avg);

  const breakdown = citationsFx?.breakdown ?? {
    present: 0,
    mismatch: 0,
    missing: 0,
    duplicate: 0,
  };
  const citationTotal =
    breakdown.present + breakdown.mismatch + breakdown.missing + breakdown.duplicate;

  const openDrifts = (napFile?.drifts ?? []).filter(
    (d) => d.slug === slug && d.status !== "resolved",
  );
  const worstDriftCritical = openDrifts.some((d) => d.severity === "critical");

  const aiStats: Record<string, SurfaceStat> = {};
  for (const s of SURFACES) aiStats[s.id] = { cited: 0, partial: 0, total: 0 };
  for (const result of localAIFx?.results ?? []) {
    const stat = aiStats[result.surface];
    if (!stat) continue;
    stat.total += 1;
    if (result.cited === true) stat.cited += 1;
    else if (result.cited === "partial") stat.partial += 1;
  }
  const sumGroup = (ids: readonly string[]) =>
    ids.reduce(
      (acc, id) => ({
        cited: acc.cited + aiStats[id].cited,
        total: acc.total + aiStats[id].total,
      }),
      { cited: 0, total: 0 },
    );
  const chatbotGroup = sumGroup(CHATBOT_SURFACES.map((s) => s.id));
  const googleGroup = sumGroup(SEARCH_FEATURE_SURFACES.map((s) => s.id));
  const bestSurfaceId = SURFACES.map((s) => s.id)
    .filter((id) => aiStats[id].cited > 0)
    .sort((a, b) => aiStats[b].cited - aiStats[a].cited)[0];
  const bestSurface = bestSurfaceId
    ? {
        name: surfaceById(bestSurfaceId)?.name ?? bestSurfaceId,
        cited: aiStats[bestSurfaceId].cited,
        total: aiStats[bestSurfaceId].total,
      }
    : undefined;
  const aiSource: DataSource = "synthetic";

  const competitors = competitorsFx?.competitors ?? [];
  const withWins = competitors.filter((c) => typeof c.map_pack_wins === "number");
  const topRival =
    withWins.sort((a, b) => (b.map_pack_wins ?? 0) - (a.map_pack_wins ?? 0))[0] ?? competitors[0];
  const closest = competitors
    .filter((c) => typeof c.distance_mi === "number")
    .sort((a, b) => (a.distance_mi ?? 0) - (b.distance_mi ?? 0))[0];

  const pinCount = gridPreview?.preview.pin_count ?? 49;
  const keywordCount = gridPreview?.preview.keyword_count ?? grids.length;
  const gridCells = pinCount * keywordCount;
  const gridCost = gridCells * 0.0025;
  const promptCount = localAIFx?.prompts.length ?? 0;
  const aiPerPrompt = surfaceMixCost(SURFACES.map((s) => s.id));
  const aiCost = promptCount * aiPerPrompt;

  const keywordsStat: KeywordsCardStat | undefined = keywordsFx
    ? (() => {
        const gridAvgByKeyword = new Map(
          grids.map((g) => {
            const latest = g.snapshots[g.snapshots.length - 1];
            return [
              g.keyword,
              typeof latest?.avg_rank === "number" && latest.avg_rank > 0 ? latest.avg_rank : null,
            ] as const;
          }),
        );
        return {
          total: keywordsFx.keywords.length,
          max: keywordsFx.max_keywords,
          scanned: keywordsFx.keywords.filter((k) => k.status === "scanned").length,
          top: keywordsFx.keywords
            .filter((k) => k.status === "scanned")
            .slice(0, 3)
            .map((k) => ({
              keyword: k.keyword,
              avg: gridAvgByKeyword.get(k.keyword) ?? null,
            })),
          source: "synthetic" as const,
        };
      })()
    : undefined;

  const attention: AttentionItem[] = [];
  if (audit?.audit_status === "processing") {
    attention.push({
      tone: "info",
      href: `/locations/${slug}/gbp-health`,
      label: "GBP audit still processing — scores land when the crawl completes",
      ariaLabel: "GBP audit processing — open GBP Health",
    });
  }
  if (openDrifts.length > 0) {
    attention.push({
      tone: worstDriftCritical ? "error" : "warning",
      href: `/locations/${slug}/citations`,
      label: `${openDrifts.length} NAP drift${openDrifts.length === 1 ? "" : "s"} to review`,
      ariaLabel: `${openDrifts.length} NAP drifts to review — open citations`,
    });
  }
  if (criticalReviews > 0) {
    attention.push({
      tone: "error",
      href: `/locations/${slug}/reviews`,
      label: `${criticalReviews} critical review${criticalReviews === 1 ? "" : "s"} — patient relations lane`,
      ariaLabel: `${criticalReviews} critical reviews — open review workspace`,
    });
  }
  if (unanswered > 0) {
    attention.push({
      tone: "warning",
      href: `/locations/${slug}/reviews`,
      label: `${unanswered} review${unanswered === 1 ? "" : "s"} awaiting response`,
      ariaLabel: `${unanswered} reviews awaiting response — open review workspace`,
    });
  }

  const dist: Record<RankBand, number> = { top: 0, mid: 0, low: 0, out: 0 };
  for (const snap of latestSnaps) {
    if (snap.avg_rank != null && snap.avg_rank > 0) {
      dist[rankBand(snap.avg_rank)] += 1;
    } else {
      dist.out += 1;
    }
  }

  return {
    location,
    shortName,
    lvi,
    lviSource: "synthetic",
    snapshotDate,
    navLocations,
    gbp: {
      status:
        audit?.audit_status === "completed"
          ? "completed"
          : audit?.audit_status === "processing"
            ? "processing"
            : "missing",
      score: audit?.report?.overall_score ?? null,
      grade: audit?.report?.score_grade,
      gbpScore: audit?.report?.gbp_score ?? null,
      citationScore: audit?.report?.citation_score ?? null,
      verified: audit?.report?.is_verified,
      source: audit?.source ?? "synthetic",
    },
    geo: {
      avgRank,
      delta: geoDelta,
      top3Pct,
      keywords: grids.length,
      pins: pinCount,
      dist,
      source: grids[0]?.source ?? "synthetic",
    },
    citations: {
      ...breakdown,
      total: citationTotal,
      source: "synthetic" as const,
    },
    reviews: {
      avg: reviewsFx?.summary.avg_rating ?? null,
      total: reviewsFx?.summary.total ?? 0,
      responseRate: reviewsFx?.summary.response_rate ?? 0,
      unanswered,
      monthlyAvgSpark,
      source: "synthetic" as const,
    },
    localAI: {
      chatbotCited: chatbotGroup.cited,
      chatbotTotal: chatbotGroup.total,
      googleCited: googleGroup.cited,
      googleTotal: googleGroup.total,
      bestSurface,
      source: aiSource,
    },
    competitive: {
      topRival: topRival?.name,
      topRivalWins: topRival?.map_pack_wins,
      rivalCount: competitors.length,
      closest:
        closest && typeof closest.distance_mi === "number"
          ? { name: closest.name, mi: closest.distance_mi }
          : undefined,
      source: competitorsFx?.source ?? "synthetic",
    },
    keywords: keywordsStat,
    aiStats,
    aiSource,
    attention,
    auditCost: {
      gridCells,
      gridCost,
      promptCount,
      aiPerPrompt,
      aiCost,
      total: gridCost + aiCost,
    },
    portfolioLVI: lviFile?.portfolio.value ?? "—",
    fleetLocationCount: (DASHBOARD_LOCATIONS as BaptistLocation[]).length,
  };
}

export function useLocationOverview(slug: string) {
  const data = useMemo(() => compute(slug), [slug]);

  return {
    data,
    isLoading: false,
    error: null as Error | null,
  };
}
