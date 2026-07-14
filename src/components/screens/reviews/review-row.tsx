"use client";

import { cn } from "@/lib/utils";
import { PHIContainer } from "@/components/local/phi-container";
import type { Review, ReviewStatus } from "@/lib/data/types";
import { fmtDateShort } from "@/lib/format";
import { PlatformPill, ReviewStatusChip, SentimentChip, Stars } from "./chips";

export function ReviewRow({
  review,
  status,
  selected,
  onSelect,
}: {
  review: Review;
  status: ReviewStatus;
  selected?: boolean;
  onSelect?: () => void;
}) {
  const critical = review.sentiment === "critical" || status === "handoff";

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`Review by ${review.reviewer.name}, ${review.rating} stars, ${review.sentiment}, ${status}`}
      className={cn(
        "border-border bg-card w-full rounded-r-md border border-l-[3px] px-3 py-2.5 text-left transition-colors",
        critical
          ? "border-l-error-500"
          : selected
            ? "border-l-primary-500"
            : "border-l-transparent",
        selected ? "bg-accent/60 dark:bg-primary-500/10" : "hover:bg-secondary/60",
      )}
    >
      {critical && (
        <span className="eyebrow bg-error-50 text-error-700 dark:bg-error-700/25 dark:text-error-100 mb-1.5 inline-flex items-center rounded px-1.5 py-0.5">
          Critical
        </span>
      )}
      <div className="flex items-baseline gap-2">
        <Stars
          rating={review.rating}
          className="shrink-0 text-[12px]"
        />
        <span className="text-foreground min-w-0 flex-1 truncate text-[13px] font-semibold">
          {review.reviewer.name}
          {review.reviewer.localGuide && (
            <span className="text-text-tertiary ml-1.5 font-normal">· Local Guide</span>
          )}
        </span>
        <span className="num text-text-tertiary shrink-0 text-[11px]">
          {fmtDateShort(review.date)}
        </span>
      </div>
      <PHIContainer className="mt-1.5 py-2">
        <p className="text-text-secondary line-clamp-2 pr-1 text-[12px] leading-snug">
          {review.text}
        </p>
      </PHIContainer>
      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
        <PlatformPill platform={review.platform} />
        <SentimentChip sentiment={review.sentiment} />
        {review.topics.slice(0, 2).map((t) => (
          <span
            key={t}
            className="bg-secondary text-text-secondary inline-flex h-5 items-center rounded-full px-2 text-[11px]"
          >
            {t}
          </span>
        ))}
        <span className="ml-auto">
          <ReviewStatusChip status={status} />
        </span>
      </div>
    </button>
  );
}
