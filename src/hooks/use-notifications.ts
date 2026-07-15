"use client";

import { useMemo } from "react";
import { DASHBOARD_NOTIFICATIONS } from "@/lib/data/fixtures";
import type { AppNotification } from "@/lib/data/types";

export function useNotifications() {
  const data = useMemo<AppNotification[]>(
    () => [...DASHBOARD_NOTIFICATIONS].sort((a, b) => +new Date(b.ts) - +new Date(a.ts)),
    [],
  );

  return { data, isLoading: false, error: null as Error | null };
}
