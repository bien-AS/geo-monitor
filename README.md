# as-baptist-local

**Geo-monitor companion app.** Monitoring and companion functionality for the as-baptist-geo-monitor ecosystem.

---

## Tech stack

| Layer     | Technology                                                                                        |
| --------- | ------------------------------------------------------------------------------------------------- |
| Framework | [Next.js 16](https://nextjs.org) (App Router)                                                     |
| UI        | [shadcn/ui](https://ui.shadcn.com) v4 (radix-vega) + [Radix Primitives](https://www.radix-ui.com) |
| Styling   | [Tailwind CSS v4](https://tailwindcss.com)                                                        |
| Icons     | [Lucide](https://lucide.dev)                                                                      |
| Language  | TypeScript                                                                                        |

---

## Getting started

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Production build
pnpm build

# Lint
pnpm lint
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project structure

```
src/
  app/                  Next.js App Router (pages, layouts, globals.css)
  components/
    ui/                 shadcn v4 UI components
  hooks/                Feature hooks (data access + utility)
  queries/              Query key factory
  store/                Zustand stores
  lib/                  Utilities, api-client, errors, logger
```

---

## Design system

The design system will be ported from `as-baptist-geo-monitor`. See [`AGENTS.md`](AGENTS.md) for conventions and [`docs/structure.md`](docs/structure.md) for the complete data architecture.

For AI coding agent conventions and the full repository guide, see [`AGENTS.md`](AGENTS.md).
