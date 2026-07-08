import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * PHI container — DESIGN.md healthcare pattern. Wraps ANY region rendering
 * raw review text or other potentially-regulated patient content (CLAUDE.md
 * law 3). Screen readers announce the region before reading content.
 */
export function PHIContainer({
  children,
  className,
  label = "Patient-generated content — handle as potentially containing PHI",
}: {
  children: React.ReactNode;
  className?: string;
  label?: string;
}) {
  return (
    <div
      role="region"
      aria-label="Protected health information"
      className={cn("phi-container relative rounded-r-md px-4 py-3", className)}
    >
      <span className="bg-phi-accent/15 text-phi-accent float-right ml-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-[0.05em] uppercase">
        <Lock
          className="size-2.5"
          aria-hidden
        />
        PHI
      </span>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}
