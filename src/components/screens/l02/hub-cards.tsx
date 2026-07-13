import Link from "next/link";
import { Icons } from "@/lib/icons";
import { Card } from "@/components/ui/card";
import { DeltaPill } from "@/components/local/delta-pill";
import { SourceBadge } from "@/components/local/source-badge";
import { Sparkline } from "@/components/local/sparkline";
import { StatusPill } from "@/components/local/status-pill";
import {
  fmtInt,
  fmtPct,
  rankBand,
  RANK_BAND_COLOR,
  RANK_BAND_LABEL,
  type RankBand,
} from "@/lib/format";
import type { DataSource } from "@/lib/data/types";

export interface KeywordsCardStat {
  total: number;
  max: number;
  scanned: number;
  top: Array<{ keyword: string; avg: number | null }>;
  source: DataSource;
}

export interface GBPCardStat {
  status: "completed" | "processing" | "missing";
  score: number | null;
  grade?: string;
  gbpScore?: number | null;
  citationScore?: number | null;
  verified?: boolean;
  source: DataSource;
}

export interface GeoCardStat {
  avgRank: number | null;
  delta?: number;
  top3Pct: number | null;
  keywords: number;
  pins: number;
  dist: Record<RankBand, number> | null;
  source: DataSource;
}

export interface CitationsCardStat {
  present: number;
  mismatch: number;
  missing: number;
  duplicate: number;
  total: number;
  source: DataSource;
}

export interface ReviewsCardStat {
  avg: number | null;
  total: number;
  responseRate: number;
  unanswered: number;
  monthlyAvgSpark: number[];
  source: DataSource;
}

export interface LocalAICardStat {
  chatbotCited: number;
  chatbotTotal: number;
  googleCited: number;
  googleTotal: number;
  bestSurface?: { name: string; cited: number; total: number };
  source: DataSource;
}

export interface CompetitiveCardStat {
  topRival?: string;
  topRivalWins?: number;
  rivalCount: number;
  closest?: { name: string; mi: number };
  source: DataSource;
}

function HubCard({
  href,
  title,
  ariaLabel,
  source,
  footer,
  children,
}: {
  href: string;
  title: string;
  ariaLabel: string;
  source: DataSource;
  footer: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className="group block h-full rounded-lg outline-none"
    >
      <Card className="group-hover:border-border-emphasis group-focus-visible:border-cta-500 h-full gap-3 p-5 transition-colors">
        <div className="flex items-start justify-between gap-2">
          <p className="eyebrow text-text-tertiary">{title}</p>
          <SourceBadge source={source} />
        </div>
        <div className="flex-1 space-y-2.5">{children}</div>
        <p className="text-text-link text-[13px] font-medium">{footer} →</p>
      </Card>
    </Link>
  );
}

function BandBar({
  segments,
  ariaLabel,
}: {
  segments: Array<{ label: string; count: number; color: string }>;
  ariaLabel: string;
}) {
  const total = segments.reduce((s, x) => s + x.count, 0);
  if (total === 0) return null;
  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className="bg-secondary flex h-2 w-full overflow-hidden rounded-full"
    >
      {segments
        .filter((s) => s.count > 0)
        .map((s) => (
          <div
            key={s.label}
            style={{ width: `${(s.count / total) * 100}%`, background: s.color }}
          />
        ))}
    </div>
  );
}

