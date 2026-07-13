"use client";

import * as React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkline } from "@/components/local/sparkline";
import { DeltaPill } from "@/components/local/delta-pill";
import { LVIBandPill, StatusPill } from "@/components/local/status-pill";
import { SourceBadge } from "@/components/local/source-badge";
import { useSessionLocations } from "./add-location-modal";
import { Icons } from "@/lib/icons";
import type { LVIBand } from "@/lib/lvi";
import { LVI_BAND_LABEL } from "@/lib/lvi";
import type { L01LocationCardData } from "./types";

const BAND_VAR: Record<LVIBand, string> = {
  elite: "var(--color-success-700)",
  healthy: "var(--color-success-500)",
  "at-risk": "var(--color-warning-500)",
  critical: "var(--color-error-500)",
};

const BAND_SEVERITY: Record<LVIBand, number> = {
  critical: 3,
  "at-risk": 2,
  healthy: 1,
  elite: 0,
};

const LISTING_META = {
  facility: { label: "Facility", icon: Icons.building },
  department: { label: "Department", icon: Icons.stethoscope },
  practitioner: { label: "Practitioner", icon: Icons.user },
} as const;

type SortKey = "lvi-desc" | "lvi-asc" | "name" | "attention";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-text-tertiary text-[9px] font-semibold tracking-wider uppercase">
        {label}
      </p>
      <p className="num text-foreground truncate text-[12px] font-semibold">{value}</p>
    </div>
  );
}

function LocationCard({ loc }: { loc: L01LocationCardData }) {
  const meta = LISTING_META[loc.listingType];
  const Icon = meta.icon;
  return (
    <Link
      href={`/locations/${loc.slug}`}
      aria-label={`${loc.shortName}, ${loc.city} — LVI ${loc.lvi}, ${LVI_BAND_LABEL[loc.band]}. Open location overview.`}
      className="group block h-full rounded-xl focus-visible:outline-none"
    >
      <Card className="group-hover:border-border-emphasis h-full gap-3 rounded-lg p-4 transition-colors">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-foreground truncate text-[14px] font-semibold">{loc.shortName}</p>
            <p className="text-text-tertiary mt-0.5 flex items-center gap-1.5 text-[12px]">
              <span className="truncate">
                {loc.city}, {loc.state}
              </span>
              <span
                className="border-border text-text-secondary inline-flex shrink-0 items-center gap-1 rounded border px-1 py-px text-[10px] font-medium"
                title={`Listing type: ${meta.label}`}
              >
                <Icon
                  className="size-2.5"
                  aria-hidden
                />
                {meta.label}
              </span>
            </p>
          </div>
          <LVIBandPill
            band={loc.band}
            className="shrink-0"
          />
        </div>

        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="eyebrow text-text-tertiary">LVI</p>
            <p
              className="num text-[28px] leading-none font-bold"
              style={{ color: BAND_VAR[loc.band] }}
            >
              {loc.lvi}
            </p>
          </div>
          <DeltaPill
            delta={loc.delta}
            label="vs last cycle"
          />
        </div>

        <Sparkline
          data={loc.spark}
          height={36}
          ariaLabel={`${loc.shortName} 6-month LVI trend`}
        />

        <div className="border-border-subtle grid grid-cols-5 gap-2 border-t pt-3">
          <Stat
            label="GBP"
            value={loc.gbpHealth != null ? `${loc.gbpHealth}` : "—"}
          />
          <Stat
            label="Rank"
            value={loc.avgRank != null ? loc.avgRank.toFixed(1) : "—"}
          />
          <Stat
            label="Cit"
            value={loc.citationsPct != null ? `${loc.citationsPct}%` : "—"}
          />
          <Stat
            label="Rating"
            value={loc.rating != null ? `${loc.rating.toFixed(1)}★` : "—"}
          />
          <Stat
            label="AI"
            value={loc.aiPct != null ? `${loc.aiPct}%` : "—"}
          />
        </div>

        <span className="text-text-link text-[13px] font-medium group-hover:underline">
          Open location →
        </span>
      </Card>
    </Link>
  );
}

