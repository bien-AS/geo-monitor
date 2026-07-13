import Link from "next/link";
import { Card } from "@/components/ui/card";
import { SourceBadge } from "@/components/local/source-badge";
import type { L01AlertItem } from "./types";

const TONE = {
  error: {
    border: "border-l-error-500",
    count: "text-error-500",
  },
  warning: {
    border: "border-l-warning-500",
    count: "text-warning-500",
  },
  info: {
    border: "border-l-primary-500",
    count: "text-primary-500 dark:text-primary-300",
  },
} as const;

export function AlertRails({ items }: { items: L01AlertItem[] }) {
  return (
    <section aria-labelledby="l01-needs-attention">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2
            id="l01-needs-attention"
            className="text-foreground text-lg font-semibold"
          >
            Needs attention
          </h2>
          <p className="text-text-tertiary text-[13px]">
            Prioritized from this cycle&apos;s findings
          </p>
        </div>
        <SourceBadge
          source="synthetic"
          note="Derived from fixture snapshots."
        />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => {
          const tone = TONE[item.tone];
          return (
            <Card
              key={item.id}
              className={`gap-2 rounded-lg border-l-[3px] p-4 ${tone.border}`}
            >
              <p className="eyebrow text-text-tertiary">{item.eyebrow}</p>
              <p className={`num text-[28px] leading-none font-bold ${tone.count}`}>{item.count}</p>
              <p className="text-text-secondary text-[13px] leading-snug">{item.line}</p>
              {item.secondary ? (
                <p className="text-text-tertiary text-[12px] leading-snug">{item.secondary}</p>
              ) : null}
              <Link
                href={item.href}
                className="text-text-link mt-auto inline-flex min-h-6 items-center pt-1 text-[13px] font-medium hover:underline"
              >
                {item.linkLabel} →
              </Link>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
