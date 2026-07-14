import type { CitationsFixture, LocalAIFixture, NAPDrift, ReviewsFixture } from "@/lib/data/types";
import type { ActionRec } from "@/lib/data/types";

export function composeRecs(inputs: {
  locations: Array<{ slug: string; name: string; city: string }>;
  drifts: NAPDrift[];
  reviewsBySlug: Record<string, ReviewsFixture | null>;
  aiBySlug: Record<string, LocalAIFixture | null>;
  citationsBySlug: Record<string, CitationsFixture | null>;
}): ActionRec[] {
  const { locations, drifts, reviewsBySlug, aiBySlug, citationsBySlug } = inputs;
  const short = (name: string) => name.split(" - ")[1] ?? name;
  const recs: ActionRec[] = [];

  for (const d of drifts.filter((d) => d.status === "open")) {
    const loc = locations.find((l) => l.slug === d.slug);
    if (!loc) continue;
    recs.push({
      id: `rec-nap-${d.slug}-${d.field}-${d.directory}`,
      kind: "nap_drift",
      title: `Correct ${d.field} drift on ${d.directory}`,
      location_slug: d.slug,
      location_name: short(loc.name),
      severity: d.field === "phone" ? "high" : "medium",
      impact: "NAP consistency feeds 14% of LVI",
      evidence: [
        `Canonical: ${d.canonical_value}`,
        `Listed on ${d.directory}: ${d.observed_value}`,
        `Detected by the weekly drift crawl`,
      ],
      methodology:
        "Weekly directory crawl diffs every monitored listing against the canonical NAP; exact-match comparison after suite-format normalization.",
      generate_href: `/locations/${d.slug}/citations`,
      generate_label: "Open drift queue",
      status: "backlog",
    });
  }

  for (const loc of locations) {
    const rf = reviewsBySlug[loc.slug];
    if (!rf) continue;
    const unanswered = rf.reviews.filter((r) => r.status === "unanswered").length;
    if (unanswered >= 3) {
      recs.push({
        id: `rec-rev-${loc.slug}`,
        kind: "reviews",
        title: `Reply to ${unanswered} unanswered reviews`,
        location_slug: loc.slug,
        location_name: short(loc.name),
        severity: unanswered >= 6 ? "high" : "medium",
        impact: "Response rate feeds 8% of LVI - replies carry the SEO weave",
        evidence: [
          `${unanswered} reviews without a public reply`,
          `HIPAA-safe drafts available per review`,
          `Positive replies weave city + service line`,
        ],
        methodology:
          "Review fixtures snapshotted from the live profile; unanswered = no owner reply.",
        generate_href: `/locations/${loc.slug}/reviews?status=unanswered`,
        generate_label: "Open reply workspace",
        status: "backlog",
      });
    }
  }

  for (const loc of locations) {
    const ai = aiBySlug[loc.slug];
    if (!ai) continue;
    const cited = ai.results.filter((r) => r.cited === true).length;
    if (ai.results.length > 0 && cited === 0) {
      recs.push({
        id: `rec-ai-${loc.slug}`,
        kind: "ai_gap",
        title: "Zero AI citations - build directory grounding",
        location_slug: loc.slug,
        location_name: short(loc.name),
        severity: "high",
        impact: "AI visibility feeds 12% of LVI - first-touch channel",
        evidence: [
          `0/${ai.results.length} checks cited this location in the fleet bake`,
          "Directory profiles are the citation path chatbots use",
          "Content answering PAA questions wins AI-answer slots",
        ],
        methodology:
          "Real DataForSEO bake: live LLM responses + geolocated SERPs, domains parsed per answer.",
        generate_href: `/locations/${loc.slug}/local-ai`,
        generate_label: "Open AI visibility",
        status: "backlog",
      });
    }
  }

  const missingRank = locations
    .map((loc) => ({
      loc,
      missing: (citationsBySlug[loc.slug]?.rows ?? []).filter((r) => r.status === "missing").length,
    }))
    .filter((x) => x.missing >= 8)
    .sort((a, b) => b.missing - a.missing)
    .slice(0, 3);
  for (const { loc, missing } of missingRank) {
    recs.push({
      id: `rec-cit-${loc.slug}`,
      kind: "citations",
      title: `Order ${missing} missing citations`,
      location_slug: loc.slug,
      location_name: short(loc.name),
      severity: missing >= 12 ? "high" : "medium",
      impact: "Citation coverage feeds 8% of LVI - aggregator sync compounds it",
      evidence: [
        `${missing} tracked directories have no listing`,
        "Bright Local packages cover the gap in one order",
        "Rows track submission -> live -> indexed per directory",
      ],
      methodology:
        "Baseline of directories per location; authority scores from backlink ranks; missing = no listing found at the canonical NAP.",
      generate_href: `/locations/${loc.slug}/citations`,
      generate_label: "Open order drawer",
      status: "backlog",
    });
  }

  const sevRank = { high: 0, medium: 1, low: 2 };
  return recs.sort((a, b) => sevRank[a.severity] - sevRank[b.severity]);
}
