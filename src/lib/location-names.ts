export function shortLocationName(name: string): string {
  return name.replace(/^Baptist Medical Group\s*[-|\u2013]\s*/i, "").trim();
}

export function slugFromPathname(pathname: string): string | null {
  const m = pathname.match(/^\/locations\/([^/]+)/);
  return m ? m[1] : null;
}

export function pathForLocation(pathname: string, slug: string): string {
  const m = pathname.match(/^\/locations\/[^/]+(\/.*)?$/);
  const moduleSuffix = m?.[1] ?? "";
  return `/locations/${slug}${moduleSuffix}`;
}
