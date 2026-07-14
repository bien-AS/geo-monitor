"use client";

import * as React from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ApprovalLadder } from "@/components/local/approval-ladder";
import { StatusPill } from "@/components/local/status-pill";
import { useRole } from "@/components/shell/role-store";
import { Icons } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { fmtDate } from "@/lib/format";
import type { GBPPost, PostStatus } from "@/lib/data/types";
import {
  ALLOWED_TRANSITIONS,
  POST_STATUS_META,
  POST_TYPE_META,
  STATUS_LANES,
  postDateISO,
  transitionBlockReason,
} from "./post-meta";
import { PostPreviewBlock, ReviewApproveLadder } from "./review-approve-ladder";
import { usePostsSession } from "@/store/posts";

interface Transition {
  post: GBPPost;
  to: PostStatus;
  fallbackScheduledISO: string;
  nonce: number;
}

const TRANSITION_VERB: Record<PostStatus, string> = {
  draft: "Approve & pull back",
  pending_approval: "Approve & queue",
  scheduled: "Approve & schedule",
  published: "Approve & publish",
};

export function KanbanBoard({
  slug,
  posts,
  onEdit,
}: {
  slug: string;
  posts: GBPPost[];
  onEdit: (post: GBPPost) => void;
}) {
  const role = useRole();
  const operator = role === "operator";

  const [dragging, setDragging] = React.useState<{
    id: string;
    from: PostStatus;
  } | null>(null);
  const [hoverLane, setHoverLane] = React.useState<PostStatus | null>(null);
  const [transition, setTransition] = React.useState<Transition | null>(null);
  const nonceRef = React.useRef(0);

  const hintId = `kanban-hint-${slug}`;

  const byDateDesc = (a: GBPPost, b: GBPPost) =>
    (postDateISO(b) ?? "9999").localeCompare(postDateISO(a) ?? "9999");
  const lanes = STATUS_LANES.map((status) => ({
    status,
    posts: posts
      .filter((p) => p.status === status)
      .sort(status === "published" ? byDateDesc : (a, b) => byDateDesc(b, a)),
  }));

  const isValidTarget = (lane: PostStatus) =>
    dragging !== null &&
    dragging.from !== lane &&
    ALLOWED_TRANSITIONS[dragging.from].includes(lane);

  const handleDrop = (lane: PostStatus, e: React.DragEvent) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || dragging?.id;
    setHoverLane(null);
    if (!id) return;
    const post = posts.find((p) => p.id === id);
    setDragging(null);
    if (!post || post.status === lane) return;
    if (!ALLOWED_TRANSITIONS[post.status].includes(lane)) {
      toast.error("Move not allowed", {
        description: transitionBlockReason(post.status, lane),
      });
      return;
    }
    const fallback = new Date();
    fallback.setDate(fallback.getDate() + 7);
    nonceRef.current += 1;
    setTransition({
      post,
      to: lane,
      fallbackScheduledISO: `${format(fallback, "yyyy-MM-dd")}T14:00:00Z`,
      nonce: nonceRef.current,
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <p
        id={hintId}
        className="sr-only"
      >
        Use the action buttons to move posts between stages.
      </p>

      <div className="overflow-x-auto pb-1">
        <div className="grid min-w-[1080px] grid-cols-[repeat(4,minmax(260px,1fr))] gap-3">
          {lanes.map((lane) => {
            const meta = POST_STATUS_META[lane.status];
            const Icon = meta.icon;
            const valid = isValidTarget(lane.status);
            const hovered = valid && hoverLane === lane.status;
            return (
              <section
                key={lane.status}
                aria-label={`${meta.label} lane`}
                onDragOver={(e) => {
                  if (!dragging) return;
                  e.preventDefault();
                  e.dataTransfer.dropEffect = valid ? "move" : "none";
                  setHoverLane(valid ? lane.status : null);
                }}
                onDragLeave={(e) => {
                  if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
                  setHoverLane((h) => (h === lane.status ? null : h));
                }}
                onDrop={(e) => handleDrop(lane.status, e)}
                className={cn(
                  "border-border bg-muted flex max-h-[70vh] min-h-[320px] flex-col overflow-y-auto rounded-lg border border-t-[3px] transition-shadow",
                  meta.laneTopCls,
                  valid && "ring-primary/40 ring-2",
                  hovered && "bg-primary/5 ring-primary",
                )}
              >
                <header
                  className={cn(
                    "bg-muted sticky top-0 z-10 flex items-center gap-2 px-3 py-2.5",
                    hovered && "bg-transparent",
                  )}
                >
                  <Icon
                    className={cn("size-4 shrink-0", meta.laneIconCls)}
                    aria-hidden
                  />
                  <h3 className="text-[13px] font-semibold">{meta.label}</h3>
                  <span className="num border-border bg-card text-muted-foreground rounded-full border px-2 py-0.5 text-[11px] font-semibold">
                    {lane.posts.length}
                  </span>
                </header>

                <div className="flex flex-1 flex-col gap-2 px-2 pb-2">
                  {lane.posts.length === 0 ? (
                    <div className="border-border flex flex-1 items-center justify-center rounded-md border border-dashed p-4 text-center">
                      <p className="text-muted-foreground text-[12px]">No posts in this lane</p>
                    </div>
                  ) : (
                    lane.posts.map((post) => (
                      <KanbanCard
                        key={post.id}
                        post={post}
                        slug={slug}
                        operator={operator}
                        hintId={hintId}
                        isDragging={dragging?.id === post.id}
                        onEdit={onEdit}
                        onDragStart={(e) => {
                          e.dataTransfer.setData("text/plain", post.id);
                          e.dataTransfer.effectAllowed = "move";
                          setDragging({ id: post.id, from: post.status });
                        }}
                        onDragEnd={() => {
                          setDragging(null);
                          setHoverLane(null);
                        }}
                      />
                    ))
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      {operator ? (
        <p className="text-muted-foreground text-[12px]">
          Drag cards between lanes — every move confirms through the approval ladder (Demo mode —
          writes simulated). Allowed: Draft → Pending · Pending → Scheduled / Published · Scheduled
          → Published or back to Draft.
        </p>
      ) : null}

      {transition ? (
        <TransitionLadder
          key={`${transition.post.id}-${transition.to}-${transition.nonce}`}
          slug={slug}
          transition={transition}
        />
      ) : null}
    </div>
  );
}

function KanbanCard({
  post,
  slug,
  operator,
  hintId,
  isDragging,
  onEdit,
  onDragStart,
  onDragEnd,
}: {
  post: GBPPost;
  slug: string;
  operator: boolean;
  hintId: string;
  isDragging: boolean;
  onEdit: (post: GBPPost) => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}) {
  const type = POST_TYPE_META[post.type];
  const TypeIcon = type.icon;
  const dateISO = postDateISO(post);

  return (
    <article
      draggable={operator}
      onDragStart={operator ? onDragStart : undefined}
      onDragEnd={operator ? onDragEnd : undefined}
      aria-label={`GBP post: ${post.title} — ${POST_STATUS_META[post.status].label}`}
      aria-describedby={hintId}
      className={cn(
        "border-border bg-card flex flex-col gap-1.5 rounded-md border p-2.5 transition-[transform,box-shadow,border-color,opacity]",
        operator &&
          "hover:border-border cursor-grab hover:-translate-y-px hover:shadow-sm active:cursor-grabbing",
        isDragging && "opacity-50",
      )}
    >
      <Badge
        variant="outline"
        className="text-[11px]"
      >
        <TypeIcon
          className="size-3"
          aria-hidden
        />
        {type.label}
      </Badge>
      <h4 className="line-clamp-1 text-[13px] leading-snug font-semibold">{post.title}</h4>
      <p className="text-muted-foreground line-clamp-2 text-[12px] leading-snug">{post.body}</p>
      <div className="mt-0.5 flex min-h-7 items-center justify-between gap-2">
        <span className="text-muted-foreground inline-flex items-center gap-1 text-[11px]">
          <Icons.calendarClock
            className="size-3"
            aria-hidden
          />
          {dateISO ? <span className="num">{fmtDate(dateISO)}</span> : "No date"}
        </span>
        <CardAction
          post={post}
          slug={slug}
          operator={operator}
          onEdit={onEdit}
        />
      </div>
    </article>
  );
}

function CardAction({
  post,
  slug,
  operator,
  onEdit,
}: {
  post: GBPPost;
  slug: string;
  operator: boolean;
  onEdit: (post: GBPPost) => void;
}) {
  if (post.status === "published") {
    return (
      <span className="eyebrow text-success-700 dark:text-success-100">
        Live on GBP · simulated
      </span>
    );
  }
  if (!operator) return null;
  if (post.status === "pending_approval") {
    return (
      <ReviewApproveLadder
        slug={slug}
        post={post}
        trigger={
          <Button
            size="sm"
            className="h-7 px-2 text-[12px]"
          >
            <Icons.stamp className="size-3" />
            Review & approve
          </Button>
        }
      />
    );
  }
  return (
    <Button
      variant="outline"
      size="sm"
      className="h-7 px-2 text-[12px]"
      onClick={() => onEdit(post)}
    >
      <Icons.edit className="size-3" />
      {post.status === "draft" ? "Edit & submit" : "Edit / reschedule"}
    </Button>
  );
}

function TransitionLadder({ slug, transition }: { slug: string; transition: Transition }) {
  const patchPost = usePostsSession((s) => s.patchPost);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    triggerRef.current?.click();
  }, []);

  const { post, to, fallbackScheduledISO } = transition;
  const fromMeta = POST_STATUS_META[post.status];
  const toMeta = POST_STATUS_META[to];
  const needsFallbackDate = to === "scheduled" && !post.scheduled_for;
  const scheduledISO = post.scheduled_for ?? fallbackScheduledISO;

  const apply = () => {
    const patch: Partial<GBPPost> =
      to === "pending_approval"
        ? { status: "pending_approval" }
        : to === "scheduled"
          ? {
              status: "scheduled",
              scheduled_for: scheduledISO,
              published_at: undefined,
            }
          : to === "published"
            ? {
                status: "published",
                published_at: new Date().toISOString(),
                scheduled_for: undefined,
              }
            : { status: "draft" };
    patchPost(slug, post.id, patch);
  };

  return (
    <ApprovalLadder
      trigger={
        <button
          ref={triggerRef}
          type="button"
          className="sr-only"
          tabIndex={-1}
          aria-hidden
        >
          Confirm board move
        </button>
      }
      title="Move post on the board"
      description={`"${post.title}"`}
      actionVerb={TRANSITION_VERB[to]}
      auditAction={`Moved GBP post "${post.title}": ${fromMeta.label} → ${toMeta.label}`}
      auditResource={`gbp_post:${post.id}`}
      auditVerb={to === "published" || to === "scheduled" ? "approve" : "update"}
      locationSlug={slug}
      cost={{
        value: "$0.00",
        math: "1 GBP post status change × 1 location — no API spend",
        subline: "Demo mode — the profile write is simulated",
      }}
      preview={
        <div className="flex flex-col gap-3">
          <div
            className="flex flex-wrap items-center gap-2"
            aria-label={`Transition: ${fromMeta.label} to ${toMeta.label}`}
          >
            <StatusPill
              tone={fromMeta.tone}
              icon={fromMeta.icon}
            >
              {fromMeta.label}
            </StatusPill>
            <Icons.arrowRight
              className="text-muted-foreground size-3.5"
              aria-hidden
            />
            <StatusPill
              tone={toMeta.tone}
              icon={toMeta.icon}
            >
              {toMeta.label}
            </StatusPill>
          </div>
          {needsFallbackDate ? (
            <p className="bg-accent text-accent-foreground rounded-md p-2 text-[12px]">
              No date on this post — it will be scheduled for{" "}
              <span className="num font-semibold">{fmtDate(scheduledISO)}</span>. Edit in the
              composer to change the date.
            </p>
          ) : null}
          {to === "published" ? (
            <p className="bg-accent text-accent-foreground rounded-md p-2 text-[12px]">
              Publishes to the profile immediately on approval.
            </p>
          ) : null}
          <PostPreviewBlock post={post} />
        </div>
      }
      onCompleted={apply}
    />
  );
}
