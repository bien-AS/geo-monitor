"use client";

import * as React from "react";
import { gsap } from "gsap";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusPill } from "@/components/local/status-pill";
import { drawIn, sweepDash, useGsapReveal } from "@/components/local/use-gsap-reveal";
import { fmtInt, fmtPct } from "@/lib/format";
import {
  buildGbpPerformance,
  type GbpPerfLocationInput,
  type GbpPerfMonthPoint,
} from "@/lib/gbp-performance";

const CHART_W = 640;
const CHART_H = 180;
const PAD = { top: 12, right: 16, bottom: 24, left: 40 };

function niceCeil(v: number): number {
  if (v <= 10) return 10;
  const mag = 10 ** Math.floor(Math.log10(v));
  const step = mag / 2;
  return Math.ceil(v / step) * step;
}

function TrendChart({
  values,
  labels,
  ariaLabel,
}: {
  values: number[];
  labels: string[];
  ariaLabel: string;
}) {
  const svgRef = React.useRef<SVGSVGElement>(null);
  const lineRef = React.useRef<SVGPathElement>(null);
  const areaRef = React.useRef<SVGPathElement>(null);

  useGsapReveal(svgRef, () => {
    drawIn(lineRef.current, { duration: 1, ease: "power2.out" });
    if (areaRef.current)
      gsap.from(areaRef.current, {
        opacity: 0,
        duration: 0.6,
        delay: 0.55,
        ease: "power2.out",
      });
    gsap.from("circle", {
      scale: 0,
      transformOrigin: "50% 50%",
      duration: 0.6,
      delay: 0.35,
      stagger: 0.05,
      ease: "power3.out",
    });
  });

  const innerW = CHART_W - PAD.left - PAD.right;
  const innerH = CHART_H - PAD.top - PAD.bottom;
  const yMax = niceCeil(Math.max(...values, 1));
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(yMax * f));

  const pts = values.map((v, i) => {
    const x = PAD.left + (i * innerW) / (values.length - 1);
    const y = PAD.top + innerH - (v / yMax) * innerH;
    return [Number(x.toFixed(2)), Number(y.toFixed(2))] as const;
  });
  const line = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
  const area = `${line} L${pts[pts.length - 1][0]},${PAD.top + innerH} L${pts[0][0]},${PAD.top + innerH} Z`;

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${CHART_W} ${CHART_H}`}
      role="img"
      aria-label={ariaLabel}
      className="w-full"
    >
      {ticks.map((t) => {
        const y = PAD.top + innerH - (t / yMax) * innerH;
        return (
          <g key={t}>
            <line
              x1={PAD.left}
              x2={CHART_W - PAD.right}
              y1={y}
              y2={y}
              stroke="var(--border)"
              strokeWidth={1}
            />
            <text
              x={PAD.left - 8}
              y={y + 3}
              textAnchor="end"
              className="fill-muted-foreground"
              style={{ fontSize: 10, fontFamily: "var(--font-mono)" }}
            >
              {fmtInt(t)}
            </text>
          </g>
        );
      })}
      <path
        ref={areaRef}
        d={area}
        fill="var(--color-primary)"
        fillOpacity={0.08}
      />
      <path
        ref={lineRef}
        d={line}
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {pts.map(([x, y], i) => (
        <circle
          key={labels[i]}
          cx={x}
          cy={y}
          r={3.5}
          fill="var(--card)"
          stroke="var(--color-primary)"
          strokeWidth={2}
        />
      ))}
      {pts.map(([x], i) => (
        <text
          key={labels[i]}
          x={x}
          y={CHART_H - 6}
          textAnchor={i === 0 ? "start" : i === pts.length - 1 ? "end" : "middle"}
          className="fill-muted-foreground"
          style={{ fontSize: 10, fontFamily: "var(--font-mono)" }}
        >
          {labels[i]}
        </text>
      ))}
    </svg>
  );
}

const DONUT_R = 40;
const DONUT_C = 2 * Math.PI * DONUT_R;

const SPLIT_META = [
  { key: "searchMobile", label: "Google Search \u2014 mobile", color: "var(--color-primary)" },
  {
    key: "searchDesktop",
    label: "Google Search \u2014 desktop",
    color: "var(--color-success-500)",
  },
  { key: "mapsMobile", label: "Google Maps \u2014 mobile", color: "var(--color-warning-500)" },
  { key: "mapsDesktop", label: "Google Maps \u2014 desktop", color: "var(--color-error-400)" },
] as const;

function PlatformDonut({
  counts,
  total,
}: {
  counts: Record<(typeof SPLIT_META)[number]["key"], number>;
  total: number;
}) {
  const svgRef = React.useRef<SVGSVGElement>(null);

  useGsapReveal(svgRef, () => {
    svgRef.current?.querySelectorAll("circle").forEach((seg, i) => {
      const len = Number.parseFloat(seg.getAttribute("stroke-dasharray") ?? "");
      if (Number.isFinite(len))
        sweepDash(seg, len, DONUT_C, {
          duration: 0.8,
          delay: 0.1 + i * 0.12,
          ease: "power2.out",
        });
    });
  });

  const segments = SPLIT_META.map(({ key, color }, i) => {
    const frac = total > 0 ? counts[key] / total : 0;
    const len = Number((frac * DONUT_C).toFixed(3));
    const priorSum = SPLIT_META.slice(0, i).reduce(
      (s, { key: k }) => (total > 0 ? s + (counts[k] / total) * DONUT_C : s),
      0,
    );
    return { key, color, len, offset: Number(priorSum.toFixed(3)) };
  });
  return (
    <svg
      ref={svgRef}
      viewBox="0 0 100 100"
      role="img"
      aria-label="Platform and device breakdown of profile views"
      className="size-28 shrink-0"
    >
      {segments.map(({ key, color, len, offset }) => (
        <circle
          key={key}
          cx={50}
          cy={50}
          r={DONUT_R}
          fill="none"
          stroke={color}
          strokeWidth={12}
          strokeDasharray={`${len} ${Number((DONUT_C - len).toFixed(3))}`}
          strokeDashoffset={Number((-offset).toFixed(3))}
          transform="rotate(-90 50 50)"
        />
      ))}
    </svg>
  );
}

function MetricBlock({
  total,
  label,
  values,
  labels,
}: {
  total: number;
  label: string;
  values: number[];
  labels: string[];
}) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="num text-[26px] leading-tight font-semibold">{fmtInt(total)}</p>
        <p className="text-muted-foreground text-[12px]">{label}</p>
      </div>
      <TrendChart
        values={values}
        labels={labels}
        ariaLabel={`${label} monthly trend`}
      />
    </div>
  );
}

const METRIC_TABS: Array<{
  value: string;
  trigger: string;
  label: string;
  pick: (m: GbpPerfMonthPoint) => number;
  totalKey: "calls" | "direction_requests" | "website_clicks" | "bookings";
}> = [
  {
    value: "directions",
    trigger: "Directions",
    label: "Direction requests \u00b7 6 months",
    pick: (m) => m.direction_requests,
    totalKey: "direction_requests",
  },
  {
    value: "website",
    trigger: "Website clicks",
    label: "Website clicks \u00b7 6 months",
    pick: (m) => m.website_clicks,
    totalKey: "website_clicks",
  },
];

export function PerformancePanel({
  location,
  keywordSeeds,
}: {
  location: GbpPerfLocationInput;
  keywordSeeds: string[];
}) {
  const perf = React.useMemo(
    () => buildGbpPerformance(location, keywordSeeds),
    [location, keywordSeeds],
  );
  const monthLabels = perf.months.map((m) => m.month);

  return (
    <Card className="gap-4 p-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-[15px] font-semibold">GBP Performance</h2>
          <p className="text-muted-foreground text-[12px]">
            Feeds from the Google Business Profile Performance API once the profile connection goes
            live.
          </p>
        </div>
        <StatusPill
          tone="neutral"
          className="num"
        >
          {perf.windowLabel}
        </StatusPill>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {METRIC_TABS.map((t) => (
            <TabsTrigger
              key={t.value}
              value={t.value}
            >
              {t.trigger}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent
          value="overview"
          className="mt-2 flex flex-col gap-5"
        >
          <MetricBlock
            total={perf.totals.interactions}
            label="Business Profile interactions \u00b7 6 months"
            values={perf.months.map((m) => m.interactions)}
            labels={monthLabels}
          />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="border-border flex flex-col gap-3 rounded-lg border p-4">
              <div>
                <h3 className="text-[13px] font-semibold">How people discovered you</h3>
                <p className="text-muted-foreground text-[12px]">
                  Platform and devices used to find this profile
                </p>
              </div>
              <div>
                <p className="num text-[20px] leading-tight font-semibold">
                  {fmtInt(perf.profileViews)}
                </p>
                <p className="text-muted-foreground text-[12px]">
                  People viewed the Business Profile
                </p>
              </div>
              <div className="flex items-center gap-4">
                <PlatformDonut
                  counts={perf.platformSplit}
                  total={perf.profileViews}
                />
                <ul className="flex min-w-0 flex-1 flex-col gap-1.5">
                  {SPLIT_META.map(({ key, label, color }) => {
                    const count = perf.platformSplit[key];
                    const pct = perf.profileViews > 0 ? (count / perf.profileViews) * 100 : 0;
                    return (
                      <li
                        key={key}
                        className="flex items-center gap-2 text-[12px]"
                      >
                        <span
                          aria-hidden
                          className="size-2 shrink-0 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                        <span className="num">{fmtInt(count)}</span>
                        <span className="num text-muted-foreground">{fmtPct(pct)}</span>
                        <span className="text-muted-foreground truncate">{label}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            <div className="border-border flex flex-col gap-3 rounded-lg border p-4">
              <div>
                <h3 className="text-[13px] font-semibold">Searches breakdown</h3>
                <p className="text-muted-foreground text-[12px]">
                  Search terms that surfaced this Business Profile
                </p>
              </div>
              <ol className="flex flex-col">
                {perf.topSearchTerms.map(({ term, count }, i) => (
                  <li
                    key={term}
                    className="flex items-center gap-3 border-b py-1.5 text-[13px] last:border-0"
                  >
                    <span className="num text-muted-foreground w-5 shrink-0">{i + 1}.</span>
                    <span className="min-w-0 flex-1 truncate">{term}</span>
                    <span className="num shrink-0 text-right">{fmtInt(count)}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </TabsContent>

        {METRIC_TABS.map((t) => (
          <TabsContent
            key={t.value}
            value={t.value}
            className="mt-2"
          >
            <MetricBlock
              total={perf.totals[t.totalKey]}
              label={t.label}
              values={perf.months.map(t.pick)}
              labels={monthLabels}
            />
          </TabsContent>
        ))}
      </Tabs>
    </Card>
  );
}
