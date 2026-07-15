import { cn } from "@/lib/utils";

export function CitationChip({ domain, us }: { domain: string; us: boolean }) {
  return (
    <span
      className={cn(
        "num inline-flex h-6 items-center gap-1 rounded px-1.5 text-[11px] font-semibold",
        us
          ? "bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-100"
          : "bg-secondary text-text-secondary",
      )}
    >
      {us && (
        <span className="eyebrow bg-primary-500 rounded-sm px-1 text-[9px] leading-4 text-white">
          US
        </span>
      )}
      {domain}
    </span>
  );
}
