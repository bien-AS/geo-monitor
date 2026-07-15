import { Icons } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { SurfacePill } from "@/components/local/surface-pill";
import { fmtLatency, type SpotResult } from "@/components/screens/spot-check/spot-check-data";
import type { AISurface } from "@/lib/surfaces";

export type SurfacePhase = "pending" | "querying" | "done";

export function ProgressMiniCard({
  surface,
  selected,
  phase,
  result,
}: {
  surface: AISurface;
  selected: boolean;
  phase: SurfacePhase | undefined;
  result: SpotResult | undefined;
}) {
  return (
    <div
      className={cn(
        "border-border-subtle flex items-center gap-2.5 rounded-lg border p-2.5",
        !selected && "opacity-45",
      )}
    >
      <SurfacePill
        surface={surface}
        size="sm"
        showName={false}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[12.5px] font-semibold">{surface.name}</p>
        {!selected ? (
          <p className="text-text-disabled text-[11px]">Not selected</p>
        ) : phase === "done" && result ? (
          <p className="text-success-700 dark:text-success-100 flex items-center gap-1 text-[11px]">
            <Icons.checkCircle className="size-3 shrink-0" /> Response ·{" "}
            <span className="num">{fmtLatency(result.responseMs)}</span>
          </p>
        ) : phase === "querying" ? (
          <p className="text-primary-600 dark:text-primary-300 flex items-center gap-1 text-[11px]">
            <Icons.circleDashed className="size-3 shrink-0 animate-spin" /> Querying surface…
          </p>
        ) : (
          <p className="text-text-tertiary flex items-center gap-1 text-[11px]">
            <Icons.circleDashed className="size-3 shrink-0" /> Queued…
          </p>
        )}
      </div>
    </div>
  );
}
