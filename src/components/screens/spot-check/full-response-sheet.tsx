import { Icons } from "@/lib/icons";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { StatusPill } from "@/components/local/status-pill";
import { SourceBadge } from "@/components/local/source-badge";
import { SurfacePill } from "@/components/local/surface-pill";
import { CitationChip } from "@/components/screens/spot-check/citation-chip";
import { isBaptistDomain } from "@/components/screens/local-ai/helpers";
import { fmtLatency, type SpotResult } from "@/components/screens/spot-check/spot-check-data";
import { surfaceById } from "@/lib/surfaces";
import { fmtDate, fmtTime } from "@/lib/format";

export function FullResponseSheet({
  surfaceId,
  result,
  prompt,
  onOpenChange,
}: {
  surfaceId: string | null;
  result: SpotResult | undefined;
  prompt: string;
  onOpenChange: (open: boolean) => void;
}) {
  const surface = surfaceId ? surfaceById(surfaceId) : undefined;
  return (
    <Sheet
      open={Boolean(surfaceId && result)}
      onOpenChange={onOpenChange}
    >
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        {surface && result && (
          <>
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <SurfacePill
                  surface={surface}
                  size="md"
                />
                response
              </SheetTitle>
              <SheetDescription>&ldquo;{prompt}&rdquo;</SheetDescription>
            </SheetHeader>
            <div className="flex flex-col gap-4 px-4 pb-6">
              <div className="flex flex-wrap items-center gap-2">
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
                {result.real ? (
                  <SourceBadge source={result.source} />
                ) : (
                  <StatusPill tone="neutral">Simulated</StatusPill>
                )}
              </div>

              <div>
                <p className="eyebrow text-text-tertiary">Full response excerpt</p>
                <p className="border-border-subtle bg-secondary/40 text-text-secondary mt-1.5 rounded-md border p-3 text-[12.5px] leading-relaxed">
                  {result.snippet || "No excerpt captured for this surface."}
                </p>
              </div>

              {result.citedDomains.length > 0 && (
                <div>
                  <p className="eyebrow text-text-tertiary">Cited sources</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {result.citedDomains.map((d) => (
                      <CitationChip
                        key={d}
                        domain={d}
                        us={isBaptistDomain(d)}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 text-[12px]">
                <div className="border-border-subtle rounded-md border p-2.5">
                  <p className="eyebrow text-text-tertiary">Checked</p>
                  <p className="num mt-0.5">
                    {fmtDate(result.checkedAt)} · {fmtTime(result.checkedAt)}
                  </p>
                </div>
                <div className="border-border-subtle rounded-md border p-2.5">
                  <p className="eyebrow text-text-tertiary">Cost · latency</p>
                  <p className="num mt-0.5">
                    ${result.cost.toFixed(3)} · {fmtLatency(result.responseMs)}
                  </p>
                </div>
              </div>

              <div>
                <p className="eyebrow text-text-tertiary">Methodology</p>
                <p className="text-text-tertiary mt-1.5 text-[12px] leading-relaxed">
                  {surface.category === "chatbot"
                    ? "Chatbot surfaces run the prompt through provider response endpoints; the answer text is parsed for Baptist domains and directory citations."
                    : "Google search features fire a geolocated SERP from the target city; the AI Overview / AI Mode block is extracted with its cited sources."}{" "}
                  {result.real
                    ? "This response replays real evidence captured during the fleet bake."
                    : "This response is a deterministic demo-mode simulation — live mode fires a real provider call."}
                </p>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
