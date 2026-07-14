import { cn } from "@/lib/utils";
import { StatusPill } from "@/components/local/status-pill";
import type { Review, ReviewSentiment, ReviewStatus } from "@/lib/data/types";
import { Icons } from "@/lib/icons";

export function SentimentChip({
  sentiment,
  className,
}: {
  sentiment: ReviewSentiment;
  className?: string;
}) {
  switch (sentiment) {
    case "positive":
      return (
        <StatusPill
          tone="success"
          icon={Icons.approve}
          className={className}
        >
          Positive
        </StatusPill>
      );
    case "neutral":
      return (
        <StatusPill
          tone="neutral"
          icon={Icons.empty}
          className={className}
        >
          Neutral
        </StatusPill>
      );
    case "negative":
      return (
        <StatusPill
          tone="warning"
          icon={Icons.warning}
          className={className}
        >
          Negative
        </StatusPill>
      );
    case "critical":
      return (
        <StatusPill
          tone="error"
          icon={Icons.xCircle}
          className={className}
        >
          Critical
        </StatusPill>
      );
  }
}

export function ReviewStatusChip({
  status,
  className,
}: {
  status: ReviewStatus;
  className?: string;
}) {
  switch (status) {
    case "unanswered":
      return (
        <StatusPill
          tone="warning"
          icon={Icons.messageSquare}
          className={className}
        >
          Unanswered
        </StatusPill>
      );
    case "draft":
      return (
        <StatusPill
          tone="info"
          icon={Icons.pencil}
          className={className}
        >
          Draft
        </StatusPill>
      );
    case "responded":
      return (
        <StatusPill
          tone="success"
          icon={Icons.approve}
          className={className}
        >
          Responded
        </StatusPill>
      );
    case "handoff":
      return (
        <StatusPill
          tone="error"
          icon={Icons.user}
          className={className}
        >
          Pt. relations
        </StatusPill>
      );
  }
}

const PLATFORM_LABEL: Record<Review["platform"], string> = {
  google: "Google",
  healthgrades: "Healthgrades",
  vitals: "Vitals",
  facebook: "Facebook",
};

export function PlatformPill({
  platform,
  className,
}: {
  platform: Review["platform"];
  className?: string;
}) {
  return (
    <span
      className={cn(
        "eyebrow border-border text-text-secondary inline-flex h-5 items-center rounded-full border px-2",
        className,
      )}
    >
      {PLATFORM_LABEL[platform]}
    </span>
  );
}

export function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <span
      className={cn("num font-bold", className)}
      aria-label={`${rating} out of 5 stars`}
    >
      <span
        aria-hidden
        className={rating <= 2 ? "text-error-500" : "text-warning-500"}
      >
        {"★".repeat(rating)}
      </span>
      <span
        aria-hidden
        className="text-border-emphasis"
      >
        {"★".repeat(Math.max(0, 5 - rating))}
      </span>{" "}
      {rating}
    </span>
  );
}
