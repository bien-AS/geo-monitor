"use client";

import { create } from "zustand";

export type Role = "operator" | "client-viewer";

interface RoleState {
  role: Role;
  setRole: (role: Role) => void;
}

export const useRole = create<RoleState>((set) => ({
  role: "operator",
  setRole: (role) => set({ role }),
}));

export const ROLE_LABEL: Record<Role, string> = {
  operator: "Operator",
  "client-viewer": "Baptist Viewer",
};
