"use client";

import { Icons } from "@/lib/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ApprovalLadder } from "@/components/local/approval-ladder";
import { StatusPill } from "@/components/local/status-pill";
import { cn } from "@/lib/utils";
import { fmtDate } from "@/lib/format";
import type { GBPPost } from "@/lib/data/types";
import { POST_STATUS_META, POST_TYPE_META, postDateISO } from "./post-meta";
import { usePostsSession } from "@/store/posts";

export function PostPreviewBlock({ post, compact }: { post: GBPPost; compact?: boolean }) {
  const type = POST_TYPE_META[post.type];
  const TypeIcon = type.icon;
  const statusMeta = POST_STATUS_META[post.status];
  const dateISO = postDateISO(post);

  return (
    <div className="flex flex-col gap-2 text-[13px]">
      <div className="flex flex-wrap items-center gap-1.5">
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
        <StatusPill
          tone={statusMeta.tone}
          icon={statusMeta.icon}
        >
          {statusMeta.label}
        </StatusPill>
      </div>
      <p className="text-foreground font-semibold">{post.title}</p>
      {!compact && (
        <p className="text-muted-foreground line-clamp-3 leading-relaxed">{post.body}</p>
      )}
      {post.cta && (
        <p className="text-[12px]">
          <span className="text-muted-foreground">CTA: </span>
          <span className="font-medium">{post.cta.label}</span>{" "}
          <span className="text-muted-foreground">→</span>{" "}
          <span className="text-muted-foreground text-[11px]">{post.cta.url}</span>
        </p>
      )}
      {dateISO && (
        <p className="text-muted-foreground text-[12px]">
          {post.status === "published" ? "Published" : "Scheduled for"}{" "}
          <span className="num font-semibold">{fmtDate(dateISO)}</span>
        </p>
      )}
    </div>
  );
}

export function ReviewApproveLadder({
  slug,
  post,
  trigger,
}: {
  slug: string;
  post: GBPPost;
  trigger: React.ReactNode;
}) {
  const patchPost = usePostsSession((s) => s.patchPost);

  return (
    <ApprovalLadder
      trigger={trigger}
      title="Review & approve GBP post"
      description={`"${post.title}"`}
      actionVerb="Approve & publish"
      auditAction={`Approved GBP post "${post.title}" for publishing`}
      auditResource={`gbp_post:${post.id}`}
      auditVerb="approve"
      locationSlug={slug}
      cost={{
        value: "$0.00",
        math: "1 GBP post publish × 1 location — no API spend",
        subline: "Demo mode — the profile write is simulated",
      }}
      preview={<PostPreviewBlock post={post} />}
      onCompleted={() => {
        patchPost(slug, post.id, {
          status: "published",
          published_at: new Date().toISOString(),
          scheduled_for: undefined,
        });
      }}
    />
  );
}
