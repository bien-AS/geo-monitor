"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { countUp, sweepDash, useGsapReveal } from "@/components/local/use-gsap-reveal";

export function scoreTone(score: number | null): "success" | "warning" | "error" | "unknown" {
  if (score == null) return "unknown";
  if (score >= 75) return "success";
  if (score >= 40) return "warning";
  return "error";
}

const TONE_VAR: Record<ReturnType<typeof scoreTone>, string> = {
  success: "var(--color-success-500)",
  warning: "var(--color-warning-500)",
  error: "var(--color-error-500)",
  unknown: "var(--color-neutral-300)",
};

export function ScoreGauge({
  score,
  caption,
  className,
}: {
  score: number | null;
  caption?: string;
  className?: string;
}) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const pct = score == null ? 0 : Math.max(0, Math.min(100, score));
  const color = TONE_VAR[scoreTone(score)];

  const rootRef = React.useRef<HTMLDivElement>(null);
  const arcRef = React.useRef<SVGCircleElement>(null);
  const numRef = React.useRef<HTMLSpanElement>(null);

  useGsapReveal(rootRef, () => {
    sweepDash(arcRef.current, (c * pct) / 100, c, {
      duration: 1,
      ease: "power3.out",
    });
    if (score != null) countUp(numRef.current, score, { duration: 1 });
  }, [score]);

  return (
    <div
      ref={rootRef}
      className={cn("relative size-40", className)}
    >
      <svg
        viewBox="0 0 128 128"
        className="size-full"
        aria-hidden
      >
        <circle
          cx="64"
          cy="64"
          r={r}
          fill="none"
          stroke="var(--secondary)"
          strokeWidth="11"
          strokeDasharray={score == null ? "3 5" : undefined}
        />
        {score != null && (
          <circle
            ref={arcRef}
            cx="64"
            cy="64"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="11"
            strokeLinecap="round"
            strokeDasharray={`${(c * pct) / 100} ${c}`}
            transform="rotate(-90 64 64)"
          />
        )}
      </svg>
      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
        role="img"
        aria-label={
          score == null ? "Scorecard composite pending" : `Scorecard composite ${score} of 100`
        }
      >
        <span
          ref={numRef}
          className="num text-primary dark:text-foreground text-[34px] leading-none font-bold tracking-tight"
        >
          {score == null ? "\u2014" : score}
        </span>
        <span className="num text-muted-foreground mt-1 text-[11px]">of 100</span>
        {caption ? (
          <span className="text-muted-foreground mt-1 text-[11px] font-semibold tracking-[0.05em] uppercase">
            {caption}
          </span>
        ) : null}
      </div>
    </div>
  );
}
