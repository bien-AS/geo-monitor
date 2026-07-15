"use client";

import { create } from "zustand";
import type { WorkspaceUser, WorkspaceUserRole } from "@/lib/data/types";

interface UsersState {
  /** Users invited this session (pending until accepted). */
  invited: WorkspaceUser[];
  /** ids removed this session (seed or invited). */
  removed: string[];
  invite: (email: string, role: WorkspaceUserRole, invitedBy: string) => WorkspaceUser;
  revoke: (id: string) => void;
  remove: (id: string) => void;
}

let counter = 0;

export const useUsersStore = create<UsersState>((set) => ({
  invited: [],
  removed: [],
  invite: (email, role, invitedBy) => {
    const token = `inv-${Math.random().toString(36).slice(2, 10)}`;
    const name = email
      .split("@")[0]
      ?.split(/[._-]/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    const user: WorkspaceUser = {
      id: `session-u-${++counter}`,
      name: name ?? email,
      email,
      role,
      status: "pending",
      invited_at: new Date().toISOString(),
      invited_by: invitedBy,
      invite_token: token,
      source: "synthetic",
    };
    set((s) => ({ invited: [user, ...s.invited] }));
    return user;
  },
  revoke: (id) => set((s) => ({ removed: [...s.removed, id] })),
  remove: (id) => set((s) => ({ removed: [...s.removed, id] })),
}));

/** Merge fixture roster with session invites/removals. */
export function mergeRoster(
  seed: WorkspaceUser[],
  state: Pick<UsersState, "invited" | "removed">,
): WorkspaceUser[] {
  return [...state.invited, ...seed].filter((u) => !state.removed.includes(u.id));
}
