function hash(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface SimulatedPin {
  lat: number;
  lng: number;
  rank: number | null;
}

export interface SimulatedScanResult {
  pins: SimulatedPin[];
  avg_rank: number;
  best_position: number;
  total_pins: number;
  position_distribution: Record<string, number>;
}

export function simulateScan({
  keyword,
  center,
  gridSize,
}: {
  slug?: string;
  keyword: string;
  center: { lat: number; lng: number };
  gridSize: "10x10" | "5x5";
}): SimulatedScanResult {
  const seed = hash(keyword);
  const rand = mulberry32(seed);

  const dim = gridSize === "10x10" ? 10 : 5;
  const spacingMiles = 1.0;
  const milesPerDegLat = 69.172;
  const milesPerDegLng = milesPerDegLat * Math.cos((center.lat * Math.PI) / 180);

  const pins: SimulatedPin[] = [];
  const ranks: number[] = [];

  for (let r = 0; r < dim; r++) {
    for (let c = 0; c < dim; c++) {
      const kLat = (dim - 1) / 2 - r;
      const kLng = c - (dim - 1) / 2;
      const lat = center.lat + (kLat * spacingMiles) / milesPerDegLat;
      const lng = center.lng + (kLng * spacingMiles) / milesPerDegLng;

      const dist = Math.sqrt(kLat * kLat + kLng * kLng) * spacingMiles;
      const baseRank = 2 + (seed % 10) + dist * 0.8;
      const jitter = (rand() - 0.5) * 4;
      const rank = Math.round(Math.max(1, Math.min(20, baseRank + jitter)));
      pins.push({ lat: Math.round(lat * 1e7) / 1e7, lng: Math.round(lng * 1e7) / 1e7, rank });
      ranks.push(rank);
    }
  }

  const found = ranks.filter((r) => r <= 20);
  const avg_rank = found.length
    ? Math.round((found.reduce((s, v) => s + v, 0) / found.length) * 10) / 10
    : 0;
  const best_position = found.length ? Math.min(...found) : 0;

  const position_distribution: Record<string, number> = { "1-3": 0, "4-7": 0, "8-20": 0, "20+": 0 };
  for (const r of ranks) {
    if (r <= 3) position_distribution["1-3"]++;
    else if (r <= 7) position_distribution["4-7"]++;
    else if (r <= 20) position_distribution["8-20"]++;
    else position_distribution["20+"]++;
  }

  return { pins, avg_rank, best_position, total_pins: pins.length, position_distribution };
}
