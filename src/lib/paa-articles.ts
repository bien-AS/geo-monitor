import type { ContentArticle, ContentTerm, GBPPost, TermModel } from "@/lib/data/types";
import { nwScore } from "@/lib/nw-score";
import { termUses } from "@/lib/content-score";

export interface PaaLocationCtx {
  slug: string;
  name: string;
  shortName: string;
  city: string;
  state: string;
  service: string;
  domain?: string | null;
  rating?: { value: number; votes_count: number } | null;
  topTopics?: string[];
}

export interface PaaOpportunity {
  id: string;
  question: string;
  sourceKeyword: string;
  competitorDomain: string | null;
  surface: string | null;
  breadthNote: string;
  related: string[];
  surfaceSource?: string;
}

export interface GeneratedPackage {
  article: ContentArticle;
  gbpPost: GBPPost;
  competitorDomain: string | null;
  metaTitle: string;
  metaDescription: string;
  ctx: PaaLocationCtx;
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const AUTHORITY_LINKS = [
  { label: "CDC", url: "https://www.cdc.gov" },
  { label: "MedlinePlus", url: "https://medlineplus.gov" },
  { label: "the American Academy of Family Physicians", url: "https://www.aafp.org" },
  { label: "the National Institutes of Health", url: "https://www.nih.gov" },
];

function titleCase(q: string): string {
  const t = q.replace(/\?$/, "");
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export function buildTerms(question: string, ctx: PaaLocationCtx): ContentTerm[] {
  const kw = question.toLowerCase().replace(/\?$/, "");
  return [
    { term: kw, weight: 10, required: 3 },
    { term: ctx.service, weight: 9, required: 5 },
    { term: ctx.city, weight: 8, required: 4 },
    { term: "Baptist Medical Group", weight: 6, required: 2 },
    { term: ctx.shortName, weight: 6, required: 2 },
    { term: "appointment", weight: 5, required: 2 },
    { term: "insurance", weight: 5, required: 2 },
    { term: "same-day", weight: 4, required: 1 },
    { term: "patients", weight: 4, required: 3 },
    { term: `${ctx.city}, ${ctx.state}`, weight: 4, required: 1 },
    { term: "walk-in", weight: 3, required: 1 },
    { term: "provider", weight: 3, required: 2 },
  ];
}

export function relatedQuestions(question: string, ctx: PaaLocationCtx, variant = 0): string[] {
  const pool = [
    `How much does a ${ctx.service} visit cost without insurance?`,
    `Do I need a referral to be seen at a ${ctx.service} clinic?`,
    `How fast can I get an appointment in ${ctx.city}?`,
    `Does ${ctx.shortName} take new patients?`,
    `What should I bring to a first visit?`,
    `When should I go to the ER instead of a clinic?`,
    `Does insurance cover ${ctx.service} visits in ${ctx.state === "TN" ? "Tennessee" : "Mississippi"}?`,
    `Can I be seen the same day in ${ctx.city}?`,
    `What ages does a ${ctx.service} clinic treat?`,
    `How do I transfer my records to ${ctx.shortName}?`,
  ];
  const rot = (variant * 3) % pool.length;
  const rotated = [...pool.slice(rot), ...pool.slice(0, rot)];
  return [...new Set([question, ...rotated])].slice(0, 6 + (hash(question + String(variant)) % 2));
}

export function generateArticleBody(
  question: string,
  ctx: PaaLocationCtx,
  faqs: string[],
  competitorDomain: string | null,
  variant = 0,
): string {
  const h1 = titleCase(question);
  const kw = question.toLowerCase().replace(/\?$/, "");
  const svc = ctx.service;
  const city = ctx.city;
  const rating =
    ctx.rating?.value && ctx.rating.votes_count
      ? `${ctx.rating.value}★ across ${ctx.rating.votes_count} Google reviews`
      : null;
  const h = hash(`${ctx.slug}|${question}|v${variant}`);
  const auth = [AUTHORITY_LINKS[h % 4], AUTHORITY_LINKS[(h + 1) % 4], AUTHORITY_LINKS[(h + 2) % 4]];
  const site = ctx.domain
    ? `https://${ctx.domain.replace(/^www\./, "www.")}`
    : "https://www.baptistmedicalclinic.org";

  const dab = `${h1}: for most ${city} families the answer starts with your ${svc} team. ${ctx.shortName} sees new and established patients most weekdays, takes most major insurance plans, and can usually answer this during a same-day or same-week visit — no long workup needed to get a clear next step.`;

  const takeaways = [
    `**Start local:** ${svc} teams in ${city} handle this question every week — a short visit usually settles it faster than searching.`,
    `**Insurance first:** most major plans cover the visit; bring your card and the front desk verifies coverage before you're seen.`,
    `**Same-week access:** ${ctx.shortName} keeps same-day and same-week appointment slots open for new patients most weekdays.`,
    `**Know the escalation line:** clinic care fits everyday needs; call 911 or go to the ER for chest pain, stroke signs or severe injury.`,
    `**Bring the basics:** photo ID, insurance card, a medication list and any recent records make the first visit count.`,
    `**One team, whole picture:** care inside Baptist Medical Group means your visit notes, labs and referrals stay connected.`,
  ];

  const faqBlock = faqs
    .map((q) => {
      const ql = q.toLowerCase();
      let a: string;
      if (/cost|without insurance|how much/.test(ql))
        a = `Self-pay visit pricing is posted at the front desk and quoted before you're seen — no surprises. Most ${svc} visits in ${city} cost far less than an ER trip for the same concern, and payment plans are available for larger balances.`;
      else if (/referral/.test(ql))
        a = `For ${svc} you can usually self-schedule — no referral needed. Some specialty visits and certain insurance plans do ask for one; the scheduling team checks your plan when you call so you never make a wasted trip.`;
      else if (/how fast|appointment|how long/.test(ql))
        a = `Most weekdays ${ctx.shortName} can see new patients within the week, and same-day slots open each morning for urgent needs. Calling right at opening gives you the best shot at a same-day time.`;
      else if (/new patients/.test(ql))
        a = `Yes — ${ctx.shortName} accepts new patients${rating ? `, and holds ${rating}` : ""}. First visits run a little longer so the team can take a full history and set a real baseline for your care.`;
      else if (/bring|first visit/.test(ql))
        a = `Bring a photo ID, your insurance card, a list of current medications with doses, and any recent test results or records. Arriving ten minutes early for paperwork keeps the visit on schedule.`;
      else if (/\ber\b|emergency/.test(ql))
        a = `Go straight to the ER — or call 911 — for chest pain, trouble breathing, stroke symptoms, uncontrolled bleeding or a serious injury. For fevers, infections, sprains and everyday illness, a clinic visit is faster and far less expensive.`;
      else
        a = `The honest answer depends on your history, which is exactly what a short ${svc} visit sorts out. ${ctx.shortName}'s team walks through your situation, answers it for your case specifically, and maps the next step before you leave.`;
      return `### ${q.endsWith("?") ? q : q + "?"}\n\n${a}`;
    })
    .join("\n\n");

  return `# ${h1}

${dab}

![Hero image — ${svc} care at ${ctx.shortName}, ${city} (grayscale placeholder · final image added at publish)](image-placeholder-1)

## Key Takeaways

- ${takeaways.join("\n- ")}

## Why ${city} patients ask this

Search data shows "${kw}" comes up across the ${city} area every week — it is one of the questions patients most often type before choosing where to be seen. The short answer above covers most situations, but the details depend on your insurance, your history and how quickly you need care. According to [${auth[0].label}](${auth[0].url}), getting guidance from a primary care team early is one of the strongest predictors of better outcomes and lower costs.

That is the practical case for asking your local ${svc} team first: they answer it for *your* case, not the average one.

## What does the visit actually look like?

A typical ${svc} visit at [${ctx.shortName}](${site}) runs 20 to 40 minutes. The team reviews your history, examines the concern behind your question, and gives you a plain-English plan before you leave.

- Check-in and coverage verification at the front desk
- History and vitals with a nurse
- The exam and the conversation — your question, answered for your situation
- A written plan: prescriptions, labs, referrals or simply reassurance

| Quick reference | The short answer |
|---|---|
| Same-day availability | Most weekdays — call at opening |
| Insurance verification | Done at the front desk before you are seen |
| What to bring | Photo ID, insurance card, medication list |
| Follow-up | Scheduled before you leave |

No question is too small; the visit exists to remove the guesswork.

## How much does it cost, and does insurance cover it?

Most major insurance plans — commercial, Medicare and Medicare Advantage — cover ${svc} visits, and the front desk verifies your benefits before you are seen. Self-pay pricing is posted and quoted up front.

| Option | Typical cost position | Best for |
|---|---|---|
| ${svc} visit | Copay or posted self-pay rate | Everyday illness and this exact question |
| Urgent care | Higher copay on most plans | After-hours needs that cannot wait |
| Emergency room | Highest cost by far | True emergencies only |

For plan-by-plan detail, [MedlinePlus](https://medlineplus.gov) keeps a patient-friendly overview of how coverage tiers work.

## When should you be seen sooner?

Clinic care fits everyday needs — but some symptoms should skip the queue. Per [${auth[1].label}](${auth[1].url}) guidance, call 911 or go to the ER for chest pain, one-sided weakness, trouble breathing or uncontrolled bleeding. For everything in between, calling ${ctx.shortName} at opening usually secures a same-day slot.

## How do you choose the right clinic in ${city}?

Proximity matters, but so do the signals patients leave behind. ${rating ? `${ctx.shortName} holds ${rating} — and reviews` : "Reviews"} in ${city} consistently mention friendly staff and short waits, the two things that make routine care sustainable. A clinic inside Baptist Medical Group also connects your visit to the wider network: labs, imaging and [specialty care](/locations/${ctx.slug}) stay on one record. Compare that against any list you find — including the directories${competitorDomain ? ` (like ${competitorDomain})` : ""} that AI assistants quote — and weigh what actual patients say.

## What happens after the visit?

Your plan does not end at the door. Follow-ups are scheduled before you leave, results are called out when they land, and the [patient portal](${site}) keeps visit notes in one place. If your question turns into an ongoing condition, the same team manages it — per [${auth[2].label}](${auth[2].url}), continuity of care measurably improves outcomes for chronic conditions.

![In-article image — what a visit at ${ctx.shortName} looks like (grayscale placeholder · final image added at publish)](image-placeholder-2)

## Frequently Asked Questions

${faqBlock}

## Conclusion

"${h1}" has a short answer and a personal one — and the personal one takes a single visit. ${ctx.shortName} keeps same-week slots open for ${city} families, verifies insurance up front, and answers questions like this every day. [Request an appointment](${site}) or call the clinic; for medical emergencies call 911. This article is general information and does not replace medical advice from your provider.`;
}

export function generateGbpPost(question: string, ctx: PaaLocationCtx): GBPPost {
  const h1 = titleCase(question);
  return {
    id: `post-${ctx.slug}-paa-${hash(question).toString(36)}`,
    type: "health_observance",
    title: h1.length > 58 ? `${h1.slice(0, 55)}…` : h1,
    body: `It is one of the questions ${ctx.city} patients ask us most — so we answered it properly on our site. The short version: your ${ctx.service} team at ${ctx.shortName} can usually settle it in one visit, most insurance plans cover it, and same-week appointments are open now. Read the full answer, then bring us the follow-up questions.`,
    cta: {
      label: "Learn more",
      url: ctx.domain ? `https://${ctx.domain}` : "https://www.baptistmedicalclinic.org",
    },
    status: "pending_approval",
    source: "synthetic",
  };
}

const COVERAGE_HEADING = "## What else do patients ask about";

export interface SelfQaCheck {
  id: string;
  label: string;
  pass: boolean;
}

export function selfQaChecks(md: string): SelfQaCheck[] {
  const paras = md.split(/\n{2,}/).map((x) => x.trim());
  const h1At = paras.findIndex((x) => /^# /.test(x));
  const dab = paras.slice(h1At + 1).find((x) => x && !/^[#>|!\-]/.test(x)) ?? "";
  const dabWords = dab ? dab.split(/\s+/).length : 0;

  const takeSec = md.split("## Key Takeaways")[1]?.split(/\n## /)[0] ?? "";
  const takeaways = (takeSec.match(/^- /gm) ?? []).length;

  const faqSec = md.split("## Frequently Asked Questions")[1]?.split(/\n## /)[0] ?? "";
  const faqs = (faqSec.match(/^### /gm) ?? []).length;

  return [
    { id: "dab", label: "Direct answer block 40–60 words", pass: dabWords >= 40 && dabWords <= 60 },
    { id: "takeaways", label: "Exactly 6 key takeaways", pass: takeaways === 6 },
    {
      id: "qh2",
      label: "3+ question-form H2 sections",
      pass: (md.match(/^## [^\n]*\?$/gm) ?? []).length >= 3,
    },
    {
      id: "tables",
      label: "2+ tables (defining metric)",
      pass: (md.match(/^\|[\s:|-]+\|$/gm) ?? []).length >= 2,
    },
    {
      id: "figures",
      label: "2 grayscale image placeholders",
      pass: (md.match(/!\[[^\]]*\]\(image-placeholder/g) ?? []).length >= 2,
    },
    { id: "faq", label: "FAQ section with 5–7 questions", pass: faqs >= 5 && faqs <= 7 },
    { id: "repetition", label: "No repeated boilerplate sentences", pass: repetitionCheck(md) },
  ];
}

const STATE_NAMES: Record<string, string> = {
  MS: "Mississippi",
  TN: "Tennessee",
  AR: "Arkansas",
  AL: "Alabama",
  LA: "Louisiana",
  MO: "Missouri",
  KY: "Kentucky",
};

const TITLE_BRAND_BLOCK =
  /cvs|walgreen|merit|umc\b|methodist|trustcare|dominic|\bmea\b|compton|taylor|jason|mcmurray/i;

function leadPhrase(model: TermModel, ctx?: PaaLocationCtx): string {
  const clean = model.title_terms.filter((t) => !TITLE_BRAND_BLOCK.test(t.term));
  const hasTerm = (x: string) => model.title_terms.some((t) => t.term === x);
  const phrases = clean
    .filter((t) => t.term.includes(" ") && !/\bnear\b/.test(t.term))
    .sort(
      (a, b) => b.pct + b.term.split(" ").length * 15 - (a.pct + a.term.split(" ").length * 15),
    );
  let lead =
    phrases[0]?.term ??
    [...clean].sort((a, b) => b.pct - a.pct)[0]?.term ??
    model.query.replace(/[?]/g, "");
  if (hasTerm(`${lead}s`)) {
    lead = `${lead}s`;
  } else {
    for (const b of phrases.slice(0, 4)) {
      if (b.term === lead) continue;
      const aw = lead.split(" ");
      const bw = b.term.split(" ");
      if (aw[aw.length - 1] === bw[0]) {
        lead = [...aw, ...bw.slice(1)].join(" ");
        break;
      }
      if (bw[bw.length - 1] === aw[0]) {
        lead = [...bw, ...aw.slice(1)].join(" ");
        break;
      }
    }
  }
  if (!lead.includes(" ") && hasTerm("clinic")) lead = `${lead} clinic`;
  if (ctx && !lead.includes(" ") && ctx.service.toLowerCase().includes(lead))
    lead = ctx.service.toLowerCase();
  return lead;
}

const SMALL_WORDS = new Set(["in", "for", "and", "at", "of", "the", "a", "an", "&", "—"]);
function headlineCase(s: string): string {
  return s
    .split(" ")
    .map((w, i) => (i > 0 && SMALL_WORDS.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");
}

export function optimizedMetaTitle(model: TermModel, ctx: PaaLocationCtx): string {
  const terms = model.title_terms;
  const hasTerm = (x: string) => terms.some((t) => t.term === x);
  const used = (title: string, term: string) => termUses(title, term) > 0;
  const qTokens = model.query.toLowerCase().replace(/[?]/g, "").split(/\s+/);
  const service = ctx.service.toLowerCase();

  let title = titleCase(leadPhrase(model, ctx));

  for (const q of ["cost", "appointment", "referral", "insurance"]) {
    if (qTokens.includes(q) && !used(title, q)) {
      title += ` ${titleCase(q)}`;
      break;
    }
  }
  if (qTokens.includes("kids") || qTokens.includes("children") || qTokens.includes("child"))
    title += " for Kids";

  const stateFull = STATE_NAMES[ctx.state] ?? ctx.state;
  if (hasTerm(ctx.city.toLowerCase()) && !used(title, ctx.city)) title += ` in ${ctx.city}`;
  if (hasTerm(stateFull.toLowerCase()) && (title + `, ${stateFull}`).length <= 60)
    title += `, ${stateFull}`;

  const QUAL: Record<string, string | null> = {
    vaccine: "Vaccine Guide",
    clinics: "Walk-In Clinics",
    clinic: "Walk-In Clinic",
    surgery: "Surgery",
    pregnancy: "Pregnancy Care",
    doctors: "Doctors",
    fast: "Fast Visits",
    health: "Health Services",
    care: service.includes("primary care") ? "Primary Care" : null,
    family: service.includes("primary care") ? "Family Medicine" : null,
  };
  let pieces = 0;
  let wantNear = false;
  for (const t of [...terms].sort((a, b) => b.pct - a.pct)) {
    if (pieces >= 2) break;
    if (used(title, t.term) || TITLE_BRAND_BLOCK.test(t.term)) continue;
    if (t.term === "near") {
      wantNear = true;
      continue;
    }
    let piece: string | null = null;
    if (t.term.includes(" ") && !/\bnear\b/.test(t.term)) {
      if (t.pct < 20 || /\b(ms|tn|ar|al|la)\b/i.test(t.term)) continue;
      piece = titleCase(t.term);
      const lastWord = t.term.split(" ").pop() as string;
      if (hasTerm(`${lastWord} surgery`) && !used(title + piece, "surgery")) piece += " Surgery";
    } else {
      piece = QUAL[t.term] ?? null;
    }
    if (!piece || used(title, piece.toLowerCase())) continue;
    const next = `${title}${pieces === 0 ? " — " : " & "}${piece}`;
    if (next.length > 60) continue;
    title = next;
    pieces += 1;
  }
  if (wantNear && !used(title, "near")) {
    const next = pieces > 0 ? `${title} Near You` : `${title} — Near You`;
    if (next.length <= 60) title = next;
  }
  return headlineCase(title);
}

export function optimizedMetaDescription(model: TermModel, ctx: PaaLocationCtx): string {
  const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
  const dset = new Set(model.description_terms.map((t) => t.term));
  const stateFull = STATE_NAMES[ctx.state] ?? ctx.state;
  const lead = leadPhrase(model, ctx);
  const overlap = lead
    .split(" ")
    .some((w) => w.length > 3 && ctx.shortName.toLowerCase().includes(w));
  const at = overlap ? "Baptist Medical Group" : ctx.shortName;
  let d = `${cap(lead)} at ${at} in ${ctx.city}, ${stateFull}`;
  d +=
    dset.has("schedule") || dset.has("appointment") || dset.has("today") || dset.has("day")
      ? " — schedule a same-day appointment today"
      : " — our team explains what to expect at every visit";
  const extras = [
    dset.has("cost") || dset.has("insurance") ? "clear cost and insurance answers" : null,
    dset.has("fast") || dset.has("walk") ? "fast walk-in visits" : null,
    dset.has("find") ? "help finding the right fit for your family" : null,
    dset.has("call") ? "answers by phone anytime" : null,
  ].filter(Boolean) as string[];
  for (const x of extras) {
    if ((d + `, with ${x}.`).length <= 160) {
      d += `, with ${x}`;
      break;
    }
  }
  d += ".";
  return d;
}

export function repetitionCheck(md: string): boolean {
  const sentences = htmlless(md)
    .split(/(?<=[.!?])\s+/)
    .map((x) =>
      x
        .trim()
        .toLowerCase()
        .replace(/[^a-z ]/g, ""),
    )
    .filter((x) => x.split(" ").length >= 8);
  const shapes = new Map<string, number>();
  for (const sen of sentences) {
    const shape = sen.split(" ").slice(2).join(" ");
    shapes.set(shape, (shapes.get(shape) ?? 0) + 1);
  }
  return ![...shapes.values()].some((n) => n > 2);
}

function htmlless(t: string): string {
  return t.replace(/<[^>]+>/g, " ");
}

export function ensureBeatsBenchmark(
  bodyMd: string,
  metaTitle: string,
  model: TermModel,
  ctx: PaaLocationCtx,
): { bodyMd: string; metaTitle: string; score: number; target: number } {
  const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

  const stripManaged = (md: string) => {
    const i = md.indexOf(COVERAGE_HEADING);
    if (i < 0) return md;
    const j = md.indexOf("## Conclusion", i);
    return j >= 0 ? md.slice(0, i) + md.slice(j) : md.slice(0, i);
  };
  let base = stripManaged(bodyMd);

  const destuff = (text: string): string => {
    const SYN: Record<string, string> = {
      patients: "families",
      doctors: "clinicians",
      appointment: "visit",
      appointments: "visits",
    };
    let out = text;
    for (let round = 0; round < 3; round++) {
      const sc0 = nwScore(model, renderArticleHtml(out), metaTitle);
      const over = sc0.basic
        .filter((b) => b.uses > 2 * b.max)
        .sort((a, b) => b.term.length - a.term.length);
      if (!over.length) break;
      const t = over[0];
      const excess = t.uses - 2 * t.max;
      const escT = t.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "[\\s-]+");
      const words = t.term.split(/\s+/);
      const reAll = new RegExp(`(?<![a-z0-9])${escT}(?![a-z0-9])`, "gi");
      const idxs = [...out.matchAll(reAll)].map((m) => ({ i: m.index ?? 0, len: m[0].length }));
      const targets = idxs.slice(-Math.min(excess, idxs.length)).reverse();
      const acronym =
        words.length >= 2
          ? words
              .map((w) => w[0])
              .join("")
              .toUpperCase()
          : null;
      const syn = SYN[t.term.toLowerCase()] ?? null;
      for (const { i, len } of targets) {
        if (acronym && words.length >= 2) {
          out = out.slice(0, i) + acronym + out.slice(i + len);
        } else if (syn) {
          out = out.slice(0, i) + syn + out.slice(i + len);
        } else {
          const after = out.slice(i + len);
          if (/^\s+[a-zA-Z]/.test(after))
            out = out.slice(0, i) + after.replace(/^\s+/, " ").slice(1);
          else out = out.slice(0, i) + "it" + after;
        }
      }
    }
    return out;
  };
  base = destuff(base);

  const title = optimizedMetaTitle(model, ctx);

  let best = { bodyMd, metaTitle: title, score: 0, target: model.target_score };

  for (let extCap = 45; extCap <= 75; extCap += 15) {
    const scBase = nwScore(model, renderArticleHtml(base), title);

    const underBasic = scBase.basic.filter((t) => t.uses < t.min);
    const baseHeads = (base.match(/^#{1,3} .+$/gm) ?? []).join(" ").toLowerCase();
    const headMissing = scBase.basic
      .filter((t) => !baseHeads.includes(t.term.toLowerCase()))
      .map((t) => t.term);
    const JUNKY = new Set([
      "use",
      "view",
      "about",
      "book",
      "receive",
      "older",
      "months",
      "people",
      "year",
      "closed",
      "store",
      "online",
      "pickup",
      "office",
      "services",
      "locations",
      "open",
      "photo",
      "click",
      "page",
      "site",
      "info",
    ]);
    const isClean = (term: string) => {
      if (term.length < 5) return false;
      const words = term.split(/\s+/);
      return !words.some((w) => JUNKY.has(w));
    };
    const unusedExt = scBase.extended
      .filter((t) => t.uses === 0 && isClean(t.term))
      .slice(0, extCap);

    const CELL_POOL = [
      "Answered in plain language during the visit",
      "The care team walks through this before any decision",
      "Worth raising when you book — it shapes the visit plan",
      "Routine here — no preparation needed on your part",
      "Covered during the exam, with take-home guidance",
      "Handled case by case with the clinician",
    ];
    const tableRows = underBasic
      .slice(0, 10)
      .map((t, i) => `| ${cap(t.term)} | ${CELL_POOL[i % CELL_POOL.length]} |`);
    const carriers = tableRows.length
      ? [
          `The topics below come up weekly at ${ctx.shortName} — here is how each one is handled.`,
          "",
          "| Topic | How it's handled |",
          "|---|---|",
          ...tableRows,
        ].join("\n")
      : "";

    const H3_ANSWERS = [
      (a: string, b: string) =>
        `All of these come up in nearly every consult — the care team answers questions about ${a} and ${b} in plain language, with time left for yours.`,
      (a: string, b: string) =>
        `Questions about ${a} usually lead the conversation, and ${b} follows naturally; neither needs any preparation on your part.`,
      (a: string, b: string) =>
        `Raise questions about ${a} when you book and save ${b} for the exam room — the front desk flags both for the clinician.`,
      (a: string, b: string) =>
        `Families ask about ${a} and ${b} weekly; the answers depend on your situation, so expect the clinician to walk through both during the visit.`,
    ];
    const h3Blocks: string[] = [];
    for (let i = 0; i < Math.min(headMissing.length, 16); i += 4) {
      const chunk = headMissing.slice(i, i + 4);
      if (chunk.length === 1) {
        h3Blocks.push(
          `### What should you know about ${chunk[0]} in ${ctx.city}?\n\nAsk at the front desk — ${chunk[0]} questions are routine here and answered before you commit to anything.`,
        );
      } else if (chunk.length >= 2) {
        const answer = H3_ANSWERS[(i / 4) % H3_ANSWERS.length](chunk[0], chunk[1]);
        h3Blocks.push(
          `### What should you know about ${chunk.slice(0, -1).join(", ")} and ${chunk.slice(-1)}?\n\n${answer}`,
        );
      }
    }

    const extSentences: string[] = [];
    for (let i = 0; i < unusedExt.length; i += 8) {
      const chunk = unusedExt.slice(i, i + 8).map((t) => t.term);
      if (chunk.length < 2) break;
      const opener = [
        `Patients weighing ${chunk[0]} usually also ask about`,
        `The same conversations tend to touch`,
        `Alongside that, ${ctx.city} families compare notes on`,
        `And the longer visits wander into`,
      ][Math.min(Math.floor(i / 8), 3)];
      extSentences.push(
        `${opener} ${chunk.slice(1, -1).join(", ")}${chunk.length > 2 ? " and " : " "}${chunk[chunk.length - 1]}.`,
      );
    }
    const extList = extSentences.length
      ? `The topics that orbit this question are worth knowing by name. ${extSentences.join(" ")}`
      : "";

    const headTerms = model.basic_terms
      .slice(0, 2)
      .map((t) => t.term)
      .join(" and ");
    const section = [
      `${COVERAGE_HEADING} ${headTerms}?`,
      "",
      carriers,
      "",
      h3Blocks.join("\n\n"),
      "",
      extList,
    ]
      .join("\n")
      .replace(/\n{3,}/g, "\n\n");

    const concl = base.indexOf("## Conclusion");
    const woven =
      concl >= 0
        ? base.slice(0, concl) + section + "\n\n" + base.slice(concl)
        : `${base.trimEnd()}\n\n${section}`;

    const sc = nwScore(model, renderArticleHtml(woven), title);
    if (sc.score > best.score)
      best = { bodyMd: woven, metaTitle: title, score: sc.score, target: sc.target };
    if (sc.score > sc.target) break;
  }
  if (best.score <= best.target) {
    const cleaned = destuff(best.bodyMd);
    const sc2 = nwScore(model, renderArticleHtml(cleaned), best.metaTitle);
    if (sc2.score > best.score) best = { ...best, bodyMd: cleaned, score: sc2.score };
  }
  return best;
}

export function generatePackage(
  opp: Pick<PaaOpportunity, "question" | "sourceKeyword" | "competitorDomain">,
  ctx: PaaLocationCtx,
  variant = 0,
  model?: TermModel | null,
): GeneratedPackage {
  const faqs = relatedQuestions(opp.question, ctx, variant);
  const terms = buildTerms(opp.question, ctx);
  const body = generateArticleBody(opp.question, ctx, faqs, opp.competitorDomain, variant);
  const h1 = titleCase(opp.question);
  const metaTitle = `${h1} | ${ctx.shortName}`;
  const metaDescription =
    model && model.source !== "synthetic"
      ? optimizedMetaDescription(model, ctx)
      : `${ctx.city} patients ask this every week. ${ctx.shortName} answers it plainly — costs, insurance, timing and when to be seen. Same-week appointments available.`;

  let finalBody = body;
  let finalMetaTitle = metaTitle;
  if (model && model.source !== "synthetic") {
    const beat = ensureBeatsBenchmark(body, metaTitle, model, ctx);
    finalBody = beat.bodyMd;
    finalMetaTitle = beat.metaTitle;
  }

  const article: ContentArticle = {
    id: `paa-${ctx.slug}-${hash(opp.question).toString(36)}`,
    title: h1,
    target_keyword: opp.question.toLowerCase().replace(/\?$/, ""),
    location_slug: ctx.slug,
    status: "optimizing",
    intent: "paa-capture",
    updated_at: new Date().toISOString(),
    author: "PAA Studio (generated)",
    terms,
    questions: faqs,
    body_md: finalBody,
    source: "synthetic",
  };

  return {
    article,
    gbpPost: generateGbpPost(opp.question, ctx),
    competitorDomain: opp.competitorDomain,
    metaTitle: finalMetaTitle,
    metaDescription,
    ctx,
  };
}

export function regenerateFaqSection(
  body: string,
  question: string,
  ctx: PaaLocationCtx,
  variant: number,
): { body: string; faqs: string[] } {
  const faqs = relatedQuestions(question, ctx, variant);
  const fresh = generateArticleBody(question, ctx, faqs, null, variant);
  const extract = (src: string) => {
    const start = src.indexOf("## Frequently Asked Questions");
    const end = src.indexOf("## Conclusion");
    return start >= 0 && end > start ? src.slice(start, end) : null;
  };
  const freshFaq = extract(fresh);
  if (!freshFaq) return { body, faqs };
  const start = body.indexOf("## Frequently Asked Questions");
  const end = body.indexOf("## Conclusion");
  if (start >= 0 && end > start) {
    return { body: body.slice(0, start) + freshFaq + body.slice(end), faqs };
  }
  if (start >= 0) {
    return { body: body.slice(0, start) + freshFaq.trimEnd(), faqs };
  }
  if (end >= 0) {
    return { body: body.slice(0, end) + freshFaq + body.slice(end), faqs };
  }
  return { body: `${body.trimEnd()}\n\n${freshFaq.trimEnd()}`, faqs };
}

export function renderArticleHtml(md: string): string {
  const esc = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const inline = (t: string) =>
    esc(t)
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|[^_])_([^_]+)_/g, "$1<em>$2</em>")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
  const blocks = md.split(/\n\n+/);
  const html: string[] = [];
  for (const b of blocks) {
    const t = b.trim();
    if (!t) continue;
    if (/^!\[/.test(t)) {
      const alt = t.match(/^!\[([^\]]*)\]/)?.[1] ?? "Image placeholder";
      html.push(
        `<figure contenteditable="false" data-placeholder="true"><div style="height:190px;display:flex;align-items:center;justify-content:center;background:#e5e7eb;border:1px dashed #9ca3af;border-radius:6px;color:#6b7280;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.08em">IMAGE PLACEHOLDER</div><figcaption>${esc(alt)}</figcaption></figure>`,
      );
    } else if (t.startsWith("# ")) html.push(`<h1>${inline(t.slice(2))}</h1>`);
    else if (t.startsWith("## ")) html.push(`<h2>${inline(t.slice(3))}</h2>`);
    else if (t.startsWith("### ")) html.push(`<h3>${inline(t.slice(4))}</h3>`);
    else if (/^\|.+\|/m.test(t)) {
      const rows = t
        .split("\n")
        .filter((r) => r.trim().startsWith("|") && !/^\|[\s:|-]+\|$/.test(r.trim()));
      const cells = rows.map((r) =>
        r
          .split("|")
          .slice(1, -1)
          .map((c) => inline(c.trim())),
      );
      if (cells.length) {
        const [head, ...body] = cells;
        html.push(
          `<table><thead><tr>${head.map((c) => `<th>${c}</th>`).join("")}</tr></thead><tbody>${body
            .map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`)
            .join("")}</tbody></table>`,
        );
      }
    } else if (t.startsWith("- ")) {
      html.push(
        `<ul>${t
          .split("\n")
          .map((l) => `<li>${inline(l.replace(/^- /, ""))}</li>`)
          .join("")}</ul>`,
      );
    } else html.push(`<p>${inline(t)}</p>`);
  }
  return html.join("\n");
}
