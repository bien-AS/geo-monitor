import { Icons } from "@/lib/icons";
import { fmtDateShort, fmtTime } from "@/lib/format";
import { FIELD_AFFECTS, type ProfileChange } from "./changes";

function charDiff(a: string, b: string) {
  let p = 0;
  while (p < a.length && p < b.length && a[p] === b[p]) p++;
  let s = 0;
  while (s < a.length - p && s < b.length - p && a[a.length - 1 - s] === b[b.length - 1 - s]) s++;
  return {
    prefix: a.slice(0, p),
    aMid: a.slice(p, a.length - s),
    bMid: b.slice(p, b.length - s),
    suffix: s > 0 ? a.slice(a.length - s) : "",
  };
}

export function DiffPanel({ change }: { change: ProfileChange }) {
  if (change.kind === "audit-log") {
    return (
      <div className="border-border border-l-primary rounded-md border border-l-[3px] p-4">
        <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.05em] uppercase">
          Logged operator write
        </p>
        <p className="mt-2 flex items-center gap-1.5 text-[13px]">
          <Icons.audit className="text-muted-foreground size-3.5 shrink-0" />
          <span className="font-semibold">{change.actor ?? "Operator"}</span>
          <span className="num text-muted-foreground text-[11px]">
            {fmtDateShort(change.date)} \u00b7 {fmtTime(change.date)}
          </span>
        </p>
        {change.detail ? (
          <p className="text-muted-foreground mt-2 text-[13px]">{change.detail}</p>
        ) : null}
        {change.resource ? (
          <p className="num text-muted-foreground mt-2 text-[11px]">{change.resource}</p>
        ) : null}
      </div>
    );
  }

  const before = change.before ?? "";
  const after = change.after ?? "";
  const d = charDiff(before, after);
  const affects = FIELD_AFFECTS[change.field];

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="border-border rounded-md border p-3.5">
          <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.05em] uppercase">
            Before \u00b7 canonical
          </p>
          <p className="num mt-2 text-[13px] leading-relaxed break-words">
            {d.prefix}
            {d.aMid ? (
              <span className="rounded-sm bg-red-50 px-0.5 text-red-700 line-through dark:bg-red-950 dark:text-red-300">
                {d.aMid}
              </span>
            ) : null}
            {d.suffix}
          </p>
        </div>
        <div className="border-border rounded-md border border-l-[3px] border-l-yellow-500 p-3.5">
          <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.05em] uppercase">
            After \u00b7 observed on {change.directory}
          </p>
          <p className="num mt-2 text-[13px] leading-relaxed break-words">
            {d.prefix}
            {d.bMid ? (
              <span className="rounded-sm bg-yellow-50 px-0.5 font-semibold text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300">
                {d.bMid}
              </span>
            ) : null}
            {d.suffix}
          </p>
        </div>
      </div>
      {affects ? (
        <div className="bg-accent text-accent-foreground rounded-md p-3 text-[12px] leading-relaxed">
          <span className="font-semibold">What this affects:</span> {affects}
        </div>
      ) : null}
    </div>
  );
}
