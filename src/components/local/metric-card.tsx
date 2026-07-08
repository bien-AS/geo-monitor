import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Sparkline } from "./sparkline";
import { DeltaPill } from "./delta-pill";

/**
 * MetricCard (M1 pattern: eyebrow / hero number / context-delta / sparkline).
 * Hero numerals are JetBrains Mono Bold in deep navy (band color optional).
 */
export function MetricCard({
  eyebrow,
  value,
  valueSuffix,
  valueColor,
  secondary,
  delta,
  deltaLabel,
  deltaGoodDirection = "up",
  deltaSuffix,
  spark,
  sparkStroke,
  accent = false,
  pill,
  className,
}: {
  eyebrow: string;
  value: string | number;
  valueSuffix?: string;
  valueColor?: string;
  secondary?: React.ReactNode;
  delta?: number;
  deltaLabel?: string;
  deltaGoodDirection?: "up" | "down";
  deltaSuffix?: string;
  spark?: number[];
  sparkStroke?: string;
  /** Hero KPI variant: 3px primary left accent */
  accent?: boolean;
  /** Optional top-right pill (e.g. LVI band) */
  pill?: React.ReactNode;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "relative gap-3 overflow-hidden p-5",
        accent && "border-l-primary-500 border-l-[3px]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="eyebrow text-text-tertiary">{eyebrow}</p>
        {pill}
      </div>
      <div>
        <p
          className="num text-primary-800 dark:text-foreground text-[34px] leading-none font-bold tracking-tight"
          style={valueColor ? { color: valueColor } : undefined}
        >
          {value}
          {valueSuffix ? (
            <span className="text-text-tertiary text-[20px] font-medium">{valueSuffix}</span>
          ) : null}
        </p>
        {secondary ? (
          <div className="text-text-secondary mt-1.5 text-[13px]">{secondary}</div>
        ) : null}
      </div>
      {typeof delta === "number" && deltaLabel ? (
        <div>
          <DeltaPill
            delta={delta}
            label={deltaLabel}
            goodDirection={deltaGoodDirection}
            suffix={deltaSuffix}
          />
        </div>
      ) : null}
      {spark && spark.length > 1 ? (
        <Sparkline
          data={spark}
          height={56}
          stroke={sparkStroke}
        />
      ) : null}
    </Card>
  );
}
