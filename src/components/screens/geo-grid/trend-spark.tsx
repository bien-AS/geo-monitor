"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { fmtDateShort } from "@/lib/format";

export function TrendSpark({
  points,
  height = 64,
  className,
}: {
  points: { date: string; value: number }[];
  height?: number;
  className?: string;
}) {
  const [hover, setHover] = React.useState<number | null>(null);
  const w = 240;
  const h = 64;
  const pad = 7;

  if (points.length < 2) {
    return (
      <p className={cn("text-muted-foreground text-[12px]", className)}>
        Second scan cycle pending — the trend appears after the next weekly refresh.
      </p>
    );
  }

  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (w - 2 * pad);
    const y = pad + ((v - min) / range) * (h - 2 * pad);
    return [x, y] as const;
  });
  const path = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
  const area = `${path} L${pts[pts.length - 1][0]},${h - pad} L${pts[0][0]},${h - pad} Z`;
  const active = hover ?? points.length - 1;

  return (
    <div className={className}>
      <div className="flex items-baseline justify-between">
        <p className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
          Trend
        </p>
        <span
          aria-hidden
          className="text-[10px] font-semibold text-green-600 dark:text-green-400"
        >
          ↑ better
        </span>
      </div>
      <div className="relative mt-1">
        <div
          className="pointer-events-none absolute z-10"
          style={{
            left: `${(pts[active][0] / w) * 100}%`,
            top: -4,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div className="bg-foreground text-background flex items-baseline gap-1.5 rounded px-1.5 py-0.5 whitespace-nowrap">
            <span className="text-[9.5px] font-medium opacity-70">
              {fmtDateShort(points[active].date)}
            </span>
            <span className="num text-[10.5px] font-bold">{points[active].value.toFixed(1)}</span>
          </div>
          <div
            aria-hidden
            className="border-t-foreground mx-auto size-0 border-x-4 border-t-4 border-x-transparent"
          />
        </div>
        <svg
          viewBox={`0 0 ${w} ${h}`}
          preserveAspectRatio="none"
          role="img"
          aria-label={`Average rank trend, ${points.length} cycles, up is better`}
          className="block w-full cursor-crosshair"
          style={{ height }}
          onMouseLeave={() => setHover(null)}
        >
          <path
            d={area}
            fill="var(--color-primary-500)"
            opacity="0.12"
          />
          <path
            d={path}
            fill="none"
            stroke="var(--color-primary-500)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          <line
            x1={pts[active][0]}
            y1={pad}
            x2={pts[active][0]}
            y2={h - pad}
            stroke="var(--color-neutral-400)"
            strokeWidth="0.7"
            strokeDasharray="2 2"
            opacity="0.6"
            pointerEvents="none"
          />
          {pts.map(([x, y], i) => (
            <g
              key={`d-${i}`}
              pointerEvents="none"
            >
              <path
                d={`M ${x} ${y} l 0.0001 0`}
                stroke="var(--card)"
                strokeWidth={i === active ? 10.8 : 8}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                fill="none"
              />
              <path
                d={`M ${x} ${y} l 0.0001 0`}
                stroke="var(--color-primary-500)"
                strokeWidth={i === active ? 8 : 5.2}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                fill="none"
              />
            </g>
          ))}
          {pts.map(([x, y], i) => (
            <circle
              key={`h-${i}`}
              cx={x}
              cy={y}
              r="14"
              fill="transparent"
              onMouseEnter={() => setHover(i)}
            />
          ))}
        </svg>
      </div>
      <div className="mt-1 flex justify-between">
        {points.map((p) => (
          <span
            key={p.date}
            className="num text-muted-foreground text-[10px]"
          >
            {fmtDateShort(p.date)}
          </span>
        ))}
      </div>
    </div>
  );
}
