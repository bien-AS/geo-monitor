"use client";

import { toast } from "sonner";
import { useAuditLog } from "@/components/local/audit-log-store";
import { useRole } from "@/components/shell/role-store";
import { useWorkspaceUsers } from "@/hooks/use-users";
import { useUsersStore } from "@/store/users";
import type { WorkspaceUser } from "@/lib/data/types";
import { InviteModal } from "./invite-modal";
import { RoleLegendCard } from "./role-legend-card";
import { UserRosterTable } from "./user-roster-table";

/**
 * Users & Roles — roster with invite / resend / revoke / remove, plus the
 * 4-role capability legend. Management actions are operator-only
 * (hidden-not-disabled) and simulated.
 */
export function UsersScreen() {
  const role = useRole();
  const { data: roster } = useWorkspaceUsers();
  const revoke = useUsersStore((s) => s.revoke);
  const remove = useUsersStore((s) => s.remove);
  const addEntry = useAuditLog((s) => s.addEntry);

  const active = roster.filter((u) => u.status === "active");
  const pending = roster.filter((u) => u.status === "pending");
  const isOperator = role === "operator";

  const resend = (u: WorkspaceUser) => {
    addEntry({
      actor: "Agency Operator",
      role: "operator",
      verb: "update",
      action: `Resent invitation to ${u.email}`,
      resource: `users:invite:${u.id}`,
      detail: "Demo mode — resend simulated.",
    });
    toast.success("Invitation resent", { description: u.email });
  };

  const revokeInvite = (u: WorkspaceUser) => {
    revoke(u.id);
    addEntry({
      actor: "Agency Operator",
      role: "operator",
      verb: "delete",
      action: `Revoked invitation for ${u.email}`,
      resource: `users:invite:${u.id}`,
      detail: "Demo mode — revoke simulated.",
    });
    toast.success("Invitation revoked", { description: u.email });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-text-tertiary text-[13px]">
            <span className="num">{active.length}</span> active ·{" "}
            <span className="num">{pending.length}</span> pending — access is scoped by role across
            all <span className="num">20</span> locations
          </p>
        </div>
        {isOperator && <InviteModal />}
      </div>

      <UserRosterTable
        roster={roster}
        isOperator={isOperator}
        onResend={resend}
        onRevoke={revokeInvite}
        onRemove={(u) => remove(u.id)}
      />

      <RoleLegendCard />
    </div>
  );
}
