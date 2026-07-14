import type { ContentTerm, TermModel } from "@/lib/data/types";
import { termUses } from "@/lib/content-score";

export type TermBand = "unused" | "low" | "ok" | "high" | "over";

export interface BasicTermState {
  term: string;
  uses: number;
  min: number;
  max: number;
  weight: number;
  presence_pct: number;
  band: TermBand;
}

export interface ExtendedTermState {
  term: string;
  uses: number;
  target: number;
  presence_pct: number;
  band: TermBand;
}

export interface NwScore {
  score: number;
  target: number;
  titlePct: number;
  headingsPct: number;
  termsPct: number;
  balancePct: number;
  words: number;
  wordsTarget: { median: number; p25: number; p75: number };
  basic: BasicTermState[];
  extended: ExtendedTermState[];
  readabilityGrade: number;
  readabilityLabel: string;
  readabilityTarget: number;
  readabilityTargetLabel: string;
  stats: {
    chars: number;
    h1: number;
    h2: number;
    h3: number;
    bold: number;
    links: number;
    images: number;
    tables: number;
  };
}

export function htmlToText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function headingsText(html: string): string {
  const m = html.match(/<h[123][^>]*>[\s\S]*?<\/h[123]>/gi) ?? [];
  return m.map((h) => htmlToText(h)).join(" · ");
}

function syllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (w.length <= 3) return 1;
  const groups = w.replace(/e$/, "").match(/[aeiouy]+/g);
  return Math.max(1, groups?.length ?? 1);
}

export function fkGrade(text: string): number {
  const sentences = Math.max(1, (text.match(/[.!?]+(\s|$)/g) ?? []).length);
  const words = text.split(/\s+/).filter((w) => /[a-z]/i.test(w));
  if (words.length < 20) return 8;
  const syl = words.reduce((s, w) => s + syllables(w), 0);
  return Math.max(
    1,
    Math.round(0.39 * (words.length / sentences) + 11.8 * (syl / words.length) - 15.59),
  );
}

export function gradeLabel(g: number): string {
  if (g <= 6) return "6th grade";
  if (g <= 8) return "Middle school";
  if (g <= 10) return "High school";
  if (g <= 12) return "HS senior";
  if (g <= 15) return "College";
  return "College graduate";
}

export function fallbackModel(query: string, terms: ContentTerm[]): TermModel {
  return {
    query,
    slug: "synthetic",
    location_name: "—",
    language_code: "en",
    fetched_at: "",
    source: "synthetic",
    serp: [],
    scraped_count: 0,
    competitor_words: { median: 1400, p25: 950, p75: 1900 },
    target_score: 70,
    readability_target: 9,
    basic_terms: terms
      .filter((t) => t.weight >= 5)
      .map((t) => ({
        term: t.term,
        presence_pct: Math.min(100, t.weight * 10),
        avg_uses: t.required,
        min: Math.max(1, Math.min(t.required, 3)),
        max: t.required + 3,
        weight: t.weight,
      })),
    extended_terms: terms
      .filter((t) => t.weight < 5)
      .map((t) => ({
        term: t.term,
        presence_pct: Math.min(60, t.weight * 10),
        target: Math.min(t.required, 2),
      })),
    title_terms: terms
      .filter((t) => t.weight >= 6)
      .slice(0, 8)
      .map((t) => ({ term: t.term, pct: Math.min(90, t.weight * 9) })),
    description_terms: terms
      .filter((t) => t.weight >= 4)
      .slice(0, 10)
      .map((t) => ({ term: t.term, pct: Math.min(80, t.weight * 8) })),
  };
}

function basicBand(uses: number, min: number, max: number): TermBand {
  if (uses === 0) return "unused";
  if (uses < min) return "low";
  if (uses <= max) return "ok";
  if (uses <= 2 * max) return "high";
  return "over";
}

