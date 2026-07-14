"use client";

import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ReviewSentiment } from "@/lib/data/types";

export interface MonthlyPoint {
  label: string;
  count: number;
  avg: number | null;
}

export interface SentimentMonthPoint {
  label: string;
  positive: number;
  neutral: number;
  negative: number;
  critical: number;
}

export interface ResponseRatePoint {
  label: string;
  pct: number;
}

export const SENTIMENT_VAR: Record<ReviewSentiment, string> = {
  positive: "var(--color-success-500)",
  neutral: "var(--color-neutral-400)",
  negative: "var(--color-warning-500)",
  critical: "var(--color-error-500)",
};

const AXIS_TICK = {
  fill: "var(--color-text-tertiary)",
  fontSize: 11,
  fontFamily: "var(--font-mono)",
};

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number | string;
    color?: string;
    stroke?: string;
    fill?: string;
  }>;
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
            style={{ background: p.color ?? p.stroke ?? p.fill }}
          />
          {p.name}: <span className="num font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

export function VolumeRatingChart({ points }: { points: MonthlyPoint[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <ComposedChart
          data={points}
          margin={{ top: 8, right: 0, bottom: 0, left: -22 }}
        >
          <CartesianGrid
            stroke="var(--color-border-subtle)"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={{ stroke: "var(--color-border)" }}
          />
          <YAxis
            yAxisId="count"
            allowDecimals={false}
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            width={36}
          />
          <YAxis
            yAxisId="avg"
            orientation="right"
            domain={[1, 5]}
            ticks={[1, 2, 3, 4, 5]}
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            width={30}
          />
          <Tooltip
            content={<ChartTooltip />}
            cursor={{ fill: "var(--color-surface-muted)" }}
          />
          <Bar
            yAxisId="count"
            name="Reviews"
            dataKey="count"
            fill="var(--color-chart-3)"
            radius={[3, 3, 0, 0]}
            maxBarSize={28}
            isAnimationActive={false}
          />
          <Line
            yAxisId="avg"
            name="Avg rating"
            dataKey="avg"
            type="monotone"
            stroke="var(--color-chart-1)"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "var(--color-chart-1)", stroke: "var(--card)", strokeWidth: 1.5 }}
            activeDot={{ r: 4 }}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ResponseRateChart({ points }: { points: ResponseRatePoint[] }) {
  return (
    <div className="h-48 w-full">
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <LineChart
          data={points}
          margin={{ top: 8, right: 8, bottom: 0, left: -18 }}
        >
          <CartesianGrid
            stroke="var(--color-border-subtle)"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={{ stroke: "var(--color-border)" }}
          />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            width={40}
            tickFormatter={(v: number) => `${v}%`}
          />
          <Tooltip
            content={<ChartTooltip />}
            cursor={{ stroke: "var(--color-border-emphasis)" }}
          />
          <Line
            name="Responded %"
            dataKey="pct"
            type="monotone"
            stroke="var(--color-chart-2)"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "var(--color-chart-2)", stroke: "var(--card)", strokeWidth: 1.5 }}
            activeDot={{ r: 4 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SentimentLegend({
  totals,
  inboxHref,
}: {
  totals: Record<ReviewSentiment, number>;
  inboxHref: string;
}) {
  const order: ReviewSentiment[] = ["positive", "neutral", "negative", "critical"];
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
      {order.map((s) => (
        <Link
          key={s}
          href={`${inboxHref}?sentiment=${s}`}
          aria-label={`Open inbox filtered to ${s} reviews`}
          className="group text-text-secondary hover:bg-secondary/60 hover:text-foreground inline-flex items-center gap-1.5 rounded px-1 py-0.5 text-[12px] font-medium"
        >
          <span
            aria-hidden
            className="size-2 rounded-full"
            style={{ background: SENTIMENT_VAR[s] }}
          />
          <span className="capitalize">{s}</span>
          <span className="num text-foreground font-bold">{totals[s]}</span>
        </Link>
      ))}
    </div>
  );
}

export function SentimentMixChart({ points }: { points: SentimentMonthPoint[] }) {
  return (
    <div className="h-48 w-full">
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <BarChart
          data={points}
          margin={{ top: 8, right: 8, bottom: 0, left: -22 }}
        >
          <CartesianGrid
            stroke="var(--color-border-subtle)"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={{ stroke: "var(--color-border)" }}
          />
          <YAxis
            allowDecimals={false}
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            width={36}
          />
          <Tooltip
            content={<ChartTooltip />}
            cursor={{ fill: "var(--color-surface-muted)" }}
          />
          <Bar
            name="Positive"
            dataKey="positive"
            stackId="mix"
            fill={SENTIMENT_VAR.positive}
            maxBarSize={28}
            isAnimationActive={false}
          />
          <Bar
            name="Neutral"
            dataKey="neutral"
            stackId="mix"
            fill={SENTIMENT_VAR.neutral}
            maxBarSize={28}
            isAnimationActive={false}
          />
          <Bar
            name="Negative"
            dataKey="negative"
            stackId="mix"
            fill={SENTIMENT_VAR.negative}
            maxBarSize={28}
            isAnimationActive={false}
          />
          <Bar
            name="Critical"
            dataKey="critical"
            stackId="mix"
            fill={SENTIMENT_VAR.critical}
            radius={[3, 3, 0, 0]}
            maxBarSize={28}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
