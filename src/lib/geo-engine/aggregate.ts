import type { CompetitorHit } from "./parse";

export interface CompetitorAggregate {
  title: string;
  data_cid: string;
  appearances: number;
  total_pins: number;
  avg_position: number;
  top3_count: number;
  rating: number | null;
  reviews: number | null;
  category: string | null;
}

export interface GridAggregates {
  avg_rank: number | null;
  atgr: number;
  solv: number;
  family_solv: number | null;
  best_position: number | null;
  center_position: number | null;
  position_distribution: Record<string, number>;
  competitors: CompetitorAggregate[];
}

const round1 = (n: number) => Math.round(n * 10) / 10;

export function aggregateGrid(
  ranks: (number | null)[],
  opts: {
    centerIndex: number;
    familyRanks?: (number | null)[];
    top20PerPin?: CompetitorHit[][];
  },
): GridAggregates {
  const total = ranks.length;
  const found = ranks.filter((r): r is number => r != null && r <= 20);

  const dist: Record<string, number> = { "1-3": 0, "4-7": 0, "8-20": 0, "20+": 0 };
  for (const r of ranks) {
    if (r == null || r > 20) dist["20+"]++;
    else if (r <= 3) dist["1-3"]++;
    else if (r <= 7) dist["4-7"]++;
    else dist["8-20"]++;
  }

  const competitors = aggregateCompetitors(opts.top20PerPin ?? [], total);

  const familyRanks = opts.familyRanks;
  return {
    avg_rank: found.length ? round1(found.reduce((a, b) => a + b, 0) / found.length) : null,
    atgr: round1(
      ranks.reduce<number>((a, r) => a + (r != null && r <= 20 ? r : 21), 0) / Math.max(1, total),
    ),
    solv: round1((100 * dist["1-3"]) / Math.max(1, total)),
    family_solv: familyRanks
      ? round1((100 * familyRanks.filter((r) => r != null && r <= 3).length) / Math.max(1, total))
      : null,
    best_position: found.length ? Math.min(...found) : null,
    center_position: ranks[opts.centerIndex] ?? null,
    position_distribution: dist,
    competitors,
  };
}

export function aggregateCompetitors(
  top20PerPin: CompetitorHit[][],
  totalPins: number,
): CompetitorAggregate[] {
  const byCid = new Map<
    string,
    {
      title: string;
      ranks: number[];
      top3: number;
      rating: number | null;
      reviews: number | null;
      category: string | null;
    }
  >();
  for (const pin of top20PerPin) {
    for (const hit of pin) {
      if (!hit.cid) continue;
      const cur = byCid.get(hit.cid) ?? {
        title: hit.title,
        ranks: [],
        top3: 0,
        rating: null,
        reviews: null,
        category: null,
      };
      cur.ranks.push(hit.rank);
      if (hit.rank <= 3) cur.top3++;
      cur.rating = hit.rating ?? cur.rating;
      cur.reviews = hit.reviews ?? cur.reviews;
      cur.category = hit.category ?? cur.category;
      cur.title = hit.title || cur.title;
      byCid.set(hit.cid, cur);
    }
  }
  return [...byCid.entries()]
    .map(([cid, c]) => ({
      title: c.title,
      data_cid: cid,
      appearances: c.ranks.length,
      total_pins: totalPins,
      avg_position: round1(c.ranks.reduce((a, b) => a + b, 0) / Math.max(1, c.ranks.length)),
      top3_count: c.top3,
      rating: c.rating,
      reviews: c.reviews,
      category: c.category,
    }))
    .sort((a, b) => b.top3_count - a.top3_count || b.appearances - a.appearances)
    .slice(0, 5);
}