export function nwScore(model: TermModel, html: string, metaTitle: string): NwScore {
  const text = htmlToText(html);
  const heads = headingsText(html);
  const words = text ? text.split(/\s+/).length : 0;

  const basic: BasicTermState[] = model.basic_terms.map((t) => {
    const uses = termUses(text, t.term);
    return { ...t, uses, band: basicBand(uses, t.min, t.max) };
  });
  const extended: ExtendedTermState[] = model.extended_terms.map((t) => {
    const uses = termUses(text, t.term);
    return {
      ...t,
      uses,
      band:
        uses === 0
          ? "unused"
          : uses <= Math.max(t.target, 2)
            ? "ok"
            : uses <= 4 * Math.max(t.target, 1)
              ? "high"
              : "over",
    };
  });

  const totalW = basic.reduce((s, t) => s + t.weight, 0) || 1;
  const basicCov =
    basic.reduce((s, t) => {
      const credit = t.uses === 0 ? 0 : t.band === "ok" ? 1 : t.band === "over" ? 0.7 : 0.85;
      return s + credit * t.weight;
    }, 0) / totalW;

  const extCov = extended.length ? extended.filter((t) => t.uses >= 1).length / extended.length : 1;

  const titleTerms = model.title_terms.length
    ? model.title_terms
    : model.basic_terms.slice(0, 6).map((t) => ({ term: t.term, pct: 50 }));
  const titleW = titleTerms.reduce((s, t) => s + t.pct, 0) || 1;
  const titleCov =
    titleTerms.reduce((s, t) => s + (termUses(metaTitle, t.term) > 0 ? t.pct : 0), 0) / titleW;

  const headingsCov = basic.length
    ? basic.filter((t) => termUses(heads, t.term) > 0).length / basic.length
    : 0;

  const { median, p25 } = model.competitor_words;
  const lengthFactor = words >= p25 ? 1 : Math.max(0.6, 0.6 + 0.4 * (words / Math.max(p25, 1)));

  const overW = basic.filter((t) => t.band === "over").reduce((s, t) => s + t.weight, 0);
  const balancePct = Math.max(0, Math.round(100 * (1 - overW / (1.5 * totalW))));

  const zone = 0.18 * titleCov + 0.22 * headingsCov + 0.5 * basicCov + 0.1 * extCov;
  const score = Math.round(100 * zone * lengthFactor * (0.75 + 0.25 * (balancePct / 100)));

  const grade = fkGrade(text);

  return {
    score,
    target: model.target_score,
    titlePct: Math.round(titleCov * 100),
    headingsPct: Math.round(headingsCov * 100),
    termsPct: Math.round((0.85 * basicCov + 0.15 * extCov) * 100),
    balancePct,
    words,
    wordsTarget: { median, p25, p75: model.competitor_words.p75 },
    basic,
    extended,
    readabilityGrade: grade,
    readabilityLabel: gradeLabel(grade),
    readabilityTarget: model.readability_target,
    readabilityTargetLabel: gradeLabel(model.readability_target),
    stats: {
      chars: text.length,
      h1: (html.match(/<h1/gi) ?? []).length,
      h2: (html.match(/<h2/gi) ?? []).length,
      h3: (html.match(/<h3/gi) ?? []).length,
      bold: (html.match(/<(strong|b)\b/gi) ?? []).length,
      links: (html.match(/<a\s/gi) ?? []).length,
      images: (html.match(/<img\s/gi) ?? []).length + (html.match(/<figure/gi) ?? []).length,
      tables: (html.match(/<table/gi) ?? []).length,
    },
  };
}

export function htmlToMarkdown(html: string): string {
  let s = html;
  s = s.replace(
    /<figure[^>]*>[\s\S]*?<figcaption>([\s\S]*?)<\/figcaption>[\s\S]*?<\/figure>/gi,
    (_, cap) => `\n\n![${htmlToText(cap)}](image-placeholder)\n\n`,
  );
  s = s.replace(
    /<img[^>]*alt="([^"]*)"[^>]*\/?>(?:<\/img>)?/gi,
    "\n\n![$1](image-placeholder)\n\n",
  );
  s = s.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, (_, t) => `\n\n# ${htmlToText(t)}\n\n`);
  s = s.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_, t) => `\n\n## ${htmlToText(t)}\n\n`);
  s = s.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_, t) => `\n\n### ${htmlToText(t)}\n\n`);
  s = s.replace(/<(strong|b)\b[^>]*>([\s\S]*?)<\/\1>/gi, "**$2**");
  s = s.replace(/<(em|i)\b[^>]*>([\s\S]*?)<\/\1>/gi, "_$2_");
  s = s.replace(/<a\s[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)");
  s = s.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, t) => `\n- ${htmlToText(t)}`);
  s = s.replace(/<\/?(ul|ol)[^>]*>/gi, "\n");
  s = s.replace(/<tr[^>]*>([\s\S]*?)<\/tr>/gi, (_, r: string) => {
    const cells = (r.match(/<t[hd][^>]*>[\s\S]*?<\/t[hd]>/gi) ?? []).map((c) => htmlToText(c));
    return `\n| ${cells.join(" | ")} |`;
  });
  s = s.replace(/<\/?(table|thead|tbody)[^>]*>/gi, "\n");
  s = s.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, "$1\n\n");
  s = s.replace(/<br\s*\/?>/gi, "\n");
  s = s.replace(/<[^>]+>/g, "");
  s = s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
  const lines = s.split("\n");
  const rebuilt: string[] = [];
  const isRow = (l?: string) => l != null && /^\|.+\|$/.test(l.trim());
  const isSep = (l?: string) => l != null && /^\|[\s:|-]+\|$/.test(l.trim());
  for (let i = 0; i < lines.length; i++) {
    rebuilt.push(lines[i]);
    if (isRow(lines[i]) && !isRow(lines[i - 1]) && isRow(lines[i + 1]) && !isSep(lines[i + 1])) {
      const cols = lines[i].split("|").length - 2;
      rebuilt.push(`|${Array(cols).fill("---").join("|")}|`);
    }
  }
  s = rebuilt.join("\n");
  return s.replace(/\n{3,}/g, "\n\n").trim();
}
