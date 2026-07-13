/**
 * Minimal .env.local loader for server-side scripts.
 * Ready for API integration.
 */

import fs from "node:fs";
import path from "node:path";

export function loadEnvLocal(): void {
  if (process.env.DATAFORSEO_LOGIN) return;
  const file = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2];
  }
}
