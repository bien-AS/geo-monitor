# as-baptist-local — Data Architecture & Conventions

> Companion to `AGENTS.md`. Read this before adding any data-fetching, state management, or error handling code.

---

## 1. Architecture Overview

```
┌──────────────────────────────────────────────────────┐
│  UI Components                                       │
│  (pages, screens, widgets)                           │
│                                                      │
│  const { data, isLoading, error } = useDomains();    │
│  const sidebar = useUIStore((s) => s.sidebar);       │
└───────────────┬──────────────────────┬───────────────┘
                │                      │
                ▼                      ▼
┌───────────────────────┐  ┌──────────────────────────┐
│  Custom Hooks          │  │  Zustand Stores           │
│  (use-domains.ts,     │  │  (store/ui.ts, per-feat)  │
│   use-auth.ts, etc.)  │  │                           │
│                       │  │  Client UI state +        │
│  Encapsulate React    │  │  persistent data           │
│  Query for a domain   │  │  (localStorage via        │
│                       │  │   persist middleware)      │
└───────────┬───────────┘  └──────────────────────────┘
            │
            ▼
┌─────────────────────────┐
│  @tanstack/react-query   │
│  - Cache & dedup        │
│  - staleTime: 5 min     │
│  - retry: 1             │
│  - refetchOnWindowFocus │
│    false                │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐     ┌───────────────────────┐
│  lib/api-client.ts       │────▶│  lib/error-transfomer │
│  api.get/post/put/       │     │  .ts                  │
│  delete<T>()             │     │                       │
│                          │     │  Raw error → friendly │
│  Native fetch wrapper    │     │  { code, message }    │
│  throws ApiError on      │────▶│                       │
│  non-ok responses        │     │  lib/logger.ts        │
└───────────┬─────────────┘     │  (captures raw error)  │
            │                   └───────────┬───────────┘
            ▼                               │
┌─────────────────────────┐                 ▼
│  Next.js API Routes      │     ┌───────────────────────┐
│  (src/app/api/)          │     │  hooks/use-error-     │
│                          │     │  handler.ts           │
└──────────────────────────┘     │                       │
                                 │  Transforms error →   │
                                 │  Sonner toast          │
                                 │  (deduped by code)    │
                                 └───────────────────────┘
```

---

## 2. Hook-Based API Pattern

**Every data domain gets a custom hook.** Components import the hook, not React Query directly. This is the single public API for that domain's server state.

### Why hooks, not raw useQuery

| Approach | Problem |
|----------|---------|
| Raw `useQuery` in components | Query keys scattered, no reuse, error handling duplicated |
| Custom hooks | Single source of truth, error handling built-in, easy to test/mock |

### Hook signature convention

```typescript
// Query hooks (read):
export function useDomains() {
  return useQuery({
    queryKey: queryKeys.domains.all,
    queryFn: () => api.get<Domain[]>("/api/domains"),
  });
}
// → { data: Domain[] | undefined, isLoading, error }

// Mutation hooks (write):
export function useLogin() {
  return useMutation({
    mutationFn: (creds: Credentials) => api.post<Session>("/api/auth/login", creds),
    onError: (error) => showToast(error),
  });
}
// → { mutate, mutateAsync, isPending, error }

// Mutation hooks with invalidation:
export function useCreateDomain() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDomainInput) => api.post<Domain>("/api/domains", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.domains.all }),
  });
}
```

### The rule

> Components call feature hooks. Feature hooks call React Query. Never the other way around.

---

## 3. Creating a Feature Hook

### Step-by-step checklist

1. **Define types** — In a types file or co-located with the hook:
   ```typescript
   interface Domain {
     id: string;
     name: string;
     trustFlow: number;
     citationFlow: number;
   }
   ```

2. **Add query keys** — Open `src/queries/keys.ts` and add:
   ```typescript
   export const queryKeys = {
     // ... existing keys ...
     domains: {
       all: ["domains"] as const,
       byId: (id: string) => ["domains", id] as const,
     },
   } as const;
   ```

3. **Write the hook** — Create `src/hooks/use-<domain>.ts`:
   ```typescript
   "use client";

   import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
   import { api } from "@/lib/api-client";
   import { useErrorHandler } from "@/hooks/use-error-handler";
   import { queryKeys } from "@/queries/keys";
   import { toast } from "sonner";

   export function useDomains() {
     return useQuery({
       queryKey: queryKeys.domains.all,
       queryFn: () => api.get<Domain[]>("/api/domains"),
     });
   }

   export function useDomain(id: string) {
     const { showToast } = useErrorHandler();
     return useQuery({
       queryKey: queryKeys.domains.byId(id),
       queryFn: () => api.get<Domain>(`/api/domains/${id}`),
       enabled: !!id,
       meta: { onError: showToast },
     });
   }

   export function useCreateDomain() {
     const qc = useQueryClient();
     const { showToast } = useErrorHandler();
     return useMutation({
       mutationFn: (input: CreateDomainInput) => api.post<Domain>("/api/domains", input),
       onSuccess: () => {
         qc.invalidateQueries({ queryKey: queryKeys.domains.all });
         toast.success("Domain created");
       },
       onError: (error) => showToast(error),
     });
   }
   ```

4. **Use in a component:**
   ```typescript
   function DomainList() {
     const { data: domains, isLoading, error } = useDomains();

     if (isLoading) return <Skeleton />;
     if (error) return <ErrorState retry={{ label: "Retry", onClick: refetch }} />;
     if (!domains?.length) return <EmptyState title="No domains yet" />;

     return domains.map((d) => <DomainCard key={d.id} domain={d} />);
   }
   ```

---

## 4. Error Handling Pipeline

