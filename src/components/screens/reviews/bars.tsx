import Link from "next/link";
import { fmtInt, fmtPct } from "@/lib/format";

export function RatingDistributionBars({
  distribution,
  href,
}: {
  distribution: Record<string, number>;
  href: string;
}) {
  const total = Object.values(distribution).reduce((a, b) => a + b, 0);
  const stars = ["5", "4", "3", "2", "1"];
  return (
    <div className="flex flex-col gap-1.5">
      {stars.map((s) => {
        const count = distribution[s] ?? 0;
        const pct = total > 0 ? (count / total) * 100 : 0;
        const bar =
          Number(s) >= 4 ? "bg-success-500" : Number(s) === 3 ? "bg-neutral-400" : "bg-error-500";
        return (
          <Link
            key={s}
            href={`${href}?rating=${s}`}
            aria-label={`${count} ${s}-star reviews — open in inbox`}
            className="group hover:bg-secondary/60 grid grid-cols-[34px_minmax(0,1fr)_88px] items-center gap-3 rounded px-1 py-1"
          >
            <span className="num text-text-secondary text-[12px] font-semibold">{s}★</span>
            <span className="bg-secondary h-2.5 overflow-hidden rounded-full">
              <span
                aria-hidden
                className={`block h-full rounded-full ${bar}`}
                style={{ width: `${Math.max(pct, count > 0 ? 2 : 0)}%` }}
              />
            </span>
            <span className="num text-text-secondary text-right text-[12px]">
              <span className="text-foreground font-bold">{fmtInt(count)}</span> · {fmtPct(pct)}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

export function TopicFrequencyBars({
  topics,
  href,
}: {
  topics: Record<string, number>;
  href: string;
}) {
  const rows = Object.entries(topics).sort((a, b) => b[1] - a[1]);
  const max = rows.length > 0 ? rows[0][1] : 0;
  if (rows.length === 0) {
    return (
      <p className="text-text-secondary text-[13px]">
        Google has not surfaced review topics for this listing yet.
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-1.5">
      {rows.map(([topic, count]) => (
        <Link
          key={topic}
          href={href}
          aria-label={`Topic ${topic}, ${count} mentions — open review inbox`}
          className="group hover:bg-secondary/60 grid grid-cols-[minmax(0,140px)_minmax(0,1fr)_44px] items-center gap-3 rounded px-1 py-1"
        >
          <span className="text-text-secondary group-hover:text-foreground truncate text-[12px] font-medium">
            {topic}
          </span>
          <span className="bg-secondary h-2.5 overflow-hidden rounded-full">
            <span
              aria-hidden
              className="bg-primary-500 block h-full rounded-full"
              style={{ width: `${max > 0 ? (count / max) * 100 : 0}%` }}
            />
          </span>
          <span className="num text-foreground text-right text-[12px] font-bold">
            {fmtInt(count)}
          </span>
        </Link>
      ))}
    </div>
  );
}
