export function shortName(name: string): string {
  return name.replace(/^Baptist Medical Group\s*[-|\u2013]\s*/i, "").trim();
}
