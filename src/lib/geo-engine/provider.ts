/**
 * DataForSEO provider client for the GeoScan engine.
 * Ready for API integration — requires DATAFORSEO_LOGIN + DATAFORSEO_PASSWORD env vars.
 * Server-side only.
 */

export type ScanLayer = "map_pack" | "organic" | "local_finder" | "ai_mode";

const LAYER_ENDPOINT: Record<ScanLayer, string> = {
  map_pack: "serp/google/maps",
  organic: "serp/google/organic",
  local_finder: "serp/google/local_finder",
  ai_mode: "serp/google/ai_mode",
};

const BASE = "https://api.dataforseo.com/v3";

export interface DfsTaskRef {
  id: string;
  tag: string;
  layer: ScanLayer;
  cost: number;
  statusCode: number;
}

export interface DfsEnvelope {
  status_code: number;
  status_message: string;
  tasks?: Array<{
    id: string;
    status_code: number;
    status_message: string;
    cost?: number;
    data?: { tag?: string };
    result?: unknown[] | null;
  }>;
}

export interface TaskPayload {
  keyword: string;
  location_coordinate: string;
  language_code: string;
  device: string;
  depth?: number;
  priority?: number;
  tag: string;
  load_async_ai_overview?: boolean;
  search_this_area?: boolean;
}

function getAuth(): string {
  const login = process.env.DATAFORSEO_LOGIN;
  const password = process.env.DATAFORSEO_PASSWORD;
  if (!login || !password) {
    throw new Error("DATAFORSEO_LOGIN / DATAFORSEO_PASSWORD missing (server-side .env.local)");
  }
  return Buffer.from(`${login}:${password}`).toString("base64");
}

async function dfsFetch(
  path: string,
  init?: { method?: string; body?: unknown },
): Promise<DfsEnvelope> {
  const res = await fetch(`${BASE}/${path}`, {
    method: init?.method ?? "GET",
    headers: {
      Authorization: `Basic ${getAuth()}`,
      "Content-Type": "application/json",
    },
    body: init?.body ? JSON.stringify(init.body) : undefined,
  });
  if (!res.ok) throw new Error(`DataForSEO HTTP ${res.status} on ${path}`);
  return (await res.json()) as DfsEnvelope;
}

export async function postTasks(layer: ScanLayer, payloads: TaskPayload[]): Promise<DfsTaskRef[]> {
  const refs: DfsTaskRef[] = [];
  for (let i = 0; i < payloads.length; i += 100) {
    const chunk = payloads.slice(i, i + 100);
    const env = await dfsFetch(`${LAYER_ENDPOINT[layer]}/task_post`, {
      method: "POST",
      body: chunk,
    });
    for (const t of env.tasks ?? []) {
      refs.push({
        id: t.id,
        tag: t.data?.tag ?? "",
        layer,
        cost: t.cost ?? 0,
        statusCode: t.status_code,
      });
    }
  }
  return refs;
}

export async function tasksReady(layer: ScanLayer): Promise<string[]> {
  const env = await dfsFetch(`${LAYER_ENDPOINT[layer]}/tasks_ready`);
  const ids: string[] = [];
  for (const t of env.tasks ?? []) {
    for (const r of (t.result ?? []) as Array<{ id?: string }>) {
      if (r?.id) ids.push(r.id);
    }
  }
  return ids;
}

export interface TaskResult {
  id: string;
  tag: string;
  statusCode: number;
  items: Array<Record<string, unknown>>;
}

export async function getTask(layer: ScanLayer, id: string): Promise<TaskResult | null> {
  const env = await dfsFetch(`${LAYER_ENDPOINT[layer]}/task_get/advanced/${id}`);
  const t = env.tasks?.[0];
  if (!t || t.status_code !== 20000 || !t.result) return null;
  const r = t.result[0] as { items?: Array<Record<string, unknown>> } | null;
  return {
    id: t.id,
    tag: t.data?.tag ?? "",
    statusCode: t.status_code,
    items: r?.items ?? [],
  };
}

export async function getTaskAny(
  layer: ScanLayer,
  id: string,
): Promise<{ statusCode: number; done: boolean; items: Array<Record<string, unknown>> }> {
  const env = await dfsFetch(`${LAYER_ENDPOINT[layer]}/task_get/advanced/${id}`);
  const t = env.tasks?.[0];
  const code = t?.status_code ?? 0;
  if (code === 20000 && t?.result) {
    const r = t.result[0] as { items?: Array<Record<string, unknown>> } | null;
    return { statusCode: code, done: true, items: r?.items ?? [] };
  }
  const terminalEmpty = code === 40102 || code === 40100 || code === 40103;
  return { statusCode: code, done: terminalEmpty, items: [] };
}

export async function liveCall(
  layer: ScanLayer,
  payload: TaskPayload,
): Promise<TaskResult & { cost: number }> {
  const env = await dfsFetch(`${LAYER_ENDPOINT[layer]}/live/advanced`, {
    method: "POST",
    body: [payload],
  });
  const t = env.tasks?.[0];
  if (!t || t.status_code !== 20000 || !t.result) {
    throw new Error(
      `live call failed: ${t?.status_code} ${t?.status_message ?? env.status_message}`,
    );
  }
  const r = t.result[0] as { items?: Array<Record<string, unknown>> } | null;
  return {
    id: t.id,
    tag: t.data?.tag ?? "",
    statusCode: t.status_code,
    items: r?.items ?? [],
    cost: t.cost ?? 0,
  };
}
