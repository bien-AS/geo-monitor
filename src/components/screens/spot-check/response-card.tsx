import { Icons } from "@/lib/icons";
import { StatusPill } from "@/components/local/status-pill";
import { SourceBadge } from "@/components/local/source-badge";
import { SurfacePill } from "@/components/local/surface-pill";
import { CitationChip } from "@/components/screens/spot-check/citation-chip";
import { isBaptistDomain } from "@/components/screens/local-ai/helpers";
import { fmtLatency, type SpotResult } from "@/components/screens/spot-check/spot-check-data";
import type { AISurface } from "@/lib/surfaces";

export function ResponseCard({
  surface,
  result,
  aiModeOff,
  onRerunWithAIMode,
  onOpenFull,
}: {
  surface: AISurface;
  result: SpotResult | undefined;
  aiModeOff: boolean;
  onRerunWithAIMode: () => void;
  onOpenFull: (surfaceId: string) => void;
}) {
  if (!result) {
    return (
      <div
        className="border-border-subtle bg-card/50 flex flex-col gap-2 rounded-lg border border-t-[3px] p-4 opacity-70"
        style={{ borderTopColor: surface.color }}
      >
        <div className="flex items-center justify-between gap-2">
          <SurfacePill
            surface={surface}
            size="md"
          />
          <StatusPill tone="neutral">Not run</StatusPill>
        </div>
        <p className="text-text-tertiary text-[12px] leading-relaxed">
          {surface.name} was not selected for this spot check.
        </p>
        {aiModeOff && (
          <button
            type="button"
            onClick={onRerunWithAIMode}
            className="text-primary inline-flex items-center gap-1 text-left text-[12px] font-semibold hover:underline"
          >
            Re-run with AI Mode <Icons.arrowRight className="size-3" />
            <span className="num text-text-tertiary font-normal">
              (+${surface.cost.toFixed(3)})
            </span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className="border-border bg-card flex flex-col gap-2.5 rounded-lg border border-t-[3px] p-4"
      style={{ borderTopColor: surface.color }}
    >
      <div className="flex items-center justify-between gap-2">
        <SurfacePill
          surface={surface}
          size="md"
        />
        {result.cited === true ? (
          <StatusPill
            tone="success"
            icon={Icons.checkCircle}
          >
            Cited
          </StatusPill>
        ) : result.cited === "partial" ? (
          <StatusPill tone="warning">Partial</StatusPill>
        ) : (
          <StatusPill
            tone="error"
            icon={Icons.xCircle}
          >
            Not cited
          </StatusPill>
        )}
      </div>

      <div>
        <p className="eyebrow text-text-tertiary">Response excerpt</p>
        <p className="text-text-secondary mt-1 line-clamp-6 text-[12px] leading-relaxed">
          {result.snippet || "No excerpt captured for this surface."}
        </p>
      </div>

      {result.citedDomains.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="eyebrow text-text-tertiary">Cited:</span>
          {result.citedDomains.map((d) => (
            <CitationChip
              key={d}
              domain={d}
              us={isBaptistDomain(d)}
            />
          ))}
        </div>
      )}

      <div className="border-border-subtle mt-auto flex items-center justify-between gap-2 border-t pt-2">
        <button
          type="button"
          onClick={() => onOpenFull(surface.id)}
          className="text-primary inline-flex items-center gap-1 text-[12px] font-semibold hover:underline"
        >
          View full response <Icons.arrowRight className="size-3" />
        </button>
        <span className="flex items-center gap-1.5">
          {result.real ? (
            <SourceBadge source={result.source} />
          ) : (
            <span className="eyebrow text-text-disabled">Simulated</span>
          )}
          <span className="num text-text-tertiary text-[11px]">
            {fmtLatency(result.responseMs)}
          </span>
        </span>
      </div>
    </div>
  );
}
