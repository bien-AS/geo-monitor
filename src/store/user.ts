import { create } from "zustand";
import type { Role } from "@/components/shell/role-store";

export interface StubUser {
  id: string;
  name: string;
  initials: string;
  role: Role;
  organization: string;
}

interface UserState {
  user: StubUser | null;
  setUser: (user: StubUser) => void;
  setRole: (role: Role) => void;
}

const DEFAULT_USER: StubUser = {
  id: "u1",
  name: "Zach B.",
  initials: "ZB",
  role: "operator",
  organization: "Baptist Memorial Health Care",
};

export const useUserStore = create<UserState>((set) => ({
  user: DEFAULT_USER,
  setUser: (user) => set({ user }),
  setRole: (role) => set((state) => (state.user ? { user: { ...state.user, role } } : state)),
}));
