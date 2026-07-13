import Link from "next/link";
import { Card } from "@/components/ui/card";
import { CHATBOT_SURFACES, SEARCH_FEATURE_SURFACES, type AISurface } from "@/lib/surfaces";
import { fmtCostPerCall } from "@/lib/format";
import type { L01SurfaceStat } from "./types";

function SurfaceRow({ surface, stat }: { surface: AISurface; stat?: L01SurfaceStat }) {
  const pct = stat ? Math.round(stat.pct) : 0;
  return (
    <div
      className="grid items-center gap-3"
      style={{ gridTemplateColumns: "auto minmax(0,1fr) auto" }}
      role="group"
      aria-label={`${surface.name}: cited on ${pct}% of local-intent checks`}
    >
      <span className="flex w-[118px] min-w-0 items-center gap-2">
        <span
          aria-hidden
          className="flex h-4 shrink-0 items-center rounded-full px-1.5 font-mono text-[9px] font-bold text-white"
          style={{ background: surface.color }}
        >
          {surface.glyph}
        </span>
        <span className="min-w-0">
          <span className="text-foreground block truncate text-[12.5px] font-medium">
            {surface.name}
          </span>
          <span className="num text-text-tertiary block text-[10.5px] leading-tight">
            {fmtCostPerCall(surface.cost)}/call
          </span>
        </span>
      </span>
      <span
        aria-hidden
        className="bg-secondary h-1.5 overflow-hidden rounded-full"
      >
        <span
          className="block h-full rounded-full"
          style={{
            width: `${Math.min(pct, 100)}%`,
            background: surface.color,
          }}
        />
      </span>
      <span className="num text-foreground w-10 text-right text-[13px] font-bold">{pct}%</span>
    </div>
  );
}

function GroupHeader({ label, pct }: { label: string; pct: number }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <p className="eyebrow text-text-tertiary">{label}</p>
      <p className="num text-primary-800 dark:text-foreground text-[17px] font-bold">{pct}%</p>
    </div>
  );
}

export function AISnapshotCard({
  stats,
  chatbotPct,
  googlePct,
  detailHref,
  totalChecks,
}: {
  stats: L01SurfaceStat[];
  chatbotPct: number;
  googlePct: number;
  detailHref: string;
  totalChecks: number;
}) {
  const byId = new Map(stats.map((s) => [s.id, s]));

  return (
    <Card className="gap-4 rounded-lg p-6 xl:col-span-5">
      <div>
        <h2 className="text-foreground text-lg font-semibold">AI visibility</h2>
        <p className="text-text-tertiary text-[13px]">
          Share of <span className="num">{totalChecks}</span> local-intent checks citing a Baptist
          location · this cycle
        </p>
      </div>

      <div className="flex flex-1 flex-col">
        <GroupHeader
          label="Chatbots"
          pct={chatbotPct}
        />
        <div className="mt-2.5 flex flex-col gap-2.5">
          {CHATBOT_SURFACES.map((s) => (
            <SurfaceRow
              key={s.id}
              surface={s}
              stat={byId.get(s.id)}
            />
          ))}
        </div>

        <div
          aria-hidden
          className="bg-border my-3 h-px w-full"
        />

        <GroupHeader
          label="Google Search AI"
          pct={googlePct}
        />
        <div className="mt-2.5 flex flex-col gap-2.5">
          {SEARCH_FEATURE_SURFACES.map((s) => (
            <SurfaceRow
              key={s.id}
              surface={s}
              stat={byId.get(s.id)}
            />
          ))}
        </div>
      </div>

      <div className="border-border-subtle border-t pt-3">
        <p className="text-text-tertiary text-[11px] leading-snug">
          Chatbot share and Google Search AI share are separate populations — never averaged
          together. Partial citations count at half weight.
        </p>
        <Link
          href={detailHref}
          className="text-text-link mt-2 inline-block text-[13px] font-medium hover:underline"
        >
          See AI visibility detail →
        </Link>
      </div>
    </Card>
  );
}
