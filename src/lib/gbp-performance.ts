export interface GbpPerfLocationInput {
  slug: string;
  rating?: { votes_count: number } | null;
  city: string;
  facility_type: string;
}

export interface GbpPerfMonthPoint {
  month: string;
  label: string;
  interactions: number;
  calls: number;
  direction_requests: number;
  website_clicks: number;
  bookings: number;
  chat_clicks: number;
}

export interface GbpPlatformSplit {
  searchMobile: number;
  searchDesktop: number;
  mapsMobile: number;
  mapsDesktop: number;
}

export interface GbpSearchTerm {
  term: string;
  count: number;
}

export interface GbpPerformance {
  months: GbpPerfMonthPoint[];
  totals: {
    interactions: number;
    calls: number;
    direction_requests: number;
    website_clicks: number;
    bookings: number;
    chat_clicks: number;
  };
  profileViews: number;
  platformSplit: GbpPlatformSplit;
  topSearchTerms: GbpSearchTerm[];
  windowLabel: string;
}

const MONTHS: Array<{ month: string; label: string }> = [
  { month: "Feb", label: "Feb 2026" },
  { month: "Mar", label: "Mar 2026" },
  { month: "Apr", label: "Apr 2026" },
  { month: "May", label: "May 2026" },
  { month: "Jun", label: "Jun 2026" },
  { month: "Jul", label: "Jul 2026" },
];

function hash(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function rand01(seed: string): number {
  return hash(seed) / 0x100000000;
}

function jitter(seed: string, spread: number): number {
  return 1 + (rand01(seed) * 2 - 1) * spread;
}

const ACTION_MIX: Array<{
  key: "calls" | "direction_requests" | "website_clicks" | "bookings" | "chat_clicks";
  share: number;
}> = [
  { key: "calls", share: 0.31 },
  { key: "direction_requests", share: 0.33 },
  { key: "website_clicks", share: 0.26 },
  { key: "bookings", share: 0.07 },
  { key: "chat_clicks", share: 0.03 },
];

function facilityLabel(facility_type: string): string {
  return facility_type
    .replace(/^specialty_/, "")
    .replace(/_/g, " ")
    .replace(/\bent\b/i, "ENT")
    .replace(/\bmfm\b/i, "maternal-fetal medicine")
    .replace(/\bpmr\b/i, "physical medicine & rehabilitation");
}

export function buildGbpPerformance(
  location: GbpPerfLocationInput,
  keywordSeeds: string[],
): GbpPerformance {
  const { slug } = location;
  const votes = Math.max(location.rating?.votes_count ?? 12, 4);

  const monthlyBase = Math.max(votes * 0.4 * jitter(`${slug}:base`, 0.2), 9);

  const months: GbpPerfMonthPoint[] = MONTHS.map(({ month, label }) => {
    const seasonal = month === "Jun" || month === "May" ? 1.08 : 1;
    const monthTotal = monthlyBase * seasonal * jitter(`${slug}:${month}:m`, 0.22);

    const point = {
      month,
      label,
      interactions: 0,
      calls: 0,
      direction_requests: 0,
      website_clicks: 0,
      bookings: 0,
      chat_clicks: 0,
    };
    for (const { key, share } of ACTION_MIX) {
      point[key] = Math.max(
        Math.round(monthTotal * share * jitter(`${slug}:${month}:${key}`, 0.25)),
        0,
      );
    }
    point.interactions =
      point.calls +
      point.direction_requests +
      point.website_clicks +
      point.bookings +
      point.chat_clicks;
    return point;
  });

  const totals = {
    interactions: 0,
    calls: 0,
    direction_requests: 0,
    website_clicks: 0,
    bookings: 0,
    chat_clicks: 0,
  };
  for (const m of months) {
    totals.interactions += m.interactions;
    totals.calls += m.calls;
    totals.direction_requests += m.direction_requests;
    totals.website_clicks += m.website_clicks;
    totals.bookings += m.bookings;
    totals.chat_clicks += m.chat_clicks;
  }

  const profileViews = Math.round(totals.interactions * 7.6 * jitter(`${slug}:views`, 0.12));

  const rawShares = [
    0.47 * jitter(`${slug}:sm`, 0.06),
    0.41 * jitter(`${slug}:sd`, 0.06),
    0.07 * jitter(`${slug}:mm`, 0.15),
    0.05 * jitter(`${slug}:md`, 0.15),
  ];
  const shareSum = rawShares.reduce((a, b) => a + b, 0);
  const searchMobile = Math.round((rawShares[0] / shareSum) * profileViews);
  const searchDesktop = Math.round((rawShares[1] / shareSum) * profileViews);
  const mapsMobile = Math.round((rawShares[2] / shareSum) * profileViews);
  const mapsDesktop = profileViews - searchMobile - searchDesktop - mapsMobile;
  const platformSplit: GbpPlatformSplit = {
    searchMobile,
    searchDesktop,
    mapsMobile,
    mapsDesktop,
  };

  const city = location.city.toLowerCase();
  const facility = facilityLabel(location.facility_type).toLowerCase();
  const candidates = [
    `baptist ${city}`,
    `${facility} ${city}`,
    `baptist memorial ${city}`,
    `${facility} near me`,
    ...keywordSeeds.map((kw) => kw.toLowerCase()),
    `baptist ${facility}`,
  ];
  const seen = new Set<string>();
  const terms: string[] = [];
  for (const t of candidates) {
    const key = t.trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    terms.push(key);
    if (terms.length >= 8) break;
  }
  let filler = 1;
  while (terms.length < 6) {
    const t = `baptist ${city} ${["clinic", "hospital", "doctor"][filler % 3]}`;
    if (!seen.has(t)) {
      seen.add(t);
      terms.push(t);
    }
    filler++;
  }

  let cursor = Math.max(Math.round(profileViews * 0.2 * jitter(`${slug}:t0`, 0.15)), 18);
  const topSearchTerms: GbpSearchTerm[] = terms.map((term, i) => {
    const count = cursor;
    cursor = Math.max(
      Math.min(Math.round(cursor * (0.65 * jitter(`${slug}:${term}:d`, 0.15))), cursor - 1),
      Math.max(3, 8 - i),
    );
    return { term, count };
  });
  for (let i = 1; i < topSearchTerms.length; i++) {
    if (topSearchTerms[i].count >= topSearchTerms[i - 1].count) {
      topSearchTerms[i].count = Math.max(topSearchTerms[i - 1].count - 1, 1);
    }
  }

  return {
    months,
    totals,
    profileViews,
    platformSplit,
    topSearchTerms,
    windowLabel: "Feb\u2013Jul 2026",
  };
}
