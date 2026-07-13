/**
 * Shared Mapbox error filter. Benign classes are swallowed; token-restriction
 * 403s collapse into ONE actionable warning (repeated console.errors were
 * tripping the Next dev overlay).
 */
let warnedTokenRestriction = false;

export function onMapError(e: unknown) {
  const err = (
    e as {
      error?: {
        message?: string;
        status?: number;
        url?: string;
        name?: string;
      };
    }
  )?.error;
  const msg = err?.message ?? "";
  const url = err?.url ?? "";
  if (url.includes("mapbox-incidents")) return;
  if (err?.status === 404 && url.includes(".pbf")) return;
  if (err?.name === "AbortError" || /abort/i.test(msg)) return;
  if ((err?.status === 403 || /403|forbidden/i.test(msg)) && url.includes("api.mapbox.com")) {
    try {
      if (sessionStorage.getItem("blgbp-map-403-warned")) return;
      sessionStorage.setItem("blgbp-map-403-warned", "1");
    } catch {
      /* private mode — fall back to module guard */
    }
    if (!warnedTokenRestriction) {
      warnedTokenRestriction = true;
      console.warn(
        `[map] Mapbox token URL restriction blocks this origin (${window.location.origin}) — ` +
          "some tiles will not load. Add this origin (and the production domain " +
          "before deploy) to the token's allowed URLs at account.mapbox.com.",
      );
    }
    return;
  }
  console.error(`[map] ${msg || "unknown map error"}${url ? ` · ${url}` : ""}`);
}
