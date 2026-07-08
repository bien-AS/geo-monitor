import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Delta pill — healthcare convention (M1 canon): direction ALWAYS pairs with
 * an explicit context label ("vs last 30 days"), and color encodes good/bad —
 * NOT arrow direction (a downward arrow can be green).
 */
export function DeltaPill({
  delta,
  label,
  goodDirection = "up",
  suffix = "",
  className,
}: {
  delta: number;
  /** Explicit context, e.g. "vs last 30 days" — required by design canon */
  label: string;
  goodDirection?: "up" | "down";
  suffix?: string;
  className?: string;
}) {
  const isFlat = delta === 0;
  const isGood = goodDirection === "up" ? delta > 0 : delta < 0;
  const Icon = isFlat ? Minus : delta > 0 ? ArrowUp : ArrowDown;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-medium",
        isFlat
          ? "bg-secondary text-text-secondary"
          : isGood
            ? "bg-success-50 text-success-700 dark:bg-success-700/25 dark:text-success-100"
            : "bg-error-50 text-error-700 dark:bg-error-700/25 dark:text-error-100",
        className,
      )}
    >
      <Icon
        className="size-3 shrink-0"
        aria-hidden
      />
      <span className="num">
        {delta > 0 ? "+" : ""}
        {delta}
        {suffix}
      </span>
      <span className="font-normal text-current/80">{label}</span>
    </span>
  );
}
