"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SourceBadge } from "@/components/local/source-badge";
import { useRole } from "@/components/shell/role-store";
import { Icons } from "@/lib/icons";
import type { GBPPost, PostType } from "@/lib/data/types";
import { POST_TYPES, POST_TYPE_META } from "./post-meta";
import { usePostsSession } from "@/store/posts";
import { KanbanBoard } from "./kanban-board";
import { PostComposer } from "./post-composer";

function mergeSessionPosts(
  slug: string,
  fixturePosts: GBPPost[],
  session: {
    added: Record<string, GBPPost[]>;
    patched: Record<string, Record<string, Partial<GBPPost>>>;
  },
): GBPPost[] {
  const patches = session.patched[slug] ?? {};
  const apply = (p: GBPPost) => (patches[p.id] ? { ...p, ...patches[p.id] } : p);
  return [...fixturePosts.map(apply), ...(session.added[slug] ?? []).map(apply)];
}

export function PostsManager({
  slug,
  locationShortName,
  city,
  website,
  fixturePosts,
  compose,
  dateParam,
  postParam,
}: {
  slug: string;
  locationShortName: string;
  city: string;
  website: string;
  fixturePosts: GBPPost[];
  compose: boolean;
  dateParam?: string;
  postParam?: string;
}) {
  const role = useRole();
  const session = usePostsSession();
  const posts = mergeSessionPosts(slug, fixturePosts, session);

  const [typeFilter, setTypeFilter] = React.useState<"all" | PostType>("all");
  const [query, setQuery] = React.useState("");
  const [editing, setEditing] = React.useState<GBPPost | null>(null);
  const composerRef = React.useRef<HTMLDivElement>(null);
  const postsRef = React.useRef(posts);

  React.useEffect(() => {
    postsRef.current = posts;
  }, [posts]);

  React.useEffect(() => {
    if (!postParam) return;
    const target = postsRef.current.find((p) => p.id === postParam && p.status !== "published");
    if (target) setEditing(target);
  }, [postParam]);

  const scrollToComposer = React.useCallback(() => {
    composerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  React.useEffect(() => {
    if (compose && role === "operator") {
      const t = window.setTimeout(scrollToComposer, 150);
      return () => window.clearTimeout(t);
    }
  }, [compose, role, scrollToComposer]);

  const startEdit = (post: GBPPost) => {
    setEditing(post);
    scrollToComposer();
  };

  const startNew = () => {
    setEditing(null);
    scrollToComposer();
  };

  const q = query.trim().toLowerCase();
  const boardPosts = posts.filter(
    (p) =>
      (typeFilter === "all" || p.type === typeFilter) &&
      (q === "" || p.title.toLowerCase().includes(q) || p.body.toLowerCase().includes(q)),
  );

  return (
    <div className="flex flex-col gap-6">
      <Card className="gap-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-lg font-semibold">Post pipeline</h2>
            <span
              className="num bg-secondary text-muted-foreground rounded-full px-2 py-0.5 text-[11px] font-semibold"
              aria-label={`${boardPosts.length} posts on the board`}
            >
              {boardPosts.length}
            </span>
            <SourceBadge source="synthetic" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Icons.search
                className="text-muted-foreground absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2"
                aria-hidden
              />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search posts…"
                aria-label="Search posts by title or body"
                className="h-8 w-[180px] pl-8 text-[13px]"
              />
            </div>
            <Select
              value={typeFilter}
              onValueChange={(v) => setTypeFilter(v as "all" | PostType)}
            >
              <SelectTrigger
                aria-label="Filter by post type"
                className="w-[190px] text-[13px]"
              >
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {POST_TYPES.map((t) => {
                  const meta = POST_TYPE_META[t];
                  const Icon = meta.icon;
                  return (
                    <SelectItem
                      key={t}
                      value={t}
                    >
                      <span className="flex items-center gap-2">
                        <Icon
                          className="text-muted-foreground size-3.5"
                          aria-hidden
                        />
                        {meta.label}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {role === "operator" ? (
              <Button
                size="sm"
                onClick={startNew}
              >
                <Icons.add className="size-3.5" />
                New post
              </Button>
            ) : null}
          </div>
        </div>

        <KanbanBoard
          slug={slug}
          posts={boardPosts}
          onEdit={startEdit}
        />
      </Card>

      <div
        ref={composerRef}
        className="scroll-mt-20"
      >
        <PostComposer
          key={editing?.id ?? `new-${compose ? "1" : "0"}`}
          slug={slug}
          locationShortName={locationShortName}
          city={city}
          website={website}
          editingPost={editing}
          initialDate={dateParam}
          onDone={() => setEditing(null)}
        />
      </div>
    </div>
  );
}
