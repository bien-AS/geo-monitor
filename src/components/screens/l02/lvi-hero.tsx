import Link from "next/link";
import { Icons } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { LVIDonut } from "@/components/local/lvi-donut";
import { Sparkline } from "@/components/local/sparkline";
import { SourceBadge } from "@/components/local/source-badge";
import { StatusPill } from "@/components/local/status-pill";
import {
  LVI_BAND_LABEL,
  LVI_COMPONENTS,
  lviBand,
  type LVIBand,
  type LVIComponentScore,
} from "@/lib/lvi";
import type { DataSource, LocationLVI } from "@/lib/data/types";

const BAND_TEXT_CLS: Record<LVIBand, string> = {
  elite: "text-success-600 dark:text-success-100",
  healthy: "text-success-600 dark:text-success-100",
  "at-risk": "text-warning-600 dark:text-warning-100",
  critical: "text-error-600 dark:text-error-100",
};

export function LVIHero({
  slug,
  locationName,
  lvi,
  source,
}: {
  slug: string;
  locationName: string;
  lvi: LocationLVI | null;
  source: DataSource;
}) {
  if (!lvi) {
    return (
      <Card className="items-center gap-3 p-10 text-center">
        <div
          aria-hidden
          className="flex items-center gap-2"
        >
          <span className="bg-primary-200 size-6 rounded-full" />
          <span className="size-6 rotate-45 bg-cyan-200" />
          <span className="bg-primary-200 size-6 rounded-sm" />
        </div>
        <h2 className="text-lg font-semibold">Awaiting first LVI computation</h2>
        <p className="text-text-secondary max-w-sm text-[13px]">
          The Local Visibility Index for this location lands after its first full audit run.
        </p>
      </Card>
    );
  }

  const components: LVIComponentScore[] = LVI_COMPONENTS.map((def) => {
    const score = Math.round(lvi.components[def.id] ?? 0);
    return { ...def, score, band: lviBand(score) };
  });
  const bottomTwo = [...components].sort((a, b) => a.score - b.score).slice(0, 2);
  const focusIds = new Set(bottomTwo.map((c) => c.id));
  const strongest = [...components].sort((a, b) => b.score - a.score)[0];
  const focusWeightPct = Math.round(bottomTwo.reduce((s, c) => s + c.weight, 0) * 100);

  return (
    <Card className="gap-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold">Local Visibility Index</h2>
          <p className="text-text-tertiary text-[13px]">
            9 healthcare-weighted components · weights sum to <span className="num">1.00</span> ·
            ring slices drill into their module
          </p>
        </div>
        <SourceBadge source={source} />
      </div>

      <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)_280px]">
        <div className="flex flex-col items-center gap-4">
          <LVIDonut
            value={lvi.value}
            band={lvi.band}
            delta={lvi.delta}
            mode="location"
            components={components}
            showRing
            slug={slug}
          />
          {lvi.spark.length > 1 ? (
            <div className="w-full">
              <p className="eyebrow text-text-tertiary">6-month trend</p>
              <Sparkline
                data={lvi.spark}
                height={40}
                ariaLabel={`LVI 6-month trend for ${locationName}`}
              />
            </div>
          ) : null}
        </div>

        <div className="min-w-0">
          <p className="eyebrow text-text-tertiary">Component scores</p>
          <ul className="divide-border-subtle mt-1 divide-y">
            {components.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/locations/${slug}/${c.module}`}
                  aria-label={`${c.label}: ${c.score} of 100, ${LVI_BAND_LABEL[c.band]}. Open ${c.label} module.`}
                  className="hover:bg-secondary/60 flex min-h-11 items-center gap-3 rounded-sm px-1 py-1.5"
                >
                  <span className="flex min-w-0 flex-1 items-center gap-2">
                    <span className="text-foreground truncate text-[13px] font-medium">
                      {c.label}
                    </span>
                    {focusIds.has(c.id) ? <StatusPill tone="warning">Focus</StatusPill> : null}
                  </span>
                  <span className="num bg-secondary text-text-secondary rounded px-1.5 py-0.5 text-[11px]">
                    ×{c.weight.toFixed(2)}
                  </span>
                  <span
                    className={cn(
                      "num w-8 text-right text-[13px] font-bold",
                      BAND_TEXT_CLS[c.band],
                    )}
                  >
                    {c.score}
                  </span>
                  <Icons.chevronRight
                    className="text-text-tertiary size-3.5 shrink-0"
                    aria-hidden
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-accent rounded-lg p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="eyebrow text-accent-foreground/80">Insights</p>
            <SourceBadge
              source="synthetic"
              note="Narrative derived from the fixture scores on this page"
            />
          </div>
          <p className="text-accent-foreground mt-2 text-[13px] leading-relaxed">
            {locationName} is {LVI_BAND_LABEL[lvi.band]} at LVI{" "}
            <span className="num font-bold">{lvi.value}</span>, {lvi.delta >= 0 ? "up" : "down"}{" "}
            <span className="num font-bold">{Math.abs(lvi.delta)}</span> vs the prior period.{" "}
            {strongest.label} (<span className="num font-bold">{strongest.score}</span>) carries the
            composite; the drag is {bottomTwo[0].label} (
            <span className="num font-bold">{bottomTwo[0].score}</span>) and {bottomTwo[1].label} (
            <span className="num font-bold">{bottomTwo[1].score}</span>). Together those two hold{" "}
            <span className="num font-bold">{focusWeightPct}%</span> of the LVI weight — improving
            them moves this score fastest.
          </p>
        </div>
      </div>
    </Card>
  );
}
