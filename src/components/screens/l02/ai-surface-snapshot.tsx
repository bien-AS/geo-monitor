import Link from "next/link";
import { Icons } from "@/lib/icons";
import { Card } from "@/components/ui/card";
import { SourceBadge } from "@/components/local/source-badge";
import { SurfacePill } from "@/components/local/surface-pill";
import { CHATBOT_SURFACES, SEARCH_FEATURE_SURFACES, type AISurface } from "@/lib/surfaces";
import { fmtPct } from "@/lib/format";
import type { DataSource } from "@/lib/data/types";

export interface SurfaceStat {
  cited: number;
  partial: number;
  total: number;
}

function Tile({ surface, stat }: { surface: AISurface; stat: SurfaceStat | undefined }) {
  const pct = stat && stat.total > 0 ? Math.round((stat.cited / stat.total) * 100) : null;
  return (
    <div className="border-border flex flex-col gap-2 rounded-md border p-3">
      <SurfacePill
        surface={surface}
        size="sm"
      />
      <p className="num text-primary-800 dark:text-foreground text-[22px] leading-none font-bold">
        {pct == null ? "—" : fmtPct(pct)}
      </p>
      <p className="text-text-tertiary text-[11px]">
        {stat && stat.total > 0 ? (
          <>
            <span className="num">
              {stat.cited}/{stat.total}
            </span>{" "}
            prompts cited
            {stat.partial > 0 ? (
              <>
                {" "}
                · <span className="num">{stat.partial}</span> partial
              </>
            ) : null}
          </>
        ) : (
          "No checks yet"
        )}
      </p>
    </div>
  );
}

function groupTotals(surfaces: readonly AISurface[], stats: Record<string, SurfaceStat>) {
  return surfaces.reduce(
    (acc, s) => {
      const st = stats[s.id];
      if (st) {
        acc.cited += st.cited;
        acc.total += st.total;
      }
      return acc;
    },
    { cited: 0, total: 0 },
  );
}

export function AISurfaceSnapshot({
  slug,
  stats,
  source,
}: {
  slug: string;
  stats: Record<string, SurfaceStat>;
  source: DataSource;
}) {
  const chatbot = groupTotals(CHATBOT_SURFACES, stats);
  const google = groupTotals(SEARCH_FEATURE_SURFACES, stats);

  return (
    <Card className="gap-5 p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold">AI surface snapshot</h2>
          <p className="text-text-tertiary text-[13px]">
            Where this location is cited across the{" "}
            <span className="num">{CHATBOT_SURFACES.length}</span> chatbot and{" "}
            <span className="num">{SEARCH_FEATURE_SURFACES.length}</span> Google search AI surfaces
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SourceBadge source={source} />
          <Link
            href={`/locations/${slug}/local-ai`}
            className="text-text-link text-[13px] font-medium hover:underline"
          >
            Open Local AI →
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-stretch">
        <div className="min-w-0 flex-[2]">
          <p className="eyebrow text-text-tertiary">
            Chatbots · <span className="num">{CHATBOT_SURFACES.length}</span>
          </p>
          <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {CHATBOT_SURFACES.map((s) => (
              <Tile
                key={s.id}
                surface={s}
                stat={stats[s.id]}
              />
            ))}
          </div>
          <p className="text-text-secondary mt-2 text-[12px]">
            Cited on{" "}
            <span className="num font-semibold">
              {chatbot.cited}/{chatbot.total}
            </span>{" "}
            chatbot checks
          </p>
        </div>

        <div
          aria-hidden
          className="hidden w-3 justify-center md:flex"
        >
          <div className="bg-border w-px" />
        </div>
        <div
          aria-hidden
          className="flex h-3 items-center md:hidden"
        >
          <div className="bg-border h-px w-full" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="eyebrow text-text-tertiary">
            Google search AI · <span className="num">{SEARCH_FEATURE_SURFACES.length}</span>
          </p>
          <div className="mt-2 grid grid-cols-2 gap-3">
            {SEARCH_FEATURE_SURFACES.map((s) => (
              <Tile
                key={s.id}
                surface={s}
                stat={stats[s.id]}
              />
            ))}
          </div>
          <p className="text-text-secondary mt-2 text-[12px]">
            Cited on{" "}
            <span className="num font-semibold">
              {google.cited}/{google.total}
            </span>{" "}
            Google-AI checks
          </p>
        </div>
      </div>
    </Card>
  );
}
