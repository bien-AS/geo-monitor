import type {
  AuditVerb,
  BaptistLocation,
  CitationsFixture,
  NAPFile,
  ScorecardItem,
} from "@/lib/data/types";
import { shortName as shortLocationName } from "./short-name";

export interface ProposalChange {
  label: string;
  from?: string;
  to: string;
}

export interface ItemProposal {
  intro: string;
  changes?: ProposalChange[];
  auditAction: string;
  auditResource: string;
  auditVerb: AuditVerb;
}

function idealCategoryFromDetail(detail: string): string | null {
  const m = detail.match(/ideal for this department: (.+)$/);
  return m ? m[1] : null;
}

export function composeProposals({
  location,
  items,
  nap,
  citations,
  keywordTemplates,
  phoneSiblings,
}: {
  location: BaptistLocation;
  items: ScorecardItem[];
  nap: NAPFile | null;
  citations: CitationsFixture | null;
  keywordTemplates: Record<string, string[]>;
  phoneSiblings: string[];
}): Record<string, ItemProposal> {
  const slug = location.slug;
  const localShortName = shortLocationName(location.name);
  const proposals: Record<string, ItemProposal> = {};
  const byId = new Map(items.map((i) => [i.id, i]));

  const openDrifts = (nap?.drifts ?? []).filter((d) => d.slug === slug && d.status === "open");
  const duplicates = (citations?.rows ?? []).filter((r) => r.status === "duplicate");
  const facilityType = location.facility_type ?? "primary_care";
  const serviceSeeds = (keywordTemplates[facilityType] ?? [])
    .map((kw) => kw.replace("{city}", location.city).replace("{metro}", `${location.city} metro`))
    .filter((kw) => !kw.includes("near me"));

  const item = (id: string) => byId.get(id);

  if (item("primary_category")?.action) {
    const ideal =
      idealCategoryFromDetail(item("primary_category")!.detail) ??
      "the department-correct healthcare category";
    proposals.primary_category = {
      intro: `Set the primary GBP category for ${localShortName} to match the department function.`,
      changes: [
        {
          label: "Primary category",
          from: location.primary_category ?? "(not resolved)",
          to: ideal,
        },
      ],
      auditAction: "Queued primary category correction",
      auditResource: `gbp:${slug}/category`,
      auditVerb: "update",
    };
  }

  if (item("secondary_categories")?.action) {
    proposals.secondary_categories = {
      intro:
        "Add secondary categories that match the service lines this department actually offers.",
      changes: [
        {
          label: "Secondary categories",
          from: "(none set)",
          to:
            facilityType === "primary_care"
              ? "Family practice physician \u00b7 Walk-in clinic"
              : "Medical clinic \u00b7 Doctor",
        },
      ],
      auditAction: "Queued secondary category additions",
      auditResource: `gbp:${slug}/category`,
      auditVerb: "update",
    };
  }

  if (item("nap_exactness")?.action) {
    proposals.nap_exactness = {
      intro: `Write the canonical NAP value over ${openDrifts.length} open drift${openDrifts.length === 1 ? "" : "s"} detected on tracked directories.`,
      changes: openDrifts.map((d) => ({
        label: `${d.field} \u00b7 ${d.directory}`,
        from: d.observed_value ?? d.observed,
        to: d.canonical_value ?? d.canonical,
      })),
      auditAction: "Queued NAP corrections to drifting directories",
      auditResource: `nap:${slug}`,
      auditVerb: "update",
    };
  }

  if (item("hours")?.action) {
    proposals.hours = {
      intro: "Publish weekly hours confirmed with the department.",
      changes: [
        {
          label: "Hours of operation",
          from: "(no hours listed)",
          to: "Mon\u2013Fri 8:00 AM\u20135:00 PM \u00b7 pending department confirmation",
        },
      ],
      auditAction: "Queued hours publication",
      auditResource: `gbp:${slug}/hours`,
      auditVerb: "update",
    };
  }

  if (item("phone_distinct")?.action) {
    proposals.phone_distinct = {
      intro: `Open a phone-routing review with Baptist telecom \u2014 this listing shares its line with ${
        phoneSiblings.length > 0 ? phoneSiblings.join(", ") : "sibling listings"
      }.`,
      changes: [
        {
          label: "Listing phone",
          from: location.phone ?? "(none)",
          to: "Department-direct line (requested from Baptist telecom)",
        },
      ],
      auditAction: "Queued department phone routing review",
      auditResource: `gbp:${slug}/phone`,
      auditVerb: "update",
    };
  }

  if (item("website_deeplink")?.action) {
    const domain = location.domain ?? "www.baptistmedicalclinic.org";
    proposals.website_deeplink = {
      intro: "Point the listing at the facility's own page instead of the domain root.",
      changes: [
        {
          label: "Website",
          from: location.website ?? "(none)",
          to: `https://${domain}/locations/${slug} (proposed facility page)`,
        },
      ],
      auditAction: "Queued website deep-link correction",
      auditResource: `gbp:${slug}/website`,
      auditVerb: "update",
    };
  }

  if (item("description_profile")?.action) {
    proposals.description_profile = {
      intro:
        "Resolve the profile items Search Atlas flagged as needing attention (description, opening date, profile fields).",
      changes: [
        {
          label: "Business description",
          to: "Compliant service-line description with the primary keyword \u2014 drafted for operator review, no PHI, no superlative claims",
        },
      ],
      auditAction: "Queued profile optimization fixes",
      auditResource: `gbp:${slug}/profile`,
      auditVerb: "update",
    };
  }

  if (item("attributes_health")?.action) {
    proposals.attributes_health = {
      intro: "Add the health-specific attribute set Google supports for this category.",
      changes: [
        {
          label: "Attributes",
          from: item("attributes_health")!.detail,
          to: "Wheelchair-accessible entrance & restroom \u00b7 Telehealth available \u00b7 Languages spoken \u00b7 Accepts new patients",
        },
      ],
      auditAction: "Queued health attribute additions",
      auditResource: `gbp:${slug}/attributes`,
      auditVerb: "update",
    };
  }

  if (item("services_menu")?.action) {
    proposals.services_menu = {
      intro: "Seed the GBP services menu from this department's keyword template.",
      changes: serviceSeeds.map((s) => ({
        label: "Service line",
        to: s,
      })),
      auditAction: "Queued service menu seeding",
      auditResource: `gbp:${slug}/services`,
      auditVerb: "create",
    };
  }

  if (item("photos_freshness")?.action) {
    proposals.photos_freshness = {
      intro: `Request a fresh photo set from the facility (currently ${location.total_photos ?? 0} photo${(location.total_photos ?? 0) === 1 ? "" : "s"} on the listing).`,
      changes: [
        {
          label: "Photo set",
          to: "Exterior / entrance (findability) \u00b7 interior \u00b7 care team \u2014 5+ photos, no patients in frame",
        },
      ],
      auditAction: "Queued facility photo set request",
      auditResource: `gbp:${slug}/photos`,
      auditVerb: "create",
    };
  }

  if (item("qa_seeded")?.action) {
    proposals.qa_seeded = {
      intro: "Seed owner-answered Q&A for the questions patients actually ask.",
      changes: [
        { label: "Q&A", to: "Where do I park and which entrance do I use?" },
        { label: "Q&A", to: "Do I need a referral to be seen?" },
        { label: "Q&A", to: "Which insurance plans are accepted?" },
        { label: "Q&A", to: "Are telehealth visits available?" },
      ],
      auditAction: "Queued owner Q&A seeding",
      auditResource: `gbp:${slug}/qa`,
      auditVerb: "create",
    };
  }

  if (item("appointment_link")?.action) {
    proposals.appointment_link = {
      intro: "Add the scheduling deep-link so patients can book from the listing.",
      changes: [
        {
          label: "Appointment link",
          from: "(none detected)",
          to: "Baptist scheduling URL for this department (confirmed with patient access)",
        },
      ],
      auditAction: "Queued appointment link addition",
      auditResource: `gbp:${slug}/booking`,
      auditVerb: "update",
    };
  }

  if (item("posts_recency")?.action) {
    proposals.posts_recency = {
      intro:
        "Schedule a recurring GBP post cadence for this listing (drafts route through the posts approval queue).",
      changes: [
        {
          label: "Post cadence",
          from: "0 posts on the listing",
          to: "2 posts/month \u2014 service-line spotlight + health-observance campaign",
        },
      ],
      auditAction: "Queued GBP post cadence",
      auditResource: `gbp:${slug}/posts`,
      auditVerb: "create",
    };
  }

  if (item("duplicate_merge")?.action) {
    proposals.duplicate_merge = {
      intro: `Open merge/suppression requests for ${duplicates.length} suspected duplicate listing${duplicates.length === 1 ? "" : "s"}.`,
      changes: duplicates.map((r) => ({
        label: r.directory,
        from: "Suspected duplicate listing",
        to: "Merge / suppression request filed with the directory",
      })),
      auditAction: "Queued duplicate merge review",
      auditResource: `citations:${slug}/duplicates`,
      auditVerb: "update",
    };
  }

  return proposals;
}
