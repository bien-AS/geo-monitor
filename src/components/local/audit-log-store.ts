"use client";

import { create } from "zustand";
import type { AuditLogEntry } from "@/lib/data/types";

/**
 * Session audit log — prototype writes are simulated (CLAUDE.md law 4):
 * every approval-ladder completion appends here (local state only) and is
 * rendered alongside the fixture audit log.
 */
interface AuditLogState {
  sessionEntries: AuditLogEntry[];
  addEntry: (entry: Omit<AuditLogEntry, "id" | "ts" | "demo" | "source">) => AuditLogEntry;
}

export const useAuditLog = create<AuditLogState>((set) => ({
  sessionEntries: [],
  addEntry: (partial) => {
    const entry: AuditLogEntry = {
      ...partial,
      id: `session-${Math.random().toString(36).slice(2, 10)}`,
      ts: new Date().toISOString(),
      demo: true,
      source: "synthetic",
    };
    set((s) => ({ sessionEntries: [entry, ...s.sessionEntries] }));
    return entry;
  },
}));
