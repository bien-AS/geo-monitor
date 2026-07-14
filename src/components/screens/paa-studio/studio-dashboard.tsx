"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronRight,
  FileText,
  ListChecks,
  MessageCircleQuestion,
  ScanSearch,
  Send,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusPill, type PillTone } from "@/components/local/status-pill";
import { useAuditLog } from "@/components/local/audit-log-store";
import { useRole } from "@/components/shell/role-store";
import { fmtDate } from "@/lib/format";
import { contentScore, scoreBand } from "@/lib/content-score";
import { htmlToMarkdown } from "@/lib/nw-score";
import { generatePackage, type PaaLocationCtx, type PaaOpportunity } from "@/lib/paa-articles";
import type { ArticleStatus, ContentArticle, PaaPoolItem, TermModel } from "@/lib/data/types";
import { usePaaStudio } from "@/store/paa-studio";

const normQ = (q: string) => q.toLowerCase().replace(/\?+$/, "").trim();

const STATUS_META: Record<ArticleStatus, { label: string; tone: PillTone }> = {
  brief: { label: "Brief", tone: "neutral" },
  drafting: { label: "Drafting", tone: "info" },
  optimizing: { label: "In review", tone: "warning" },
  ready: { label: "Approved", tone: "success" },
};

const PIPELINE_STEPS = [
  {
    icon: MessageCircleQuestion,
    title: "Patient question",
    desc: "Pulled from People-Also-Ask on this location's geo-grid keywords",
  },
  {
    icon: ScanSearch,
    title: "Competitor teardown",
    desc: "DataForSEO pulls the ranking pages; Firecrawl extracts what they actually say",
  },
  {
    icon: ListChecks,
    title: "Term model",
    desc: "The vocabulary the winners share, with usage targets (basic + extended terms)",
  },
  {
    icon: FileText,
    title: "Draft generated",
    desc: "Full article + GBP post, pre-scored against the competitor benchmark",
  },
  {
    icon: Send,
    title: "Review & publish",
    desc: "Edit in the NW-grade editor, approve — the post lands on the Posts board",
  },
] as const;

