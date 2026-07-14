import type { CitationRow, DataSource, NAP, NAPDrift } from "@/lib/data/types";

export type DriftField = NAPDrift["field"];
export type DriftSeverity = NAPDrift["severity"];
export type DriftStatus = NAPDrift["status"];

export interface DriftItem {
  key: string;
  directory: string;
  domain: string;
  field: DriftField;
  canonical_value: string;
  observed_value: string;
  severity: DriftSeverity;
  detected_at: string;
  status: DriftStatus;
  source: DataSource;
  derived: boolean;
  authority?: number;
  authority_band?: CitationRow["authority_band"];
}

export const FIELD_LABEL: Record<DriftField, string> = {
  name: "Name",
  address: "Address",
  phone: "Phone",
  website: "Website",
};

export const SEVERITY_ORDER: Record<DriftSeverity, number> = {
  critical: 0,
  moderate: 1,
  minor: 2,
};

export function driftKey(domain: string, field: DriftField): string {
  return `${domain}__${field}`;
}

export function charDiff(a: string, b: string) {
  let p = 0;
  while (p < a.length && p < b.length && a[p] === b[p]) p++;
  let s = 0;
  while (s < a.length - p && s < b.length - p && a[a.length - 1 - s] === b[b.length - 1 - s]) s++;
  return {
    prefix: a.slice(0, p),
    aMid: a.slice(p, a.length - s),
    bMid: b.slice(p, b.length - s),
    suffix: s > 0 ? a.slice(a.length - s) : "",
  };
}

export const CRITICAL_FIELDS: ReadonlySet<string> = new Set(["name", "phone"]);

function severityForDerived(field: DriftField): DriftSeverity {
  if (field === "phone" || field === "name") return "critical";
  if (field === "address") return "moderate";
  return "minor";
}

export function buildDriftItems({
  drifts,
  rows,
  canonical,
}: {
  drifts: NAPDrift[];
  rows: CitationRow[];
  canonical: NAP & { source: DataSource };
}): DriftItem[] {
  const rowByDomain = new Map(rows.map((r) => [r.domain, r]));
  const items: DriftItem[] = [];

  for (const d of drifts) {
    const row = rowByDomain.get(d.directory);
    items.push({
      key: driftKey(d.directory, d.field),
      directory: row?.directory ?? d.directory,
      domain: d.directory,
      field: d.field,
      canonical_value: d.canonical_value ?? d.canonical,
      observed_value: d.observed_value ?? d.observed,
      severity: d.severity as DriftSeverity,
      detected_at: d.detected_at,
      status: d.status as DriftStatus,
      source: d.source ?? "synthetic",
      derived: false,
      authority: row?.authority,
      authority_band: row?.authority_band,
    });
  }

  const covered = new Set(items.map((i) => i.key));
  for (const row of rows) {
    if (!row.listed || !row.field_match) continue;
    for (const field of ["name", "address", "phone"] as const) {
      if (row.field_match[field]) continue;
      const key = driftKey(row.domain, field);
      if (covered.has(key)) continue;
      covered.add(key);
      items.push({
        key,
        directory: row.directory,
        domain: row.domain,
        field,
        canonical_value: canonical[field],
        observed_value:
          row.nap_observed?.[field] ?? "Differs from canonical (live value not captured)",
        severity: severityForDerived(field),
        detected_at: row.last_checked,
        status: "open",
        source: row.source,
        derived: true,
        authority: row.authority,
        authority_band: row.authority_band,
      });
    }
  }

  return items.sort(
    (a, b) =>
      SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] ||
      b.detected_at.localeCompare(a.detected_at),
  );
}

const FIELD_IMPACT: Record<DriftField, string> = {
  name: "Name drift splits entity signals across directories and weakens the knowledge-graph match for this listing.",
  address: "Address drift fragments map citations and can send patients to the wrong door.",
  phone: "A wrong phone number misroutes patient calls. Treat phone drift as urgent.",
  website: "Website drift splits click-through and conversion signals across URLs.",
};

export function recommendationFor(item: DriftItem): string {
  return `Update the ${FIELD_LABEL[item.field]} on ${item.directory} to match the canonical record. ${FIELD_IMPACT[item.field]}`;
}

export function correctionPacket(item: DriftItem, locationName: string): string {
  return [
    `NAP correction — ${locationName}`,
    `Directory: ${item.directory} (${item.domain})`,
    `Field: ${FIELD_LABEL[item.field]}`,
    `Observed (incorrect): ${item.observed_value}`,
    `Canonical (write this): ${item.canonical_value}`,
    `Detected: ${item.detected_at} · Severity: ${item.severity}`,
  ].join("\n");
}

export function rowDrifting(row: CitationRow): boolean {
  if (!row.listed || !row.field_match) return false;
  return !row.field_match.name || !row.field_match.address || !row.field_match.phone;
}
