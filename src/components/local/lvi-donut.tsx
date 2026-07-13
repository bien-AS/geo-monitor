"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { LVI_BAND_LABEL, type LVIBand, type LVIComponentScore } from "@/lib/lvi";
import { countUp, drawIn, useGsapReveal } from "./use-gsap-reveal";

const BAND_HEX: Record<LVIBand, string> = {
  elite: "var(--color-success-500)",
  healthy: "var(--color-success-500)",
  "at-risk": "var(--color-warning-500)",
  critical: "var(--color-error-500)",
};

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return [
    Number((cx + r * Math.cos(rad)).toFixed(3)),
    Number((cy + r * Math.sin(rad)).toFixed(3)),
  ] as const;
}

function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const [sx, sy] = polar(cx, cy, r, startDeg);
  const [ex, ey] = polar(cx, cy, r, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${sx} ${sy} A ${r} ${r} 0 ${large} 1 ${ex} ${ey}`;
}

/**
 * <LVIDonut /> — the headline metric. Donut arc = composite LVI colored by band;
 * the optional outer ring renders the 9 weighted components (arc length = weight,
 * fill = sub-score band) and drills into the owning module on click.
 */
export function LVIDonut({
  value,
  band,
  delta,
  mode = "location",
  components,
  showRing = false,
  slug,
  size,
  className,
}: {
  value: number;
  band: LVIBand;
  delta?: number;
  mode?: "location" | "portfolio";
  components?: LVIComponentScore[];
  showRing?: boolean;
  /** Required for ring drill-through */
  slug?: string;
  size?: number;
  className?: string;
}) {
  const router = useRouter();
  const [hover, setHover] = React.useState<LVIComponentScore | null>(null);

  const rootRef = React.useRef<HTMLDivElement>(null);
  const arcRef = React.useRef<SVGPathElement>(null);
  const valueRef = React.useRef<SVGTextElement>(null);

  useGsapReveal(rootRef, () => {
    drawIn(arcRef.current, { duration: 1.1, ease: "power3.out" });
    countUp(valueRef.current, value, { duration: 1 });
  }, [value]);

  const s = size ?? (showRing ? 224 : 200);
  const c = s / 2;
  const trackR = showRing ? c - 26 : c - 14;
  const ringR = c - 8;
  const sweep = Math.max(0.5, (value / 100) * 359.5);
  const color = BAND_HEX[band];

  const gap = 2.5;
  let cursor = 0;
  const segments =
    showRing && components
      ? components.map((comp) => {
          const span = comp.weight * 360;
          const seg = {
            comp,
            start: cursor + gap / 2,
            end: cursor + span - gap / 2,
          };
          cursor += span;
          return seg;
        })
      : [];

  return (
    <div
      ref={rootRef}
      className={cn("relative inline-flex flex-col items-center", className)}
    >
      <svg
        width={s}
        height={s}
        viewBox={`0 0 ${s} ${s}`}
        role="img"
        aria-label={`${mode === "portfolio" ? "Portfolio" : "Local"} Visibility Index ${value} of 100 — ${LVI_BAND_LABEL[band]}`}
      >
        {/* track */}
        <circle
          cx={c}
          cy={c}
          r={trackR}
          fill="none"
          stroke="var(--color-surface-muted)"
          strokeWidth={13}
        />
        {/* value arc */}
        <path
          ref={arcRef}
          d={arcPath(c, c, trackR, 0, sweep)}
          fill="none"
          stroke={color}
          strokeWidth={13}
          strokeLinecap="round"
        />
        {/* 9-component weighted ring */}
        {segments.map(({ comp, start, end }) => (
          <path
            key={comp.id}
            d={arcPath(c, c, ringR, start, end)}
            fill="none"
            stroke={BAND_HEX[comp.band]}
            strokeWidth={hover?.id === comp.id ? 9 : 6}
            strokeLinecap="butt"
            className="cursor-pointer transition-all"
            tabIndex={0}
            role="link"
            aria-label={`${comp.label}: ${comp.score} of 100, weight ${(comp.weight * 100).toFixed(0)}%. Open ${comp.label} module.`}
            onMouseEnter={() => setHover(comp)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(comp)}
            onBlur={() => setHover(null)}
            onClick={() => slug && router.push(`/locations/${slug}/${comp.module}`)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && slug) router.push(`/locations/${slug}/${comp.module}`);
            }}
          />
        ))}
        {/* center 3-line label */}
        <text
          x={c}
          y={c - 26}
          textAnchor="middle"
          className="fill-text-tertiary"
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.07em",
            textTransform: "uppercase",
          }}
        >
          {mode === "portfolio" ? "PORTFOLIO LVI" : "LOCAL VISIBILITY INDEX"}
        </text>
        <text
          ref={valueRef}
          x={c}
          y={c + 14}
          textAnchor="middle"
          style={{
            fontSize: 40,
            fontWeight: 700,
            fontFamily: "var(--font-mono)",
            fill: color,
          }}
        >
          {value}
        </text>
        <text
          x={c}
          y={c + 34}
          textAnchor="middle"
          className="fill-text-tertiary"
          style={{ fontSize: 11, fontStyle: "italic" }}
        >
          {LVI_BAND_LABEL[band]}
          {typeof delta === "number" ? ` · ${delta >= 0 ? "↑ +" : "↓ "}${delta}` : ""}
        </text>
      </svg>
      {/* hover legend for ring segments */}
      {showRing && (
        <div
          aria-live="polite"
          className="text-text-secondary mt-1 h-5 text-center text-[12px]"
        >
          {hover ? (
            <>
              <span className="text-foreground font-medium">{hover.label}</span> ·{" "}
              <span className="num">{(hover.weight * 100).toFixed(0)}%</span> weight ·{" "}
              <span className="num">{hover.score}</span>/100 · {LVI_BAND_LABEL[hover.band]}
            </>
          ) : (
            <span className="text-text-tertiary">Hover a segment · click to open its module</span>
          )}
        </div>
      )}
    </div>
  );
}
