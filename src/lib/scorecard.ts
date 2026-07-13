import type {
  BaptistLocation,
  CitationsFixture,
  GBPAuditFixture,
  NAPFile,
  ScorecardItem,
} from "@/lib/data/types";

const IDEAL_CATEGORY: Record<string, string[]> = {
  primary_care: ["Medical clinic", "Family practice physician"],
  internal_medicine: ["Internal medicine ward", "Internist", "Medical clinic"],
  specialty_ent: ["Otolaryngologist", "Otolaryngology clinic"],
  specialty_rheumatology: ["Rheumatologist"],
  specialty_mfm: ["Perinatal center", "Women's health clinic"],
  specialty_pmr: ["Physiatrist", "Rehabilitation center"],
  surgical: ["Surgeon", "Surgical center"],
};

function catScore(audit: GBPAuditFixture | null, key: string): number | null {
  const cat = audit?.report?.category_scores?.[key];
  return cat && cat.total_items > 0 ? cat.score : null;
}

function statusFromScore(score: number | null): ScorecardItem["status"] {
  if (score == null) return "unknown";
  if (score >= 75) return "pass";
  if (score >= 40) return "attention";
  return "fail";
}

export const SCORECARD_IMPACT: Record<string, string> = {
  primary_category:
    "The single highest-leverage GBP field \u2014 a generic category dilutes ranking for the department's real specialty queries.",
  secondary_categories:
    "Secondary categories widen the query set the listing can rank for without splitting the entity.",
  nap_exactness:
    "NAP drift erodes local-pack trust and splits citation equity; payer directories inherit the errors.",
  hours:
    "Wrong or missing hours drive patient walk-aways and negative reviews; ER/urgent-care hours are patient-safety data.",
  phone_distinct:
    "Shared phone lines blur entity boundaries \u2014 Google may merge or suppress sibling department listings.",
  website_deeplink:
    "Root/system links leak conversion and blur entity association; deep links to the facility page consolidate signals.",
  description_profile:
    "Profile completeness is a direct audit-score input and feeds AI-engine entity understanding.",
  attributes_health:
    "Accessibility, telehealth, and payment attributes filter directly into 'near me' refinements and AI answers.",
  services_menu:
    "The services menu is structured data Google and AI engines quote \u2014 an empty menu forfeits service-line queries.",
  photos_freshness:
    "Fresh entrance/interior photos lift conversion and findability; stale media reads as a stale business.",
  qa_seeded: "Owner-seeded Q&A owns the answer box before patients or trolls write it for you.",
  appointment_link:
    "A booking deep-link turns visibility into scheduled appointments \u2014 the conversion field on the listing.",
  reviews_health:
    "Rating, recency, and response rate are the heaviest local-pack trust signals \u2014 and AI engines quote them.",
  posts_recency:
    "Post cadence signals an active business; zero posts fleet-wide is a visible freshness gap vs rivals.",
  duplicate_merge:
    "Duplicates split reviews and rank between listings \u2014 endemic in hospital systems after acquisitions.",
  schema_parity:
    "Schema on the linked page must match the GBP \u2014 parity strengthens the entity graph AI engines resolve against.",
};

