"use client";

import { useMemo } from "react";
import { shortLocationName } from "@/lib/location-names";
import type { BaptistLocation, PostsFixture, GBPPost } from "@/lib/data/types";
import { DASHBOARD_LOCATIONS, DASHBOARD_POSTS } from "@/lib/data/fixtures";
import { usePostsSession } from "@/store/posts";

export interface PostsPageData {
  location: BaptistLocation;
  shortName: string;
  navLocations: Array<{ slug: string; name: string; city: string }>;
  posts: GBPPost[];
  fixtureSource: "synthetic";
}

function compute(slug: string): PostsPageData | null {
  const location = (DASHBOARD_LOCATIONS as BaptistLocation[]).find((l) => l.slug === slug);
  if (!location) return null;

  const shortName = shortLocationName(location.name);
  const navLocations = (DASHBOARD_LOCATIONS as BaptistLocation[]).map((l) => ({
    slug: l.slug,
    name: l.name,
    city: l.city,
  }));

  const fixture: PostsFixture | null = DASHBOARD_POSTS[slug] ?? null;
  const fixturePosts = fixture?.posts ?? [];

  return {
    location,
    shortName,
    navLocations,
    posts: fixturePosts,
    fixtureSource: "synthetic" as const,
  };
}

export function usePosts(slug: string) {
  const session = usePostsSession();
  const base = useMemo(() => compute(slug), [slug]);

  const posts = useMemo(() => {
    if (!base) return [];
    const patches = session.patched[slug] ?? {};
    const apply = (p: GBPPost) => (patches[p.id] ? { ...p, ...patches[p.id] } : p);
    return [...base.posts.map(apply), ...(session.added[slug] ?? []).map(apply)];
  }, [base, session.added, session.patched, slug]);

  return {
    data: base ? { ...base, posts } : null,
    isLoading: false,
    error: null as Error | null,
  };
}
