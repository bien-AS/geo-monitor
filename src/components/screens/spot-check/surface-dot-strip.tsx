import { cn } from "@/lib/utils";
import { CHATBOT_SURFACES, SEARCH_FEATURE_SURFACES, type AISurface } from "@/lib/surfaces";
import type { DotStatus } from "@/components/screens/spot-check/spot-check-data";

const DOT_CLS: Record<DotStatus, string> = {
  us: "bg-success-500 border-success-500",
  partial: "bg-warning-500 border-warning-500",
  competitor: "border-error-500 bg-transparent",
  notrun: "border-border bg-secondary",
};

const DOT_LABEL: Record<DotStatus, string> = {
  us: "Baptist cited",
  partial: "partial (via directory)",
  competitor: "competitor-only",
  notrun: "not run",
};

export function SurfaceDotStrip({
  statuses,
  size = 8,
  className,
}: {
  statuses: Record<string, DotStatus>;
  size?: number;
  className?: string;
}) {
  const dot = (s: AISurface) => (
    <span
      key={s.id}
      title={`${s.name}: ${DOT_LABEL[statuses[s.id] ?? "notrun"]}`}
      className={cn("rounded-full border", DOT_CLS[statuses[s.id] ?? "notrun"])}
      style={{ width: size, height: size, borderWidth: 1.5 }}
    />
  );
  return (
    <span
      className={cn("inline-flex items-center gap-1.5", className)}
      aria-hidden
    >
      {CHATBOT_SURFACES.map(dot)}
      <span className="w-3" />
      {SEARCH_FEATURE_SURFACES.map(dot)}
    </span>
  );
}
