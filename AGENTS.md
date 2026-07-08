# AGENTS.md — as-baptist-local

> This file is the persistent brief for AI coding agents working in this repo. Read it before any task.

## 1. What this is

as-baptist-local is a **geo-monitor companion app** — a Next.js application that provides monitoring and companion functionality for the as-baptist-geo-monitor ecosystem. It serves as the local management interface with real-time data visualization, configuration workflows, and project dashboards.

## 2. Tech stack

| Layer      | Choice                                                                     |
| ---------- | -------------------------------------------------------------------------- |
| Framework  | Next.js 16.2 (App Router)                                                  |
| React      | 19.2                                                                       |
| Styling    | Tailwind CSS v4 (`@theme inline` in `src/app/globals.css`)                 |
| Components | shadcn/ui v4 (radix-vega style, Radix primitives)                          |
| Variants   | `class-variance-authority`                                                 |
| Icons      | Lucide — import from `@/lib/icons`                                         |
| Data fetching | TanStack Query v5 via custom hooks — see `docs/structure.md` for the full pattern |
| State management | Zustand v5 for client UI state + persistence — see `docs/structure.md` |
| Error handling | Typed pipeline: `transformError()` → Sonner toast — see `docs/structure.md` |
| Notifications | Sonner |

## 3. Design system

The design system will be ported from `as-baptist-geo-monitor`. Until that migration is complete, follow shadcn/ui defaults with Tailwind CSS v4 semantic tokens.

## 4. Repository map

```
AGENTS.md                    ← you are here
docs/
  structure.md               ← data architecture & conventions (hook-based pattern, error handling, persistence)
src/
  app/
    globals.css              ← Tailwind v4 @theme inline + light/dark CSS variables
    layout.tsx               ← Root layout
    page.tsx                 ← Home page
  components/
    providers.tsx            ← QueryClientProvider, ThemeProvider, TooltipProvider wrapper
    ui/                      ← shadcn v4 components
  hooks/                     ← Feature hooks (data-access and utility)
    use-error-handler.ts     ← Error → Sonner toast hook
    use-mobile.ts            ← Window size hook
  queries/
    keys.ts                  ← Typed query key factory
  store/                     ← Zustand stores
    ui.ts                    ← Global UI state (sidebar, filters, command palette)
    index.ts                 ← Barrel exports
  lib/
    api-client.ts            ← Thin fetch wrapper + ApiError class
    errors.ts                ← Typed error codes + friendly messages
    error-transformer.ts     ← Raw error → UserFriendlyError pipeline
    logger.ts                ← Env-gated logging (NEXT_PUBLIC_LOG_LEVEL)
    utils.ts                 ← cn() helper (clsx + tailwind-merge)
```

## 5. Conventions

**Code**

- React function components + TypeScript. shadcn/ui v4 patterns (Radix primitives, `cn()`).
- **All interactive components** must start with `"use client"` (Next.js App Router).
- Import icons from `@/lib/icons` — never directly from `lucide-react` in feature code.
- Use semantic Tailwind tokens (`bg-primary`, `text-muted-foreground`, `border-border`) — never hardcode hex in components.
- Numbers: apply `tabular-nums` on every numeric cell/metric.
- Accessibility: visible focus rings (`ring`), >=36px hit areas, never color-only meaning.
- **No `any` types** — use `unknown` or a proper interface instead.
- **No `eslint-disable` / `eslint-ignore`** without a documented, strong justification in a comment.

**Import paths**

- `@/components/ui/*` — UI components
- `@/hooks/*` — feature hooks (data access + utility)
- `@/store/*` — Zustand stores
- `@/queries/*` — query key factory
- `@/lib/*` — utilities, icons, api-client, errors, logger

**shadcn v4 patterns**

- Imports from `radix-ui` (single package), not `@radix-ui/react-*`.
- Components use `data-slot` attributes for internal styling.
- Button variants: `default` (primary), `secondary`, `ghost`, `outline`, `destructive`, `link`.
- `DialogContent` auto-wraps in Portal + Overlay (no separate `DialogPortal` / `DialogOverlay` needed).
- `DropdownMenuItem` uses `variant="destructive"` (not `destructive` prop).

## 6. Commands

```bash
pnpm dev               # Start dev server (localhost:3000)
pnpm build             # Production build (tsc + next build)
pnpm lint              # ESLint (flat config)
pnpm format            # Prettier (write)
pnpm format:check      # Prettier (check only)
pnpm typecheck         # tsc --noEmit
pnpm test              # Vitest

# Adding shadcn components:
npx shadcn@latest add <component>
```

## 7. Data layer (hook-based pattern)

> Full architecture in `docs/structure.md`. This is the quick-start.

**The rule:** every data domain gets a custom hook. Components import hooks, not `useQuery`/`api.get` directly.

### Fetching data

```typescript
import { useDomains } from "@/hooks/use-domains";

function DomainList() {
  const { data: domains, isLoading, error, refetch } = useDomains();

  if (isLoading)  return <DomainListSkeleton />;
  if (error)      return <ErrorState retry={{ label: "Retry", onClick: () => refetch() }} />;
  if (!domains?.length) return <EmptyState title="No domains" />;

  return domains.map((d) => <DomainCard key={d.id} domain={d} />);
}
```

### Mutating data

```typescript
import { useCreateDomain } from "@/hooks/use-domains";

function AddDomainForm() {
  const { mutate, isPending } = useCreateDomain();
  // onSubmit → mutate({ name: "example.com" })
  // → cache auto-invalidated, success toast shown, errors surfaced
}
```

### Checklist: adding a new data domain

1. Add query keys to `src/queries/keys.ts`
2. Create `src/hooks/use-<domain>.ts` with query + mutation hooks
3. On mutation success: invalidate related query keys + show success toast
4. On error: use `useErrorHandler().showToast(error)` (it transforms + dedups)
5. Components: always handle loading, error, and empty states

### Zustand for UI state

Zustand is for **client-only** state (sidebar, filters, modals). Server data lives in React Query cache.

```typescript
import { useUIStore } from "@/store";

const sidebar = useUIStore((s) => s.sidebar);
const toggle = useUIStore((s) => s.toggleSidebar);
```

### Error handling

```
Raw error → transformError() → UserFriendlyError → Sonner toast (deduped by code)
```

Errors are **automatic** for mutations (via global `onError` on QueryClient). For queries, opt in: `meta: { onError: showToast }`.

---

_as-baptist-local — geo-monitor companion app._
