"use client";

import { useUserStore } from "@/store/user";

export type Role = "operator" | "client-viewer";

export function useRole(): Role {
  return useUserStore((s) => s.user?.role ?? "operator");
}

export const ROLE_LABEL: Record<Role, string> = {
  operator: "Operator",
  "client-viewer": "Baptist Viewer",
};

export const ROLE_DESCRIPTION: Record<Role, string> = {
  operator: "Full access — operate and approve",
  "client-viewer": "Read-only — what Baptist sees",
};
