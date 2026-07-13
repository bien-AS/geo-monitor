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

export function fmtInt(v: number): string {
  return new Intl.NumberFormat("en-US").format(Math.round(v));
}

export function fmtPct(v: number, digits = 0): string {
  return `${v.toFixed(digits)}%`;
}

export function fmtCost(v: number): string {
  return `$${v.toFixed(2)}`;
}

export function fmtCostPerCall(v: number): string {
  return `$${v.toFixed(3)}`;
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
  top: "1\u20133",
  mid: "4\u201310",
  low: "11\u201320",
  out: "20+ / absent",
};
