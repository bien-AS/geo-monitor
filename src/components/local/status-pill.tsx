import { AlertTriangle, CheckCircle2, CircleDashed, CircleDot, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LVIBand } from "@/lib/lvi";
import { LVI_BAND_LABEL } from "@/lib/lvi";

export type PillTone = "success" | "warning" | "error" | "neutral" | "info";

const TONE_CLS: Record<PillTone, string> = {
  success: "bg-success-50 text-success-700 dark:bg-success-700/25 dark:text-success-100",
  warning: "bg-warning-50 text-warning-700 dark:bg-warning-700/25 dark:text-warning-100",
  error: "bg-error-50 text-error-700 dark:bg-error-700/25 dark:text-error-100",
  neutral: "bg-secondary text-text-secondary",
  info: "bg-accent text-accent-foreground",
};

const TONE_ICON: Record<PillTone, React.ComponentType<{ className?: string }>> = {
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
  neutral: CircleDashed,
  info: CircleDot,
};

/**
 * Status pill — DESIGN.md badge grammar: every status is color + icon + text,
 * never color alone.
 */
export function StatusPill({
  tone,
  children,
  icon: IconOverride,
  className,
}: {
  tone: PillTone;
  children: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}) {
  const Icon = IconOverride ?? TONE_ICON[tone];
  return (
    <span
      className={cn(
        "eyebrow inline-flex h-5 items-center gap-1 rounded-full px-2",
        TONE_CLS[tone],
        className,
      )}
    >
      <Icon
        className="size-3 shrink-0"
        aria-hidden
      />
      {children}
    </span>
  );
}

const BAND_TONE: Record<LVIBand, PillTone> = {
  elite: "success",
  healthy: "success",
  "at-risk": "warning",
  critical: "error",
};

/** LVI band pill (component-spec thresholds: 80+/60/30). */
export function LVIBandPill({ band, className }: { band: LVIBand; className?: string }) {
  return (
    <StatusPill
      tone={BAND_TONE[band]}
      className={className}
    >
      {LVI_BAND_LABEL[band]}
    </StatusPill>
  );
}
