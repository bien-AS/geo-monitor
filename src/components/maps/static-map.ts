import { MAPBOX_TOKEN } from "./token";

export function staticMapUrl({
  lat,
  lng,
  zoom = 13,
  width = 400,
  height = 200,
  pinColor = "005699",
  dark = false,
  marker = true,
}: {
  lat: number;
  lng: number;
  zoom?: number;
  width?: number;
  height?: number;
  pinColor?: string;
  dark?: boolean;
  marker?: boolean;
}): string | null {
  if (!MAPBOX_TOKEN) return null;
  const style = dark ? "navigation-night-v1" : "streets-v12";
  const overlay = marker ? `pin-s+${pinColor}(${lng},${lat})/` : "";
  return `https://api.mapbox.com/styles/v1/mapbox/${style}/static/${overlay}${lng},${lat},${zoom}/${width}x${height}@2x?access_token=${MAPBOX_TOKEN}&attribution=false&logo=false`;
}
