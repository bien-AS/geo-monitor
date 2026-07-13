"use client";

import dynamic from "next/dynamic";
import { MapFallback } from "./map-fallback";

/** Dynamic ssr:false wrapper — maps are client-only. */
export const FleetMapLazy = dynamic(() => import("./fleet-map").then((m) => m.FleetMap), {
  ssr: false,
  loading: () => (
    <MapFallback
      label="Fleet map"
      detail="Loading map…"
    />
  ),
});
