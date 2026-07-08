import { cn } from "@/lib/utils";

/**
 * CostPreview — the L-series cost-transparency block (05 §1 translation):
 * 3px slate left border, 11px caps title, JetBrains Mono value, math line.
 * Appears before EVERY spend action (CLAUDE.md law 2). Real math only.
 */
export function CostPreview({
  title = "Estimated cost",
  value,
  math,
  subline,
  perSurface,
  className,
}: {
  title?: string;
  /** Main figure, already formatted (e.g. "588 checks/mo" or "$1.34") */
  value: string;
  /** The math breakdown line (e.g. "49 pins × 3 keywords × 4 refreshes/mo") */
  math: string;
  /** Impact line (e.g. "Fleet total: 11,760 checks/mo across 20 locations") */
  subline?: string;
  /** Optional per-surface row breakdown */
  perSurface?: Array<{ label: string; value: string; color?: string }>;
  className?: string;
}) {
  return (
    <div className={cn("cost-preview-block rounded-r-md p-4", className)}>
      <p className="eyebrow text-text-tertiary">{title}</p>
      <p className="num text-foreground mt-1 text-[17px] font-bold">{value}</p>
      <p className="text-text-tertiary mt-1 text-[12px]">{math}</p>
      {perSurface && perSurface.length > 0 && (
        <div className="border-border-subtle mt-2 grid grid-cols-2 gap-x-4 gap-y-1 border-t pt-2">
          {perSurface.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between gap-2 text-[12px]"
            >
              <span className="text-text-secondary flex items-center gap-1.5">
                {row.color && (
                  <span
                    aria-hidden
                    className="size-2 rounded-full"
                    style={{ background: row.color }}
                  />
                )}
                {row.label}
              </span>
              <span className="num font-semibold">{row.value}</span>
            </div>
          ))}
        </div>
      )}
      {subline && <p className="text-text-secondary mt-2 text-[12px]">{subline}</p>}
    </div>
  );
}