export function buildScorecard({
  location,
  audit,
  citations,
  nap,
  fleetPhones,
}: {
  location: BaptistLocation;
  audit: GBPAuditFixture | null;
  citations: CitationsFixture | null;
  nap: NAPFile | null;
  fleetPhones: Map<string, number>;
}): ScorecardItem[] {
  const items: ScorecardItem[] = [];
  const slug = location.slug;
  const facilityType = location.facility_type ?? "primary_care";

  const ideal = IDEAL_CATEGORY[facilityType] ?? ["Medical clinic"];
  const catOk = location.primary_category ? ideal.includes(location.primary_category) : null;
  const genericSpecialty =
    facilityType.startsWith("specialty_") && location.primary_category === "Medical clinic";
  items.push({
    id: "primary_category",
    n: 1,
    label: "Primary category vs department function",
    status: catOk === null ? "unknown" : catOk && !genericSpecialty ? "pass" : "attention",
    detail:
      location.primary_category == null
        ? "Category not resolved"
        : genericSpecialty || !catOk
          ? `Listed as "${location.primary_category}" \u2014 ideal for this department: ${ideal[0]}`
          : `"${location.primary_category}" matches the department function`,
    source: "dataforseo",
    action: genericSpecialty || catOk === false ? "Fix category" : undefined,
  });

  const hasSecondary = (location.additional_categories?.length ?? 0) > 0;
  items.push({
    id: "secondary_categories",
    n: 2,
    label: "Secondary categories",
    status: hasSecondary ? "pass" : "attention",
    detail: hasSecondary
      ? `${location.additional_categories!.length} secondary categories set`
      : "No secondary categories on the listing",
    source: "dataforseo",
    action: hasSecondary ? undefined : "Add categories",
  });

  const drifts = nap?.drifts.filter((d) => d.slug === slug && d.status !== "fixed") ?? [];
  const criticalDrift = drifts.some((d) => d.severity === "critical");
  items.push({
    id: "nap_exactness",
    n: 3,
    label: "NAP exactness vs canonical",
    status: drifts.length === 0 ? "pass" : criticalDrift ? "fail" : "attention",
    detail:
      drifts.length === 0
        ? "Listing matches the canonical NAP"
        : `${drifts.length} open drift${drifts.length > 1 ? "s" : ""}: ${drifts
            .map((d) => d.field)
            .join(", ")}`,
    source: "dataforseo",
    action: drifts.length > 0 ? "Queue NAP fix" : undefined,
  });

  const hasHours = Boolean(location.work_time?.timetable);
  items.push({
    id: "hours",
    n: 4,
    label: "Hours of operation",
    status: hasHours ? "pass" : "fail",
    detail: hasHours ? "Weekly hours published" : "No hours on the listing",
    source: "dataforseo",
    action: hasHours ? undefined : "Set hours",
  });

  const phoneCount = location.phone ? (fleetPhones.get(location.phone) ?? 1) : 0;
  items.push({
    id: "phone_distinct",
    n: 5,
    label: "Department-distinct phone",
    status: location.phone == null ? "fail" : phoneCount > 1 ? "attention" : "pass",
    detail:
      location.phone == null
        ? "No phone on the listing"
        : phoneCount > 1
          ? `Shares ${location.phone} with ${phoneCount - 1} sibling listing${phoneCount > 2 ? "s" : ""}`
          : "Unique direct line",
    source: "dataforseo",
    action: phoneCount > 1 ? "Review phone routing" : undefined,
  });

  const website = location.website ?? "";
  const isDeepLink = /baptistmedicalclinic\.org\/.+|baptistdoctors\.org\/.+/.test(
    website.replace(/https?:\/\/(www\.)?/, ""),
  );
  const isGeneric = website.includes("baptistonline.org");
  items.push({
    id: "website_deeplink",
    n: 6,
    label: "Website deep-link to facility page",
    status: !website ? "fail" : isDeepLink ? "pass" : "attention",
    detail: !website
      ? "No website on the listing"
      : isDeepLink
        ? "Links to the facility page"
        : isGeneric
          ? "Points at the generic system locations page"
          : "Points at the domain root, not the facility page",
    source: "dataforseo",
    action: isDeepLink ? undefined : "Fix website link",
  });

  const profileScore = catScore(audit, "profile_optimization");
  items.push({
    id: "description_profile",
    n: 7,
    label: "Description & profile completeness",
    status: statusFromScore(profileScore),
    detail:
      profileScore == null
        ? "Audit still processing"
        : `Search Atlas profile optimization: ${profileScore}/100`,
    source: "searchatlas",
    action: profileScore != null && profileScore < 75 ? "Improve profile" : undefined,
  });

  const attrGroups = Object.keys(location.attributes ?? {});
  const attrCount = Object.values(location.attributes ?? {}).flat().length;
  items.push({
    id: "attributes_health",
    n: 8,
    label: "Health attributes (accessibility, planning, payments)",
    status: attrCount >= 8 ? "pass" : attrCount >= 4 ? "attention" : "fail",
    detail: `${attrCount} attributes across ${attrGroups.length} groups`,
    source: "dataforseo",
    action: attrCount < 8 ? "Add attributes" : undefined,
  });

  const servicesCat = audit?.report?.category_scores?.services_products;
  const servicesEmpty = servicesCat != null && servicesCat.total_items === 0;
  items.push({
    id: "services_menu",
    n: 9,
    label: "Services / service-line menu",
    status: servicesEmpty ? "fail" : statusFromScore(catScore(audit, "services_products")),
    detail: servicesEmpty
      ? "No services configured on the listing"
      : servicesCat
        ? `Search Atlas services score: ${servicesCat.score}/100`
        : "Audit still processing",
    source: "searchatlas",
    action: servicesEmpty ? "Add services" : undefined,
  });

  const photosScore = catScore(audit, "photos_media");
  const photoCount = location.total_photos ?? 0;
  items.push({
    id: "photos_freshness",
    n: 10,
    label: "Photos (exterior, interior, staff) freshness",
    status:
      photosScore != null
        ? statusFromScore(photosScore)
        : photoCount >= 5
          ? "pass"
          : photoCount >= 2
            ? "attention"
            : "fail",
    detail: `${photoCount} photo${photoCount === 1 ? "" : "s"} on the listing${
      photosScore != null ? ` \u00b7 audit score ${photosScore}/100` : ""
    }`,
    source: photosScore != null ? "searchatlas" : "dataforseo",
    action: photoCount < 5 ? "Request photo set" : undefined,
  });

  items.push({
    id: "qa_seeded",
    n: 11,
    label: "Q&A seeded & monitored",
    status: "attention",
    detail: "Owner Q&A not yet seeded \u2014 high-leverage, commonly ignored",
    source: "synthetic",
    action: "Seed Q&A",
  });

  items.push({
    id: "appointment_link",
    n: 12,
    label: "Appointment / booking link",
    status: "attention",
    detail: "No scheduling deep-link detected on the listing",
    source: "synthetic",
    action: "Add booking link",
  });

  const reviewsScore = catScore(audit, "reviews_reputation");
  const rating = location.rating?.value ?? null;
  items.push({
    id: "reviews_health",
    n: 13,
    label: "Reviews health (volume, recency, rating, response)",
    status:
      rating != null && rating < 3.5
        ? "fail"
        : rating != null && rating < 4.2
          ? "attention"
          : statusFromScore(reviewsScore ?? (rating != null ? 80 : null)),
    detail:
      rating == null
        ? "No reviews yet on this listing"
        : `${rating.toFixed(1)}\u2605 \u00b7 ${location.rating?.votes_count ?? 0} reviews${
            reviewsScore != null ? ` \u00b7 audit score ${reviewsScore}/100` : ""
          }`,
    source: reviewsScore != null ? "searchatlas" : "dataforseo",
    action: rating != null && rating < 4.2 ? "Open review workspace" : undefined,
  });

  const postsScore = catScore(audit, "posts_updates");
  const postsCount = audit?.report?.business_metrics_core?.posts?.value ?? null;
  items.push({
    id: "posts_recency",
    n: 14,
    label: "Posts recency",
    status: postsCount === 0 ? "fail" : statusFromScore(postsScore),
    detail:
      postsCount === 0
        ? "No GBP posts on the listing"
        : postsScore != null
          ? `Audit posts score: ${postsScore}/100`
          : "Audit still processing",
    source: "searchatlas",
    action: postsCount === 0 ? "Schedule posts" : undefined,
  });

  const dupes = citations?.rows?.filter((r) => r.status === "duplicate").length ?? 0;
  items.push({
    id: "duplicate_merge",
    n: 15,
    label: "Duplicate / merge status",
    status: dupes === 0 ? "pass" : "attention",
    detail:
      dupes === 0
        ? "No suspected duplicates in the tracked directory set"
        : `${dupes} suspected duplicate listing${dupes > 1 ? "s" : ""} detected`,
    source: citations?.source ?? "synthetic",
    action: dupes > 0 ? "Review duplicates" : undefined,
  });

  items.push({
    id: "schema_parity",
    n: 16,
    label: "Schema parity (MedicalClinic / Physician on linked page)",
    status: "unknown",
    detail: "Schema check requires live page crawl \u2014 Phase 2",
    source: "synthetic",
  });

  return items;
}

export function scorecardScore(items: ScorecardItem[]): number | null {
  const scored = items.filter((i) => i.status !== "unknown");
  if (scored.length === 0) return null;
  const sum = scored.reduce(
    (acc, i) => acc + (i.status === "pass" ? 1 : i.status === "attention" ? 0.5 : 0),
    0,
  );
  return Math.round((sum / scored.length) * 100);
}
