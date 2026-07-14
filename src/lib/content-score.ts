import type { ContentArticle, ContentTerm } from "@/lib/data/types";

export function termUses(body: string, term: string): number {
  if (!body) return 0;
  const esc = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "[\\s-]+");
  const re = new RegExp(`(?<![a-z0-9])${esc}(?![a-z0-9])`, "gi");
  return (body.match(re) ?? []).length;
}

export interface TermCoverage extends ContentTerm {
  uses: number;
  credit: number;
}

export function coverTerms(body: string, terms: ContentTerm[]): TermCoverage[] {
  return terms.map((t) => {
    const uses = termUses(body, t.term);
    return { ...t, uses, credit: Math.min(uses / t.required, 1) };
  });
}

export function termScore(cov: TermCoverage[]): number {
  const totalWeight = cov.reduce((s, t) => s + t.weight, 0) || 1;
  return Math.round((cov.reduce((s, t) => s + t.credit * t.weight, 0) / totalWeight) * 100);
}

export interface StructureCheck {
  id: string;
  label: string;
  pass: boolean;
}

export function structureChecks(body: string): StructureCheck[] {
  const words = body.trim() === "" ? 0 : body.trim().split(/\s+/).length;
  return [
    { id: "h1", label: "Has a single H1", pass: (body.match(/^# /gm) ?? []).length === 1 },
    { id: "h2", label: "At least two H2 sections", pass: (body.match(/^## /gm) ?? []).length >= 2 },
    { id: "length", label: "300+ words", pass: words >= 300 },
    {
      id: "tables",
      label: "At least two tables (defining metric)",
      pass: (body.match(/^\|[\s:|-]+\|$/gm) ?? []).length >= 2,
    },
    {
      id: "intro",
      label: "Opens with a patient-relevant hook",
      pass: body.trim().length > 0 && !/^#?\s*$/.test(body.split("\n\n")[1] ?? ""),
    },
  ];
}

const CURE_RE = /\b(cure[sd]?|guarantee[sd]?|miracle|100% effective|painless)\b/i;
const SUPERLATIVE_RE = /\b(best|top-rated|#1|number one|premier|world-class)\b/i;
const DISCLAIMER_RE = /call 911|does not replace medical advice/i;

export function eeatChecks(
  article: Pick<ContentArticle, "author">,
  body: string,
): StructureCheck[] {
  return [
    { id: "disclaimer", label: "Medical disclaimer present", pass: DISCLAIMER_RE.test(body) },
    { id: "cure", label: "No cure/guarantee claims", pass: !CURE_RE.test(body) },
    { id: "superlative", label: "No superlative claims", pass: !SUPERLATIVE_RE.test(body) },
    { id: "author", label: "Author attributed", pass: Boolean(article.author) },
    { id: "entity", label: "Names the Baptist entity", pass: /Baptist Medical Group/i.test(body) },
  ];
}

export function questionCoverage(
  body: string,
  questions: string[],
): Array<{ q: string; covered: boolean }> {
  return questions.map((q) => {
    const keywords = q
      .toLowerCase()
      .replace(/[?]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 4);
    const hits = keywords.filter((k) => body.toLowerCase().includes(k)).length;
    return { q, covered: keywords.length > 0 && hits / keywords.length >= 0.5 };
  });
}

export function contentScore(article: ContentArticle, body: string): number {
  const cov = coverTerms(body, article.terms);
  const t = termScore(cov);
  const s =
    (structureChecks(body).filter((c) => c.pass).length / structureChecks(body).length) * 100;
  const e =
    (eeatChecks(article, body).filter((c) => c.pass).length / eeatChecks(article, body).length) *
    100;
  return Math.round(t * 0.6 + s * 0.2 + e * 0.2);
}

export function scoreBand(score: number): "success" | "warning" | "error" {
  return score >= 70 ? "success" : score >= 40 ? "warning" : "error";
}
