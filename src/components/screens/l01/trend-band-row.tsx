"use client";

import * as React from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import { SourceBadge } from "@/components/local/source-badge";
import type { LVIBand } from "@/lib/lvi";
import type { L01BandRow, L01TrendPoint } from "./types";

const BAND_VAR: Record<LVIBand, string> = {
  elite: "var(--color-success-700)",
  healthy: "var(--color-success-500)",
  "at-risk": "var(--color-warning-500)",
  critical: "var(--color-error-500)",
};

function TrendTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; stroke?: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="border-border bg-popover rounded-md border px-3 py-2 shadow-md">
      <p className="eyebrow text-text-tertiary">{label}</p>
      {payload.map((p) => (
        <p
          key={p.name}
          className="text-text-secondary mt-0.5 text-[12px]"
        >
          <span
            aria-hidden
            className="mr-1.5 inline-block size-2 rounded-full"
            style={{ background: p.stroke }}
          />
          {p.name}: <span className="num font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

/** 6-month portfolio LVI line (recharts). */
export function LVITrendCard({
  points,
  locationCount,
  sinceLabel,
  delta,
}: {
  points: L01TrendPoint[];
  locationCount: number;
  sinceLabel: string;
  delta: number;
}) {
  const values = points.flatMap((p) => [p.portfolio, p.median]);
  const lo = Math.floor((Math.min(...values) - 4) / 5) * 5;
  const hi = Math.ceil((Math.max(...values) + 4) / 5) * 5;
  const latest = points[points.length - 1];

  return (
    <Card className="gap-4 rounded-lg p-6 xl:col-span-8">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-foreground text-lg font-semibold">
            Local Visibility Index — fleet trend
          </h2>
          <p className="text-text-tertiary text-[13px]">
            Equal-weighted across all <span className="num">{locationCount}</span> locations
          </p>
        </div>
        <span className="bg-accent text-accent-foreground rounded-full px-2.5 py-1 text-[11px] font-bold">
          <span className="num">
            {delta >= 0 ? "↑ +" : "↓ "}
            {delta}
          </span>{" "}
          pts since {sinceLabel}
        </span>
      </div>
      <p className="eyebrow text-text-tertiary -mb-2">6-month trend</p>
      <div className="h-56 w-full">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <LineChart
            data={points}
            margin={{ top: 8, right: 12, bottom: 0, left: -18 }}
          >
            <CartesianGrid
              stroke="var(--color-border-subtle)"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              tick={{
                fill: "var(--color-text-tertiary)",
                fontSize: 11,
                fontFamily: "var(--font-mono)",
              }}
              tickLine={false}
              axisLine={{ stroke: "var(--color-border)" }}
            />
            <YAxis
              domain={[lo, hi]}
              tick={{
                fill: "var(--color-text-tertiary)",
                fontSize: 11,
                fontFamily: "var(--font-mono)",
              }}
              tickLine={false}
              axisLine={false}
              width={40}
            />
            <Tooltip
              content={<TrendTooltip />}
              cursor={{ stroke: "var(--color-border-emphasis)" }}
            />
            <Line
              name="Fleet median"
              dataKey="median"
              type="monotone"
              stroke="var(--color-chart-3)"
              strokeWidth={1.5}
              strokeDasharray="4 3"
              dot={false}
              isAnimationActive={false}
            />
            <Line
              name="Portfolio LVI"
              dataKey="portfolio"
              type="monotone"
              stroke="var(--color-chart-1)"
              strokeWidth={2.5}
              dot={{
                r: 3,
                fill: "var(--color-chart-1)",
                stroke: "var(--card)",
                strokeWidth: 1.5,
              }}
              activeDot={{ r: 4 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* series legend */}
      <div className="flex flex-col gap-1.5">
        <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
          <span
            aria-hidden
            className="size-2 rounded-full"
            style={{ background: "var(--color-chart-1)" }}
          />
          <span className="text-foreground text-[13px] font-medium">Portfolio LVI</span>
          <span
            className="num text-[13px] font-bold"
            style={{ color: "var(--color-chart-1)" }}
          >
            {latest.portfolio}
          </span>
        </div>
        <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
          <span
            aria-hidden
            className="size-2 rounded-full"
            style={{ background: "var(--color-chart-3)" }}
          />
          <span className="text-foreground text-[13px] font-medium">Fleet median location</span>
          <span className="num text-text-secondary text-[13px] font-bold">{latest.median}</span>
        </div>
      </div>
    </Card>
  );
}

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)] as const;
}

function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const [sx, sy] = polar(cx, cy, r, startDeg);
  const [ex, ey] = polar(cx, cy, r, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${sx} ${sy} A ${r} ${r} 0 ${large} 1 ${ex} ${ey}`;
}

/** Locations-by-band donut with count + percent legend. */
export function BandDonutCard({
  bands,
  locationCount,
}: {
  bands: L01BandRow[];
  locationCount: number;
}) {
  const size = 180;
  const c = size / 2;
  const r = c - 12;
  const gap = 2;

  const nonEmpty = bands.filter((b) => b.count > 0);
  const segments = nonEmpty.map((b, idx) => {
    const startSpan = nonEmpty
      .slice(0, idx)
      .reduce((acc, prev) => acc + (prev.count / locationCount) * 360, 0);
    const span = (b.count / locationCount) * 360;
    return {
      ...b,
      start: startSpan + gap / 2,
      end: Math.min(startSpan + span - gap / 2, startSpan + span - 0.1),
    };
  });

  return (
    <Card className="gap-4 rounded-lg p-6 xl:col-span-4">
      <div>
        <h2 className="text-foreground text-lg font-semibold">Locations</h2>
        <p className="text-text-tertiary text-[13px]">By LVI band</p>
      </div>
      <div className="flex justify-center">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          role="img"
          aria-label={`${locationCount} locations by LVI band: ${bands
            .map((b) => `${b.label} ${b.count}`)
            .join(", ")}`}
        >
          <circle
            cx={c}
            cy={c}
            r={r}
            fill="none"
            stroke="var(--color-surface-muted)"
            strokeWidth={14}
          />
          {segments.map((s) => (
            <path
              key={s.band}
              d={arcPath(c, c, r, s.start, s.end)}
              fill="none"
              stroke={BAND_VAR[s.band]}
              strokeWidth={14}
              strokeLinecap="butt"
            />
          ))}
          <text
            x={c}
            y={c - 18}
            textAnchor="middle"
            className="fill-text-tertiary"
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.07em",
              textTransform: "uppercase",
            }}
          >
            LOCATIONS
          </text>
          <text
            x={c}
            y={c + 14}
            textAnchor="middle"
            className="fill-foreground"
            style={{
              fontSize: 34,
              fontWeight: 700,
              fontFamily: "var(--font-mono)",
            }}
          >
            {locationCount}
          </text>
          <text
            x={c}
            y={c + 32}
            textAnchor="middle"
            className="fill-text-tertiary"
            style={{ fontSize: 11, fontStyle: "italic" }}
          >
            across the fleet
          </text>
        </svg>
      </div>
      <div className="flex flex-col gap-1.5">
        {bands.map((b) => (
          <div
            key={b.band}
            className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-3"
          >
            <span
              aria-hidden
              className="size-2 rounded-full"
              style={{ background: BAND_VAR[b.band] }}
            />
            <span className="text-foreground text-[13px] font-medium">{b.label}</span>
            <span className="num text-text-tertiary text-[13px] font-semibold">{b.count}</span>
            <span
              className="num w-10 text-right text-[13px] font-bold"
              style={{ color: BAND_VAR[b.band] }}
            >
              {b.pct}%
            </span>
          </div>
        ))}
      </div>
      <a
        href="#locations"
        className="text-text-link text-[13px] font-medium hover:underline"
      >
        View all locations →
      </a>
      <div>
        <SourceBadge source="synthetic" />
      </div>
    </Card>
  );
}
