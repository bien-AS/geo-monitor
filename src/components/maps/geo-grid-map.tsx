"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import Map, {
  Layer,
  Marker,
  NavigationControl,
  Source,
  type MapMouseEvent,
  type ViewState,
  type ViewStateChangeEvent,
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import turfCircle from "@turf/circle";
import { cn } from "@/lib/utils";
import type { GridPin } from "@/lib/data/types";
import { MAPBOX_TOKEN, hasMapboxToken, MAP_STYLE_LIGHT, MAP_STYLE_DARK } from "./token";
import { MapFallback } from "./map-fallback";
import { onMapError } from "./map-error";
import { GbpMarker } from "./gbp-marker";

const RANK_STEP_COLORS = ["#1D9E75", 4, "#EAB308", 11, "#EF9F27", 21, "#A32D2D"] as const;

export function GeoGridMap({
  center,
  pins,
  radiusMiles = 1,
  selectedIndex,
  onPinClick,
  height = 520,
  className,
  viewState,
  onMove,
  outline,
  aiHalo,
  business,
}: {
  center: { lat: number; lng: number };
  pins: GridPin[];
  radiusMiles?: number;
  selectedIndex?: number | null;
  onPinClick?: (pin: GridPin, index: number) => void;
  height?: number | "100%";
  className?: string;
  viewState?: Partial<ViewState>;
  onMove?: (e: ViewStateChangeEvent) => void;
  outline?: ReturnType<typeof turfCircle>;
  aiHalo?: Array<{ id: string; color: string; cited: boolean | "partial" }> | null;
  business?: { name: string; address: string } | null;
}) {
  const { resolvedTheme } = useTheme();
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const pinsGeoJSON = React.useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: pins.map((p, i) => ({
        type: "Feature" as const,
        id: i,
        geometry: {
          type: "Point" as const,
          coordinates: [p.lng, p.lat] as [number, number],
        },
        properties: {
          index: i,
          rankSort: p.rank == null ? 99 : p.rank,
          label:
            typeof p.pinLabel === "string" ? p.pinLabel : p.rank == null ? "–" : String(p.rank),
          selected: selectedIndex === i,
          ...(typeof p.pinColor === "string" ? { overrideColor: p.pinColor } : {}),
        },
      })),
    }),
    [pins, selectedIndex],
  );

  const defaultCircle = React.useMemo(
    () =>
      turfCircle([center.lng, center.lat], radiusMiles, {
        steps: 64,
        units: "miles",
      }),
    [center.lat, center.lng, radiusMiles],
  );
  const radiusPolygon = outline ?? defaultCircle;

  const handleClick = React.useCallback(
    (e: MapMouseEvent) => {
      const feature = e.features?.[0];
      if (!feature || feature.properties?.index == null) return;
      const idx = Number(feature.properties.index);
      if (pins[idx] && onPinClick) onPinClick(pins[idx], idx);
    },
    [pins, onPinClick],
  );

  if (!hasMapboxToken()) {
    return (
      <MapFallback
        label="Geo-grid scan map"
        className={className}
      />
    );
  }
  if (pins.length === 0) {
    return (
      <MapFallback
        label="Geo-grid scan map"
        detail="No scan pins for this cycle."
        className={className}
      />
    );
  }

  const latPad = (radiusMiles / 69) * 1.45;
  const lngPad = (radiusMiles / (69 * Math.cos((center.lat * Math.PI) / 180))) * 1.45;

  return (
    <div
      className={cn("border-border overflow-hidden rounded-md border", className)}
      style={{ height: height === "100%" ? "100%" : height }}
    >
      <Map
        mapboxAccessToken={MAPBOX_TOKEN}
        {...(viewState ? { ...viewState } : {})}
        {...(onMove ? { onMove } : {})}
        initialViewState={{
          bounds: [
            [center.lng - lngPad, center.lat - latPad],
            [center.lng + lngPad, center.lat + latPad],
          ],
          fitBoundsOptions: { padding: 24 },
        }}
        mapStyle={resolvedTheme === "dark" ? MAP_STYLE_DARK : MAP_STYLE_LIGHT}
        styleDiffing={false}
        onError={onMapError}
        attributionControl={false}
        interactiveLayerIds={["grid-pins"]}
        onClick={handleClick}
        onMouseEnter={(e) => {
          e.target.getCanvas().style.cursor = "pointer";
        }}
        onMouseLeave={(e) => {
          e.target.getCanvas().style.cursor = "";
        }}
        style={{ width: "100%", height: "100%" }}
        {...(prefersReducedMotion ? { dragRotate: false } : {})}
      >
        <NavigationControl
          position="top-right"
          showCompass={false}
        />

        <Source
          id="grid-radius"
          type="geojson"
          data={radiusPolygon}
        >
          <Layer
            id="grid-radius-fill"
            type="fill"
            paint={{ "fill-color": "#005699", "fill-opacity": 0.08 }}
          />
          <Layer
            id="grid-radius-line"
            type="line"
            paint={{ "line-color": "#005699", "line-width": 1, "line-opacity": 0.5 }}
          />
        </Source>

        <Source
          id="grid-pins-src"
          type="geojson"
          data={pinsGeoJSON}
        >
          <Layer
            id="grid-pins"
            type="circle"
            paint={{
              "circle-radius": ["case", ["boolean", ["get", "selected"], false], 14, 11],
              "circle-color": [
                "case",
                ["has", "overrideColor"],
                ["get", "overrideColor"],
                ["step", ["get", "rankSort"], ...RANK_STEP_COLORS],
              ] as unknown as string,
              "circle-stroke-color": "#ffffff",
              "circle-stroke-width": ["case", ["boolean", ["get", "selected"], false], 2.5, 1.25],
              "circle-opacity": 0.92,
            }}
          />
          <Layer
            id="grid-pin-labels"
            type="symbol"
            layout={{
              "text-field": ["get", "label"],
              "text-size": 10,
              "text-font": ["DIN Pro Medium", "Arial Unicode MS Regular"],
              "text-allow-overlap": true,
            }}
            paint={{ "text-color": "#ffffff" }}
          />
        </Source>

        {business && (
          <Marker
            longitude={center.lng}
            latitude={center.lat}
            anchor="center"
            style={{ zIndex: 6 }}
          >
            <GbpMarker
              name={business.name}
              address={business.address}
            />
          </Marker>
        )}

        {aiHalo && aiHalo.length > 0 && (
          <Marker
            longitude={center.lng}
            latitude={center.lat}
            anchor="center"
            style={{ pointerEvents: "none", zIndex: 5 }}
          >
            <div
              aria-label={`AI citation halo — ${aiHalo.length} citing surfaces`}
              style={{ position: "relative", width: 0, height: 0 }}
            >
              {aiHalo.map((h, i) => {
                const d = 46 + i * 22;
                return (
                  <span
                    key={h.id}
                    style={{
                      position: "absolute",
                      left: -d / 2,
                      top: -d / 2,
                      width: d,
                      height: d,
                      borderRadius: "9999px",
                      border: `2.5px ${h.cited === "partial" ? "dashed" : "solid"} ${h.color}`,
                      boxShadow: `0 0 ${10 + i * 4}px ${h.color}55`,
                      opacity: 0.9,
                    }}
                  />
                );
              })}
              <span
                style={{
                  position: "absolute",
                  left: -7,
                  top: -7,
                  width: 14,
                  height: 14,
                  borderRadius: "9999px",
                  background: "#005699",
                  border: "2.5px solid #ffffff",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
                }}
              />
            </div>
          </Marker>
        )}
      </Map>
    </div>
  );
}
