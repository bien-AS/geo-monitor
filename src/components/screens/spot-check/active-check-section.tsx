import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/local/status-pill";
import {
  ProgressMiniCard,
  type SurfacePhase,
} from "@/components/screens/spot-check/progress-mini-card";
import type { SpotResult } from "@/components/screens/spot-check/spot-check-data";
import { CHATBOT_SURFACES, SEARCH_FEATURE_SURFACES } from "@/lib/surfaces";
import { fmtTime } from "@/lib/format";

function fmtElapsed(sec: number): string {
  return `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;
}

export function ActiveCheckSection({
  checkId,
  startedAt,
  elapsed,
  surfaceIds,
  surfacePhases,
  results,
}: {
  checkId: string;
  startedAt: string;
  elapsed: number;
  surfaceIds: string[];
  surfacePhases: Record<string, SurfacePhase>;
  results: Record<string, SpotResult>;
}) {
  return (
    <Card className="gap-4 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <StatusPill
            tone="info"
            className="animate-pulse"
          >
            Running
          </StatusPill>
          <span className="text-[13.5px] font-semibold">
            Spot check <span className="num">{checkId}</span>
          </span>
          <span className="num text-text-tertiary text-[12px]">started {fmtTime(startedAt)}</span>
        </div>
        <span className="num text-[14px] font-bold">{fmtElapsed(elapsed)}</span>
      </div>
      <div>
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {CHATBOT_SURFACES.map((s) => (
            <ProgressMiniCard
              key={s.id}
              surface={s}
              selected={surfaceIds.includes(s.id)}
              phase={surfacePhases[s.id]}
              result={results[s.id]}
            />
          ))}
        </div>
        <div
          aria-hidden
          className="h-3"
        />
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {SEARCH_FEATURE_SURFACES.map((s) => (
            <ProgressMiniCard
              key={s.id}
              surface={s}
              selected={surfaceIds.includes(s.id)}
              phase={surfacePhases[s.id]}
              result={results[s.id]}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}
