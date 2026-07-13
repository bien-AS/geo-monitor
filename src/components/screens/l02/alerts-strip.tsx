import Link from "next/link";
import { cn } from "@/lib/utils";
import { Icons } from "@/lib/icons";
import { Card } from "@/components/ui/card";

export type AttentionTone = "error" | "warning" | "info";

export interface AttentionItem {
  href: string;
  tone: AttentionTone;
  label: React.ReactNode;
  ariaLabel: string;
}

const TONE_CLS: Record<AttentionTone, string> = {
  error:
    "border-error-100 bg-error-50 text-error-700 hover:bg-error-100 dark:border-error-700/40 dark:bg-error-700/20 dark:text-error-100 dark:hover:bg-error-700/30",
  warning:
    "border-warning-100 bg-warning-50 text-warning-700 hover:bg-warning-100 dark:border-warning-700/40 dark:bg-warning-700/20 dark:text-warning-100 dark:hover:bg-warning-700/30",
  info: "border-border bg-accent text-accent-foreground hover:bg-primary-50 dark:hover:bg-secondary",
};

const TONE_ICON: Record<AttentionTone, React.ComponentType<{ className?: string }>> = {
  error: Icons.xCircle,
  warning: Icons.alertTriangle,
  info: Icons.info,
};

export function AlertsStrip({ items }: { items: AttentionItem[] }) {
  if (items.length === 0) return null;

  return (
    <Card className="gap-3 p-5">
      <p className="eyebrow text-text-tertiary">
        Needs attention (<span className="num">{items.length}</span>)
      </p>
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => {
          const Icon = TONE_ICON[item.tone];
          return (
            <Link
              key={i}
              href={item.href}
              aria-label={item.ariaLabel}
              className={cn(
                "inline-flex min-h-11 items-center gap-2 rounded-md border px-3 py-2 text-[13px] font-medium transition-colors",
                TONE_CLS[item.tone],
              )}
            >
              <Icon
                className="size-4 shrink-0"
                aria-hidden
              />
              <span>{item.label}</span>
              <Icons.arrowRight
                className="size-3.5 shrink-0"
                aria-hidden
              />
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
