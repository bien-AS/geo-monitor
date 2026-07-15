"use client";

import { useMemo } from "react";
import { DASHBOARD_USERS } from "@/lib/data/fixtures";
import { mergeRoster, useUsersStore } from "@/store/users";
import type { WorkspaceUser } from "@/lib/data/types";

export function useWorkspaceUsers() {
  const invited = useUsersStore((s) => s.invited);
  const removed = useUsersStore((s) => s.removed);

  const data = useMemo<WorkspaceUser[]>(
    () => mergeRoster(DASHBOARD_USERS, { invited, removed }),
    [invited, removed],
  );

  return { data, isLoading: false, error: null as Error | null };
}
