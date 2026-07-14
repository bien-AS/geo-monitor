import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusPill } from "@/components/local/status-pill";
import { fmtDate, fmtPct } from "@/lib/format";

export function ConsistencySummary({
  clean,
  listed,
  driftingRows,
  openItems,
  queuedItems,
  severityCounts,
  lastChecked,
}: {
  clean: number;
  listed: number;
  driftingRows: number;
  openItems: number;
  queuedItems: number;
  severityCounts: { critical: number; moderate: number; minor: number };
  lastChecked: string | null;
}) {
  const pct = listed > 0 ? (clean / listed) * 100 : 0;
  const tone = pct >= 95 ? "success" : pct >= 80 ? "warning" : "error";

  return (
    <Card className="min-w-0">
      <CardHeader className="pb-2">
        <CardTitle className="eyebrow text-text-tertiary">NAP consistency</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div>
          <p
            className={cn(
              "num text-[34px] leading-none font-bold",
              tone === "success" && "text-success-600 dark:text-success-100",
              tone === "warning" && "text-warning-600 dark:text-warning-100",
              tone === "error" && "text-error-600 dark:text-error-100",
            )}
          >
            {fmtPct(pct)}
          </p>
          <p className="text-text-secondary mt-1 text-[12px]">
            <span className="num font-semibold">{clean}</span> of{" "}
            <span className="num font-semibold">{listed}</span> listed directories match canonical
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {driftingRows > 0 ? (
            <StatusPill tone="warning">{driftingRows} drifting</StatusPill>
          ) : (
            <StatusPill tone="success">No drift</StatusPill>
          )}
          {openItems > 0 && <StatusPill tone="error">{openItems} open</StatusPill>}
          {queuedItems > 0 && <StatusPill tone="info">{queuedItems} queued</StatusPill>}
        </div>
        <dl className="border-border grid grid-cols-3 gap-2 border-t pt-3">
          {(["Critical", "Moderate", "Minor"] as const).map((label, i) => {
            const keys: Array<keyof typeof severityCounts> = ["critical", "moderate", "minor"];
            const count = severityCounts[keys[i]];
            return (
              <div key={label}>
                <dt className="eyebrow text-text-tertiary">{label}</dt>
                <dd className="num text-foreground mt-0.5 text-[15px] font-semibold">{count}</dd>
              </div>
            );
          })}
        </dl>
        <p className="border-border text-text-tertiary border-t pt-3 text-[12px]">
          Weekly auto-diff
          {lastChecked ? (
            <>
              {" "}
              · last checked <span className="num">{fmtDate(lastChecked)}</span>
            </>
          ) : null}
        </p>
      </CardContent>
    </Card>
  );
}
