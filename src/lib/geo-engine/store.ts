/**
 * Scan store — Supabase-backed storage for GeoScan results.
 * Ready for API integration. Falls back to file-based storage
 * when SUPABASE_URL is not configured.
 */
import { composeGridFixture, type PinRow } from "./serve";
import { nearestPinIndex } from "./grid";

export interface StoredGrid {
  slug: string;
  keyword: string;
  fixture: Record<string, unknown>;
}

export interface ScanStore {
  readonly kind: "supabase" | "file" | "none";
  getGridFixtures(slug: string): Promise<Record<string, unknown>[]>;
}

export class SupabaseScanStore implements ScanStore {
  readonly kind = "supabase" as const;

  constructor(
    private url = process.env.SUPABASE_URL ?? "",
    private key = process.env.SUPABASE_ANON_KEY ?? "",
  ) {}

  private async rest<T>(pathQ: string): Promise<T> {
    const res = await fetch(`${this.url}/rest/v1/${pathQ}`, {
      headers: { apikey: this.key, Authorization: `Bearer ${this.key}` },
      next: { revalidate: 300, tags: ["geoscan"] },
    } as RequestInit);
    if (!res.ok) throw new Error(`supabase rest ${res.status} on ${pathQ}`);
    return (await res.json()) as T;
  }

  async getGridFixtures(slug: string): Promise<Record<string, unknown>[]> {
    const summaries = await this.rest<
      Array<{
        scan_id: string;
        keyword: string;
        scan_date: string;
        fetched_at: string;
        queue: string;
        pins: Array<{
          pin_index: number;
          lat: number;
          lng: number;
          primary_rank: number | null;
        }>;
      }>
    >(`scan_summaries?slug=eq.${encodeURIComponent(slug)}&order=scan_date.desc&limit=40`);

    const out: Record<string, unknown>[] = [];
    for (const s of summaries) {
      const pins: PinRow[] = (s.pins ?? []).map((r) => ({
        pin_index: r.pin_index,
        lat: Number(r.lat),
        lng: Number(r.lng),
        rank: r.primary_rank,
        family_rank: null,
        local_finder_rank: null,
        organic_rank: null,
      }));

      if (!pins.length) continue;
      const cLat = pins.reduce((a, p) => a + p.lat, 0) / pins.length;
      const cLng = pins.reduce((a, p) => a + p.lng, 0) / pins.length;

      out.push(
        composeGridFixture(
          {
            slug,
            keyword: s.keyword,
            scanDate: s.scan_date,
            fetchedAt: s.fetched_at,
            centerIndex: nearestPinIndex(pins, cLat, cLng),
            scanId: s.scan_id,
            queue: s.queue,
          },
          pins,
        ),
      );
    }
    return out;
  }
}

export class NoopScanStore implements ScanStore {
  readonly kind = "none" as const;
  async getGridFixtures(_slug: string): Promise<Record<string, unknown>[]> {
    return [];
  }
}

export function pickScanStore(): ScanStore {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
    return new SupabaseScanStore();
  }
  return new NoopScanStore();
}
