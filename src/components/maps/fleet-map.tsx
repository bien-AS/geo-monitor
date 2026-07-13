"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import Map, { Marker, Popup, NavigationControl } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { cn } from "@/lib/utils";
import type { LVIBand } from "@/lib/lvi";
import { LVI_BAND_LABEL } from "@/lib/lvi";
import { shortLocationName } from "@/lib/location-names";
import { MAPBOX_TOKEN, hasMapboxToken } from "./token";
import { MapFallback } from "./map-fallback";
import { onMapError } from "./map-error";

const COLOR_STYLE_LIGHT = "mapbox://styles/mapbox/streets-v12";
const COLOR_STYLE_DARK = "mapbox://styles/mapbox/navigation-night-v1";

export interface FleetPin {
  slug: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
  lvi?: number;
  band?: LVIBand;
  topAlert?: string;
}

const BAND_HEX: Record<LVIBand, string> = {
  elite: "#1f8a3a",
  healthy: "#1f8a3a",
  "at-risk": "#b87400",
  critical: "#c92a2a",
};

export function FleetMap({
  pins,
  className,
  height = 380,
}: {
  pins: FleetPin[];
  className?: string;
  height?: number;
}) {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [selected, setSelected] = React.useState<FleetPin | null>(null);
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const valid = pins.filter((p) => p.lat != null && p.lng != null);

  const bounds = React.useMemo(() => {
    if (valid.length === 0) return null;
    const lats = valid.map((p) => p.lat);
    const lngs = valid.map((p) => p.lng);
    return [
      [Math.min(...lngs) - 0.3, Math.min(...lats) - 0.3],
      [Math.max(...lngs) + 0.3, Math.max(...lats) + 0.3],
    ] as [[number, number], [number, number]];
  }, [valid]);

  if (!hasMapboxToken()) {
    return (
      <MapFallback
        label="Fleet map"
        className={className}
      />
    );
  }
  if (!bounds) {
    return (
      <MapFallback
        label="Fleet map"
        detail="No located pins yet."
      />
    );
  }

  return (
    <div
      className={cn("border-border overflow-hidden rounded-md border", className)}
      style={{ height }}
    >
      <Map
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{ bounds, fitBoundsOptions: { padding: 48 } }}
        mapStyle={resolvedTheme === "dark" ? COLOR_STYLE_DARK : COLOR_STYLE_LIGHT}
        styleDiffing={false}
        onError={onMapError}
        attributionControl={false}
        style={{ width: "100%", height: "100%" }}
        {...(prefersReducedMotion ? { dragRotate: false } : {})}
      >
        <NavigationControl
          position="top-right"
          showCompass={false}
        />
        {valid.map((pin) => (
          <Marker
            key={pin.slug}
            latitude={pin.lat}
            longitude={pin.lng}
            anchor="center"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setSelected(pin);
            }}
          >
            <button
              type="button"
              aria-label={`${shortLocationName(pin.name)} — LVI ${pin.lvi ?? "n/a"}`}
              className="flex size-6 cursor-pointer items-center justify-center rounded-full border-2 border-white text-[9px] font-bold text-white shadow-md transition-transform hover:scale-110"
              style={{
                background: pin.band ? BAND_HEX[pin.band] : "#005699",
                fontFamily: "var(--font-mono)",
              }}
            >
              {pin.lvi ?? "•"}
            </button>
          </Marker>
        ))}
        {selected && (
          <Popup
            latitude={selected.lat}
            longitude={selected.lng}
            anchor="bottom"
            offset={14}
            closeButton={false}
            onClose={() => setSelected(null)}
            maxWidth="260px"
          >
            <div className="flex flex-col gap-1 p-1">
              <p className="text-[13px] leading-tight font-semibold text-neutral-900">
                {shortLocationName(selected.name)}
              </p>
              <p className="text-[11px] text-neutral-600">
                {selected.city} ·{" "}
                {selected.band
                  ? `LVI ${selected.lvi} — ${LVI_BAND_LABEL[selected.band]}`
                  : "Awaiting first scan"}
              </p>
              {selected.topAlert && (
                <p className="text-[11px] font-medium text-[#b87400]">{selected.topAlert}</p>
              )}
              <button
                type="button"
                className="mt-1 self-start text-[12px] font-semibold text-[#0061e5] hover:underline"
                onClick={() => router.push(`/locations/${selected.slug}`)}
              >
                Open location →
              </button>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
