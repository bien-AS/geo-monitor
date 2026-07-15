import { Icons } from "@/lib/icons";
import { StatusPill } from "@/components/local/status-pill";
import { ResponseCard } from "@/components/screens/spot-check/response-card";
import { CitationSummaryCard } from "@/components/screens/spot-check/citation-summary-card";
import type { SpotResult } from "@/components/screens/spot-check/spot-check-data";
import { CHATBOT_SURFACES, SEARCH_FEATURE_SURFACES } from "@/lib/surfaces";
import { fmtTime } from "@/lib/format";

export function ResponseSection({
  prompt,
  startedAt,
  matchedName,
  surfaceIds,
  results,
  summaryDomain,
  briefHref,
  onRerunWithAIMode,
  onOpenFull,
}: {
  prompt: string;
  startedAt: string;
  matchedName: string | null;
  surfaceIds: string[];
  results: Record<string, SpotResult>;
  summaryDomain: string;
  briefHref: string;
  onRerunWithAIMode: () => void;
  onOpenFull: (surfaceId: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold">
          Surface responses for <span className="num text-[14px]">&ldquo;{prompt}&rdquo;</span>
        </h2>
        <div className="flex items-center gap-2">
          <StatusPill
            tone="success"
            icon={Icons.checkCircle}
          >
            Completed
          </StatusPill>
          <span className="num text-text-tertiary text-[11.5px]">{fmtTime(startedAt)}</span>
        </div>
      </div>
      {matchedName ? (
        <p className="text-text-tertiary -mt-2 text-[12px]">
          City + prompt matched the{" "}
          <span className="text-text-secondary font-medium">{matchedName}</span> bake — surfaces
          with baked evidence replay the real responses.
        </p>
      ) : (
        <p className="text-text-tertiary -mt-2 text-[12px]">
          No baked evidence for this city + prompt — responses below are deterministic demo-mode
          simulations.
        </p>
      )}

      <div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CHATBOT_SURFACES.map((s) => (
            <ResponseCard
              key={s.id}
              surface={s}
              result={results[s.id]}
              aiModeOff={false}
              onRerunWithAIMode={onRerunWithAIMode}
              onOpenFull={onOpenFull}
            />
          ))}
        </div>
        <div
          aria-hidden
          className="h-3"
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {SEARCH_FEATURE_SURFACES.map((s) => (
            <ResponseCard
              key={s.id}
              surface={s}
              result={results[s.id]}
              aiModeOff={s.id === "ai-mode" && !surfaceIds.includes("ai-mode")}
              onRerunWithAIMode={onRerunWithAIMode}
              onOpenFull={onOpenFull}
            />
          ))}
        </div>
      </div>

      <CitationSummaryCard
        domain={summaryDomain}
        results={results}
        selectedIds={new Set(surfaceIds)}
        briefHref={briefHref}
      />
    </div>
  );
}
