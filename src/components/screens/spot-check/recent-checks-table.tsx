import Link from "next/link";
import { Icons } from "@/lib/icons";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/local/status-pill";
import { SurfaceDotStrip } from "@/components/screens/spot-check/surface-dot-strip";
import { SEED_RECENT, type RecentCheck } from "@/components/screens/spot-check/spot-check-data";
import { fmtDateShort } from "@/lib/format";

export function RecentChecksTable({
  sessionChecks,
  totalChecks,
  onReRun,
}: {
  sessionChecks: RecentCheck[];
  totalChecks: number;
  onReRun: (check: RecentCheck) => void;
}) {
  const recentRows = [...sessionChecks, ...SEED_RECENT].slice(0, 6);

  return (
    <Card className="gap-4 p-6">
      <div>
        <h2 className="text-base font-semibold">Recent spot checks</h2>
        <p className="text-text-tertiary mt-0.5 text-[13px]">
          Latest checks across the fleet. Re-run reloads the city, state, prompt and surface mix
          into the form.
        </p>
      </div>
      <div className="divide-border-subtle flex flex-col divide-y">
        {recentRows.map((r) => (
          <div
            key={r.id}
            className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3"
          >
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-2">
                <span className="truncate text-[13px] font-bold">&ldquo;{r.prompt}&rdquo;</span>
                <StatusPill tone="success">Completed</StatusPill>
                {r.session && <StatusPill tone="info">This session</StatusPill>}
              </p>
              <p className="text-text-tertiary mt-0.5 text-[11.5px]">
                Operator: Zach B. · <span className="num">{fmtDateShort(r.at)}</span> ·{" "}
                <span className="num">{r.surfaces.length}</span> surfaces · cost{" "}
                <span className="num text-text-secondary font-semibold">${r.cost.toFixed(3)}</span>{" "}
                · cited <span className="num">{r.citedCount}</span> of{" "}
                <span className="num">{r.total}</span> · {r.city}
                {r.state ? `, ${r.state}` : ""}
              </p>
            </div>
            <SurfaceDotStrip
              statuses={r.statuses}
              className="shrink-0"
            />
            <button
              type="button"
              onClick={() => onReRun(r)}
              className="text-primary inline-flex shrink-0 items-center gap-1 text-[12px] font-semibold hover:underline"
            >
              Re-run <Icons.arrowRight className="size-3" />
            </button>
          </div>
        ))}
      </div>
      <div className="border-border-subtle text-text-tertiary flex items-center justify-between border-t pt-3 text-[12.5px]">
        <span>
          Showing <span className="num">{recentRows.length}</span> of{" "}
          <span className="num">{totalChecks}</span>
        </span>
        <Link
          href="/system/runs"
          className="text-primary inline-flex items-center gap-1 font-semibold hover:underline"
        >
          View all in Runs <Icons.arrowRight className="size-3" />
        </Link>
      </div>
    </Card>
  );
}
