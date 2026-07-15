"use client";

import * as React from "react";
import { toast } from "sonner";
import { Icons } from "@/lib/icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusPill } from "@/components/local/status-pill";
import { useAuditLog } from "@/components/local/audit-log-store";
import { useUsersStore } from "@/store/users";
import type { WorkspaceUser, WorkspaceUserRole } from "@/lib/data/types";
import { ROLE_META } from "./roles";

/**
 * Invite flow: email + role → pending roster row + shareable /invite/[token]
 * link. Simulated (demo mode) — live mode sends the email via Supabase Auth.
 */
export function InviteModal() {
  const invite = useUsersStore((s) => s.invite);
  const addEntry = useAuditLog((s) => s.addEntry);

  const [open, setOpen] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState<WorkspaceUserRole>("client_user");
  const [sent, setSent] = React.useState<WorkspaceUser | null>(null);
  const [copied, setCopied] = React.useState(false);

  const handleOpenChange = (o: boolean) => {
    setOpen(o);
    if (o) {
      setEmail("");
      setRole("client_user");
      setSent(null);
      setCopied(false);
    }
  };

  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const send = () => {
    const user = invite(email.trim().toLowerCase(), role, "Agency Operator");
    addEntry({
      actor: "Agency Operator",
      role: "operator",
      verb: "create",
      action: `Invited ${user.email} as ${ROLE_META[role].label}`,
      resource: `users:invite:${user.id}`,
      detail: "Demo mode — invite simulated. Live: Supabase Auth invitation email with role claim.",
    });
    toast.success("Invitation created", {
      description: `${user.email} · ${ROLE_META[role].label} — pending until accepted`,
    });
    setSent(user);
  };

  const inviteUrl = sent ? `/invite/${sent.invite_token}` : "";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin + inviteUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Copy failed — link shown below");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DialogTrigger asChild>
        <Button size="sm">
          <Icons.userPlus className="size-4" />
          Invite user
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {!sent ? (
          <>
            <DialogHeader>
              <DialogTitle>Invite a user</DialogTitle>
              <DialogDescription>
                They receive a link to join the Baptist Local workspace with the role you pick.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div>
                <Label
                  htmlFor="invite-email"
                  className="text-[13px] font-medium"
                >
                  Email
                </Label>
                <Input
                  id="invite-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@bmhcc.org"
                  className="mt-1.5"
                  autoFocus
                />
              </div>
              <div>
                <Label className="text-[13px] font-medium">Role</Label>
                <Select
                  value={role}
                  onValueChange={(v) => setRole(v as WorkspaceUserRole)}
                >
                  <SelectTrigger className="mt-1.5 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(
                      Object.entries(ROLE_META) as Array<
                        [WorkspaceUserRole, (typeof ROLE_META)[WorkspaceUserRole]]
                      >
                    ).map(([id, meta]) => (
                      <SelectItem
                        key={id}
                        value={id}
                      >
                        {meta.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-text-tertiary mt-1.5 text-[12px]">{ROLE_META[role].blurb}</p>
              </div>
              <StatusPill tone="warning">Demo mode — invite simulated</StatusPill>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={send}
                disabled={!valid}
              >
                <Icons.mail className="size-4" />
                Send invitation
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Invitation sent</DialogTitle>
              <DialogDescription>
                {sent.email} is now pending as {ROLE_META[sent.role].label}. Share the link below or
                let them use the email.
              </DialogDescription>
            </DialogHeader>
            <div className="border-border bg-secondary/40 flex items-center gap-2 rounded-md border px-3 py-2">
              <Icons.link className="text-text-tertiary size-4 shrink-0" />
              <span className="num min-w-0 flex-1 truncate text-[12.5px]">{inviteUrl}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={copy}
              >
                {copied ? (
                  <Icons.check className="text-success-600 size-4" />
                ) : (
                  <Icons.copy className="size-4" />
                )}
              </Button>
            </div>
            <DialogFooter>
              <Button onClick={() => setOpen(false)}>Done</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
