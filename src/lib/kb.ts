import type { BaptistLocation, DataSource } from "@/lib/data/types";
import type { KBField, KBGroup } from "@/lib/data/types";

const DAY_ORDER = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

interface HourPoint {
  hour: number;
  minute?: number;
}

interface Timetable {
  timetable?: Record<string, Array<{ open: HourPoint; close: HourPoint }> | null>;
}

function hoursSummary(location: BaptistLocation): string | null {
  const tt = (location.work_time as Timetable | undefined)?.timetable;
  if (!tt) return null;
  const fmt = (h: HourPoint) =>
    `${h.hour % 12 === 0 ? 12 : h.hour % 12}${h.minute ? `:${String(h.minute).padStart(2, "0")}` : ""}${h.hour >= 12 ? "p" : "a"}`;
  const parts: string[] = [];
  for (const day of DAY_ORDER) {
    const spans = tt[day];
    if (!spans || spans.length === 0) continue;
    parts.push(
      `${day.slice(0, 3)} ${spans.map((s) => `${fmt(s.open)}-${fmt(s.close)}`).join(", ")}`,
    );
  }
  return parts.length ? parts.join(" - ") : null;
}

function topTopics(location: BaptistLocation, n = 5): string | null {
  const topics = (location as Record<string, unknown>).place_topics as
    Record<string, number> | undefined;
  if (!topics) return null;
  const top = Object.entries(topics)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([t, c]) => `${t} (${c})`);
  return top.length ? top.join(", ") : null;
}

function attrList(location: BaptistLocation, group: string): string | null {
  const attrs = (location.attributes as Record<string, string[]> | undefined)?.[group];
  if (!attrs || attrs.length === 0) return null;
  return attrs.map((a) => a.replace(/^(has_|is_)/, "").replace(/_/g, " ")).join(", ");
}

export function buildKB(location: BaptistLocation, serviceSeeds: string[]): KBGroup[] {
  const src = (location.source ?? "dataforseo") as DataSource;
  return [
    {
      id: "identity",
      title: "Identity",
      description: "Who this listing is - names, type, category, claim state",
      fields: [
        { id: "name", label: "GBP business name", value: location.name, source: src },
        { id: "listing_type", label: "Listing type", value: location.listing_type, source: src },
        {
          id: "facility_type",
          label: "Facility type",
          value: (location.facility_type ?? "")
            .replace(/^specialty_/, "specialty - ")
            .replace(/_/g, " "),
          source: src,
        },
        {
          id: "primary_category",
          label: "Primary category",
          value: location.primary_category ?? null,
          source: src,
        },
        {
          id: "claimed",
          label: "Claim status",
          value: location.is_claimed ? "Claimed" : "Unclaimed",
          source: src,
        },
      ],
    },
    {
      id: "contact",
      title: "Contact & access",
      description: "Canonical NAP and how patients reach the clinic",
      fields: [
        {
          id: "address",
          label: "Address (canonical)",
          value: location.address ?? null,
          source: src,
          editable: true,
        },
        {
          id: "phone",
          label: "Phone (canonical)",
          value: location.phone ?? null,
          source: src,
          editable: true,
        },
        {
          id: "website",
          label: "Website",
          value: location.website ?? null,
          source: src,
          editable: true,
        },
        {
          id: "accessibility",
          label: "Accessibility",
          value: attrList(location, "accessibility"),
          source: src,
          missingNote: "GBP accessibility attributes not set",
        },
      ],
    },
    {
      id: "hours",
      title: "Hours",
      description: "Weekly schedule and exceptions",
      fields: [
        { id: "weekly_hours", label: "Weekly hours", value: hoursSummary(location), source: src },
        {
          id: "holiday_hours",
          label: "Holiday exceptions",
          value: null,
          source: "synthetic",
          missingNote: "Imported from the client calendar at onboarding",
          editable: true,
        },
      ],
    },
    {
      id: "services",
      title: "Services & specialties",
      description: "Service lines the location is optimized around",
      fields: [
        {
          id: "service_lines",
          label: "Service lines",
          value: serviceSeeds.length ? serviceSeeds.slice(0, 6).join(", ") : null,
          source: "synthetic",
          editable: true,
        },
        {
          id: "conditions",
          label: "Conditions & procedures",
          value: null,
          source: "synthetic",
          missingNote: "Filled from the clinical intake sheet",
          editable: true,
        },
      ],
    },
    {
      id: "providers",
      title: "Providers",
      description: "Practitioner roster tied to this listing",
      fields: [
        {
          id: "roster",
          label: "Provider roster",
          value: null,
          source: "synthetic",
          missingNote: "Verified roster import pending",
          editable: true,
        },
      ],
    },
    {
      id: "insurance",
      title: "Insurance & payments",
      description: "Coverage and payment options patients ask about",
      fields: [
        {
          id: "plans",
          label: "Insurance plans accepted",
          value: null,
          source: "synthetic",
          missingNote: "Filled from the payer sheet at onboarding",
          editable: true,
        },
        {
          id: "payments",
          label: "Payment options",
          value: attrList(location, "payments"),
          source: src,
          missingNote: "GBP payment attributes not set",
        },
      ],
    },
    {
      id: "reputation",
      title: "Reputation & voice",
      description: "What patients already say - grounding for replies & posts",
      fields: [
        {
          id: "rating",
          label: "Google rating",
          value: location.rating
            ? `${location.rating.value} across ${location.rating.votes_count} reviews`
            : null,
          source: src,
        },
        {
          id: "topics",
          label: "Top review topics",
          value: topTopics(location),
          source: src,
          missingNote: "No place topics returned yet",
        },
        {
          id: "reply_register",
          label: "Reply register",
          value:
            "HIPAA-constrained: never confirm patienthood; negative/critical -> patient relations",
          source: "synthetic",
        },
      ],
    },
    {
      id: "local_context",
      title: "Local context",
      description: "Geography and competitive surroundings",
      fields: [
        {
          id: "city",
          label: "City / market",
          value: `${location.city}, ${location.state}`,
          source: src,
        },
        {
          id: "service_area",
          label: "Service area",
          value: `${location.city} + ${location.city} metro`,
          source: "synthetic",
          editable: true,
        },
        {
          id: "rivals",
          label: "People-also-search rivals",
          value: null,
          source: src,
        },
        {
          id: "landmarks",
          label: "Parking & landmarks",
          value: null,
          source: "synthetic",
          missingNote: "Collected from the clinic manager at onboarding",
          editable: true,
        },
      ],
    },
  ];
}

export function kbCompleteness(groups: KBGroup[]): {
  filled: number;
  total: number;
  pct: number;
} {
  const all = groups.flatMap((g) => g.fields);
  const filled = all.filter((f) => f.value !== null && f.value !== "").length;
  return { filled, total: all.length, pct: Math.round((filled / all.length) * 100) };
}
