import Link from "next/link";
import { Icons } from "@/lib/icons";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/local/status-pill";
import { SurfaceDotStrip } from "@/components/screens/spot-check/surface-dot-strip";
import { isBaptistDomain } from "@/components/screens/local-ai/helpers";
import {
  dotStatusFor,
  type DotStatus,
  type SpotResult,
} from "@/components/screens/spot-check/spot-check-data";
import { SURFACES } from "@/lib/surfaces";

export function CitationSummaryCard({
  domain,
  results,
  selectedIds,
  briefHref,
}: {
  domain: string;
  results: Record<string, SpotResult>;
  selectedIds: Set<string>;
  briefHref: string;
}) {
  const queried = SURFACES.filter((s) => selectedIds.has(s.id));
  const citedCount = queried.filter((s) => results[s.id]?.cited === true).length;
  const partialCount = queried.filter((s) => results[s.id]?.cited === "partial").length;
  const pct = queried.length ? Math.round((citedCount / queried.length) * 100) : 0;

  const strength =
    pct >= 50
      ? ({ tone: "success", label: "Strong" } as const)
      : citedCount > 0 || partialCount > 0
        ? ({ tone: "warning", label: "Building" } as const)
        : ({ tone: "error", label: "Absent" } as const);

  const statuses: Record<string, DotStatus> = Object.fromEntries(
    SURFACES.map((s) => [s.id, dotStatusFor(results[s.id])]),
  );

  const counts = new Map<string, number>();
  for (const s of queried) {
    for (const d of results[s.id]?.citedDomains ?? []) {
      if (!isBaptistDomain(d)) counts.set(d, (counts.get(d) ?? 0) + 1);
    }
  }
  const topCoCited = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);

  return (
    <Card className="border-l-primary-500 gap-4 border-l-[3px] p-5 sm:flex-row sm:items-start sm:justify-between">
      <div className="sm:max-w-[40%]">
        <p className="eyebrow text-text-tertiary">Citation summary</p>
        <p className="mt-1 text-[15px] leading-snug font-semibold">
          <span className="num">{domain}</span> cited in <span className="num">{citedCount}</span>{" "}
          of <span className="num">{queried.length}</span> surfaces queried
        </p>
        <p className="text-text-secondary mt-1.5 flex flex-wrap items-center gap-2 text-[13px]">
          <span className="num font-semibold">{pct}%</span> citation rate
          {partialCount > 0 && (
            <span className="text-text-tertiary">
              · <span className="num">{partialCount}</span> partial
            </span>
          )}
          <StatusPill tone={strength.tone}>{strength.label}</StatusPill>
        </p>
      </div>

      <div className="flex flex-col items-start gap-1.5 sm:items-center">
        <p className="eyebrow text-text-tertiary">Surfaces</p>
        <SurfaceDotStrip
          statuses={statuses}
          size={14}
        />
        <p className="text-text-disabled text-[11px]">
          lit = Baptist cited · outline = competitor-only · dim = not run
        </p>
      </div>

      <div className="sm:max-w-[30%]">
        <p className="eyebrow text-text-tertiary">Top co-cited domains</p>
        {topCoCited.length > 0 ? (
          <ol className="mt-1 flex flex-col gap-0.5">
            {topCoCited.map(([d, n], i) => (
              <li
                key={d}
                className="num text-text-secondary text-[11.5px] font-semibold"
              >
                {i + 1}. {d}{" "}
                <span className="text-text-tertiary font-normal">
                  ({n} of {queried.length})
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-text-tertiary mt-1 text-[12px]">No co-cited domains captured.</p>
        )}
        <Link
          href={briefHref}
          className="text-primary mt-2 inline-flex items-center gap-1 text-[12px] font-semibold hover:underline"
        >
          Create a content brief for this prompt <Icons.arrowRight className="size-3" />
        </Link>
      </div>
    </Card>
  );
}
