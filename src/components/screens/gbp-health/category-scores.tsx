"use client";

import * as React from "react";
import { gsap } from "gsap";
import type { GBPAuditReport } from "@/lib/data/types";
import { useGsapReveal } from "@/components/local/use-gsap-reveal";
import { scoreTone } from "./score-gauge";

const CATEGORIES: Array<[key: string, label: string]> = [
  ["profile_optimization", "Profile optimization"],
  ["photos_media", "Photos & media"],
  ["technical_seo", "Technical SEO"],
  ["services_products", "Services & products"],
  ["reviews_reputation", "Reviews & reputation"],
  ["posts_updates", "Posts & updates"],
];

const TONE_VAR: Record<string, string> = {
  success: "var(--color-success-500)",
  warning: "var(--color-warning-500)",
  error: "var(--color-error-500)",
  unknown: "var(--color-neutral-300)",
};

export function CategoryScores({
  categoryScores,
}: {
  categoryScores: GBPAuditReport["category_scores"] | null;
}) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const fillRefs = React.useRef<Array<HTMLDivElement | null>>([]);

  useGsapReveal(rootRef, () => {
    const fills = fillRefs.current.filter((el): el is HTMLDivElement => el != null);
    if (fills.length === 0) return;
    gsap.from(fills, {
      scaleX: 0,
      transformOrigin: "left center",
      duration: 0.7,
      ease: "power3.out",
      stagger: 0.05,
    });
  });

  return (
    <div
      ref={rootRef}
      className="flex flex-col gap-3"
    >
      {CATEGORIES.map(([key, label], i) => {
        const cat = categoryScores?.[key] ?? null;
        const populated = cat != null && cat.total_items > 0;
        const score = populated ? cat.score : null;
        const tone = scoreTone(score);

        return (
          <div
            key={key}
            className="flex items-center gap-3"
          >
            <p className="text-muted-foreground w-40 shrink-0 truncate text-[12px]">{label}</p>
            <div
              className="bg-secondary h-2 flex-1 overflow-hidden rounded-full"
              role="img"
              aria-label={
                score != null
                  ? `${label}: ${score} of 100`
                  : populated === false && cat != null
                    ? `${label}: not populated on the listing`
                    : `${label}: audit processing`
              }
            >
              {score != null && (
                <div
                  ref={(el) => {
                    fillRefs.current[i] = el;
                  }}
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.max(2, Math.min(100, score))}%`,
                    background: TONE_VAR[tone],
                  }}
                />
              )}
            </div>
            <p
              className="num w-16 shrink-0 text-right text-[12px] font-semibold"
              title={
                populated
                  ? `${cat.complete} complete \u00b7 ${cat.needs_attention} need attention \u00b7 ${cat.incomplete} incomplete`
                  : undefined
              }
            >
              {score != null ? (
                `${score}/100`
              ) : (
                <span className="text-muted-foreground font-normal">
                  {cat != null && cat.total_items === 0 ? "empty" : "\u2026"}
                </span>
              )}
            </p>
          </div>
        );
      })}
    </div>
  );
}
