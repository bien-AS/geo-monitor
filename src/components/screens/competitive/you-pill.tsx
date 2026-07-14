import { cn } from "@/lib/utils";

export function YouPill({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "eyebrow bg-primary-700 dark:bg-primary-300 dark:text-primary-900 inline-flex h-4 shrink-0 items-center rounded-full px-1.5 text-[9px] text-white",
        className,
      )}
    >
      YOU
    </span>
  );
}

export const YOU_ROW_CLS =
  "bg-primary-50 border-y border-primary-200 dark:bg-primary-500/15 dark:border-primary-700";

export const YOU_NAME_CLS = "font-bold text-primary-700 dark:text-primary-100";
