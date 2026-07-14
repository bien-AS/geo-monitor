"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  Bold,
  Check,
  CircleAlert,
  Download,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Pilcrow,
  RefreshCcw,
  Save,
  Send,
  Trophy,
  Underline,
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusPill } from "@/components/local/status-pill";
import { ApprovalLadder } from "@/components/local/approval-ladder";
import { useAuditLog } from "@/components/local/audit-log-store";
import { useRole } from "@/components/shell/role-store";
import { usePostsSession } from "@/store/posts";
import { cn } from "@/lib/utils";
import { fmtDate } from "@/lib/format";
import {
  fallbackModel,
  htmlToMarkdown,
  htmlToText,
  nwScore,
  type BasicTermState,
  type ExtendedTermState,
  type TermBand,
} from "@/lib/nw-score";
import {
  ensureBeatsBenchmark,
  generateArticleBody,
  generateGbpPost,
  regenerateFaqSection,
  relatedQuestions,
  renderArticleHtml,
  type GeneratedPackage,
  type PaaLocationCtx,
  optimizedMetaTitle,
  selfQaChecks,
  optimizedMetaDescription,
} from "@/lib/paa-articles";
import type { ContentArticle, TermModel } from "@/lib/data/types";
import { usePaaStudio } from "@/store/paa-studio";

function Gauge({ score, target }: { score: number; target: number }) {
  const angle = Math.min(score, 100) / 100;
  const circ = Math.PI * 34;
  const color = score >= target ? "#1D9E75" : score >= target * 0.7 ? "#EAB308" : "#A32D2D";
  return (
    <div className="relative h-16 w-24">
      <svg
        viewBox="0 0 88 52"
        className="h-16 w-24"
      >
        <path
          d="M 10 44 A 34 34 0 0 1 78 44"
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          className="stroke-secondary"
        />
        <path
          d="M 10 44 A 34 34 0 0 1 78 44"
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          stroke={color}
          strokeDasharray={`${angle * circ} ${circ}`}
        />
      </svg>
      <span className="num absolute inset-x-0 bottom-3 text-center text-[20px] font-bold">
        {score}
      </span>
      <span
        className="num border-warning-500/40 bg-warning-50 text-warning-700 dark:bg-warning-700/20 dark:text-warning-100 absolute top-0 -right-1 inline-flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[10.5px] font-bold"
        title="Competitor benchmark — the best ranking page's coverage, not an arbitrary 100"
      >
        <Trophy className="size-2.5" />
        {target}
      </span>
    </div>
  );
}

function PctBar({ label, pct }: { label: string; pct: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-text-secondary w-16 text-[11.5px] font-medium">{label}:</span>
      <span className="num w-9 text-[11.5px] font-semibold">{pct}%</span>
      <div className="bg-secondary h-1.5 flex-1 overflow-hidden rounded-full">
        <div
          className={cn(
            "h-full rounded-full",
            pct >= 70 ? "bg-success-500" : pct >= 40 ? "bg-warning-500" : "bg-error-500",
          )}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  );
}

const BAND_CLS: Record<TermBand, string> = {
  unused: "border-border bg-secondary/50 text-text-tertiary",
  low: "border-warning-500/40 bg-warning-50 text-warning-700 dark:bg-warning-700/15 dark:text-warning-100",
  ok: "border-success-500/40 bg-success-50 text-success-700 dark:bg-success-700/15 dark:text-success-400",
  high: "border-warning-500/40 bg-warning-50 text-warning-700 dark:bg-warning-700/15 dark:text-warning-100",
  over: "border-error-500/40 bg-error-50 text-error-600 dark:bg-error-700/15",
};

