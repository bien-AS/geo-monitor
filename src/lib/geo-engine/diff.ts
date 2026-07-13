/**
 * Cycle-over-cycle diff + rank-drop alerting. Fires from the
 * second scan cycle onward; thresholds sit above documented same-tool SERP
 * volatility so alerts mean movement, not noise.
 */

export interface CycleSnapshot {
  date: string;
  avg_rank: number | null;
  position_distribution: Record<string, number>;
  geoscan?: { solv: number };
}

export interface GridAlert {
  slug: string;
  keyword: string;
  severity: "critical" | "warning" | "improved";
  message: string;
  from: string;
  to: string;
}

const solvOf = (s: CycleSnapshot) =>
  s.geoscan?.solv ??
  Math.round(
    (100 * (s.position_distribution["1-3"] ?? 0)) /
      Math.max(
        1,
        Object.values(s.position_distribution).reduce((a, b) => a + b, 0),
      ),
  );

export function diffCycles(
  slug: string,
  keyword: string,
  prev: CycleSnapshot,
  next: CycleSnapshot,
): GridAlert[] {
  const alerts: GridAlert[] = [];
  const base = { slug, keyword, from: prev.date, to: next.date };
  const pAvg = prev.avg_rank;
  const nAvg = next.avg_rank;

  if (pAvg != null && nAvg == null) {
    alerts.push({
      ...base,
      severity: "critical",
      message: `"${keyword}" dropped out of the top 20 across the entire grid (was avg ${pAvg.toFixed(1)})`,
    });
    return alerts;
  }
  if (pAvg == null && nAvg != null) {
    alerts.push({
      ...base,
      severity: "improved",
      message: `"${keyword}" entered the map pack — avg ${nAvg.toFixed(1)} after ranking nowhere`,
    });
    return alerts;
  }
  if (pAvg != null && nAvg != null && nAvg - pAvg >= 2) {
    alerts.push({
      ...base,
      severity: "warning",
      message: `"${keyword}" average rank worsened ${(nAvg - pAvg).toFixed(1)} positions (${pAvg.toFixed(1)} → ${nAvg.toFixed(1)})`,
    });
  }
  const solvDelta = solvOf(next) - solvOf(prev);
  if (solvDelta <= -15) {
    alerts.push({
      ...base,
      severity: "warning",
      message: `"${keyword}" top-3 coverage fell ${Math.abs(solvDelta)} points (${solvOf(prev)}% → ${solvOf(next)}%)`,
    });
  }
  if (pAvg != null && nAvg != null && pAvg - nAvg >= 2) {
    alerts.push({
      ...base,
      severity: "improved",
      message: `"${keyword}" average rank improved ${(pAvg - nAvg).toFixed(1)} positions (${pAvg.toFixed(1)} → ${nAvg.toFixed(1)})`,
    });
  }
  return alerts;
}
