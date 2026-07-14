export function shortName(name: string): string {
  return name.replace(/^Baptist Memorial Hospital\s*[-–]\s*/i, "").trim();
}