export function PaaEditor({
  article,
  pkg,
  slug,
  model: realModel,
  locationCtx,
}: {
  article: ContentArticle;
  pkg: GeneratedPackage | null;
  slug: string;
  model?: TermModel | null;
  locationCtx?: PaaLocationCtx;
}) {
  const role = useRole();
  const addEntry = useAuditLog((s) => s.addEntry);
  const addPost = usePostsSession((s) => s.addPost);
  const {
    bodies,
    metaTitles,
    metaDescs,
    statuses,
    postPushed,
    saveBody,
    saveMeta,
    setStatus,
    markPostPushed,
  } = usePaaStudio();

  const model = React.useMemo(
    () => realModel ?? fallbackModel(article.target_keyword, article.terms),
    [realModel, article],
  );

  const initialHtml = React.useMemo(() => {
    const saved = bodies[article.id] ?? article.body_md;
    return saved.trimStart().startsWith("<") ? saved : renderArticleHtml(saved);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only change on article.id switch
  }, [article.id, bodies]);

  const surfaceRef = React.useRef<HTMLDivElement>(null);
  const [html, setHtml] = React.useState(initialHtml);
  const [metaTitle, setMetaTitle] = React.useState(
    metaTitles[article.id] ??
      pkg?.metaTitle ??
      (model.source !== "synthetic" && (pkg?.ctx ?? locationCtx)
        ? optimizedMetaTitle(model, (pkg?.ctx ?? locationCtx)!)
        : `${article.title} | Baptist Medical Group`),
  );
  const [metaDesc, setMetaDesc] = React.useState(
    metaDescs[article.id] ??
      pkg?.metaDescription ??
      (model.source !== "synthetic" && (pkg?.ctx ?? locationCtx)
        ? optimizedMetaDescription(model, (pkg?.ctx ?? locationCtx)!)
        : ""),
  );
  const [postBody, setPostBody] = React.useState("");
  const [dirty, setDirty] = React.useState(false);
  const [variant, setVariant] = React.useState(1);

  React.useEffect(() => {
    if (surfaceRef.current) surfaceRef.current.innerHTML = initialHtml;
  }, [initialHtml]);

  const setSurface = (nextHtml: string) => {
    if (surfaceRef.current) surfaceRef.current.innerHTML = nextHtml;
    setHtml(nextHtml);
    setDirty(true);
  };

  const paaQuestion = `${article.title.replace(/\?$/, "")}?`;
  const genCtx = pkg?.ctx ?? locationCtx ?? null;
  const gbpPost = React.useMemo(
    () => pkg?.gbpPost ?? (genCtx ? generateGbpPost(paaQuestion, genCtx) : null),
    [pkg, genCtx, paaQuestion],
  );
  const gbpPostBody = (postBody || gbpPost?.body) ?? "";
  const rivalDomain =
    pkg?.competitorDomain ?? model.serp.find((r) => !/baptist/i.test(r.domain))?.domain ?? null;
  const sc = nwScore(model, html, metaTitle);
  const qa = React.useMemo(() => selfQaChecks(htmlToMarkdown(html)), [html]);
  const qaPass = qa.every((c) => c.pass);
  const status = statuses[article.id] ?? article.status;
  const isOperator = role === "operator";
  const pushed = postPushed[article.id];
  const readMin = Math.max(1, Math.round(sc.words / 220));

  const insertTerm = (term: string) => {
    surfaceRef.current?.focus();
    document.execCommand("insertText", false, term);
    if (surfaceRef.current) {
      setHtml(surfaceRef.current.innerHTML);
      setDirty(true);
    }
  };

  const save = () => {
    saveBody(article.id, html);
    saveMeta(article.id, metaTitle, metaDesc);
    addEntry({
      actor: "Agency Operator",
      role: "operator",
      verb: "update",
      action: `Saved PAA article "${article.title}" (score ${sc.score} / target ${sc.target})`,
      resource: `paa-studio:${article.id}`,
      location_slug: slug,
      detail: "Demo mode — session persistence; live mode versions rows in Postgres.",
    });
    toast.success("Draft saved", {
      description: `Score ${sc.score} vs benchmark ${sc.target}`,
    });
    setDirty(false);
  };

  const regenerateArticle = () => {
    if (!genCtx) return;
    const v = variant + 1;
    setVariant(v);
    const faqs = relatedQuestions(paaQuestion, genCtx, v);
    let bodyMd = generateArticleBody(paaQuestion, genCtx, faqs, rivalDomain, v);
    let note = `Variant ${v} — same contract, fresh copy.`;
    if (model.source !== "synthetic") {
      const beat = ensureBeatsBenchmark(bodyMd, metaTitle, model, genCtx);
      bodyMd = beat.bodyMd;
      setMetaTitle(beat.metaTitle);
      note = `Variant ${v} — score ${beat.score} vs benchmark ${beat.target} (mandate enforced).`;
    }
    setSurface(renderArticleHtml(bodyMd));
    toast.success("Article regenerated", { description: note });
  };

  const regenerateFaqs = () => {
    if (!genCtx) return;
    const v = variant + 1;
    setVariant(v);
    const out = regenerateFaqSection(htmlToMarkdown(html), paaQuestion, genCtx, v);
    setSurface(renderArticleHtml(out.body));
    toast.success("FAQs regenerated", {
      description: `${out.faqs.length} PAA questions swapped in.`,
    });
  };

  const download = (name: string, content: string, type: string) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([content], { type }));
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const TermChip = ({ t }: { t: BasicTermState | ExtendedTermState }) => (
    <button
      type="button"
      onClick={() => insertTerm(t.term)}
      title={`${t.presence_pct}% of ranking pages use this — click to insert at cursor`}
      className={cn(
        "rounded-full border px-2 py-0.5 text-[11.5px] font-medium transition-colors",
        BAND_CLS[t.band],
      )}
    >
      {t.term}{" "}
      <span className="num">
        {t.uses}/{"min" in t ? `${t.min}-${t.max}` : t.target}
      </span>
    </button>
  );

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Link
          href={`/locations/${slug}/paa-studio`}
          className="text-text-tertiary hover:text-text-secondary inline-flex items-center gap-1 text-[13px]"
        >
          <ArrowLeft className="size-3.5" />
          PAA Studio
        </Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold">Content editor</h1>
            <p className="num text-text-tertiary mt-0.5 text-[12.5px]">
              {article.target_keyword}
              {model.source !== "synthetic" ? (
                <span className="border-success-500/40 text-success-700 dark:text-success-400 ml-2 rounded-full border px-1.5 py-0.5 text-[10.5px] font-medium">
                  Term model: live &middot; {model.scraped_count} ranking pages analyzed
                </span>
              ) : (
                <span className="border-border text-text-tertiary ml-2 rounded-full border px-1.5 py-0.5 text-[10.5px] font-medium">
                  Term model: template — bake pending for this query
                </span>
              )}
              {pkg?.competitorDomain && (
                <span className="border-warning-500/40 text-warning-700 dark:text-warning-100 ml-2 rounded-full border px-1.5 py-0.5 text-[10.5px] font-medium">
                  vs {pkg.competitorDomain}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Gauge
              score={sc.score}
              target={sc.target}
            />
            <div className="flex w-52 flex-col gap-1.5">
              <PctBar
                label="Title"
                pct={sc.titlePct}
              />
              <PctBar
                label="Headings"
                pct={sc.headingsPct}
              />
              <PctBar
                label="Terms"
                pct={sc.termsPct}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              {isOperator &&
                (status === "ready" ? (
                  <StatusPill tone="success">
                    <BadgeCheck className="size-3.5" /> Article approved
                  </StatusPill>
                ) : (
                  <ApprovalLadder
                    trigger={
                      <Button
                        size="sm"
                        disabled={sc.score <= sc.target || !qaPass}
                        title={
                          sc.score <= sc.target
                            ? `Mandate: score must beat the ${sc.target} benchmark first (currently ${sc.score})`
                            : !qaPass
                              ? `Self-QA: ${qa
                                  .filter((c) => !c.pass)
                                  .map((c) => c.label)
                                  .join(" · ")}`
                              : undefined
                        }
                      >
                        <BadgeCheck className="size-4" />
                        Approve article
                      </Button>
                    }
                    title={`Approve "${article.title}"`}
                    description={`Score ${sc.score} vs competitor benchmark ${sc.target} — mandate met`}
                    actionVerb="Approve article"
                    auditAction={`Approved PAA article "${article.title}" (score ${sc.score} > benchmark ${sc.target})`}
                    auditResource={`paa-studio:${article.id}:approve`}
                    auditVerb="update"
                    locationSlug={slug}
                    preview={
                      <div className="space-y-1.5 text-[13px]">
                        <p>
                          <span className="font-semibold">{article.title}</span> moves to{" "}
                          <span className="font-semibold">Approved</span> — ready for export and the
                          web-team handoff.
                        </p>
                        <p className="num text-text-tertiary text-[12px]">
                          Score {sc.score} &middot; benchmark {sc.target} &middot; {sc.words} words
                          &middot; {sc.stats.images} image placeholders
                        </p>
                      </div>
                    }
                    onCompleted={() => {
                      saveBody(article.id, html);
                      saveMeta(article.id, metaTitle, metaDesc);
                      setStatus(article.id, "ready");
                      toast.success("Article approved", {
                        description:
                          "Status: Approved — export it or push the companion GBP post next",
                      });
                    }}
                  />
                ))}
              {isOperator && (
                <Button
                  size="sm"
                  variant={status === "ready" ? "default" : "outline"}
                  onClick={save}
                  disabled={!dirty}
                >
                  <Save className="size-4" />
                  Save
                </Button>
              )}
              {genCtx && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={regenerateArticle}
                  >
                    <RefreshCcw className="size-3.5" />
                    Regenerate article
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={regenerateFaqs}
                  >
                    <RefreshCcw className="size-3.5" />
                    Regenerate FAQs
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-5">
          <Card className="gap-0 p-0">
            <div className="border-border flex items-center gap-3 border-b px-5 py-3">
              <Label
                htmlFor="doc-title"
                className="text-[13px] font-semibold"
              >
                Title
              </Label>
              <Input
                id="doc-title"
                value={metaTitle}
                disabled={!isOperator}
                onChange={(e) => {
                  setMetaTitle(e.target.value);
                  setDirty(true);
                }}
                className="bg-primary-50/40 dark:bg-primary-700/10 h-8 flex-1 text-[13.5px]"
              />
              <span
                className={cn(
                  "num text-[11px]",
                  metaTitle.length > 60 ? "text-error-600 font-semibold" : "text-text-tertiary",
                )}
              >
                {metaTitle.length}/60
              </span>
            </div>
            <div className="border-border flex items-center gap-3 border-b px-5 py-3">
              <Label
                htmlFor="doc-desc"
                className="text-[13px] font-semibold"
              >
                Description
              </Label>
              <Input
                id="doc-desc"
                value={metaDesc}
                disabled={!isOperator}
                onChange={(e) => {
                  setMetaDesc(e.target.value);
                  setDirty(true);
                }}
                className="bg-primary-50/40 dark:bg-primary-700/10 h-8 flex-1 text-[12.5px]"
              />
              <span
                className={cn(
                  "num text-[11px]",
                  metaDesc.length > 160 ? "text-error-600 font-semibold" : "text-text-tertiary",
                )}
              >
                {metaDesc.length}/160
              </span>
            </div>
            {isOperator && (
              <div className="border-border flex flex-wrap items-center gap-0.5 border-b px-3 py-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  className="size-7 p-0"
                  title="Bold"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    surfaceRef.current?.focus();
                    document.execCommand("bold", false);
                    if (surfaceRef.current) {
                      setHtml(surfaceRef.current.innerHTML);
                      setDirty(true);
                    }
                  }}
                >
                  <Bold className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="size-7 p-0"
                  title="Italic"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    surfaceRef.current?.focus();
                    document.execCommand("italic", false);
                    if (surfaceRef.current) {
                      setHtml(surfaceRef.current.innerHTML);
                      setDirty(true);
                    }
                  }}
                >
                  <Italic className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="size-7 p-0"
                  title="Underline"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    surfaceRef.current?.focus();
                    document.execCommand("underline", false);
                    if (surfaceRef.current) {
                      setHtml(surfaceRef.current.innerHTML);
                      setDirty(true);
                    }
                  }}
                >
                  <Underline className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="size-7 p-0"
                  title="Heading 2"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    surfaceRef.current?.focus();
                    document.execCommand("formatBlock", false, "<h2>");
                    if (surfaceRef.current) {
                      setHtml(surfaceRef.current.innerHTML);
                      setDirty(true);
                    }
                  }}
                >
                  <Heading2 className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="size-7 p-0"
                  title="Heading 3"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    surfaceRef.current?.focus();
                    document.execCommand("formatBlock", false, "<h3>");
                    if (surfaceRef.current) {
                      setHtml(surfaceRef.current.innerHTML);
                      setDirty(true);
                    }
                  }}
                >
                  <Heading3 className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="size-7 p-0"
                  title="Paragraph"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    surfaceRef.current?.focus();
                    document.execCommand("formatBlock", false, "<p>");
                    if (surfaceRef.current) {
                      setHtml(surfaceRef.current.innerHTML);
                      setDirty(true);
                    }
                  }}
                >
                  <Pilcrow className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="size-7 p-0"
                  title="Bullet list"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    surfaceRef.current?.focus();
                    document.execCommand("insertUnorderedList", false);
                    if (surfaceRef.current) {
                      setHtml(surfaceRef.current.innerHTML);
                      setDirty(true);
                    }
                  }}
                >
                  <List className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="size-7 p-0"
                  title="Numbered list"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    surfaceRef.current?.focus();
                    document.execCommand("insertOrderedList", false);
                    if (surfaceRef.current) {
                      setHtml(surfaceRef.current.innerHTML);
                      setDirty(true);
                    }
                  }}
                >
                  <ListOrdered className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="size-7 p-0"
                  title="Link"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    const url = window.prompt("Link URL", "https://");
                    if (url) {
                      surfaceRef.current?.focus();
                      document.execCommand("createLink", false, url);
                      if (surfaceRef.current) {
                        setHtml(surfaceRef.current.innerHTML);
                        setDirty(true);
                      }
                    }
                  }}
                >
                  <Link2 className="size-3.5" />
                </Button>
                <span className="num text-text-tertiary ml-auto text-[11.5px]">
                  {sc.words} words &middot; ~{readMin} min read &middot; updated{" "}
                  {fmtDate(article.updated_at)}
                </span>
              </div>
            )}
            <div
              ref={surfaceRef}
              contentEditable={isOperator}
              suppressContentEditableWarning
              onInput={(e) => {
                setHtml((e.target as HTMLDivElement).innerHTML);
                setDirty(true);
              }}
              className={cn(
                "min-h-[560px] max-w-none px-8 py-6 pl-16 text-[14px] leading-relaxed outline-none",
                "[&_h1]:relative [&_h1]:mb-3 [&_h1]:text-[26px] [&_h1]:leading-tight [&_h1]:font-bold",
                "[&_h1]:before:text-text-disabled [&_h1]:before:absolute [&_h1]:before:top-2 [&_h1]:before:-left-10 [&_h1]:before:font-mono [&_h1]:before:text-[10px] [&_h1]:before:font-bold [&_h1]:before:content-['H1']",
                "[&_h2]:relative [&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:text-[19px] [&_h2]:font-semibold",
                "[&_h2]:before:text-text-disabled [&_h2]:before:absolute [&_h2]:before:top-1 [&_h2]:before:-left-10 [&_h2]:before:font-mono [&_h2]:before:text-[10px] [&_h2]:before:font-bold [&_h2]:before:content-['H2']",
                "[&_h3]:relative [&_h3]:mt-4 [&_h3]:mb-1.5 [&_h3]:text-[15.5px] [&_h3]:font-semibold",
                "[&_h3]:before:text-text-disabled [&_h3]:before:absolute [&_h3]:before:top-1 [&_h3]:before:-left-10 [&_h3]:before:font-mono [&_h3]:before:text-[10px] [&_h3]:before:font-bold [&_h3]:before:content-['H3']",
                "[&_a]:text-primary-600 dark:[&_a]:text-primary-300 [&_a]:underline [&_p]:mb-3",
                "[&_li]:mb-1 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5",
                "[&_figcaption]:text-text-tertiary [&_th]:border-border [&_th]:bg-secondary/60 [&_td]:border-border [&_figcaption]:mt-1.5 [&_figcaption]:text-[11.5px] [&_figcaption]:italic [&_figure]:my-4 [&_figure]:select-none [&_table]:my-3 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:px-2.5 [&_td]:py-1.5 [&_td]:text-[12.5px] [&_th]:border [&_th]:px-2.5 [&_th]:py-1.5 [&_th]:text-left [&_th]:text-[12.5px]",
                !isOperator && "opacity-90",
              )}
              aria-label="Article document — formatted and directly editable"
            />
            <div className="border-border flex flex-wrap items-center gap-2 border-t px-5 py-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  download(`${article.id}.md`, htmlToMarkdown(html), "text/markdown");
                  toast.success("Markdown exported");
                }}
              >
                <Download className="size-3.5" /> MD
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  download(`${article.id}.html`, html, "text/html");
                  toast.success("HTML exported", {
                    description: "Exactly what you see — same markup as the surface",
                  });
                }}
              >
                <Download className="size-3.5" /> HTML
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  toast.success("DOCX export queued", {
                    description: "Demo mode — worker renders the WordPress-ready DOCX in live mode",
                  })
                }
              >
                <Download className="size-3.5" /> DOCX
              </Button>
              <span className="text-text-tertiary ml-auto text-[11.5px] italic">
                Formatting is retained — exports serialize this exact document.
              </span>
            </div>
          </Card>

          {gbpPost && (
            <Card className="gap-3 p-5">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-[15px] font-semibold">GBP post — bundled output</h2>
                  <p className="text-text-tertiary text-[12.5px]">
                    Approving sends it to the Posts board (pending approval lane) and the calendar.
                  </p>
                </div>
                {pushed ? (
                  <StatusPill tone="success">
                    <Check className="size-3" /> On the board
                  </StatusPill>
                ) : (
                  <StatusPill tone="info">Drafted</StatusPill>
                )}
              </div>
              <p className="text-[13px] font-semibold">{gbpPost.title}</p>
              <Textarea
                value={gbpPostBody}
                disabled={!isOperator || pushed}
                onChange={(e) => setPostBody(e.target.value)}
                className="min-h-24 text-[13px] leading-relaxed"
              />
              <div className="flex items-center justify-between gap-2">
                <span className="num text-text-tertiary text-[11.5px]">
                  CTA: {gbpPost.cta?.label} &middot; {gbpPost.cta?.url}
                </span>
                {isOperator && !pushed && (
                  <ApprovalLadder
                    trigger={
                      <Button size="sm">
                        <Send className="size-4" />
                        Approve post &rarr; board
                      </Button>
                    }
                    title="Send GBP post to the Posts board"
                    description={`${article.title} · companion post`}
                    actionVerb="Approve & queue"
                    auditAction={`PAA companion post queued: "${gbpPost.title}"`}
                    auditResource={`gbp_post:${gbpPost.id}`}
                    auditVerb="create"
                    locationSlug={slug}
                    preview={
                      <div className="space-y-1.5 text-[13px]">
                        <p className="font-semibold">{gbpPost.title}</p>
                        <p className="text-text-secondary whitespace-pre-wrap">{postBody}</p>
                      </div>
                    }
                    onCompleted={() => {
                      addPost(slug, { ...gbpPost, body: postBody, status: "pending_approval" });
                      markPostPushed(article.id);
                      if (status !== "ready") setStatus(article.id, "ready");
                      toast.success("Post on the board", {
                        description: "Pending approval lane — open Posts to schedule it",
                      });
                    }}
                  />
                )}
                {pushed && (
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                  >
                    <Link href={`/locations/${slug}/posts`}>
                      Open Posts board
                      <ArrowUpRight className="size-3.5" />
                    </Link>
                  </Button>
                )}
              </div>
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <Card className="gap-3 p-5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Trophy
                  className="text-primary-500 size-4"
                  aria-hidden
                />
                <h2 className="text-[15px] font-semibold">Winning the PAA spot</h2>
              </div>
            </div>
            <p className="text-text-secondary text-[12.5px] leading-relaxed">
              Google lifts PAA answers from pages that answer the exact question concisely, near the
              top, on a page it trusts for the topic. This draft is built to be that page for{" "}
              <span className="font-semibold">&ldquo;{paaQuestion}&rdquo;</span>
              {rivalDomain && (
                <>
                  {" "}
                  &mdash; currently fed by <span className="num">{rivalDomain}</span>
                </>
              )}
              .
            </p>
            <div className="flex flex-col gap-1">
              {(() => {
                const text = htmlToText(html);
                const firstChunk = text.split(/\s+/).slice(0, 90).join(" ");
                const dabPresent = firstChunk.length > 120;
                const faqIdx = html.indexOf("Frequently Asked Questions");
                const faqTail = faqIdx >= 0 ? html.slice(faqIdx) : "";
                const faqEnd = faqTail.indexOf("<h2");
                const faqBlock = faqEnd > 0 ? faqTail.slice(0, faqEnd) : faqTail;
                const answersVerbatim = htmlToText(faqBlock).includes(paaQuestion);
                const qH2 = (html.match(/<h2[^>]*>[^<]*\?<\/h2>/gi) ?? []).length;
                const faqCount = (faqBlock.match(/<h3/gi) ?? []).length;
                const cityHits = genCtx
                  ? (text.match(new RegExp(genCtx.city, "gi")) ?? []).length
                  : 0;
                const rows = [
                  {
                    ok: dabPresent,
                    label: "Direct answer in the opening block (extraction-ready)",
                  },
                  { ok: answersVerbatim, label: "Question answered verbatim in the FAQ" },
                  {
                    ok: faqCount >= 5 && faqCount <= 7,
                    label: `${faqCount} related PAA questions covered (5–7 target)`,
                  },
                  { ok: qH2 >= 3, label: `${qH2} question-form section headers` },
                  {
                    ok: cityHits >= 4,
                    label: `Local signals: ${cityHits} city mentions + the clinic entity`,
                  },
                  {
                    ok: sc.score >= sc.target,
                    label: `Score ${sc.score} vs competitor benchmark ${sc.target}`,
                  },
                ];
                return rows.map((r) => (
                  <div
                    key={r.label}
                    className="flex items-start gap-2 py-0.5"
                  >
                    {r.ok ? (
                      <Check className="text-success-600 mt-0.5 size-3.5 shrink-0" />
                    ) : (
                      <CircleAlert className="text-warning-500 mt-0.5 size-3.5 shrink-0" />
                    )}
                    <span className="text-[12px] leading-snug">{r.label}</span>
                  </div>
                ));
              })()}
            </div>
          </Card>

          <Card className="gap-3 p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-[15px] font-semibold">Competing articles</h2>
              {model.source !== "synthetic" && (
                <span className="num border-border text-text-tertiary rounded-full border px-2 py-0.5 text-[10.5px] font-medium">
                  {model.serp.length} ranking pages
                </span>
              )}
            </div>
            {model.source !== "synthetic" ? (
              <>
                <div className="divide-border-subtle flex flex-col divide-y">
                  {model.serp.slice(0, 10).map((r) => (
                    <a
                      key={r.position}
                      href={r.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-start gap-2.5 py-2"
                    >
                      <span className="num border-border text-text-secondary mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border text-[10.5px] font-bold">
                        {r.position}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="group-hover:text-primary-600 dark:group-hover:text-primary-300 block truncate text-[12.5px] font-medium">
                          {r.title || r.domain}
                        </span>
                        <span className="num text-text-tertiary block truncate text-[11px]">
                          {r.domain}
                        </span>
                      </span>
                      <ArrowUpRight className="text-text-tertiary mt-1 size-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                    </a>
                  ))}
                </div>
                <p className="text-text-tertiary text-[11px] leading-snug">
                  The live pages this draft is scored against — SERP pulled{" "}
                  <span className="num">{fmtDate(model.fetched_at)}</span> &middot;{" "}
                  {model.location_name}. The term targets on the right come from what these pages
                  actually publish.
                </p>
              </>
            ) : (
              <p className="text-text-tertiary text-[12.5px]">
                The competitor set loads with this query&apos;s bake — run the SERP + extraction
                pass to populate it.
              </p>
            )}
          </Card>

          <Card className="h-fit gap-3 p-5">
            <Tabs defaultValue="optimization">
              <TabsList className="w-full">
                <TabsTrigger
                  value="optimization"
                  className="flex-1"
                >
                  Terms
                </TabsTrigger>
                <TabsTrigger
                  value="meta"
                  className="flex-1"
                >
                  Meta
                </TabsTrigger>
                <TabsTrigger
                  value="outline"
                  className="flex-1"
                >
                  Outline
                </TabsTrigger>
                <TabsTrigger
                  value="stats"
                  className="flex-1"
                >
                  Stats
                </TabsTrigger>
                <TabsTrigger
                  value="qa"
                  className="flex-1"
                >
                  QA
                  {!qaPass && (
                    <span className="bg-error-500 ml-1 inline-block size-1.5 rounded-full" />
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value="optimization"
                className="mt-3 flex flex-col gap-3"
              >
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <p className="eyebrow text-text-tertiary">Basic terms</p>
                    <span className="num text-text-tertiary text-[11px]">used / target range</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {sc.basic.map((t) => (
                      <TermChip
                        key={t.term}
                        t={t}
                      />
                    ))}
                  </div>
                  <p className="text-text-tertiary mt-1.5 text-[11px] leading-snug">
                    Ranges come from how often the ranking pages use each term — two-sided: running
                    far past the band stops helping.
                  </p>
                </div>
                <div>
                  <p className="eyebrow text-text-tertiary mb-1.5">Extended terms</p>
                  <div className="flex flex-wrap gap-1.5">
                    {sc.extended.map((t) => (
                      <TermChip
                        key={t.term}
                        t={t}
                      />
                    ))}
                  </div>
                </div>
                <div className="border-border-subtle border-t pt-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[12.5px] font-medium">Optimization balance</p>
                    <span className="num text-[12.5px] font-semibold">{sc.balancePct}%</span>
                  </div>
                  <div className="bg-secondary mt-1 h-1.5 overflow-hidden rounded-full">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        sc.balancePct >= 90 ? "bg-success-500" : "bg-warning-500",
                      )}
                      style={{ width: `${sc.balancePct}%` }}
                    />
                  </div>
                  <p className="text-text-tertiary mt-1 text-[11px]">
                    Drops when terms run far past their band — over-stuffing reads unnatural.
                  </p>
                </div>
              </TabsContent>

              <TabsContent
                value="meta"
                className="mt-3 flex flex-col gap-3"
              >
                <div>
                  <p className="eyebrow text-text-tertiary mb-1.5">
                    Title terms &middot; % of ranking pages using them
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {model.title_terms.map((t) => {
                      const used = metaTitle.toLowerCase().includes(t.term.toLowerCase());
                      return (
                        <span
                          key={t.term}
                          className={cn(
                            "rounded-full border px-2 py-0.5 text-[11px] font-medium",
                            used ? BAND_CLS.ok : BAND_CLS.unused,
                          )}
                        >
                          {t.term} <span className="num">({t.pct}%)</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <p className="eyebrow text-text-tertiary mb-1.5">Query in title</p>
                  <div className="flex flex-wrap gap-1.5">
                    {article.target_keyword
                      .split(/\s+/)
                      .filter((w) => w.length > 2)
                      .map((w) => (
                        <span
                          key={w}
                          className={cn(
                            "rounded-full border px-2 py-0.5 text-[11px] font-medium",
                            metaTitle.toLowerCase().includes(w) ? BAND_CLS.ok : BAND_CLS.unused,
                          )}
                        >
                          {w}
                        </span>
                      ))}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="meta-desc"
                      className="text-[12.5px] font-medium"
                    >
                      Meta description
                    </Label>
                    <span
                      className={cn(
                        "num text-[11px]",
                        metaDesc.length > 160
                          ? "text-error-600 font-semibold"
                          : "text-text-tertiary",
                      )}
                    >
                      {metaDesc.length}/160
                    </span>
                  </div>
                  <Textarea
                    id="meta-desc"
                    value={metaDesc}
                    disabled={!isOperator}
                    onChange={(e) => {
                      setMetaDesc(e.target.value);
                      setDirty(true);
                    }}
                    className="mt-1 min-h-16 text-[12.5px]"
                  />
                </div>
                <div>
                  <p className="eyebrow text-text-tertiary mb-1.5">Description terms</p>
                  <div className="flex flex-wrap gap-1.5">
                    {model.description_terms.map((t) => {
                      const used = metaDesc.toLowerCase().includes(t.term.toLowerCase());
                      return (
                        <span
                          key={t.term}
                          className={cn(
                            "rounded-full border px-2 py-0.5 text-[11px] font-medium",
                            used ? BAND_CLS.ok : BAND_CLS.unused,
                          )}
                        >
                          {t.term} <span className="num">({t.pct}%)</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              </TabsContent>

              <TabsContent
                value="outline"
                className="mt-3"
              >
                <div className="flex flex-col gap-1">
                  {(html.match(/<h[123][^>]*>[\s\S]*?<\/h[123]>/gi) ?? []).map((h, i) => {
                    const level = Number(h.match(/<h([123])/i)?.[1] ?? 2);
                    return (
                      <p
                        key={i}
                        className={cn(
                          "truncate text-[12.5px]",
                          level === 1 && "font-bold",
                          level === 2 && "pl-3 font-medium",
                          level === 3 && "text-text-secondary pl-6",
                        )}
                      >
                        <span className="num text-text-disabled mr-1.5 text-[10px]">H{level}</span>
                        {htmlToText(h)}
                      </p>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent
                value="qa"
                className="mt-3"
              >
                <p className="text-text-tertiary mb-2 text-[11.5px] leading-snug">
                  Elite-output contract — every check must pass (alongside beating the competitor
                  benchmark) before the article can be approved.
                </p>
                <div
                  className={`mb-2 flex items-center justify-between rounded-md border px-2.5 py-1.5 text-[12.5px] ${
                    sc.score > sc.target
                      ? "border-success-300 bg-success-50 dark:bg-success-950/30"
                      : "border-error-300 bg-error-50 dark:bg-error-950/30"
                  }`}
                >
                  <span className="font-medium">Beats competitor benchmark</span>
                  <span className="num font-semibold">
                    {sc.score} / {sc.target}
                  </span>
                </div>
                {qa.map((c) => (
                  <div
                    key={c.id}
                    className="border-border-subtle flex items-center justify-between border-t py-1.5 text-[12.5px]"
                  >
                    <span className={c.pass ? "text-text-secondary" : "text-error-600 font-medium"}>
                      {c.label}
                    </span>
                    {c.pass ? (
                      <BadgeCheck className="text-success-600 size-4" />
                    ) : (
                      <span className="text-error-600 text-[11px] font-semibold uppercase">
                        Fix
                      </span>
                    )}
                  </div>
                ))}
                <p className="text-text-tertiary mt-2 text-[11px] leading-snug">
                  The repetition check blocks template-sentence stuffing — coverage must arrive
                  through the topic table, subheads and prose, never a wall of near-identical lines.
                </p>
              </TabsContent>

              <TabsContent
                value="stats"
                className="mt-3"
              >
                <div className="flex items-center justify-between py-1.5 text-[12.5px]">
                  <span className="text-text-secondary">Words</span>
                  <span className="num font-semibold">
                    {sc.words}{" "}
                    <span className="text-text-tertiary font-normal">
                      / competitors ~{sc.wordsTarget.median}
                    </span>
                  </span>
                </div>
                <div className="border-border-subtle flex items-center justify-between border-t py-1.5 text-[12.5px]">
                  <span className="text-text-secondary">Readability</span>
                  <span className="font-medium">
                    {sc.readabilityLabel}{" "}
                    <span className="num text-text-tertiary">({sc.readabilityGrade})</span>
                    <span className="text-text-tertiary">
                      {" "}
                      &middot; target {sc.readabilityTargetLabel}
                    </span>
                  </span>
                </div>
                {(
                  [
                    ["Characters", sc.stats.chars.toLocaleString()],
                    ["H1 headings", String(sc.stats.h1)],
                    ["H2 headings", String(sc.stats.h2)],
                    ["H3 headings", String(sc.stats.h3)],
                    ["Bold text", String(sc.stats.bold)],
                    ["Links", String(sc.stats.links)],
                    ["Tables", String(sc.stats.tables)],
                    ["Images", String(sc.stats.images)],
                  ] as Array<[string, string]>
                ).map(([k, v]) => (
                  <div
                    key={k}
                    className="border-border-subtle flex items-center justify-between border-t py-1.5 text-[12.5px]"
                  >
                    <span className="text-text-secondary">{k}</span>
                    <span className="num font-semibold">{v}</span>
                  </div>
                ))}
                {model.source !== "synthetic" && (
                  <p className="text-text-tertiary mt-2 text-[11px] leading-snug">
                    Benchmark from <span className="num">{model.scraped_count}</span> ranking pages
                    ({model.location_name}) — SERP via DataForSEO, extraction via Firecrawl,{" "}
                    <span className="num">{fmtDate(model.fetched_at)}</span>.
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <StatusPill tone="warning">Demo mode — saves simulated</StatusPill>
      </div>
    </div>
  );
}