export function LocationsGrid({ locations }: { locations: L01LocationCardData[] }) {
  const [sort, setSort] = React.useState<SortKey>("lvi-desc");
  const [bandFilter, setBandFilter] = React.useState<string>("all");
  const sessionAdded = useSessionLocations((s) => s.added);

  const visible = React.useMemo(() => {
    const filtered =
      bandFilter === "all" ? locations : locations.filter((l) => l.band === bandFilter);
    const sorted = [...filtered];
    switch (sort) {
      case "lvi-asc":
        sorted.sort((a, b) => a.lvi - b.lvi);
        break;
      case "name":
        sorted.sort((a, b) => a.shortName.localeCompare(b.shortName));
        break;
      case "attention":
        sorted.sort(
          (a, b) =>
            BAND_SEVERITY[b.band] - BAND_SEVERITY[a.band] || a.delta - b.delta || a.lvi - b.lvi,
        );
        break;
      default:
        sorted.sort((a, b) => b.lvi - a.lvi);
    }
    return sorted;
  }, [locations, sort, bandFilter]);

  return (
    <section
      id="locations"
      aria-labelledby="l01-all-locations"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2
            id="l01-all-locations"
            className="text-foreground text-lg font-semibold"
          >
            All locations <span className="num text-text-tertiary">({visible.length})</span>
          </h2>
          <SourceBadge
            source="dataforseo"
            note="Location roster + ratings from the DataForSEO enrichment; LVI composite is synthetic"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={sort}
            onValueChange={(v) => setSort(v as SortKey)}
          >
            <SelectTrigger
              size="sm"
              className="w-[180px]"
              aria-label="Sort locations"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lvi-desc">Sort: LVI high → low</SelectItem>
              <SelectItem value="lvi-asc">Sort: LVI low → high</SelectItem>
              <SelectItem value="name">Sort: Name A–Z</SelectItem>
              <SelectItem value="attention">Sort: Needs attention first</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={bandFilter}
            onValueChange={setBandFilter}
          >
            <SelectTrigger
              size="sm"
              className="w-[140px]"
              aria-label="Filter by LVI band"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All bands</SelectItem>
              {(Object.keys(LVI_BAND_LABEL) as LVIBand[]).map((b) => (
                <SelectItem
                  key={b}
                  value={b}
                >
                  {LVI_BAND_LABEL[b]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {visible.length === 0 ? (
        <Card className="items-center gap-3 rounded-lg p-10 text-center">
          <div
            className="flex items-center gap-1.5"
            aria-hidden
          >
            <span className="bg-primary-200 size-3 rotate-45" />
            <span className="size-3 rounded-full bg-cyan-200" />
            <span className="bg-primary-200 size-3" />
          </div>
          <h3 className="text-foreground text-[15px] font-semibold">No locations in this band</h3>
          <p className="text-text-secondary max-w-sm text-[13px]">
            No location currently falls in the{" "}
            {bandFilter !== "all" ? LVI_BAND_LABEL[bandFilter as LVIBand] : "selected"} band. Clear
            the filter to see the full fleet.
          </p>
          <button
            type="button"
            onClick={() => setBandFilter("all")}
            className="text-text-link text-[13px] font-medium hover:underline"
          >
            Show all bands
          </button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((loc) => (
            <LocationCard
              key={loc.slug}
              loc={loc}
            />
          ))}
          {sessionAdded.map((l) => (
            <Card
              key={l.cid}
              className="border-border-emphasis gap-2.5 border-dashed p-5"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-foreground text-[14px] font-semibold">
                  {l.name.replace(/^Baptist (Medical Group\s*[-|–]\s*)?/i, "")}
                </p>
                <StatusPill tone="info">Onboarding</StatusPill>
              </div>
              <p className="text-text-tertiary text-[12px]">
                near {l.near} · CID <span className="num">{l.cid}</span>
              </p>
              <p className="num text-text-secondary text-[12.5px]">
                {l.rating != null
                  ? `${l.rating.toFixed(1)}★ · ${l.votes ?? 0} reviews`
                  : "No reviews yet"}
              </p>
              <p className="text-text-tertiary text-[12px]">
                First audit + geo-grid scan queue when the profile connects — LVI appears after the
                first cycle.
              </p>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
