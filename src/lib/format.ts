/** Formatting helpers — render every number in JetBrains Mono (`.num`). */

/** Per-call costs: 3 decimal places ($0.015). */
export function fmtCostPerCall(v: number): string {
  return `$${v.toFixed(3)}`;
}

/** Monthly / aggregate costs: 2 decimal places ($24.68). */
export function fmtCost(v: number): string {
  return `$${v.toFixed(2)}`;
}

export function fmtInt(v: number): string {
  return new Intl.NumberFormat("en-US").format(Math.round(v));
}

export function fmtPct(v: number, digits = 0): string {
  return `${v.toFixed(digits)}%`;
}

/** Date-only strings parse as UTC midnight and can slip a day in local
 *  render — pin them to noon. */
function safeDate(iso: string): Date {
  return new Date(/^\d{4}-\d{2}-\d{2}$/.test(iso) ? `${iso}T12:00:00` : iso);
}

export function fmtDate(iso: string): string {
  const d = safeDate(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function fmtDateShort(iso: string): string {
  const d = safeDate(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function fmtTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function relativeTime(iso: string, now = new Date()): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const diffMs = now.getTime() - d.getTime();
  const mins = Math.round(diffMs / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return fmtDate(iso);
}

export function formatCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/** Rank → geo-grid band id (04_MAPBOX_SPEC.md §2). */
export type RankBand = "top" | "mid" | "low" | "out";

export function rankBand(rank: number | null | undefined): RankBand {
  if (rank == null || rank > 20) return "out";
  if (rank <= 3) return "top";
  if (rank <= 10) return "mid";
  return "low";
}

export const RANK_BAND_COLOR: Record<RankBand, string> = {
  top: "#1D9E75",
  mid: "#EAB308",
  low: "#EF9F27",
  out: "#A32D2D",
};

export const RANK_BAND_LABEL: Record<RankBand, string> = {
  top: "1–3",
  mid: "4–10",
  low: "11–20",
  out: "20+ / absent",
};
