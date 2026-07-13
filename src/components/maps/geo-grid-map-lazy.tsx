"use client";

import dynamic from "next/dynamic";
import { MapFallback } from "./map-fallback";

export const GeoGridMapLazy = dynamic(() => import("./geo-grid-map").then((m) => m.GeoGridMap), {
  ssr: false,
  loading: () => (
    <MapFallback
      label="Geo-grid scan map"
      detail="Loading map…"
    />
  ),
});
