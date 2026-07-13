/**
 * GeoScan lattice math. Matches the fixture geometry exactly:
 * NxN square lattice centered on the business, row-major from the
 * NW corner, offsets in half-steps for even N.
 */

export interface LatticePin {
  index: number;
  lat: number;
  lng: number;
}

const MILES_PER_DEG_LAT = 69.172;

export function buildLattice(
  centerLat: number,
  centerLng: number,
  rows = 10,
  cols = 10,
  spacingMiles = 1.0,
): LatticePin[] {
  const milesPerDegLng = MILES_PER_DEG_LAT * Math.cos((centerLat * Math.PI) / 180);
  const pins: LatticePin[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const kLat = (rows - 1) / 2 - r;
      const kLng = c - (cols - 1) / 2;
      pins.push({
        index: r * cols + c,
        lat: round7(centerLat + (kLat * spacingMiles) / MILES_PER_DEG_LAT),
        lng: round7(centerLng + (kLng * spacingMiles) / milesPerDegLng),
      });
    }
  }
  return pins;
}

export function round7(n: number): number {
  return Math.round(n * 1e7) / 1e7;
}

export function nearestPinIndex(
  pins: { lat: number; lng: number }[],
  lat: number,
  lng: number,
): number {
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i < pins.length; i++) {
    const dLat = (pins[i].lat - lat) * MILES_PER_DEG_LAT;
    const dLng = (pins[i].lng - lng) * MILES_PER_DEG_LAT * Math.cos((lat * Math.PI) / 180);
    const d = dLat * dLat + dLng * dLng;
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  return best;
}

export function anchorIndices(
  pins: { lat: number; lng: number }[],
  centerLat: number,
  centerLng: number,
  spanMiles: number,
): number[] {
  const q = spanMiles / 4;
  const milesPerDegLng = MILES_PER_DEG_LAT * Math.cos((centerLat * Math.PI) / 180);
  const targets = [
    [centerLat, centerLng],
    [centerLat + q / MILES_PER_DEG_LAT, centerLng - q / milesPerDegLng],
    [centerLat + q / MILES_PER_DEG_LAT, centerLng + q / milesPerDegLng],
    [centerLat - q / MILES_PER_DEG_LAT, centerLng - q / milesPerDegLng],
    [centerLat - q / MILES_PER_DEG_LAT, centerLng + q / milesPerDegLng],
  ];
  return [...new Set(targets.map(([la, ln]) => nearestPinIndex(pins, la, ln)))];
}
