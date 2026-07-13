"use client";

import * as React from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { Card } from "@/components/ui/card";
import { LVIDonut } from "@/components/local/lvi-donut";
import { useGsapReveal } from "@/components/local/use-gsap-reveal";
import { Sparkline } from "@/components/local/sparkline";
import { DeltaPill } from "@/components/local/delta-pill";
import { SourceBadge } from "@/components/local/source-badge";
import type { LVIBand } from "@/lib/lvi";
import type { L01BandRow, L01Mover } from "./types";

const BAND_VAR: Record<LVIBand, string> = {
  elite: "var(--color-success-700)",
  healthy: "var(--color-success-500)",
  "at-risk": "var(--color-warning-500)",
  critical: "var(--color-error-500)",
};

/** Wrap every numeric token in `.num` (JetBrains Mono law, even in prose). */
function MonoNums({ text }: { text: string }) {
  const parts = text.split(/([+\-−↑↓]?\d[\d.,]*[%★]?)/g);
  return (
    <>
      {parts.map((p, i) =>
        /\d/.test(p) ? (
          <span
            key={i}
            className="num font-semibold"
          >
            {p}
          </span>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

function MoverList({ eyebrow, movers }: { eyebrow: string; movers: L01Mover[] }) {
  return (
    <div>
      <p className="eyebrow text-text-tertiary">{eyebrow}</p>
      <div className="mt-2 flex flex-col gap-1">
        {movers.map((m) => (
          <Link
            key={m.slug}
            href={`/locations/${m.slug}`}
            className="hover:bg-secondary -mx-2 flex min-h-11 flex-col gap-1 rounded-md px-2 py-1.5 transition-colors"
            aria-label={`${m.shortName} — LVI ${m.lvi}, ${m.delta >= 0 ? "up" : "down"} ${Math.abs(m.delta)} vs last cycle. Open location overview.`}
          >
            <span className="flex items-baseline justify-between gap-3">
              <span className="text-foreground min-w-0 truncate text-[13px] font-medium">
                {m.shortName}
                <span className="text-text-tertiary ml-1.5 text-[11px] font-normal">{m.city}</span>
              </span>
              <span
                className="num shrink-0 text-[16px] font-bold"
                style={{ color: BAND_VAR[m.band] }}
              >
                {m.lvi}
              </span>
            </span>
            <span className="flex items-center justify-between gap-3">
              <DeltaPill
                delta={m.delta}
                label="vs last cycle"
              />
              <Sparkline
                data={m.spark}
                height={22}
                className="max-w-16"
                ariaLabel={`${m.shortName} 6-month LVI trend`}
              />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function LVIHero({
  value,
  band,
  delta,
  locationCount,
  bands,
  up,
  down,
  insights,
  snapshotDate,
}: {
  value: number;
  band: LVIBand;
  delta: number;
  locationCount: number;
  bands: L01BandRow[];
  up: L01Mover[];
  down: L01Mover[];
  insights: string;
  snapshotDate: string;
}) {
  const nonZero = bands.filter((b) => b.count > 0);

  const bandBarRef = React.useRef<HTMLDivElement>(null);
  useGsapReveal(bandBarRef, () => {
    const segs = bandBarRef.current?.children;
    if (!segs || segs.length === 0) return;
    gsap.from(Array.from(segs), {
      scaleX: 0,
      transformOrigin: "left center",
      duration: 0.8,
      ease: "power3.out",
      stagger: 0.05,
    });
  });

  return (
    <Card className="border-l-primary-500 gap-5 rounded-xl border-l-[3px] p-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-foreground text-lg font-semibold">
            Portfolio Local Visibility Index
          </h2>
          <p className="text-text-tertiary text-[13px]">
            Equal-weighted across all <span className="num">{locationCount}</span> locations ·
            snapshot <span className="num">{snapshotDate}</span>
          </p>
        </div>
        <SourceBadge
          source="synthetic"
          note="LVI composite computed from DataForSEO / Search Atlas snapshot signals via lib/lvi.ts weights"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[auto_minmax(0,1fr)] xl:grid-cols-[auto_minmax(0,1fr)_300px]">
        {/* COL A — the headline donut */}
        <div className="flex flex-col items-center gap-2 justify-self-center lg:justify-self-start">
          <LVIDonut
            value={value}
            band={band}
            mode="portfolio"
            size={200}
          />
          <DeltaPill
            delta={delta}
            label="vs last cycle"
            suffix=" pts"
          />
        </div>

        {/* COL B — band distribution + movers */}
        <div className="flex min-w-0 flex-col gap-4">
          <div>
            <div
              ref={bandBarRef}
              className="flex h-3 w-full overflow-hidden rounded-full"
              role="img"
              aria-label={bands
                .map((b) => `${b.label}: ${b.count} locations (${b.pct}%)`)
                .join(", ")}
            >
              {nonZero.map((b) => (
                <div
                  key={b.band}
                  style={{
                    width: `${b.pct}%`,
                    background: BAND_VAR[b.band],
                  }}
                />
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              {bands.map((b) => (
                <span
                  key={b.band}
                  className="text-text-secondary inline-flex items-center gap-1.5 text-[12px]"
                >
                  <span
                    aria-hidden
                    className="size-2 rounded-full"
                    style={{ background: BAND_VAR[b.band] }}
                  />
                  {b.label}
                  <span className="num text-foreground font-semibold">{b.count}</span>
                  <span className="num text-text-tertiary">{b.pct}%</span>
                </span>
              ))}
            </div>
          </div>
          <div className="border-border-subtle grid grid-cols-1 gap-4 border-t pt-4 sm:grid-cols-2">
            <MoverList
              eyebrow="Top movers"
              movers={up}
            />
            <MoverList
              eyebrow="Slipping"
              movers={down}
            />
          </div>
        </div>

        {/* COL C — fleet synthesis */}
        <div className="bg-accent flex flex-col gap-2 rounded-lg p-4 lg:col-span-2 xl:col-span-1">
          <p className="eyebrow text-accent-foreground/80">Fleet synthesis</p>
          <p className="text-accent-foreground text-[13px] leading-relaxed">
            <MonoNums text={insights} />
          </p>
          <p className="text-accent-foreground/70 mt-auto pt-1 text-[11px]">
            Derived from this cycle&apos;s fixture snapshot — not an LLM narrative.
          </p>
        </div>
      </div>
    </Card>
  );
}
