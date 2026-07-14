/**
 * PHI lint — the client-side leak classifier that gates Approve on reviews.
 * Runs on every draft and every operator edit BEFORE the Approve & Post button
 * enables; flagged drafts are blocked with the specific phrase highlighted.
 */
export interface PHIFlag {
  id: string;
  label: string;
  matches: string[];
}

const CARE_WORDS =
  /\b(visit|appointment|treatment|surgery|surgical|injection|procedure|diagnos\w*|exam|admitted|discharg\w*|prescri\w*|medication|therapy|care|seen|results?)\b/i;

const MONTHS =
  "january|february|march|april|may|june|july|august|september|october|november|december";

interface PHIPattern {
  id: string;
  label: string;
  regex: RegExp;
  when?: (text: string) => boolean;
}

const PATTERNS: PHIPattern[] = [
  {
    id: "treatment-reference",
    label: "References the reviewer's visit or treatment",
    regex:
      /\byour (?:\w+ ){0,2}?(?:visit|appointment|treatment|surgery|injection|procedure|diagnosis|results?|prescription|medication|scan|x-ray|mri|exam)\b/gi,
  },
  {
    id: "patienthood",
    label: "Confirms the reviewer was a patient",
    regex: /\byou (?:were|came|visited|saw|received|had)\b/gi,
  },
  {
    id: "care-date",
    label: "References a date of care",
    regex: new RegExp(`\\bon (?:${MONTHS}|\\d{1,2}\\/\\d{1,2})(?:\\s+\\d{1,2})?\\b`, "gi"),
    when: (text) => CARE_WORDS.test(text),
  },
  {
    id: "provider-voice",
    label: "Speaks as the reviewer's provider",
    regex: /\bas your (?:doctor|physician|provider|nurse|surgeon|care team)\b/gi,
  },
  {
    id: "staff-name",
    label: "Names a staff member in the reply",
    regex: /\b(?:Dr|Doctor|Nurse|NP|PA)\.?\s+[A-Z][a-z]+\b/g,
  },
];

export function lintPHI(text: string): PHIFlag[] {
  if (!text.trim()) return [];
  const flags: PHIFlag[] = [];
  for (const p of PATTERNS) {
    if (p.when && !p.when(text)) continue;
    const matches = Array.from(text.matchAll(new RegExp(p.regex.source, p.regex.flags)), (m) =>
      m[0].trim(),
    );
    if (matches.length > 0) {
      flags.push({ id: p.id, label: p.label, matches: [...new Set(matches)] });
    }
  }
  return flags;
}

export function phiGate(flags: PHIFlag[]): {
  blocked: boolean;
  label: string;
  detail?: string;
} {
  if (flags.length === 0) {
    return { blocked: false, label: "PHI check passed" };
  }
  return {
    blocked: true,
    label: "PHI check failed",
    detail: `Blocked phrases: ${flags
      .map((f) => `${f.matches.map((m) => `"${m}"`).join(", ")} — ${f.label}`)
      .join(
        "; ",
      )}. Remove every reference to patienthood, visits, treatment, dates of care, and staff names before approving.`,
  };
}
