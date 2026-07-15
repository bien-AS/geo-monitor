import type { WorkspaceUserRole } from "@/lib/data/types";

/**
 * 4-role model. The shell's view-as switch maps as_admin/as_staff → operator
 * and client_admin/client_user → client-viewer.
 */
export const ROLE_META: Record<
  WorkspaceUserRole,
  { label: string; org: "agency" | "client"; blurb: string }
> = {
  as_admin: {
    label: "Agency Admin",
    org: "agency",
    blurb: "Full control — billing, provider keys, user management, all write approvals.",
  },
  as_staff: {
    label: "Agency Staff",
    org: "agency",
    blurb: "Runs the work — scans, orders, drafts and approvals on assigned locations.",
  },
  client_admin: {
    label: "Client Admin",
    org: "client",
    blurb: "Baptist marketing lead — full read access, approves content, manages client users.",
  },
  client_user: {
    label: "Client User",
    org: "client",
    blurb: "Read-only dashboards and reports for their locations.",
  },
};

/** Capability rows for the role legend. */
export const ROLE_CAPABILITIES: Array<{
  capability: string;
  as_admin: boolean;
  as_staff: boolean;
  client_admin: boolean;
  client_user: boolean;
}> = [
  {
    capability: "View dashboards & reports",
    as_admin: true,
    as_staff: true,
    client_admin: true,
    client_user: true,
  },
  {
    capability: "Approve review replies & posts",
    as_admin: true,
    as_staff: true,
    client_admin: true,
    client_user: false,
  },
  {
    capability: "Run scans & place citation orders",
    as_admin: true,
    as_staff: true,
    client_admin: false,
    client_user: false,
  },
  {
    capability: "See costs, spend & data-source badges",
    as_admin: true,
    as_staff: true,
    client_admin: false,
    client_user: false,
  },
  {
    capability: "Invite & remove users",
    as_admin: true,
    as_staff: false,
    client_admin: true,
    client_user: false,
  },
  {
    capability: "Provider keys & billing",
    as_admin: true,
    as_staff: false,
    client_admin: false,
    client_user: false,
  },
];
