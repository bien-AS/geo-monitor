export type DataSource = "searchatlas" | "dataforseo" | "synthetic";

export type AuditVerb = "create" | "approve" | "update" | "delete" | "read";

export type AuditLogEntry = {
  id: string;
  ts: string;
  actor: string;
  action: string;
  verb: AuditVerb;
  resource: string;
  detail?: string;
  demo: boolean;
  source: DataSource;
};
