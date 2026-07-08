"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Sparkline-as-primary (M1 pattern 6): full-width inline SVG, min 56px tall
 * on metric cards. Color logic: improving → primary, declining → error.
 */
export function Sparkline({
  data,
  height = 56,
  stroke,
  declineIsBad = true,
  className,
  ariaLabel,
}: {
  data: number[];
  height?: number;
  /** Override stroke color (defaults to trend-based primary/error) */
  stroke?: string;
  declineIsBad?: boolean;
  className?: string;
  ariaLabel?: string;
}) {
  const id = React.useId();
  if (!data || data.length < 2) {
    return (
      <div
        className={cn("skeleton", className)}
        style={{ height }}
      />
    );
  }

  const w = 100;
  const h = 32;
  const pad = 3;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pts = data.map((v, i) => {
    const x = pad + (i * (w - pad * 2)) / (data.length - 1);
    const y = h - pad - ((v - min) / span) * (h - pad * 2);
    return [x, y] as const;
  });
  const path = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
  const area = `${path} L${pts[pts.length - 1][0]},${h} L${pts[0][0]},${h} Z`;

  const declining = data[data.length - 1] < data[0];
  const color =
    stroke ?? (declining && declineIsBad ? "var(--color-error-500)" : "var(--color-primary-500)");

  const [lx, ly] = pts[pts.length - 1];

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      role="img"
      aria-label={ariaLabel ?? "Trend sparkline"}
      className={cn("w-full", className)}
      style={{ height }}
    >
      <defs>
        <linearGradient
          id={`spark-${id}`}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop
            offset="0%"
            stopColor={color}
            stopOpacity="0.14"
          />
          <stop
            offset="100%"
            stopColor={color}
            stopOpacity="0.02"
          />
        </linearGradient>
      </defs>
      <path
        d={area}
        fill={`url(#spark-${id})`}
      />
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {/* End dot as zero-length round-cap strokes: stays circular even though
          the SVG stretches non-uniformly (preserveAspectRatio="none") */}
      <path
        d={`M ${lx} ${ly} l 0.0001 0`}
        stroke="var(--card)"
        strokeWidth="7"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        fill="none"
      />
      <path
        d={`M ${lx} ${ly} l 0.0001 0`}
        stroke={color}
        strokeWidth="4.5"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        fill="none"
      />
    </svg>
  );
}
