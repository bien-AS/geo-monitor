import { Card } from "@/components/ui/card";
import { FleetMapLazy } from "@/components/maps/fleet-map-lazy";
import type { FleetPin } from "@/components/maps/fleet-map";
import { SourceBadge } from "@/components/local/source-badge";
import type { LVIBand } from "@/lib/lvi";

const LEGEND: Array<{ label: string; band: LVIBand; color: string }> = [
  { label: "Elite / Healthy", band: "healthy", color: "#1f8a3a" },
  { label: "At-Risk", band: "at-risk", color: "#b87400" },
  { label: "Critical", band: "critical", color: "#c92a2a" },
];

export function FleetMapCard({ pins, locationCount }: { pins: FleetPin[]; locationCount: number }) {
  return (
    <Card className="gap-4 rounded-lg p-6 xl:col-span-7">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-foreground text-lg font-semibold">Fleet map</h2>
          <p className="text-text-tertiary text-[13px]">
            <span className="num">{locationCount}</span> listings across MS + TN · pins colored by
            LVI band · click a pin to open the location
          </p>
        </div>
        <SourceBadge
          source="dataforseo"
          note="Coordinates from the DataForSEO business-listing enrichment"
        />
      </div>
      <FleetMapLazy
        pins={pins}
        height={380}
      />
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {LEGEND.map((l) => (
          <span
            key={l.label}
            className="text-text-secondary inline-flex items-center gap-1.5 text-[12px]"
          >
            <span
              aria-hidden
              className="size-2.5 rounded-full border border-white/60"
              style={{ background: l.color }}
            />
            {l.label}
          </span>
        ))}
      </div>
    </Card>
  );
}
