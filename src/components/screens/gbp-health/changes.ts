import type { AuditLogFile, DataSource, NAPFile } from "@/lib/data/types";

export type ChangeWho = "google" | "directory" | "operator";
export type ChangeSeverity = "critical" | "moderate" | "minor" | "info";
export type ChangeStatus = "open" | "fix_queued" | "fixed" | "logged";

export interface ProfileChange {
  changeId: string;
  kind: "nap-drift" | "audit-log";
  date: string;
  field: string;
  fieldLabel: string;
  summary: string;
  who: ChangeWho;
  whoLabel: string;
  directory?: string;
  before?: string;
  after?: string;
  severity: ChangeSeverity;
  status: ChangeStatus;
  source: DataSource;
  actionable: boolean;
  actor?: string;
  resource?: string;
  detail?: string;
}

const STATUS_LABEL: Record<ChangeStatus, string> = {
  open: "Open",
  fix_queued: "Fix queued",
  fixed: "Fixed",
  logged: "Logged",
};

export function changeStatusLabel(status: ChangeStatus): string {
  return STATUS_LABEL[status];
}

const LOG_FIELD_LABEL: Record<string, string> = {
  review_reply: "Reviews",
  review: "Reviews",
  post: "Posts",
  nap: "NAP",
  grid_preview: "Geo-grid",
  geo_grid: "Geo-grid",
  gbp_audit: "GBP audit",
  gbp: "GBP profile",
  local_ai: "Local AI",
  citation: "Citations",
};

export const FIELD_AFFECTS: Record<string, string> = {
  phone:
    "The phone number feeds the call button on Maps and Search; phone mismatches across directories are a top NAP-consistency penalty and a patient-access problem.",
  address:
    "The address drives the map pin, driving directions, and NAP-consistency scoring across the citation graph.",
  name: "The business name is the strongest local ranking token; name drift across directories fragments entity confidence.",
  website:
    "The website link carries the deep-link signal to the facility page and drives profile clicks.",
};

export function buildChangeList({
  slug,
  nap,
  auditLog,
}: {
  slug: string;
  nap: NAPFile | null;
  auditLog: AuditLogFile | null;
}): ProfileChange[] {
  const changes: ProfileChange[] = [];

  (nap?.drifts ?? []).forEach((d, i) => {
    if (d.slug !== slug) return;
    const cv = d.canonical_value ?? d.canonical;
    const ov = d.observed_value ?? d.observed;
    changes.push({
      changeId: `nap-${i}`,
      kind: "nap-drift",
      date: d.detected_at,
      field: d.field,
      fieldLabel: d.field.charAt(0).toUpperCase() + d.field.slice(1),
      summary: `${d.field.charAt(0).toUpperCase() + d.field.slice(1)} on ${d.directory} drifted from the canonical value`,
      who: d.directory.includes("google") ? "google" : "directory",
      whoLabel: d.directory.includes("google") ? "Google" : "Directory",
      directory: d.directory,
      before: cv,
      after: ov,
      severity: d.severity as ChangeSeverity,
      status: d.status as ChangeStatus,
      source: d.source ?? "dataforseo",
      actionable: d.status === "open",
    });
  });

  (auditLog?.entries ?? []).forEach((e) => {
    if (e.location_slug !== slug) return;
    const prefix = e.action.split(".")[0];
    changes.push({
      changeId: e.id,
      kind: "audit-log",
      date: e.ts,
      field: prefix,
      fieldLabel: LOG_FIELD_LABEL[prefix] ?? "GBP profile",
      summary: e.detail ?? e.action,
      who: "operator",
      whoLabel: "Operator",
      severity: "info",
      status: "logged",
      source: e.source,
      actionable: false,
      actor: e.actor,
      resource: e.resource,
      detail: e.detail,
    });
  });

  return changes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
