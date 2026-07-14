import type { BaptistLocation } from "@/lib/data/types";
import type { ProfileField, LocationProfileSections } from "@/lib/data/types";

function serviceLabel(facilityType: string): string {
  return facilityType.replace(/^specialty_/, "").replace(/_/g, " ");
}

export function buildLocationProfileSections(
  location: BaptistLocation,
  serviceSeeds: string[],
): LocationProfileSections {
  const shortName = location.name.split(" - ")[1] ?? location.name;
  const service = serviceLabel(location.facility_type ?? "primary_care");
  const city = location.city;
  const rating = location.rating?.value;
  const votes = location.rating?.votes_count;

  const brandVoice: ProfileField[] = [
    {
      id: "promise",
      label: "Location promise",
      value: `${shortName} gives ${city} families ${service} care from a team that knows them by name - backed by the Baptist Memorial network.`,
    },
    {
      id: "voice",
      label: "Voice descriptors",
      value:
        "Warm, plainspoken, unhurried. Local-first: name the clinic and the city, not the corporation. Confident without boasting.",
      hint: "Tone scaffold for every draft generated for this location.",
    },
    {
      id: "avoid",
      label: "Words & claims to avoid",
      value:
        "Superlatives (best, #1, top-rated), outcome or cure claims, urgency pressure, competitor comparisons, corporate jargon.",
      locked: true,
    },
    {
      id: "proof",
      label: "Proof points",
      value:
        rating && votes
          ? `${rating} across ${votes} Google reviews; same-week appointments most weekdays; part of Baptist Medical Group.`
          : "Same-week appointments most weekdays; part of Baptist Medical Group.",
    },
  ];

  const audience: ProfileField[] = [
    {
      id: "segments",
      label: "Primary patients",
      value: `Families and working adults in ${city} choosing a ${service} home; seniors managing ongoing conditions; new residents searching "${service} near me".`,
    },
    {
      id: "decision",
      label: "How they choose",
      value:
        "Proximity first, then reviews and rating, then insurance acceptance, then how fast they can be seen. AI assistants are a fast-growing first touch.",
    },
    {
      id: "access",
      label: "Access needs",
      value:
        "Clear walk-in guidance, wheelchair access notes on the profile, parking directions, and a phone line that matches the listing.",
    },
  ];

  const servicesGeo: ProfileField[] = [
    {
      id: "service_lines",
      label: "Service lines",
      value: serviceSeeds.length ? serviceSeeds.slice(0, 6).join(", ") : `${service} care`,
      hint: "Synced with the Knowledge Base services group.",
    },
    {
      id: "service_area",
      label: "Service area",
      value: `${city} and the surrounding ${city} metro - the 10x10 geo-grid mirrors this footprint.`,
    },
    {
      id: "web",
      label: "Web presence",
      value: location.website
        ? `${location.website} - the GBP-declared site; organic tracking keys to this domain.`
        : "No standalone site - the GBP listing is the primary web presence.",
    },
  ];

  const compliance: ProfileField[] = [
    {
      id: "hipaa",
      label: "HIPAA reply rules",
      value:
        "Never confirm or deny that a reviewer is a patient. No visit, treatment or staff references. Negative and critical feedback routes to patient relations. Every reply passes the PHI gate before Approve enables. No auto-posting.",
      locked: true,
    },
    {
      id: "claims",
      label: "Claims policy",
      value:
        "No outcome or cure claims. No superlatives. Patient stories require written consent on file - none exist here, so none are used.",
      locked: true,
    },
    {
      id: "providers",
      label: "Provider naming",
      value:
        "Provider names appear only from this location's verified roster (Business Details -> Providers). Roster import pending, so drafts name no individuals.",
    },
    {
      id: "disclaimer",
      label: "Standard disclaimer",
      value:
        "For medical emergencies call 911. This profile is general information and does not replace medical advice from your provider.",
    },
  ];

  return { brandVoice, audience, servicesGeo, compliance };
}
