export type LVIBand = "elite" | "healthy" | "at-risk" | "critical" | "unknown";

export type LVIStatus = LVIBand;

export interface LVIScore {
  score: number;
  status: LVIStatus;
  label: string;
}

export function getLVIStatus(score: number): LVIStatus {
  if (score >= 80) return "healthy";
  if (score >= 50) return "at-risk";
  if (score >= 0) return "critical";
  return "unknown";
}

export const LVI_LABELS: Record<LVIStatus, string> = {
  elite: "Elite",
  healthy: "Healthy",
  "at-risk": "At Risk",
  critical: "Critical",
  unknown: "Unknown",
};

export const LVI_BAND_LABEL: Record<LVIBand, string> = {
  elite: "Elite",
  healthy: "Healthy",
  "at-risk": "At Risk",
  critical: "Critical",
  unknown: "Unknown",
};
