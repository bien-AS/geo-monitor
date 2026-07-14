"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PHIContainer } from "@/components/local/phi-container";
import { ApprovalLadder } from "@/components/local/approval-ladder";
import { useRole } from "@/components/shell/role-store";
import { Icons } from "@/lib/icons";
import type { Review, ReviewStatus } from "@/lib/data/types";
import { fmtDate } from "@/lib/format";
import { lintPHI, phiGate } from "./phi-lint";
import {
  templateFor,
  weaveTerms,
  PATIENT_RELATIONS_PHONE,
  type SeoWeaveContext,
} from "./templates";
import { PlatformPill, ReviewStatusChip, SentimentChip, Stars } from "./chips";

export function DetailPane({
  review,
  status,
  draft,
  onDraftChange,
  postedReply,
  onPosted,
  onHandoff,
  checkUrl,
  slug,
  seoCtx,
}: {
  review: Review;
  status: ReviewStatus;
  draft: string;
  onDraftChange: (text: string) => void;
  postedReply?: { text: string; date: string };
  onPosted: (text: string) => void;
  onHandoff: () => void;
  checkUrl?: string | null;
  slug: string;
  seoCtx?: SeoWeaveContext;
}) {
  const role = useRole();
  const viewer = role === "client-viewer";

  const flags = React.useMemo(() => lintPHI(draft), [draft]);
  const gate = phiGate(flags);
  const inHandoff = status === "handoff";
  const reply = postedReply ?? review.reply;
  const canHandoff =
    !viewer && !inHandoff && (review.sentiment === "critical" || review.rating <= 2);
  const showEditor = !viewer && status !== "responded";

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Stars
          rating={review.rating}
          className="text-[14px]"
        />
        <span className="text-foreground text-[14px] font-semibold">{review.reviewer.name}</span>
        {review.reviewer.localGuide && (
          <span className="eyebrow bg-secondary text-text-secondary rounded-full px-2 py-0.5">
            Local Guide
          </span>
        )}
        <span className="num text-text-tertiary text-[12px]">{fmtDate(review.date)}</span>
        <span className="ml-auto flex items-center gap-1.5">
          <PlatformPill platform={review.platform} />
          <SentimentChip sentiment={review.sentiment} />
          <ReviewStatusChip status={status} />
        </span>
      </div>
      <PHIContainer>
        <p className="text-foreground text-[13px] leading-relaxed">{review.text}</p>
      </PHIContainer>
      <div className="flex flex-wrap items-center gap-1.5">
        {review.topics.map((t) => (
          <span
            key={t}
            className="bg-secondary text-text-secondary inline-flex h-5 items-center rounded-full px-2 text-[11px]"
          >
            {t}
          </span>
        ))}
        {review.platform === "google" && checkUrl && (
          <a
            href={checkUrl}
            target="_blank"
            rel="noreferrer"
            className="text-text-link ml-auto inline-flex items-center gap-1 text-[12px] font-medium hover:underline"
          >
            View listing on Google
            <Icons.external
              className="size-3"
              aria-hidden
            />
          </a>
        )}
      </div>
      {inHandoff && (
        <div
          role="status"
          className="border-border border-l-error-500 bg-error-50 text-error-700 dark:bg-error-700/15 dark:text-error-100 flex items-start gap-2.5 rounded-r-md border border-l-[3px] px-3.5 py-3 text-[13px]"
        >
          <Icons.user
            className="mt-0.5 size-4 shrink-0"
            aria-hidden
          />
          <p>
            <span className="font-semibold">In the patient relations handoff lane.</span> Follow-up
            happens offline — the only recommended public action is a compliant acknowledgment.
          </p>
        </div>
      )}
      {canHandoff && (
        <div className="border-border border-l-error-500 flex items-start justify-between gap-3 rounded-r-md border border-l-[3px] px-3.5 py-3">
          <p className="text-text-secondary text-[13px]">
            <span className="text-foreground font-semibold">Recommended route:</span> hand this
            review to patient relations for offline follow-up, then post only a compliant
            acknowledgment.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="border-error-500/40 text-error-700 hover:bg-error-50 dark:text-error-100 shrink-0"
            onClick={onHandoff}
          >
            <Icons.user
              className="size-3.5"
              aria-hidden
            />
            Hand off to patient relations
          </Button>
        </div>
      )}
      {reply && (
        <div className="border-border border-l-success-500 rounded-md border border-l-[3px] p-3.5">
          <p className="eyebrow text-success-700 dark:text-success-100 flex items-center gap-1.5">
            <Icons.approve
              className="size-3.5"
              aria-hidden
            />
            Public reply posted
          </p>
          <p className="text-foreground mt-2 text-[13px] leading-relaxed">{reply.text}</p>
          <p className="num text-text-tertiary mt-2 text-[11px]">
            {"author" in reply && typeof reply.author === "string"
              ? `${reply.author} · `
              : "Baptist Memorial Health Care · "}
            {fmtDate(reply.date)}
          </p>
        </div>
      )}
      {showEditor && (
        <div className="border-border flex flex-col gap-3 rounded-md border p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="eyebrow text-text-tertiary">Response draft · HIPAA-constrained</p>
              <p className="text-text-tertiary mt-0.5 text-[12px]">
                Template draft · compliant register, varies by sentiment · no AI spend
              </p>
              {weaveTerms(review.sentiment, seoCtx).length > 0 && (
                <p className="mt-1 flex flex-wrap items-center gap-1">
                  <span className="text-text-tertiary text-[10.5px] font-medium">SEO weave:</span>
                  {weaveTerms(review.sentiment, seoCtx).map((t) => (
                    <span
                      key={t}
                      className="border-primary-500/30 bg-primary-50 text-primary-700 dark:bg-primary-700/15 dark:text-primary-100 rounded-full border px-1.5 py-0.5 text-[10.5px] font-medium"
                    >
                      {t}
                    </span>
                  ))}
                  <span className="text-text-tertiary text-[10.5px]">
                    · positive/neutral only — PHI gate stays primary
                  </span>
                </p>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDraftChange(templateFor(review.sentiment, seoCtx))}
            >
              <Icons.sparkles
                className="size-3.5"
                aria-hidden
              />
              Generate compliant draft
            </Button>
          </div>
          <Textarea
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
            rows={5}
            placeholder="Draft a public reply — the PHI gate checks every edit before Approve enables."
            aria-label="Reply draft"
            className="text-[13px] leading-relaxed"
          />
          {draft.trim() === "" ? (
            <p className="text-text-tertiary flex items-center gap-1.5 text-[12px]">
              <Icons.shield
                className="size-3.5"
                aria-hidden
              />
              PHI check runs as you type.
            </p>
          ) : flags.length === 0 ? (
            <p
              role="status"
              className="text-success-700 dark:text-success-100 flex items-center gap-1.5 text-[12px] font-medium"
            >
              <Icons.shield
                className="size-3.5"
                aria-hidden
              />
              No PHI detected — clear to approve.
            </p>
          ) : (
            <div
              role="alert"
              className="bg-error-50 text-error-700 dark:bg-error-700/20 dark:text-error-100 rounded-md p-3 text-[12px]"
            >
              <p className="flex items-center gap-1.5 font-semibold">
                <Icons.shieldAlert
                  className="size-3.5"
                  aria-hidden
                />
                PHI check failed — Approve is blocked
              </p>
              <ul className="mt-1.5 flex flex-col gap-1 pl-5">
                {flags.map((f) => (
                  <li
                    key={f.id}
                    className="list-disc"
                  >
                    {f.matches.map((m, i) => (
                      <span key={m}>
                        {i > 0 && ", "}
                        <span className="font-semibold">&ldquo;{m}&rdquo;</span>
                      </span>
                    ))}{" "}
                    — {f.label}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex items-center justify-between gap-3">
            <span className="num text-text-tertiary text-[11px]">{draft.length} chars</span>
            <ApprovalLadder
              trigger={
                <Button
                  size="sm"
                  disabled={draft.trim() === ""}
                >
                  <Icons.send
                    className="size-3.5"
                    aria-hidden
                  />
                  Approve & post reply
                </Button>
              }
              title="Approve & post review reply"
              description={`${review.reviewer.name} · ${review.rating}★ · Google Business Profile`}
              actionVerb="Approve & post"
              auditAction="Approved & posted review reply"
              auditResource={`review:${review.id}`}
              auditVerb="approve"
              locationSlug={slug}
              gate={gate}
              cost={{
                value: "$0.00 — no AI spend",
                math: "Template draft composed client-side · 1 GBP reply post",
                subline: "Demo mode — the write is simulated; nothing posts to Google.",
              }}
              preview={
                <div className="flex flex-col gap-2 text-[13px]">
                  <p className="eyebrow text-text-tertiary">Exact public reply</p>
                  <blockquote className="border-l-primary-500 bg-card rounded-md border-l-[3px] p-3 leading-relaxed">
                    {draft}
                  </blockquote>
                  <p className="text-text-tertiary text-[12px]">
                    Posts publicly on the Google listing as Baptist Memorial Health Care. PHI gate
                    re-checks at the Approve step.
                  </p>
                </div>
              }
              onCompleted={() => onPosted(draft)}
            />
          </div>
        </div>
      )}
      <div className="border-border border-l-warning-500 bg-neutral-25 dark:bg-surface-muted rounded-r-md border border-l-[3px] px-3.5 py-3">
        <p className="eyebrow text-text-tertiary">HIPAA reply rules — enforced by the PHI gate</p>
        <ul className="text-text-secondary mt-1.5 flex flex-col gap-1 pl-4 text-[12px]">
          <li className="list-disc">Never confirm or deny that a reviewer is or was a patient.</li>
          <li className="list-disc">
            No care details, dates, or staff names — even to correct a factual inaccuracy.
          </li>
          <li className="list-disc">
            Take concerns offline: patient relations at{" "}
            <span className="num">{PATIENT_RELATIONS_PHONE}</span>.
          </li>
          <li className="list-disc">
            No reply ever auto-posts — operator approval + audit log on every post.
          </li>
        </ul>
      </div>
    </div>
  );
}
