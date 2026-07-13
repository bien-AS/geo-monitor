/**
 * Mapbox public token — the ONLY NEXT_PUBLIC_ credential in the app.
 * URL-restricted in the Mapbox account settings.
 * Absent token → every map component renders its graceful fallback.
 */
export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

export const hasMapboxToken = () => MAPBOX_TOKEN.length > 0;

export const MAP_STYLE_LIGHT = "mapbox://styles/mapbox/light-v11";
export const MAP_STYLE_DARK = "mapbox://styles/mapbox/dark-v11";