```
Raw Error (fetch, ApiError, TypeError, unknown)
         │
         ▼
  transformError(raw)          ← lib/error-transformer.ts
         │                        Logs raw error to console (dev only)
         │                        Maps HTTP status → friendly code
         │                        Handles network errors, unknown errors
         │
         ▼
  UserFriendlyError            ← lib/errors.ts
  { code, message, context? }    6 typed codes, autocomplete
         │
         ▼
  Sonner toast                  ← hooks/use-error-handler.ts
    toast.error(message,          Deduped by error code (id)
      { id: code })
```

### Error codes (single source of truth)

| Code | HTTP | Message |
|------|------|---------|
| `NETWORK_ERROR` | — | Unable to connect. Please check your internet. |
| `UNAUTHORIZED` | 401, 403 | Session expired. Please log in again. |
| `VALIDATION_ERROR` | 400 | Please check your input and try again. |
| `NOT_FOUND` | 404 | Resource not found. |
| `RATE_LIMITED` | 429 | Too many requests. Please wait a moment and try again. |
| `SERVER_ERROR` | 500+ | Something went wrong. Our team has been notified. |

### Adding a new error code

1. Add to `USER_FRIENDLY_ERRORS` in `lib/errors.ts`
2. Map the HTTP status (if applicable) in `STATUS_TO_CODE` in `lib/error-transformer.ts`
3. TypeScript will enforce exhaustiveness everywhere

---

## 5. Logging

```typescript
import { logger } from "@/lib/logger";

logger.debug("Component mounted", { slug });
logger.info("User logged in", { userId });
logger.warn("Rate limit approaching", { remaining });
logger.error("API call failed", { path, status });
```

| Env | `NEXT_PUBLIC_LOG_LEVEL` | Output |
|-----|--------------------------|--------|
| Production | `error` | Only `logger.error()` |
| Staging | `warn` (default) | `warn` + `error` |
| Development | `debug` | All levels |

Set via `.env.local`:
```
NEXT_PUBLIC_LOG_LEVEL=debug
```

---

## 6. Persistence (Zustand)

### Current stores

| Store | File | Purpose |
|-------|------|---------|
| `useUIStore` | `store/ui.ts` | Sidebar state, filters, command palette. Sidebar persisted to localStorage. |

### Adding a per-feature store

```typescript
// src/store/<feature>.ts
import { create } from "zustand";

interface FeatureState {
  items: Item[];
  activeId: string | null;
  setActive: (id: string) => void;
}

export const useFeatureStore = create<FeatureState>((set) => ({
  items: [],
  activeId: null,
  setActive: (id) => set({ activeId: id }),
}));
```

### When to use Zustand vs React Query

| Data type | Use |
|-----------|-----|
| Server-derived data (API responses) | **React Query** — cached, auto-refetched, invalidated on mutation |
| UI state (sidebar, filters, modals) | **Zustand** — local, immediate, optional persistence |
| Persistent preferences (theme, layout) | **Zustand + `persist` middleware** |
| Cross-component session state | **Zustand** — simpler than prop drilling or context |

> **Rule:** Never duplicate React Query cache in Zustand. If the source of truth is the server, use a query hook.

### Persist middleware

```typescript
import { persist } from "zustand/middleware";

export const useStore = create<State>()(
  persist(
    (set) => ({ /* ... */ }),
    {
      name: "baptist-local-feature",
      partialize: (state) => ({ /* only keys to persist */ }),
    }
  )
);
```

---

## 7. API Client

```typescript
import { api } from "@/lib/api-client";

// GET
const domains = await api.get<Domain[]>("/api/domains");

// POST
const newDomain = await api.post<Domain>("/api/domains", { name: "example.com" });

// PUT
const updated = await api.put<Domain>("/api/domains/123", { name: "newexample.com" });

// DELETE
await api.delete("/api/domains/123");
```

- Non-ok responses throw `ApiError` with `status` and parsed `body`
- `ApiError` extends `Error` and is caught by `transformError()`
- Base URL: relative paths only (same-origin API routes)
- JSON is assumed for both request and response bodies

---

## 8. Query Key Factory

Located at `src/queries/keys.ts`. All keys are `as const` arrays for type inference.

```typescript
import { queryKeys } from "@/queries/keys";

queryKeys.domains.all           // → ["domains"]
queryKeys.domains.byId("abc")   // → ["domains", "abc"]
```

**Why a factory?** Prevents key mismatches between `useQuery` and `invalidateQueries`. TypeScript catches typos.

---

## 9. File Placement

```
src/
  hooks/                         ← Feature hooks (data access)
    use-<feature>.ts             ← One hook file per data domain
    use-error-handler.ts         ← Error → toast utility
    use-mobile.ts                ← Window size hook

  queries/
    keys.ts                      ← Query key factory (all keys)

  store/                         ← Zustand stores
    ui.ts                        ← Global UI state
    <feature>.ts                 ← Per-feature stores
    index.ts                     ← Barrel exports

  lib/
    api-client.ts                ← fetch wrapper + ApiError class
    errors.ts                    ← Error codes + types
    error-transformer.ts         ← Raw → friendly error
    logger.ts                    ← Env-gated logger
    utils.ts                     ← cn(), general helpers

  components/
    providers.tsx                ← QueryClient + Theme + Tooltip wrapper
```

### When to use which directory

| What | Where | Example |
|------|-------|---------|
| React Query hook (read) | `src/hooks/use-<domain>.ts` | `useDomains()` |
| React Query hook (write) | `src/hooks/use-<domain>.ts` | `useCreateDomain()` |
| Generic utility hook | `src/hooks/use-<name>.ts` | `useErrorHandler()` |
| Zustand store | `src/store/<feature>.ts` | `src/store/ui.ts` |
| Query keys | `src/queries/keys.ts` | Always in the factory |
