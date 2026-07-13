import { Icons } from "@/lib/icons";
import { cn } from "@/lib/utils";

/** Graceful no-token placeholder. */
export function MapFallback({
  label = "Map preview",
  detail = "Add NEXT_PUBLIC_MAPBOX_TOKEN to render live Mapbox tiles.",
  className,
}: {
  label?: string;
  detail?: string;
  className?: string;
}) {
  return (
    <div
      role="img"
      aria-label={`${label} unavailable — Mapbox token not configured`}
      className={cn(
        "border-border-emphasis bg-secondary/40 relative flex h-full min-h-48 w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-md border border-dashed",
        className,
      )}
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.35]"
      >
        <div
          className="size-full"
          style={{
            backgroundImage:
              "linear-gradient(var(--color-neutral-200) 1px, transparent 1px), linear-gradient(90deg, var(--color-neutral-200) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>
      <Icons.mapPinOff className="text-text-tertiary relative size-5" />
      <p className="text-text-secondary relative text-[13px] font-medium">{label}</p>
      <p className="text-text-tertiary relative max-w-xs text-center text-[12px]">{detail}</p>
    </div>
  );
}