export function StudioDashboard({
  ctx,
  opportunities,
  fixtureArticles,
  bakedQueries = [],
  pool = [],
  modelsByQuery = {},
  rivals = [],
}: {
  ctx: PaaLocationCtx;
  opportunities: PaaOpportunity[];
  fixtureArticles: ContentArticle[];
  bakedQueries?: string[];
  pool?: PaaPoolItem[];
  modelsByQuery?: Record<string, TermModel>;
  rivals?: Array<{ domain: string; surface: string }>;
}) {
  const role = useRole();
  const router = useRouter();
  const params = useSearchParams();
  const addEntry = useAuditLog((s) => s.addEntry);
  const { packages, bodies, statuses, postPushed, addPackage } = usePaaStudio();
  const [generating, setGenerating] = React.useState<string | null>(null);
  const [visibleCount, setVisibleCount] = React.useState(4);
  const isBaked = React.useCallback(
    (q: string) => bakedQueries.includes(q.toLowerCase().replace(/\?+$/, "").trim()),
    [bakedQueries],
  );

  const sessionArticles = Object.values(packages)
    .filter((p) => p.article.location_slug === ctx.slug)
    .map((p) => p.article);
  const articles = [...sessionArticles, ...fixtureArticles];

  const answered = new Set(
    articles.map((a) => a.target_keyword.toLowerCase().replace(/\?+$/, "").trim()),
  );
  const SOURCE_LABEL: Record<string, string> = {
    serp_paa: "PAA",
    ai_overview: "AI Overview",
    ai_mode: "AI Mode",
  };
  const CITE_VERB: Record<string, string> = {
    serp_paa: "PAA answer cites",
    ai_overview: "AI Overview cites",
    ai_mode: "AI Mode cites",
  };
  const SURFACE_NAME: Record<string, string> = {
    "ai-overviews": "AI Overview",
    "ai-mode": "AI Mode",
    chatgpt: "ChatGPT",
    gemini: "Gemini",
    perplexity: "Perplexity",
    claude: "Claude",
  };
  const poolOpps: PaaOpportunity[] = pool.map((it, i) => {
    const fallback = rivals.length ? rivals[i % rivals.length] : null;
    return {
      id: `pool-${ctx.slug}-${i}`,
      question: it.question.endsWith("?") ? it.question : `${it.question}?`,
      sourceKeyword: it.seen_on_keyword,
      competitorDomain: it.rival_domain ?? fallback?.domain ?? null,
      surface: it.rival_domain
        ? (CITE_VERB[it.source_surface] ?? "AI cites")
        : (fallback?.surface ?? null),
      breadthNote: `captured live on the ${ctx.city} grid SERP`,
      related: [],
      surfaceSource: it.source_surface,
    };
  });
  const allOpps = (poolOpps.length ? poolOpps : opportunities).filter(
    (o) => !answered.has(normQ(o.question)),
  );
  const visibleOpps = allOpps.slice(0, visibleCount);

  const generate = React.useCallback(
    (opp: Pick<PaaOpportunity, "id" | "question" | "sourceKeyword" | "competitorDomain">) => {
      setGenerating(opp.id);
      toast.info("Pulling the ranking pages — DataForSEO SERP");
      window.setTimeout(() => {
        toast.info("Extracting competitor content — Firecrawl");
        window.setTimeout(() => {
          const model = modelsByQuery[normQ(opp.question)] ?? null;
          const pkg = generatePackage(opp, ctx, 0, model);
          addPackage(pkg);
          addEntry({
            actor: role === "operator" ? "Agency Operator" : "Baptist Viewer",
            role,
            verb: "create",
            action: `PAA article generated: "${pkg.article.title}"`,
            resource: `paa-studio:${pkg.article.id}`,
            location_slug: ctx.slug,
            detail:
              "Demo mode — template engine grounded in the Location Profile. Live: Claude Sonnet 5 (Vertex) writes with the term model in-prompt; the outperform gate re-runs post-draft (~$0.18/article).",
          });
          toast.success("Article generated", {
            description: isBaked(opp.question)
              ? "Scored against this query's live competitor model — opening the editor"
              : "Template model for now — live mode bakes this query automatically (SERP + extraction). Opening the editor",
          });
          setGenerating(null);
          router.push(`/locations/${ctx.slug}/paa-studio/${pkg.article.id}`);
        }, 1100);
      }, 500);
    },
    [ctx, addPackage, addEntry, router, modelsByQuery, isBaked, role],
  );

  const paaParam = params.get("paa");
  const handled = React.useRef(false);
  React.useEffect(() => {
    if (!paaParam || handled.current) return;
    handled.current = true;
    generate({
      id: `handoff-${paaParam.slice(0, 24)}`,
      question: paaParam,
      sourceKeyword: params.get("kw") ?? paaParam,
      competitorDomain: params.get("rival") ?? null,
    });
  }, [paaParam, params, generate]);

  const inReviewCount = articles.filter(
    (a) => (statuses[a.id] ?? a.status) === "optimizing",
  ).length;
  const approvedCount = articles.filter((a) => (statuses[a.id] ?? a.status) === "ready").length;
  const onBoardCount = articles.filter((a) => postPushed[a.id]).length;
  const stats = [
    {
      label: "Open opportunities",
      value: allOpps.length,
      hint: "PAA questions without an owned answer",
    },
    {
      label: "Articles in review",
      value: inReviewCount,
      hint: "Being optimized against the benchmark",
    },
    {
      label: "Approved",
      value: approvedCount,
      hint: "Scored, approved, ready to publish",
    },
    {
      label: "Posts on the board",
      value: onBoardCount,
      hint: "GBP posts pushed to the Posts board",
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <Card className="gap-3 p-5">
        <div>
          <h2 className="text-base font-semibold">From patient question to owned answer</h2>
          <p className="text-text-tertiary mt-0.5 text-[13px]">
            PAA Studio turns a People-Also-Ask box this location doesn&apos;t own into a scored
            article + GBP post — in five steps.
          </p>
        </div>
        <div className="flex flex-wrap items-stretch gap-x-1.5 gap-y-3">
          {PIPELINE_STEPS.map((s, i) => (
            <React.Fragment key={s.title}>
              {i > 0 && (
                <ChevronRight className="text-text-disabled hidden size-3.5 shrink-0 self-center sm:block" />
              )}
              <div className="min-w-[150px] flex-1 basis-40">
                <div className="flex items-center gap-1.5">
                  <span className="num bg-primary-50 text-primary-700 dark:bg-primary-700/25 dark:text-primary-100 flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold">
                    {i + 1}
                  </span>
                  <s.icon className="text-primary-500 size-3.5 shrink-0" />
                  <span className="text-[12.5px] font-semibold">{s.title}</span>
                </div>
                <p className="text-text-tertiary mt-1 text-[11.5px] leading-snug">{s.desc}</p>
              </div>
            </React.Fragment>
          ))}
        </div>
        <p className="border-border-subtle text-text-tertiary border-t pt-2.5 text-[12px]">
          Live pipeline: <span className="num">serp/google/organic</span> + Firecrawl extraction
          &middot; scoring benchmarks against the best-ranking competitor, not an arbitrary 100.
        </p>
      </Card>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {stats.map((s) => (
          <Card
            key={s.label}
            className="gap-0.5 p-4"
          >
            <p className="eyebrow text-text-tertiary">{s.label}</p>
            <p className="num text-[22px] font-bold">{s.value}</p>
            <p className="text-text-tertiary text-[11.5px]">{s.hint}</p>
          </Card>
        ))}
      </div>

      <Card className="gap-4 p-6">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <MessageCircleQuestion className="text-primary-500 size-4" />
              PAA opportunities
            </h2>
            <p className="text-text-tertiary mt-0.5 text-[13px]">
              Questions {ctx.city} patients ask Google — with the competitor source AI answers cite
              today. Generate turns one into a complete article + GBP post, pre-optimized.
            </p>
          </div>
        </div>
        <div className="divide-border-subtle flex flex-col divide-y">
          {visibleOpps.map((o) => (
            <div
              key={o.id}
              className="flex items-center gap-3 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] font-semibold">{o.question}</p>
                <p className="text-text-tertiary mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px]">
                  <span className="num">{o.sourceKeyword}</span>
                  <span>&middot; {o.breadthNote}</span>
                  {o.surfaceSource && (
                    <span className="border-primary-500/40 bg-primary-50 text-primary-700 dark:bg-primary-700/15 dark:text-primary-100 inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10.5px] font-medium">
                      {SOURCE_LABEL[o.surfaceSource] ?? o.surfaceSource}
                    </span>
                  )}
                  {isBaked(o.question) && (
                    <span className="border-success-500/40 text-success-700 dark:text-success-400 inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10.5px] font-medium">
                      Live model
                    </span>
                  )}
                  {o.competitorDomain && (
                    <span className="border-warning-500/40 text-warning-700 dark:text-warning-100 inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10.5px] font-medium">
                      {o.surface
                        ? o.surface.includes("cites")
                          ? o.surface
                          : `${SURFACE_NAME[o.surface] ?? o.surface} cites`
                        : "AI cites"}{" "}
                      <span className="num">{o.competitorDomain}</span>
                    </span>
                  )}
                </p>
                <p className="text-text-secondary mt-1 text-[12px] leading-snug">
                  {o.competitorDomain ? (
                    <>
                      Winning this PAA spot takes the answer verbatim + stronger local signals than{" "}
                      <span className="num">{o.competitorDomain}</span>.
                    </>
                  ) : (
                    <>
                      Winning this PAA spot takes answering it verbatim, near the top of a page
                      Google already trusts for the topic.
                    </>
                  )}
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => generate(o)}
                disabled={generating !== null}
              >
                <Sparkles className="size-3.5" />
                {generating === o.id ? "Generating…" : "Generate article"}
              </Button>
            </div>
          ))}
          {allOpps.length > visibleCount && (
            <div className="flex justify-center py-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setVisibleCount((c) => c + 4)}
              >
                Generate more PAA opportunities ({allOpps.length - visibleCount} more captured on
                this grid)
              </Button>
            </div>
          )}
          {allOpps.length > 0 && allOpps.length <= visibleCount && poolOpps.length > 0 && (
            <p className="text-text-tertiary py-2 text-center text-[11.5px]">
              Pool exhausted — the next grid scan cycle refreshes it with new PAA, AI Overview and
              AI Mode captures.
            </p>
          )}
          {allOpps.length === 0 && (
            <p className="text-text-tertiary py-6 text-center text-[13px]">
              No open PAA opportunities — new questions surface with each scan cycle.
            </p>
          )}
        </div>
      </Card>

      <div>
        <h2 className="text-base font-semibold">Articles</h2>
        <p className="text-text-tertiary mt-0.5 text-[13px]">
          Every draft is scored against its query&apos;s competitor benchmark — open one to
          optimize.
        </p>
      </div>
      <Card className="-mt-2 gap-0 overflow-hidden p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Article</TableHead>
              <TableHead className="text-center">Content score</TableHead>
              <TableHead className="text-right">Words</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>GBP post</TableHead>
              <TableHead className="text-right">Analysis date</TableHead>
              <TableHead className="w-8" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {articles.map((a) => {
              const savedBody = bodies[a.id] ?? a.body_md;
              const body = savedBody.trimStart().startsWith("<")
                ? htmlToMarkdown(savedBody)
                : savedBody;
              const status = statuses[a.id] ?? a.status;
              const score = contentScore(a, body);
              const words = body.trim() ? body.trim().split(/\s+/).length : 0;
              const band = scoreBand(score);
              return (
                <TableRow
                  key={a.id}
                  className="group relative"
                >
                  <TableCell>
                    <Link
                      href={`/locations/${ctx.slug}/paa-studio/${a.id}`}
                      className="font-medium after:absolute after:inset-0"
                    >
                      <span className="text-[13.5px]">{a.title}</span>
                    </Link>
                    <p className="num text-text-tertiary mt-0.5 text-[11.5px]">
                      {a.target_keyword}
                    </p>
                  </TableCell>
                  <TableCell className="text-center">
                    <span
                      className={`num inline-flex size-9 items-center justify-center rounded-md border text-[13px] font-bold ${
                        band === "success"
                          ? "border-success-500/40 bg-success-50 text-success-700 dark:bg-success-700/15 dark:text-success-400"
                          : band === "warning"
                            ? "border-warning-500/40 bg-warning-50 text-warning-700 dark:bg-warning-700/15 dark:text-warning-400"
                            : "border-error-500/40 bg-error-50 text-error-600 dark:bg-error-700/15"
                      }`}
                    >
                      {score}
                    </span>
                  </TableCell>
                  <TableCell className="num text-right text-[13px]">{words}</TableCell>
                  <TableCell>
                    <StatusPill tone={STATUS_META[status].tone}>
                      {STATUS_META[status].label}
                    </StatusPill>
                  </TableCell>
                  <TableCell>
                    {postPushed[a.id] ? (
                      <StatusPill tone="success">On the board</StatusPill>
                    ) : packages[a.id] ? (
                      <StatusPill tone="info">Drafted</StatusPill>
                    ) : (
                      <span className="text-text-disabled text-[12px]">&mdash;</span>
                    )}
                  </TableCell>
                  <TableCell className="num text-text-secondary text-right text-[12.5px]">
                    {fmtDate(a.updated_at)}
                  </TableCell>
                  <TableCell>
                    <ChevronRight className="text-text-tertiary size-4 transition-transform group-hover:translate-x-0.5" />
                  </TableCell>
                </TableRow>
              );
            })}
            {articles.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-text-tertiary py-8 text-center text-[13px]"
                >
                  No articles yet — generate one from an opportunity above.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
