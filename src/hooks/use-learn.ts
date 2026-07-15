"use client";

import { useMemo } from "react";
import { GLOSSARY } from "@/lib/data/learn/glossary";
import { HELP_ARTICLES, HELP_BY_SLUG } from "@/lib/data/learn/help-articles";
import { TUTORIAL_GROUPS } from "@/lib/data/learn/tutorials";
import type { GlossaryEntry, HelpArticle, TutorialGroup } from "@/lib/data/types";

export function useGlossary() {
  const data = useMemo<GlossaryEntry[]>(() => GLOSSARY, []);
  return { data, isLoading: false, error: null as Error | null };
}

export function useHelpArticles() {
  const data = useMemo<HelpArticle[]>(() => HELP_ARTICLES, []);
  return { data, isLoading: false, error: null as Error | null };
}

export function useHelpArticle(slug: string) {
  const data = useMemo<HelpArticle | null>(() => HELP_BY_SLUG[slug] ?? null, [slug]);
  return { data, isLoading: false, error: null as Error | null };
}

export function useTutorials() {
  const data = useMemo<TutorialGroup[]>(() => TUTORIAL_GROUPS, []);
  return { data, isLoading: false, error: null as Error | null };
}
