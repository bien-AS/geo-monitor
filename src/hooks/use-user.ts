"use client";

import { useUserStore } from "@/store/user";

export function useCurrentUser() {
  return useUserStore((s) => s.user);
}