export function HubCards({
  slug,
  gbp,
  geo,
  citations,
  reviews,
  localAI,
  competitive,
  keywords,
}: {
  slug: string;
  gbp: GBPCardStat;
  geo: GeoCardStat;
  citations: CitationsCardStat;
  reviews: ReviewsCardStat;
  localAI: LocalAICardStat;
  competitive: CompetitiveCardStat;
  keywords?: KeywordsCardStat;
}) {
  const base = `/locations/${slug}`;
  const rankOrder: RankBand[] = ["top", "mid", "low", "out"];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <HubCard
        href={`${base}/gbp-health`}
        title="GBP Health"
        ariaLabel="Open GBP Health audit"
        source={gbp.source}
        footer="Open GBP Health"
      >
        {gbp.status === "completed" && gbp.score != null ? (
          <>
            <p className="num text-primary-800 dark:text-foreground text-[28px] leading-none font-bold">
              {gbp.score}
              <span className="text-text-tertiary text-[16px] font-medium">/100</span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {gbp.grade ? (
                <StatusPill
                  tone={gbp.score >= 80 ? "success" : gbp.score >= 50 ? "warning" : "error"}
                >
                  {gbp.grade}
                </StatusPill>
              ) : null}
              {gbp.verified ? (
                <StatusPill tone="success">Verified</StatusPill>
              ) : (
                <StatusPill tone="neutral">Not verified</StatusPill>
              )}
            </div>
            <p className="text-text-tertiary text-[12px]">
              GBP <span className="num">{gbp.gbpScore ?? "—"}</span> · Citations{" "}
              <span className="num">{gbp.citationScore ?? "—"}</span>
            </p>
          </>
        ) : gbp.status === "processing" ? (
          <>
            <StatusPill tone="info">Audit processing</StatusPill>
            <p className="text-text-secondary text-[13px]">
              Search Atlas is still crawling this profile — the 16-point scorecard lands when it
              completes.
            </p>
          </>
        ) : (
          <p className="text-text-secondary text-[13px]">
            No audit yet — run the first location audit to score this profile.
          </p>
        )}
      </HubCard>

      <HubCard
        href={`${base}/geo-grid`}
        title="Geo-Grid Rank"
        ariaLabel="Open Geo-Grid scanner"
        source={geo.source}
        footer="Open Geo-Grid"
      >
        {geo.avgRank != null ? (
          <>
            <p className="num text-primary-800 dark:text-foreground text-[28px] leading-none font-bold">
              {geo.avgRank.toFixed(1)}
              <span className="text-text-tertiary text-[16px] font-medium"> avg rank</span>
            </p>
            {typeof geo.delta === "number" ? (
              <DeltaPill
                delta={geo.delta}
                label="vs last scan"
                goodDirection="down"
              />
            ) : null}
            {geo.dist ? (
              <BandBar
                ariaLabel={`Rank distribution across ${geo.pins} grid pins`}
                segments={rankOrder.map((b) => ({
                  label: RANK_BAND_LABEL[b],
                  count: geo.dist?.[b] ?? 0,
                  color: RANK_BAND_COLOR[b],
                }))}
              />
            ) : null}
            <p className="text-text-tertiary text-[12px]">
              <span className="num">{fmtPct(geo.top3Pct ?? 0)}</span> top-3 ·{" "}
              <span className="num">{geo.keywords}</span> keywords ·{" "}
              <span className="num">{geo.pins}</span>-pin grid
            </p>
          </>
        ) : (
          <p className="text-text-secondary text-[13px]">
            No grid scans yet — the first weekly scan populates this card.
          </p>
        )}
      </HubCard>

      <HubCard
        href={`${base}/citations`}
        title="Citations & NAP"
        ariaLabel="Open Citation tracker"
        source={citations.source}
        footer="Open Citations"
      >
        {citations.total > 0 ? (
          <>
            <p className="num text-primary-800 dark:text-foreground text-[28px] leading-none font-bold">
              {citations.present}
              <span className="text-text-tertiary text-[16px] font-medium">
                /{citations.total} listed
              </span>
            </p>
            <BandBar
              ariaLabel={`Citation status across ${citations.total} directories: ${citations.present} present, ${citations.mismatch} mismatched, ${citations.missing} missing, ${citations.duplicate} duplicate`}
              segments={[
                {
                  label: "present",
                  count: citations.present,
                  color: "var(--color-success-500)",
                },
                {
                  label: "mismatch",
                  count: citations.mismatch,
                  color: "var(--color-warning-500)",
                },
                {
                  label: "missing",
                  count: citations.missing,
                  color: "var(--color-error-500)",
                },
                {
                  label: "duplicate",
                  count: citations.duplicate,
                  color: "var(--color-neutral-400)",
                },
              ]}
            />
            <div className="flex flex-wrap gap-1.5">
              {citations.mismatch > 0 ? (
                <StatusPill tone="error">
                  <span className="num">{citations.mismatch}</span>&nbsp;mismatch
                </StatusPill>
              ) : null}
              {citations.missing > 0 ? (
                <StatusPill tone="warning">
                  <span className="num">{citations.missing}</span>&nbsp;missing
                </StatusPill>
              ) : null}
              {citations.mismatch === 0 && citations.missing === 0 ? (
                <StatusPill tone="success">All consistent</StatusPill>
              ) : null}
            </div>
          </>
        ) : (
          <p className="text-text-secondary text-[13px]">No citation scan yet for this location.</p>
        )}
      </HubCard>

      <HubCard
        href={`${base}/reviews`}
        title="Reviews"
        ariaLabel="Open Review response workspace"
        source={reviews.source}
        footer="Open Reviews"
      >
        {reviews.total > 0 && reviews.avg != null ? (
          <>
            <p className="num text-primary-800 dark:text-foreground flex items-center gap-1.5 text-[28px] leading-none font-bold">
              {reviews.avg.toFixed(1)}
              <Icons.star
                className="fill-warning-500 text-warning-500 size-5"
                aria-hidden
              />
              <span className="text-text-tertiary text-[16px] font-medium">
                · {fmtInt(reviews.total)} reviews
              </span>
            </p>
            {reviews.monthlyAvgSpark.length > 1 ? (
              <Sparkline
                data={reviews.monthlyAvgSpark}
                height={32}
                ariaLabel="Monthly average rating trend"
              />
            ) : null}
            <p className="text-text-tertiary text-[12px]">
              <span className="num">{fmtPct(reviews.responseRate)}</span> response rate ·{" "}
              <span className="num">{reviews.unanswered}</span> unanswered (recent)
            </p>
          </>
        ) : (
          <>
            <StatusPill tone="neutral">No reviews yet</StatusPill>
            <p className="text-text-secondary text-[13px]">
              This profile has zero public Google reviews — a review-generation play is the fastest
              lift here.
            </p>
          </>
        )}
      </HubCard>

      <HubCard
        href={`${base}/local-ai`}
        title="Local AI Visibility"
        ariaLabel="Open Local AI visibility"
        source={localAI.source}
        footer="Open Local AI"
      >
        {localAI.chatbotTotal + localAI.googleTotal > 0 ? (
          <>
            <div className="flex items-center gap-4">
              <div>
                <p className="num text-primary-800 dark:text-foreground text-[24px] leading-none font-bold">
                  {localAI.chatbotCited}
                  <span className="text-text-tertiary text-[14px] font-medium">
                    /{localAI.chatbotTotal}
                  </span>
                </p>
                <p className="eyebrow text-text-tertiary mt-1">Chatbots</p>
              </div>
              <div
                aria-hidden
                className="bg-border h-10 w-px"
              />
              <div>
                <p className="num text-primary-800 dark:text-foreground text-[24px] leading-none font-bold">
                  {localAI.googleCited}
                  <span className="text-text-tertiary text-[14px] font-medium">
                    /{localAI.googleTotal}
                  </span>
                </p>
                <p className="eyebrow text-text-tertiary mt-1">Google AI</p>
              </div>
            </div>
            <p className="text-text-tertiary text-[12px]">
              Checks cited, reported per group — chatbot and Google-AI results are never averaged.
              {localAI.bestSurface ? (
                <>
                  {" "}
                  Best: {localAI.bestSurface.name} (
                  <span className="num">
                    {localAI.bestSurface.cited}/{localAI.bestSurface.total}
                  </span>
                  ).
                </>
              ) : null}
            </p>
          </>
        ) : (
          <p className="text-text-secondary text-[13px]">
            No AI surface checks yet for this location.
          </p>
        )}
      </HubCard>

      <HubCard
        href={`${base}/competitive`}
        title="Local Competitive"
        ariaLabel="Open Local competitive intelligence"
        source={competitive.source}
        footer="Open Competitive"
      >
        {competitive.topRival ? (
          <>
            <p
              className="text-primary-800 dark:text-foreground truncate text-[18px] leading-snug font-semibold"
              title={competitive.topRival}
            >
              {competitive.topRival}
            </p>
            <div className="flex flex-wrap gap-1.5">
              <StatusPill tone="warning">
                Top rival
                {typeof competitive.topRivalWins === "number" ? (
                  <>
                    &nbsp;·&nbsp;
                    <span className="num">{competitive.topRivalWins}</span>
                    &nbsp;map-pack wins
                  </>
                ) : null}
              </StatusPill>
            </div>
            <p className="text-text-tertiary text-[12px]">
              <span className="num">{competitive.rivalCount}</span> rivals tracked
              {competitive.closest ? (
                <>
                  {" "}
                  · closest {competitive.closest.name} (
                  <span className="num">{competitive.closest.mi.toFixed(1)}</span> mi)
                </>
              ) : null}
            </p>
          </>
        ) : (
          <p className="text-text-secondary text-[13px]">
            No competitors tracked yet for this market.
          </p>
        )}
      </HubCard>

      {keywords && (
        <HubCard
          href={`${base}/keywords`}
          title="Keywords Tracked"
          ariaLabel="Open Keywords Manager"
          source={keywords.source}
          footer="Manage keywords"
        >
          <p className="num text-primary-800 dark:text-foreground text-[28px] leading-none font-bold">
            {keywords.total}
            <span className="text-text-tertiary text-[16px] font-medium">/{keywords.max}</span>
          </p>
          <p className="text-text-tertiary text-[12px]">
            <span className="num">{keywords.scanned}</span> scanned on the geo-grid ·{" "}
            <span className="num">{keywords.total - keywords.scanned}</span> awaiting first scan
          </p>
          <div className="flex flex-wrap gap-1.5">
            {keywords.top.map((k) => (
              <span
                key={k.keyword}
                className="border-border bg-card text-text-secondary flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11.5px] font-medium"
              >
                <span className="max-w-40 truncate">{k.keyword}</span>
                {k.avg != null && k.avg > 0 && (
                  <span
                    className="num rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white"
                    style={{
                      background: RANK_BAND_COLOR[rankBand(Math.round(k.avg))],
                    }}
                  >
                    {k.avg.toFixed(1)}
                  </span>
                )}
              </span>
            ))}
          </div>
        </HubCard>
      )}
    </div>
  );
}
