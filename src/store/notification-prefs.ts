"use client";

import { create } from "zustand";

export interface NotificationPrefs {
  weeklyDigest: boolean;
  rankDrops: boolean;
  newReviews: boolean;
  napDrift: boolean;
  runFailures: boolean;
}

export const PREF_META: Record<keyof NotificationPrefs, { label: string; detail: string }> = {
  weeklyDigest: {
    label: "Weekly digest",
    detail: "A Monday-morning summary of LVI, reviews, and NAP drift across the fleet.",
  },
  rankDrops: {
    label: "Rank drops",
    detail: "Alert when a tracked keyword falls out of the top 10 average position.",
  },
  newReviews: {
    label: "New reviews",
    detail: "Alert when a location receives a new review that needs a response.",
  },
  napDrift: {
    label: "NAP drift",
    detail: "Alert when a directory listing goes out of sync with the canonical NAP.",
  },
  runFailures: {
    label: "Run failures",
    detail: "Alert when a scan or provider call fails and needs attention.",
  },
};

const DEFAULT_PREFS: NotificationPrefs = {
  weeklyDigest: true,
  rankDrops: true,
  newReviews: true,
  napDrift: true,
  runFailures: false,
};

interface NotificationPrefsState {
  prefs: NotificationPrefs;
  setPref: (key: keyof NotificationPrefs, value: boolean) => void;
}

export const useNotificationPrefsStore = create<NotificationPrefsState>((set) => ({
  prefs: DEFAULT_PREFS,
  setPref: (key, value) => set((s) => ({ prefs: { ...s.prefs, [key]: value } })),
}));
