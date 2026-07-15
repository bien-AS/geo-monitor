import { Icons } from "@/lib/icons";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusPill } from "@/components/local/status-pill";
import { ApprovalLadder } from "@/components/local/approval-ladder";
import { fmtDate } from "@/lib/format";
import type { WorkspaceUser } from "@/lib/data/types";
import { ROLE_META } from "./roles";

interface UserRosterTableProps {
  roster: WorkspaceUser[];
  isOperator: boolean;
  onResend: (user: WorkspaceUser) => void;
  onRevoke: (user: WorkspaceUser) => void;
  onRemove: (user: WorkspaceUser) => void;
}

function RolePill({ user }: { user: WorkspaceUser }) {
  const meta = ROLE_META[user.role];
  return (
    <span className="inline-flex items-center gap-1.5">
      {meta.org === "agency" ? (
        <Icons.shield
          className="text-primary-500 size-3.5"
          aria-hidden
        />
      ) : (
        <Icons.building
          className="text-text-tertiary size-3.5"
          aria-hidden
        />
      )}
      <span className="text-[12.5px] font-medium">{meta.label}</span>
    </span>
  );
}

export function UserRosterTable({
  roster,
  isOperator,
  onResend,
  onRevoke,
  onRemove,
}: UserRosterTableProps) {
  return (
    <Card className="gap-0 overflow-hidden p-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last active</TableHead>
            {isOperator && <TableHead className="w-40 text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {roster.map((u) => (
            <TableRow key={u.id}>
              <TableCell>
                <div className="flex items-center gap-2.5">
                  <span className="bg-secondary text-text-secondary flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold">
                    {u.name
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[13.5px] font-medium">{u.name}</p>
                    <p className="text-text-tertiary truncate text-[12px]">{u.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <RolePill user={u} />
              </TableCell>
              <TableCell>
                {u.status === "active" ? (
                  <StatusPill tone="success">Active</StatusPill>
                ) : (
                  <StatusPill tone="info">Pending</StatusPill>
                )}
              </TableCell>
              <TableCell>
                <span className="num text-text-secondary text-[12.5px]">
                  {u.status === "pending"
                    ? u.invited_at
                      ? `Invited ${fmtDate(u.invited_at)}`
                      : "Invited"
                    : u.last_active
                      ? fmtDate(u.last_active)
                      : "—"}
                </span>
              </TableCell>
              {isOperator && (
                <TableCell className="text-right">
                  {u.status === "pending" ? (
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onResend(u)}
                      >
                        <Icons.refreshCcw className="size-3.5" />
                        Resend
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRevoke(u)}
                      >
                        <Icons.close className="size-3.5" />
                        Revoke
                      </Button>
                    </div>
                  ) : u.role === "as_admin" ? (
                    <span className="text-text-disabled text-[12px]">Owner</span>
                  ) : (
                    <ApprovalLadder
                      trigger={
                        <Button
                          variant="ghost"
                          size="sm"
                        >
                          <Icons.trash className="size-3.5" />
                          Remove
                        </Button>
                      }
                      title={`Remove ${u.name}`}
                      description={`${u.email} · ${ROLE_META[u.role].label}`}
                      actionVerb="Approve & remove"
                      auditAction={`Removed ${u.email} from the workspace`}
                      auditResource={`users:${u.id}`}
                      auditVerb="delete"
                      preview={
                        <div className="space-y-1.5 text-[13px]">
                          <p>
                            <span className="font-semibold">{u.name}</span> loses access to all
                            Baptist Local dashboards immediately.
                          </p>
                          <p className="text-text-secondary">
                            Their approval history stays in the audit log.
                          </p>
                        </div>
                      }
                      onCompleted={() => onRemove(u)}
                    />
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
