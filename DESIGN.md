---
name: "as-baptist-local Design System"
parent-brand: "Baptist Memorial Health Care Corporation (BMHC)"
system-type: "SaaS application design system"
vertical: "Geo-monitor companion app — HIPAA-conscious, light + dark mode"
color-modes: ["light", "dark"]
density: "comfortable (default), compact (data-heavy contexts)"
target-frameworks: ["React", "Next.js", "Tailwind CSS", "shadcn/ui radix-vega"]
font-display: "Montserrat"
font-ui: "Inter"
font-mono: "JetBrains Mono"

# ===== COLOR SCALES =====
colors:
  primary-50:  "#e6f0f7"
  primary-100: "#cce1ef"
  primary-200: "#99c3df"
  primary-300: "#66a4ce"
  primary-400: "#3386be"
  primary-500: "#005699"   # Baptist Primary Blue — brand anchor
  primary-600: "#004c87"
  primary-700: "#003d6d"
  primary-800: "#01305e"   # Deep Navy
  primary-900: "#001d39"

  cta-50:  "#e6ecff"
  cta-100: "#cdd9ff"
  cta-200: "#9bb3ff"
  cta-300: "#688cff"
  cta-400: "#3666ff"
  cta-500: "#0061e5"   # Conversion CTA Blue
  cta-600: "#0751b7"
  cta-700: "#024a90"

  cyan-50:  "#eafaff"
  cyan-100: "#d1f3fe"
  cyan-200: "#a7e5fc"
  cyan-300: "#92dffa"
  cyan-400: "#67cef2"
  cyan-500: "#68cef3"   # PMS 297 logo accent
  cyan-600: "#3eb4d6"

  yellow-50:  "#fffaeb"
  yellow-100: "#fdf6e3"
  yellow-200: "#fddb7d"
  yellow-300: "#fdc940"
  yellow-400: "#febe10"   # Pinned-CTA brand yellow
  yellow-500: "#e6a800"

  neutral-0:   "#ffffff"
  neutral-25:  "#fbfcfd"
  neutral-50:  "#f7f8fa"
  neutral-100: "#eef1f5"
  neutral-200: "#e1e6ed"
  neutral-300: "#cdd5df"
  neutral-400: "#a3aebd"
  neutral-500: "#7d8a9b"
  neutral-600: "#596e80"
  neutral-700: "#425565"
  neutral-800: "#233c50"
  neutral-900: "#0f1f2e"
  neutral-950: "#070f17"

  success-50:  "#e8f6ec"
  success-100: "#c5e7cf"
  success-500: "#1f8a3a"   # WCAG AA on white
  success-600: "#157a30"
  success-700: "#0e5e23"

  warning-50:  "#fff7e0"
  warning-100: "#ffe7a0"
  warning-500: "#b87400"   # WCAG AA on white
  warning-600: "#9a5f00"
  warning-700: "#7a4b00"

  error-50:  "#fdecec"
  error-100: "#f9c8c8"
  error-500: "#c92a2a"   # WCAG AA on white
  error-600: "#a91f1f"
  error-700: "#871717"

  info-50:  "#e6f0f7"
  info-500: "#005699"

  phi-tint:   "#fff7e0"
  phi-accent: "#b87400"
  redacted:   "#7d8a9b"

# ===== SEMANTIC SURFACE / TEXT TOKENS (light + dark) =====
semantic-light:
  surface:           "#ffffff"
  surface-subtle:    "#f7f8fa"
  surface-muted:     "#eef1f5"
  surface-inverse:   "#01305e"
  border-subtle:     "#eef1f5"
  border-default:    "#e1e6ed"
  border-emphasis:   "#cdd5df"
  border-focus:      "#005699"
  text-primary:      "#0f1f2e"
  text-secondary:    "#425565"
  text-tertiary:     "#7d8a9b"
  text-disabled:     "#a3aebd"
  text-on-primary:   "#ffffff"
  text-on-cta:       "#ffffff"
  text-on-yellow:    "#01305e"
  text-link:         "#0061e5"

semantic-dark:
  surface:           "#0f1f2e"
  surface-subtle:    "#15263d"
  surface-muted:     "#1c3151"
  surface-elevated:  "#1a2d4a"
  border-subtle:     "#1c3151"
  border-default:    "#2a4366"
  border-emphasis:   "#3d5a82"
  border-focus:      "#3386be"
  text-primary:      "#f4f7fb"
  text-secondary:    "#cdd5df"
  text-tertiary:     "#a3aebd"
  text-disabled:     "#596e80"
  text-on-primary:   "#ffffff"
  text-on-cta:       "#ffffff"
  text-on-yellow:    "#01305e"
  text-link:         "#688cff"

# ===== TYPOGRAPHY =====
typography:
  fonts:
    display: "Montserrat, Gotham, Arial, Helvetica, sans-serif"
    ui:      "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    mono:    "'JetBrains Mono', 'SF Mono', Menlo, Monaco, 'Courier New', monospace"
  feature-settings-ui:   "'cv11', 'ss01', 'ss03'"
  feature-settings-data: "'tnum', 'lnum'"
  scale:
    display-xl: { size: "60px", line: "1.1",  weight: 600, letter: "-0.02em",  font: "display" }
    display-lg: { size: "48px", line: "1.15", weight: 600, letter: "-0.015em", font: "display" }
    display-md: { size: "36px", line: "1.2",  weight: 600, letter: "-0.01em",  font: "display" }
    display-sm: { size: "30px", line: "1.25", weight: 500, letter: "-0.005em", font: "display" }
    h1:         { size: "32px", line: "1.25", weight: 600, letter: "-0.01em",  font: "ui" }
    h2:         { size: "24px", line: "1.3",  weight: 600, letter: "-0.005em", font: "ui" }
    h3:         { size: "20px", line: "1.35", weight: 600, font: "ui" }
    h4:         { size: "18px", line: "1.4",  weight: 600, font: "ui" }
    h5:         { size: "16px", line: "1.45", weight: 600, font: "ui" }
    body-lg:    { size: "18px", line: "1.6",  weight: 400, font: "ui" }
    body-md:    { size: "14px", line: "1.55", weight: 400, font: "ui" }
    body-sm:    { size: "13px", line: "1.5",  weight: 400, font: "ui" }
    body-xs:    { size: "12px", line: "1.45", weight: 400, font: "ui" }
    label-md:   { size: "13px", line: "1.4",  weight: 500, letter: "0.01em",  font: "ui" }
    label-sm:   { size: "12px", line: "1.4",  weight: 500, letter: "0.01em",  font: "ui" }
    label-xs:   { size: "11px", line: "1.4",  weight: 600, letter: "0.05em",  font: "ui", transform: "uppercase" }
    code-md:    { size: "13px", line: "1.5",  weight: 400, font: "mono" }
    code-sm:    { size: "12px", line: "1.45", weight: 400, font: "mono" }

# ===== SPACING (4px base grid) =====
spacing:
  0:   "0px"
  0.5: "2px"
  1:   "4px"
  1.5: "6px"
  2:   "8px"
  3:   "12px"
  4:   "16px"
  5:   "20px"
  6:   "24px"
  8:   "32px"
  10:  "40px"
  12:  "48px"
  16:  "64px"
  20:  "80px"
  24:  "96px"

# ===== RADIUS (SaaS-tighter than marketing) =====
radius:
  none: "0px"
  xs:   "2px"
  sm:   "4px"
  md:   "6px"   # default — most SaaS components
  lg:   "8px"
  xl:   "12px"
  2xl:  "16px"
  full: "9999px"

# ===== ELEVATION =====
elevation:
  flat:    "none"
  xs:      "0 1px 2px rgba(15, 31, 46, 0.04)"
  sm:      "0 1px 3px rgba(15, 31, 46, 0.06), 0 1px 2px rgba(15, 31, 46, 0.04)"
  md:      "0 4px 8px rgba(15, 31, 46, 0.06), 0 2px 4px rgba(15, 31, 46, 0.04)"
  lg:      "0 8px 16px rgba(15, 31, 46, 0.08), 0 4px 8px rgba(15, 31, 46, 0.04)"
  xl:      "0 16px 24px rgba(15, 31, 46, 0.10), 0 8px 16px rgba(15, 31, 46, 0.06)"
  2xl:     "0 24px 40px rgba(15, 31, 46, 0.12), 0 12px 20px rgba(15, 31, 46, 0.08)"
  focus:   "0 0 0 3px rgba(0, 86, 153, 0.20)"
  focus-error: "0 0 0 3px rgba(201, 42, 42, 0.20)"
  dark-sm: "0 1px 2px rgba(0, 0, 0, 0.4)"
  dark-md: "0 4px 8px rgba(0, 0, 0, 0.4)"
  dark-lg: "0 8px 24px rgba(0, 0, 0, 0.5)"

# ===== Z-INDEX SCALE =====
z-index:
  base:        0
  raised:      1
  dropdown:    1000
  sticky:      1100
  banner:      1200
  overlay:     1300
  modal:       1400
  popover:     1500
  skip-link:   1600
  toast:       1700
  tooltip:     1800
  cmd-palette: 1900

# ===== MOTION =====
motion:
  duration-instant: "0ms"
  duration-fast:    "120ms"
  duration-normal:  "200ms"
  duration-slow:    "320ms"
  duration-slower:  "500ms"
  easing-standard:    "cubic-bezier(0.2, 0, 0.2, 1)"
  easing-emphasized:  "cubic-bezier(0.2, 0, 0, 1)"
  easing-decelerate:  "cubic-bezier(0, 0, 0.2, 1)"
  easing-accelerate:  "cubic-bezier(0.4, 0, 1, 1)"
  easing-spring:      "cubic-bezier(0.34, 1.56, 0.64, 1)"

# ===== BREAKPOINTS =====
breakpoints:
  sm:  "640px"
  md:  "768px"
  lg:  "1024px"
  xl:  "1280px"
  2xl: "1536px"

# ===== LAYOUT =====
layout:
  app-shell-topbar-height: "56px"
  app-shell-sidebar-expanded: "240px"
  app-shell-sidebar-collapsed: "56px"
  app-shell-content-max-width: "1440px"
  app-shell-content-padding-x: "24px"
  app-shell-content-padding-y: "24px"
  page-section-gap: "32px"
  card-padding-default: "24px"
  card-padding-compact: "16px"

# ===== MOTIFS =====
motifs:
  scattered-diamonds:
    restricted: true
    note: "Marketing surfaces only. NEVER inside the authenticated app shell."
  pin-dots:
    restricted: true
    note: "Marketing only. Permitted at <20% opacity in empty-state illustrations."
  data-grid-watermark:
    color: "#005699"
    opacity: "0.04"
    use: "Faint single diamond, bottom-right of empty data tables — restrained Baptist signature inside app surfaces."
  empty-state-geometric:
    palette: ["#cce1ef", "#a7e5fc"]
    use: "Flat geometric shapes (rounded square + circle + triangle) for SaaS empty states."
---

# Baptist Health SaaS — Design System

## 1. Overview

This is the design system for Baptist Memorial Health Care Corporation's **SaaS applications** — patient portals, clinical tools, administrative dashboards, employee platforms. It is not the marketing system. The marketing brand (hero blocks, patient-story photography, scattered-diamond decorative motifs) does not appear inside the app shell.

The system carries Baptist brand DNA — primary blue `#005699`, PMS 297 cyan `#68cef3`, CTA blue `#0061e5`, the yellow pinned-CTA pattern — but applies it through the discipline of modern SaaS design language. Think Linear's keyboard fluency, Stripe Dashboard's data density, Vercel's empty-state restraint, Notion's typographic clarity — all rendered in Baptist's visual voice.

The design philosophy is **clinical calm**. SaaS users in healthcare contexts are often time-pressured, fatigued, and accountable for decisions with patient-safety consequences. Every UI choice should reduce cognitive load: predictable layouts, consistent affordances, restrained color, generous whitespace where breathing room serves comprehension, dense tabular grids where data efficiency matters. The interface should feel like a calm, capable colleague — not a marketing brochure, not a consumer app, not a generic enterprise dashboard.

The system is **light-first but ships fully designed in dark mode** — table stakes for any modern SaaS, especially relevant in healthcare where night-shift clinicians spend hours in low-light environments. Both modes preserve Baptist brand identity through identical primary and CTA blues, with surface and text tokens recalibrated for each mode.

**Accessibility is non-negotiable.** All text-on-surface combinations meet WCAG 2.1 AA contrast minimums (4.5:1 body text, 3:1 large text and UI components). All interactive elements meet 44×44px minimum touch targets. Focus rings are visible on every interactive element. Color is never the sole channel for conveying state — every status uses color + icon + text.

**HIPAA awareness is baked in, not bolted on.** The system includes first-class patterns for PHI handling: PHI containers, audit log rows, session-timeout banners, patient header components with allergy indicators, and explicit guidance against displaying PHI in screenshots, examples, or staging data.

## 2. Colors

### Color Philosophy

The SaaS palette extends the Baptist marketing palette in two directions:

1. **Granular tonal scales** (50–950) for every brand and neutral color, enabling consistent component states without ad-hoc color picking.
2. **WCAG-tuned semantic state colors** (success, warning, error) that diverge from Bootstrap defaults. The marketing system inherited `#dc3545`, `#ffc107`, `#28a745` — these fail accessibility on white at small sizes. SaaS variants (`#c92a2a`, `#b87400`, `#1f8a3a`) clear WCAG AA at 4.5:1 against `#ffffff`.

### Brand Core Scales

| Scale | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 |
|---|---|---|---|---|---|---|---|---|---|---|
| **Primary** | `#e6f0f7` | `#cce1ef` | `#99c3df` | `#66a4ce` | `#3386be` | **`#005699`** | `#004c87` | `#003d6d` | `#01305e` | `#001d39` |
| **CTA** | `#e6ecff` | `#cdd9ff` | `#9bb3ff` | `#688cff` | `#3666ff` | **`#0061e5`** | `#0751b7` | `#024a90` | — | — |
| **Cyan** | `#eafaff` | `#d1f3fe` | `#a7e5fc` | `#92dffa` | `#67cef2` | **`#68cef3`** | `#3eb4d6` | — | — | — |
| **Yellow** | `#fffaeb` | `#fdf6e3` | `#fddb7d` | `#fdc940` | **`#febe10`** | `#e6a800` | — | — | — | — |

**The 500-stop is the brand anchor.** Use 500 as the default. 50–100 for backgrounds, 200–300 for borders/disabled, 600–700 for hover/active, 800–900 for dark-mode surfaces.

### Neutrals (Warm-Cool Tuned)

The neutral scale is intentionally tuned slightly cool-blue rather than pure gray, harmonizing with brand blues and avoiding the cold sterile feel of pure grayscale common in healthcare UI.

```
neutral-0:   #ffffff   surfaces, modals
neutral-25:  #fbfcfd   off-white tints
neutral-50:  #f7f8fa   subtle backgrounds (sidebar, table headers)
neutral-100: #eef1f5   muted backgrounds, separators
neutral-200: #e1e6ed   default borders, dividers
neutral-300: #cdd5df   emphasized borders, disabled inputs
neutral-400: #a3aebd   disabled text, decorative icons
neutral-500: #7d8a9b   redacted content, very muted text
neutral-600: #596e80   tertiary text, captions
neutral-700: #425565   secondary text
neutral-800: #233c50   strong text emphasis
neutral-900: #0f1f2e   primary text on light mode
neutral-950: #070f17   deepest accent
```

### Semantic State Colors (WCAG AA Tuned)

| State | 50 (bg) | 100 (subtle bg) | 500 (text/icon) | 600 (hover) | 700 (deep text) |
|---|---|---|---|---|---|
| **Success** | `#e8f6ec` | `#c5e7cf` | `#1f8a3a` | `#157a30` | `#0e5e23` |
| **Warning** | `#fff7e0` | `#ffe7a0` | `#b87400` | `#9a5f00` | `#7a4b00` |
| **Error**   | `#fdecec` | `#f9c8c8` | `#c92a2a` | `#a91f1f` | `#871717` |
| **Info**    | `#e6f0f7` | `#cce1ef` | `#005699` | `#004c87` | — |

**Healthcare convention:** `info` uses the brand primary — informational UI feels native to Baptist rather than introducing a foreign blue.

### HIPAA / PHI Color Semantics

| Token | Hex | Use |
|---|---|---|
| `phi-tint` | `#fff7e0` | Subtle background for any container holding protected health information |
| `phi-accent` | `#b87400` | PHI badge accent, PHI container left border |
| `redacted` | `#7d8a9b` | Placeholder for redacted/permission-gated content |

The PHI tint is a warm yellow — visually distinct from info blue, warning amber, and error red. This deliberate fourth state signals "this region contains regulated patient data" without alarming the user.

### Color Rules

- **Don't introduce Bootstrap defaults** (`#007bff`, `#ffc107`, `#dc3545`, `#28a745`). They're not Baptist and they fail WCAG.
- **Don't use brand yellow `#febe10` as an interface element** — reserved for marketing-pinned CTAs only. SaaS warning yellow is `#b87400`.
- **Don't use accent cyan `#68cef3` for interactive states** — it's a logo/icon-circle/decorative color only. Interactive states use the CTA blue scale.
- **Don't use color alone to convey state** — every status uses color + icon + text. Accessibility AND healthcare safety rule.
- **Don't mix neutral scales with pure grayscale** (`#666`, `#999`) — the cool-tuned scale is intentional.

## 3. Typography

### Three-Font Stack

| Font | Role | When Used |
|---|---|---|
| **Montserrat** (display) | Marketing surfaces, large hero numbers, presentation contexts | Login/marketing pages, dashboard hero metrics >30px, report titles |
| **Inter** (UI) | All app-level UI | Body, headings under 30px, buttons, forms, tables, navigation |
| **JetBrains Mono** (mono) | Code, IDs, monospaced data | MRNs, transaction IDs, code blocks, timestamps in audit logs |

**Why two sans-serif fonts?** Montserrat is geometric humanist — beautiful at large display sizes, less optimal at 12–14px in dense data tables. Inter is purpose-built for screen UI at small sizes (designed by Rasmus Andersson at Figma) with tabular numbers, ligatures, and stylistic alternates tuned for legibility at 11–18px. Using both gives the system marketing presence and working-interface precision.

**Inter feature settings** enable specific stylistic improvements:
```css
/* Default UI */
font-feature-settings: 'cv11', 'ss01', 'ss03';

/* Tables, numeric data */
font-feature-settings: 'tnum', 'lnum';
```

The `tnum` flag is critical for data tables — makes numeric digits monospaced so columns align cleanly. **Non-negotiable** for any numeric column.

### Type Scale

| Token | Size | Line | Weight | Letter | Font | Use |
|---|---|---|---|---|---|---|
| `display-xl` | 60px | 1.1 | 600 | -0.02em | Montserrat | Marketing hero only |
| `display-lg` | 48px | 1.15 | 600 | -0.015em | Montserrat | Marketing section heads, login welcome |
| `display-md` | 36px | 1.2 | 600 | -0.01em | Montserrat | Dashboard hero metric numbers |
| `display-sm` | 30px | 1.25 | 500 | -0.005em | Montserrat | Section feature heads |
| `h1` | 32px | 1.25 | 600 | -0.01em | Inter | Page title |
| `h2` | 24px | 1.3 | 600 | -0.005em | Inter | Section heading |
| `h3` | 20px | 1.35 | 600 | 0 | Inter | Sub-section, card heading |
| `h4` | 18px | 1.4 | 600 | 0 | Inter | Group label, modal title |
| `h5` | 16px | 1.45 | 600 | 0 | Inter | Inline emphasis heading |
| `body-lg` | 18px | 1.6 | 400 | 0 | Inter | Hero subtitle, lead paragraph |
| `body-md` | **14px** | 1.55 | 400 | 0 | Inter | **SaaS default body** |
| `body-sm` | 13px | 1.5 | 400 | 0 | Inter | Captions, helper text |
| `body-xs` | 12px | 1.45 | 400 | 0 | Inter | Metadata, fine print |
| `label-md` | 13px | 1.4 | 500 | 0.01em | Inter | Form labels, nav items |
| `label-sm` | 12px | 1.4 | 500 | 0.01em | Inter | Compact labels |
| `label-xs` | 11px | 1.4 | 600 | 0.05em | Inter UC | Uppercase eyebrows, badge text |
| `code-md` | 13px | 1.5 | 400 | 0 | JetBrains Mono | Code blocks, MRN display |
| `code-sm` | 12px | 1.45 | 400 | 0 | JetBrains Mono | Timestamps, IDs, keyboard hints |

### Typography Rules

- **Don't use Montserrat in data tables** — optimized for display; at 12–14px Inter is materially more legible.
- **Don't use Inter for hero marketing numbers (>30px)** — Montserrat carries more brand presence at large sizes.
- **Don't use more than three font weights per screen** — typically 400 (body), 500 (labels/nav), 600 (headings).
- **Don't use mono font for body content** — monospace destroys reading rhythm; reserve for true monospaced data.
- **Don't disable tabular-numerals on numeric data** — column alignment is a usability requirement, not a preference.

## 4. Component Styles

This section specifies the SaaS component vocabulary. Token references use `{path.to.token}` syntax resolving automatically across light + dark mode.

### App Shell

The standard Baptist SaaS layout is a **three-zone shell**: top bar (56px), left sidebar (240px expanded / 56px collapsed), main content area. The shell persists across all routes except auth, marketing surfaces, and full-screen modals.

```
┌─────────────────────────────────────────────────────────┐
│  Top Bar (56px)                                          │
├──────────┬──────────────────────────────────────────────┤
│ Sidebar  │  Main Content                                 │
│ (240px)  │  max-width 1440px, padding 24px               │
│          │                                               │
└──────────┴──────────────────────────────────────────────┘
```

**Top Bar (left → right):**
1. Logo (or workspace switcher if multi-tenant)
2. Global search input — cmd+K trigger, expandable max-width 480px
3. Spacer (flex-grow)
4. Quick actions (workspace-specific, max 3 icons)
5. Notification bell with badge
6. Help menu
7. User avatar (opens user menu dropdown)

**Sidebar:**
1. Workspace/org switcher (if applicable)
2. Primary navigation tree, sections separated by `label-xs` uppercase headers
3. Bottom-pinned: settings link, user account link
4. Collapse toggle button (icon-only when collapsed)

### Buttons

Five semantic button roles, four sizes each. **Size-by-context rule:**

- `xl` (48px): Primary CTA on auth/empty/onboarding screens — actions where deliberateness matters
- `lg` (44px): Section-level primary actions
- `md` (36px): **Default** — most in-app buttons
- `sm` (32px): Toolbar buttons, table-row actions

#### Button: Primary

```
background:    cta-500 (#0061e5)
color:         white
border:        1px transparent
font-weight:   500
border-radius: 6px (radius.md)

hover:    background cta-600 (#0751b7)
active:   background cta-700 (#024a90)
focus:    box-shadow 0 0 0 3px rgba(0,86,153,0.20)
disabled: background cta-200, opacity 0.5
loading:  spinner replaces leading icon, label kept, opacity 0.8
```

**Use for:** the single most important action on a screen or in a section. At most one primary button per visual section. "Save Changes," "Create Patient," "Send Order," "Confirm Discharge."

#### Button: Secondary

```
background:  white
color:       text-primary
border:      1px solid border-emphasis (#cdd5df)

hover:   background neutral-50, border border-focus (#005699)
active:  background neutral-100
focus:   box-shadow focus ring
```

**Use for:** actions paired with primary ("Cancel" beside "Save," "Back" in wizards) or standalone secondary actions ("Export," "Filter").

#### Button: Tertiary (Subtle Action)

```
background:  transparent
color:       text-link (#0061e5)
border:      1px transparent

hover:   background cta-50
active:  background cta-100
```

**Use for:** low-emphasis secondary actions, "View All," "Manage," in-line CTAs.

#### Button: Ghost (Icon-Heavy, Discrete)

```
background:  transparent
color:       text-secondary
border:      1px transparent

hover:   background neutral-100, color text-primary
```

**Use for:** toolbar buttons, table row hover actions, drawer close buttons.

#### Button: Danger (Destructive)

```
background:  error-500 (#c92a2a)
color:       white

hover:   background error-600
focus:   box-shadow 0 0 0 3px rgba(201,42,42,0.20)
```

**Use for:** destructive actions only — Delete, Archive, Revoke. **Always pair with a confirmation dialog.** Never expose a danger button as a one-click action.

#### Button: CTA Pinned (Brand Yellow)

```
background:  yellow-400 (#febe10)
color:       primary-800 (#01305e)
font-weight: 600
```

**RESTRICTED.** Marketing surfaces and login/landing screens only — never inside the authenticated app. The yellow is a brand navigation-anchor pattern; using it inside the app dilutes its recognition value.

#### Icon Button

```
size:           32×32px (md), 24×24px (sm), 40×40px (lg)
background:     transparent
color:          text-secondary
border-radius:  6px

hover: background neutral-100, color text-primary
```

Always include `aria-label`. Always include a tooltip showing the action name on hover.

### Inputs

#### Base Spec

```
background:     surface
border:         1px solid border-default
border-radius:  6px
font:           body-md (14px Inter)
color:          text-primary
placeholder:    text-tertiary

hover:    border-color border-emphasis
focus:    border-color border-focus, box-shadow focus ring
error:    border-color error-500, box-shadow focus-error ring
disabled: background neutral-50, color text-disabled, cursor not-allowed
readonly: background neutral-50
```

#### Sizes

| Size | Padding | Min Height | Use |
|---|---|---|---|
| `sm` | 6px 10px | 32px | Toolbar inline filters, compact data forms |
| `md` | 8px 12px | 36px | **Default** — most forms |
| `lg` | 10px 14px | 44px | Auth screens, prominent forms, mobile |

#### Field Wrapper

Every input wraps in a Field component:

```
[Label*]                              ← bold label, * in error-500 if required
[Input]
[Helper text body-sm tertiary] OR [Error message body-sm error-600 with icon]
```

Required: red `*` after label + `aria-required="true"` on input.
Optional: `(optional)` in text-tertiary, only when field is unusual in a mostly-required form.

#### Checkbox / Radio / Switch

```
checkbox:
  size: 16×16px, radius 2px, border-emphasis
  checked: bg primary-500, white check icon
  indeterminate: bg primary-500, white dash icon (for "some-selected" parent)
  focus: focus ring around the box

radio:
  size: 16×16px, radius full, 2px border-emphasis
  checked: border primary-500, inner 8px dot primary-500
  focus: focus ring

switch (toggle):
  track: 36×20px, radius full
  off: neutral-300, on: primary-500
  thumb: 16×16px white, 2px inset, transition 120ms
```

**Switch vs Checkbox rule:**  
Switches = binary settings that take **immediate effect** ("Enable email notifications").  
Checkboxes = boolean form fields **saved on submit**.  
Confusing the two creates real user errors. Enforce in code review.

### Cards

#### Default Card (Flat with Border)

```
background:    surface
border:        1px solid border-default
border-radius: 8px (radius.lg)
padding:       24px
shadow:        none
```

**Default is flat with a border, not shadowed.** Shadow is reserved for elevated contexts (popovers, modals, dragged elements).

#### Card with Header

```
header:        border-bottom 1px border-subtle, padding-bottom 16px, margin-bottom 16px
header-title:  h3 (20px weight 600)
header-action: icon-button or button-tertiary, top-right
footer:        border-top 1px border-subtle, padding-top 16px (optional)
```

#### Card: Interactive (Clickable)

```
extends:       default card
cursor:        pointer
hover:         border-color border-focus, shadow elevation-sm
active:        background neutral-50
focus-visible: border-color border-focus, shadow focus ring
```

Wrap the entire card in a single semantic element (`<a>` or `<button>`) — not a `<div>` with `onClick`. Preserves keyboard accessibility and right-click.

#### Card: Metric (Dashboard Mainstay)

```
[label-xs uppercase, text-tertiary]   Active Patients
[display-sm Montserrat, text-primary] 2,847
[delta-pill] ↑ 12% vs last week          [optional sparkline 40px height]
```

**Delta pill colors:**
- Positive: bg `success-50`, color `success-700`, up-arrow icon
- Negative: bg `error-50`, color `error-700`, down-arrow icon
- Neutral: bg `neutral-100`, color `text-secondary`, dash icon

Healthcare context note: avoid "↑ good / ↓ bad" assumption. ER wait time going down is good; admissions going up may be neutral. Use color/icon **only** with explicit context label.

### Data Tables

The most critical SaaS component. Minor drift produces visible usability degradation.

#### Structure

```
[Bulk Action Bar — visible only when rows selected]
[Toolbar — search, filter, density toggle, columns toggle, primary action]
[Table Header — sticky on scroll]
[Rows]
[Footer — pagination + row counts]
```

#### Header

```
background:    surface-subtle (#f7f8fa light, #1c3151 dark)
border-bottom: 1px solid border-default
font:          label-sm
color:         text-secondary
padding:       12px 16px
sticky:        top: 0
sort-icon:     16px chevron, opacity 0.4 default, opacity 1 + primary-500 when active
```

#### Rows

```
padding:       12px 16px (default density)
border-bottom: 1px solid border-subtle
font:          body-md
color:         text-primary
hover:         background neutral-50 (light) / surface-elevated (dark)
selected:      background primary-50, border-bottom border-default
```

#### Density Variants

| Density | Padding | Use |
|---|---|---|
| Compact | 8px 16px | Power users, large datasets (>50 rows visible) |
| **Default** | 12px 16px | Most contexts |
| Comfortable | 16px 16px | Patient-facing displays, accessibility priority |

Expose density as a user-toggleable preference in the table toolbar, persisted per-user.

#### Cell Conventions

| Cell Type | Treatment |
|---|---|
| **Text** | body-md, text-primary, left-aligned |
| **Numeric** | body-md `font-feature-settings: 'tnum'`, right-aligned |
| **ID / Code** | code-sm JetBrains Mono, text-secondary |
| **Status** | Badge (see Badges), left-aligned |
| **Date/Time** | body-md, relative time on hover ("3 days ago" tooltip → exact timestamp) |
| **Avatar + Name** | 24px avatar + name link, 8px gap |
| **Row Actions** | 32px icon-buttons trailing column, revealed on row hover (always visible on mobile) |

#### Bulk Selection

When ≥1 row selected, bulk action bar replaces table header:

```
background:     primary-50
border-bottom:  1px solid primary-200
content:        "[N] selected"  [Action] [Action]  [×] Clear
left-checkbox:  indeterminate state for partial selection
```

#### Pagination Footer

```
content:    [N–M of Total]  [Per page: 10▼ 25 50 100]  [« Prev] [1] [2] [3] [Next »]
padding:    12px 16px
border-top: 1px solid border-default
```

For >1000 rows, use cursor-based pagination over page-number (server performance).

#### Empty Table State

```
[Empty illustration — 80px, primary-200 geometric]
[h3] No results found
[body-md text-secondary] Try adjusting your filters, or [link]clear all filters[/link]
[button-primary] Add Patient
```

When empty state results from active filter, **prioritize "clear filters" over "create new"** — user usually came looking for something that exists.

### Modals, Dialogs, Sheets

#### Modal (Centered Dialog)

```
overlay:        rgba(15, 31, 46, 0.6)
background:     surface
border-radius:  12px (radius.xl)
shadow:         elevation-2xl
padding:        24px

max-width-sm:   440px  (confirmations)
max-width-md:   560px  (forms)
max-width-lg:   720px  (multi-step or rich content)
max-width-xl:   960px  (complex workflows, side-by-side)

header:  h4 title, optional label-xs eyebrow, close icon-button top-right
body:   card padding
footer: border-top, padding-top 16px, right-aligned button group [Cancel][Primary]
```

**Keyboard rules:** `Esc` closes (unless destructive confirmation); `Enter` submits primary action when focus is inside modal but not on a text input.

**Body scroll lock** when modal open. Restore scroll position on close.

#### Sheet (Side Drawer)

Same as modal except:
- Slides from right edge (left in RTL)
- Width: 400px (sm), 560px (md), 720px (lg)
- Full viewport height
- No border-radius
- Used for detail views, edit forms, configuration panels

#### Alert Dialog (Destructive Confirmation)

```
icon:    32×32 leading, error or warning color
title:   h3, e.g., "Delete this patient record?"
body:    body-md, explicit consequence ("This action cannot be undone.")
footer:  [Cancel] [Delete] — danger button on the right
```

**Always require explicit confirmation for destructive actions.** For severe actions (delete patient, revoke access, mass-archive), require typing the resource name to confirm.

### Toasts & Notifications

```
position:       bottom-right (default) or top-right
stack-gap:      8px
max-visible:    3 (older toasts queue)
width:          320px min, 440px max
background:     neutral-900 (light mode) / surface-elevated (dark mode)
color:          white / text-primary
border-radius:  8px
shadow:         elevation-lg
padding:        12px 16px
animation:      slide-up + fade, 200ms emphasized easing
```

**Composition:**

```
[Variant Icon]  [Message — body-md]                    [Action — optional]  [×]
                [Secondary line — body-sm]
```

**Variants:** success (green check), error (red alert-circle), warning (amber triangle), info (blue info), loading (animated spinner).

**Auto-dismiss:**
- Default: 5s
- Error: 8s (read time)
- With action ("Undo"): **never** auto-dismiss

Toasts are **not** for critical confirmations (alert dialogs) or sustained errors (inline form errors or banner alerts).

### Badges, Pills, Status

```
height:         20px
padding:        2px 8px
border-radius:  full
font:           label-xs (11px Inter weight 600, uppercase, letter-spacing 0.05em)
```

**Variants:**

| Variant | Background | Text Color | Use |
|---|---|---|---|
| Neutral | neutral-100 | text-secondary | Default labels, generic tags |
| Primary | primary-50 | primary-700 | Brand-relevant, "Featured" |
| Success | success-50 | success-700 | "Active," "Approved," "Verified" |
| Warning | warning-50 | warning-700 | "Pending," "Review needed" |
| Error | error-50 | error-700 | "Failed," "Expired," "Inactive" |
| PHI | phi-tint | phi-accent | "PHI" with lock icon — HIPAA |

**Status dot variant** (online/offline):
```
size:   8px circle
colors: success-500 (online), error-500 (busy), warning-500 (away), neutral-400 (offline)
```

### Avatars

```
sizes:           xs 20px, sm 24px, md 32px, lg 40px, xl 48px, 2xl 64px
shape:           circle (radius full)
fallback-bg:     primary-100
fallback-color:  primary-700
fallback-text:   initials, 2 chars max, uppercase
```

**Stacked group:**
```
overlap:        -8px (margin-left items 2+)
border:         2px solid surface
max-displayed:  3, then "+N" pill in same size
```

### Tooltips, Popovers, Dropdowns

#### Tooltip

```
background:  neutral-900
color:       white
font:        body-xs (12px)
padding:     6px 8px
radius:      4px
max-width:   280px
delay-show:  500ms
delay-hide:  0ms
```

Use for: icon-button labels, abbreviated content reveal, hint information. **Don't** use for content the user must read to complete a task — tooltips are dismissed too easily.

#### Popover

```
background:    surface
border:        1px solid border-default
border-radius: 8px
shadow:        elevation-lg
padding:       16px
min-width:     240px
```

For richer hover content — user profile previews, contextual help, filter builders.

#### Dropdown Menu

```
background:     surface
border:         1px solid border-default
border-radius:  6px
shadow:         elevation-md
padding:        4px
min-width:      200px

item:           padding 8px 12px, radius 4px, body-md
item-hover:     background neutral-100
item-icon-gap:  8px
separator:      1px solid border-subtle, margin 4px 0
```

Always keyboard-navigable: arrows move focus, Enter selects, Esc closes.

#### Command Palette (cmd+K)

The healthcare SaaS power-user tool. Activated by `cmd+K` / `ctrl+K`.

```
overlay:           rgba(15, 31, 46, 0.4)
background:        surface
border-radius:     12px
shadow:            elevation-2xl
width:             640px
max-height:        480px
search-height:     52px
search-font:       body-lg
result-padding:    8px 20px
keyboard-hint:     bg neutral-100, font code-sm, radius 4px
```

**Result structure:**
```
[Section Header — label-xs]   Patients
[Result row — icon + name + secondary text + keyboard hint]
[Result row]
```

**Empty state:** "No results for '[query]'. Try searching for patients, providers, or actions."

### Tabs

#### Tabs Horizontal (Primary Pattern)

```
container:       border-bottom 1px border-default
item:            padding 12px 16px, label-md, color text-secondary
active:          color primary-500, border-bottom 2px primary-500
hover:           color text-primary
```

#### Tabs Segmented (Secondary, for binary/short choices)

```
container:    background neutral-100, radius 6px, padding 2px
item:         padding 6px 12px, radius 4px, label-sm
active:       background surface, shadow elevation-xs, color text-primary
```

Use segmented tabs for 2-4 mutually-exclusive view modes ("List | Kanban | Calendar"). Use horizontal tabs for navigation between page sections.

### Empty / Loading / Error States

#### Empty State

```
padding:           64px 24px
text-align:        center
illustration:      120px, color primary-200
title:             h3 text-primary
description:       body-md text-secondary, max-width 400px
action:            primary button, 24px above
```

**Illustration discipline:** simple geometric shapes (rounded square + circle + triangle) in `primary-200` + `cyan-200`. **Never** generic stock illustrations of medical equipment, healthcare workers, or abstract data flows.

**Variants:**
- No data yet (first-time): "Get started by creating your first [thing]"
- No results (filter active): "Try adjusting your filters"
- No permissions: lock icon, "You don't have access to this section" + contact-admin link
- Error: alert icon, "Something went wrong" + retry button + support link

#### Skeleton Loaders

```
background-light: linear-gradient 90deg #eef1f5 → #f7f8fa → #eef1f5
background-dark:  linear-gradient 90deg #1c3151 → #2a4366 → #1c3151
animation:        shimmer 1.6s ease-in-out infinite
border-radius:    4px (sm) — match the actual content's radius
```

**Skeleton matching rule:** the skeleton must have the same dimensions and approximate count of the content it replaces. Don't show 5 skeleton rows if the typical state is 50 rows — show 8-10 to suggest scrollable content.

#### Loading Spinner

```
sizes:         sm 16px, md 20px, lg 32px
color:         primary-500
track:         primary-100
animation:     spin 800ms linear infinite
stroke-width:  2px (sm/md), 3px (lg)
```

Use inline (next to text), inside buttons (replacing leading icon during async), or full-page (centered, with optional message below).

#### Progress Bar

```
height:        6px
track:         neutral-100
fill:          primary-500
border-radius: full
```

Indeterminate variant: track + animated 40% segment sliding left-to-right, 1.2s loop.

### Forms

#### Form Section

```
padding:                24px
border:                 1px solid border-default
border-radius:          8px
background:             surface
header-padding-bottom:  16px
header-border-bottom:   1px solid border-subtle
```

Long forms group into multiple sections with `h3` titles. Each section is independently scrollable in long modals.

#### Multi-Step Form (Wizard)

```
[Step indicator — circles + connecting lines, current = primary-500 fill]
[Step title — h2]
[Step description — body-md text-secondary]
[Form fields]
[Footer:  [« Back]  [Skip optional]                    [Continue »]]
```

**Step indicator structure:**
```
○──○──●──○──○        Step 3 of 5: Insurance Information
Completed steps: filled circle, primary-500
Current step:    larger circle, primary-500 with white center dot
Future steps:    empty circle, border neutral-300
```

#### File Upload

```
[Drop zone — dashed border-emphasis, 200px min-height]
  [Upload icon — 32px, text-tertiary]
  [Heading body-md-strong]    Drop files here or click to browse
  [Subtitle body-sm]          PDF, PNG, JPG — max 10MB
```

**Active drag state:** border-color `primary-500`, background `primary-50`.
**Uploaded files:** list below, each row with icon + filename + size + remove icon-button. Progress bar appears during upload.

### Healthcare-Specific Components

#### PHI Container

```
background:     phi-tint (#fff7e0)
border-left:    3px solid phi-accent (#b87400)
padding:        12px 16px
icon:           lock 16px in phi-accent
badge:          "PHI" badge in trailing position
```

Wrap any region containing protected health information. The visual signal alerts the user that the contained data is regulated, even when they expected it. Screen readers announce "Protected health information" before reading content.

```html
<div role="region" aria-label="Protected health information">
  <span class="phi-badge"><LockIcon /> PHI</span>
  <!-- patient data here -->
</div>
```

#### Patient Header

The persistent banner at the top of any patient-context screen.

```
background:     surface
border-bottom:  1px solid border-default
padding:        16px 24px

[Patient avatar 48px]  [Name h2]                                 [Actions]
                       [MRN code-md text-secondary]
                       [DOB body-md] · [Age] · [Sex] · [Insurance status badge]
                       [⚠ Allergies — red badge if present]
```

**Allergy badge is non-optional**: if patient has allergies, the red badge is always visible at the top. Critical for patient safety.

#### Audit Log Row

```
[Timestamp — code-md, text-secondary]   [Action icon 16px]   [body-sm-strong actor name]
[Action description body-md]
[Affected resource — link]
```

Each row is left-bordered with state color (primary for read, warning for update, error for delete, success for create).

#### Session Timeout Banner

Appears at the top of the viewport when session is approaching expiration.

```
background:     warning-50
color:          warning-700
border-bottom:  1px solid warning-100
padding:        8px 16px
content:        [Clock icon] Session expires in [4:32 countdown] · [Stay signed in button]
```

Countdown number uses `code-md` (JetBrains Mono) so digit-width doesn't shift as time decrements.

#### Permission-Gated Region

For regions the user lacks permission to view:

```
[Lock icon 24px text-tertiary]
[Body-md text-secondary]   You don't have permission to view this content.
[Tertiary button]          Request access
```

**Don't show "permission denied" inside the same UI region** that would normally show the data — collapse the entire region so the user doesn't infer information from the layout.

## 5. Layout & Spacing

### App Shell Specifics

| Element | Spec |
|---|---|
| Top bar height | 56px |
| Sidebar expanded | 240px |
| Sidebar collapsed | 56px (icon-only) |
| Content max-width | 1440px |
| Content padding | 24px horizontal, 24px vertical |
| Section gap | 32px between major page sections |

### Spacing Scale (4px Base Grid)

```
0:    0px       0.5:  2px      1:    4px       1.5:  6px
2:    8px       3:    12px     4:    16px      5:    20px
6:    24px      8:    32px     10:   40px      12:   48px
16:   64px      20:   80px     24:   96px
```

**Use ratios, not pixels.** Component code should reference `spacing.4` not `16px`. This makes density-toggle and zoom-level scaling possible.

### Density Hierarchy

The Baptist SaaS uses **comfortable** density by default but exposes a **compact** toggle for data-heavy contexts (admin dashboards, audit logs, large lists).

| Context | Default Density | Compact Available? |
|---|---|---|
| Clinical workflows | Comfortable | No — patient safety |
| Admin dashboards | Comfortable | Yes |
| Audit logs / activity feeds | Compact | No (already dense) |
| Settings | Comfortable | No |
| Reports | Comfortable | Yes |

### Grid

12-column grid with 24px gutters within the app shell content area. Most page layouts use:

- 12 cols (full-width content)
- 8/4 cols (content + sidebar widget)
- 6/6 cols (two-column equal)
- 4/4/4 cols (three-column equal — metric cards row)

## 6. Depth & Elevation

The SaaS system uses more shadow gradations than the marketing system because layered SaaS UIs (overlays, popovers, modals, drawers, command palettes) need clear elevation hierarchy.

| Token | Use |
|---|---|
| `flat` | Default surfaces, default cards |
| `xs` | Hover state on default cards, sticky table headers |
| `sm` | Interactive card hover, raised toolbar |
| `md` | Dropdown menus, contextual menus |
| `lg` | Popovers, toasts |
| `xl` | Sheets, drawers |
| `2xl` | Modals, command palette |
| `focus` | Standard focus ring (rgba primary-500 0.20) |
| `focus-error` | Error focus ring (rgba error-500 0.20) |

**Brand-tinted shadows:** All shadows use `rgba(15, 31, 46, ...)` — a deep navy-tinted neutral — not pure black. Ties depth subliminally back to the brand.

**Dark mode:** Shadows are less effective on dark backgrounds; use border emphasis (`border-emphasis` instead of `border-default`) and `surface-elevated` background steps to convey elevation.

### Z-Index Scale

Use named tokens, never raw numbers:

```
base:        0       raised:      1        dropdown:    1000
sticky:      1100    banner:      1200     overlay:     1300
modal:       1400    popover:     1500     skip-link:   1600
toast:       1700    tooltip:     1800     cmd-palette: 1900
```

The 100-unit spacing leaves room for inserting new layers without renumbering.

## 7. Do's and Don'ts

The single highest-leverage section. These rules prevent the most common SaaS design failures.

### DO

- **Do use Inter for all in-app UI** — body, buttons, forms, tables, nav. Montserrat appears only at display sizes (>30px) in marketing-style hero contexts.
- **Do use tabular numerals on every numeric column** — column alignment is a usability requirement.
- **Do enforce one primary button per visual section** — primary button proliferation destroys hierarchy.
- **Do use color + icon + text for every state** — never color alone. Accessibility AND healthcare safety rule.
- **Do wrap interactive cards in a single `<a>` or `<button>`** — preserves keyboard accessibility and right-click.
- **Do persist user preferences** — density toggle, sidebar collapse state, column visibility, sort order. Server-side per user.
- **Do show skeleton loaders matching the eventual content's shape** — don't show 5 skeleton rows when 50 are expected.
- **Do use the command palette for power-user navigation** — cmd+K is a learned convention; users will look for it.
- **Do mark all PHI containers** with the `phi-container` pattern, even when it seems obvious that the user expects it.
- **Do require explicit confirmation for destructive actions** — type-to-confirm for severe cases.

### DON'T

1. **Don't put marketing components inside the app shell.** Hero blocks, scattered-diamond decorations, patient-story photo collages, "Send Some Love" cheer cards — all belong to marketing surfaces only. The app uses page headers, breadcrumbs, dashboard widgets.
2. **Don't use 80px section padding inside the app.** That's marketing rhythm. App sections use 24-32px vertical padding.
3. **Don't use the brand yellow `#febe10` as an in-app interface element.** Yellow is reserved for the persistent marketing "Find a Doctor" CTA pattern. Inside the app, warning state uses `#b87400` (warning-500).
4. **Don't use accent cyan `#68cef3` for any interactive state.** Cyan is logo + icon-circle + decorative only. Hover/active/selected states use the CTA blue scale.
5. **Don't show two primary buttons in the same section.** Primary button proliferation breaks the action hierarchy. If you need two emphatic actions, one is primary and the other is secondary.
6. **Don't use centered body text in app screens.** Center-aligned content reads as marketing-aspirational; SaaS body is always left-aligned (start-aligned for RTL).
7. **Don't add drop shadows to default cards.** Default cards are flat with borders. Shadow is reserved for elevated contexts.
8. **Don't use Bootstrap default colors.** `#007bff`, `#ffc107`, `#dc3545`, `#28a745` — all fail WCAG AA at body sizes. Use the SaaS-tuned variants (`cta-500`, `warning-500`, `error-500`, `success-500`).
9. **Don't use pill-radius buttons.** Baptist SaaS uses 6px radius consistently. Full-pill buttons read as consumer-app, not healthcare-institutional.
10. **Don't display PHI in screenshots, mockups, examples, or staging data.** All demo data uses obviously-fake names (e.g., "Patient X," "John Doe," "Test Subject A") with non-real MRNs. HIPAA + appearance.
11. **Don't use generic AI-healthcare illustrations.** No DNA helixes, no glowing neon medical iconography, no isometric 3D medical scenes, no pastel mint-and-lavender gradients. Baptist SaaS uses simple geometric shapes from the brand palette.
12. **Don't put real patient faces in screenshots or empty-state illustrations.** Use abstract geometric illustrations only inside the app.
13. **Don't use Montserrat in data tables.** Inter at 14px is materially more legible at table density.
14. **Don't expose destructive actions as one-click operations.** Delete, archive, revoke — all require confirmation. Severe destructive actions require type-to-confirm.
15. **Don't use shadows on default state for elements meant to be flat.** Shadows on every card produce visual noise; reserve them for genuine elevation.
16. **Don't introduce sub-brand-specific motifs into the SaaS shell.** The cancer-center mountain wave belongs to BCC marketing only. The scattered-diamond motif belongs to BMHC marketing only. SaaS has its own restrained motif language (geometric empty states + faint diamond watermark).
17. **Don't violate the switch-vs-checkbox semantic.** Switches = immediate effect. Checkboxes = saved on submit. Confusion causes real user errors.
18. **Don't use tooltips for content the user must read.** Tooltips dismiss too easily — if information is necessary for task completion, use a popover or inline helper text.
19. **Don't display status with color alone.** Status badges include color + icon + text. "Active" pill is green-bg + check-icon + "Active" text.
20. **Don't ship dark mode as an afterthought.** Every component spec includes dark-mode tokens; every screen mockup is reviewed in both modes before shipping.

## 8. Responsive Behavior

The Baptist SaaS is **desktop-first** (most users on 1280px+ screens) with **first-class mobile support** for patient-facing surfaces and on-call clinical workflows.

### Breakpoints

| Breakpoint | Min Width | Primary Use |
|---|---|---|
| `xs` | 0 | Mobile portrait |
| `sm` | 640px | Mobile landscape, small tablet |
| `md` | 768px | Tablet |
| `lg` | 1024px | Small desktop, large tablet landscape |
| `xl` | 1280px | **Default desktop target** |
| `2xl` | 1536px | Large desktop |

### Layout Responsive Rules

**Sidebar:**
- `lg+`: expanded by default, user can collapse to icon-only
- `md`: collapsed to icon-only by default, user can expand
- Below `md`: hidden, replaced by top-bar hamburger that opens a full-overlay drawer

**Top bar:**
- `lg+`: full top bar with search input expanded
- `md`: search collapses to icon button (opens search modal)
- Below `md`: top bar reduces to logo + hamburger + user avatar; search activates from hamburger

**Content area:**
- `xl+`: max-width 1440px, centered with horizontal padding
- `lg`: full-width with 24px horizontal padding
- `md`: full-width with 16px horizontal padding
- Below `md`: full-width with 12px horizontal padding

**Tables:**
- `lg+`: full table with all columns
- `md`: hide low-priority columns (configurable per table)
- Below `md`: collapse to card list — each row becomes a stacked card with `[primary field — h4][secondary fields — label-sm + value]` layout

**Forms:**
- `md+`: two-column field layout where appropriate (e.g., First Name + Last Name)
- Below `md`: all fields stack to single column

**Modals:**
- `md+`: standard centered modal at spec'd max-width
- Below `md`: modals slide up from bottom, full-width, with safe-area-inset-bottom respected

### Touch Targets

All interactive elements meet **minimum 44×44px** touch targets, with **48px preferred** for mobile-primary surfaces (patient-facing portals, on-call clinical apps). This exceeds WCAG 2.5.5's floor with margin for older adults and stressed/fatigued users.

### Mobile-Specific Patterns

- **Patient header** on mobile: stacks below top bar, avatar+name on row 1, MRN+DOB+badges on row 2, scrolls horizontally for additional metadata
- **Data tables** collapse to card lists (see above) — never horizontal-scroll except for power-user opt-in
- **Persistent CTA**: bottom-pinned action bar (e.g., "Save Changes," "Submit Order") instead of top-aligned, within thumb reach
- **Bottom sheet** modal pattern for short forms (4 fields or fewer), slide up from bottom

## 9. Agent Prompt Guide

Reusable prompts for Claude Design, Claude Code, or any AI coding agent.

### Master System Primer

```
You are designing a SaaS application for Baptist Memorial Health Care
Corporation. Use the design tokens from the imported DESIGN.md. This is
a HIPAA-conscious healthcare SaaS, not a marketing site.

Visual fundamentals:
- Clinical calm: predictable layouts, restrained color, generous whitespace
  where it serves comprehension, dense tabular grids where data efficiency
  matters.
- Inter for all UI text; Montserrat only for display-size headings (>30px)
  in marketing-style contexts; JetBrains Mono for IDs/timestamps/code.
- Tabular numerals on every numeric column.
- One primary button per visual section.
- Color + icon + text for every status (accessibility + healthcare safety).
- 44×44 minimum touch targets; 48×48 preferred on mobile.
- All PHI containers wrapped with the phi-container pattern.
- Demo data uses obviously-fake names — no real PHI in mockups.
- Light + dark mode both first-class; verify designs in both.
- Default cards are flat with borders, not shadowed.
- Brand yellow #febe10 is RESTRICTED to marketing — never in-app.

Never generate generic AI-healthcare aesthetic (DNA helixes, glowing neon,
isometric 3D medical scenes, pastel gradients, stock-photo abstractions).
Empty-state illustrations are simple geometric shapes in primary-200 + cyan-200.

Consult the Don'ts section of DESIGN.md when in doubt.
```

### App Shell Prompt

```
Design the standard Baptist SaaS application shell.
- Top bar 56px: logo left, global search input (cmd+K trigger) expanding
  max-width 480px, quick action icons, notification bell with badge,
  help menu, user avatar dropdown
- Left sidebar 240px expanded (56px collapsed): workspace switcher at top,
  primary nav tree with label-xs uppercase section headers, settings + user
  account pinned at bottom, collapse toggle
- Content area: max-width 1440px, 24px horizontal/vertical padding
- Sidebar: surface-subtle background, active items use primary-50 background
  with 3px primary-500 left border, label-md text
- All text Inter. No marketing components anywhere in the shell.
- Render in both light AND dark mode.
```

### Dashboard Page Prompt

```
Design a Baptist clinical operations dashboard page.
- Page header: h1 "Operations Dashboard" + breadcrumb above + date range
  picker + export button on the right
- Row 1 — Metric cards (4 across, 24px gap):
  - Active Patients [2,847] ↑ 12% sparkline
  - Bed Occupancy [87%] → 0% sparkline
  - Avg ER Wait [22 min] ↓ 8% sparkline
  - Pending Discharges [34] ↑ 5% sparkline
  - Each card uses display-sm Montserrat for the number, label-xs uppercase
    label, delta pill in success or error state
- Row 2 — Two-column 6/6:
  - Left: Admissions trend line chart (last 30 days)
  - Right: Department capacity table (department, occupied, capacity, %)
- Row 3 — Full-width:
  - Recent Activity audit log table with timestamp, actor, action, resource
- All numbers tabular-nums. All cards flat with border-default border.
- Default density. Light mode rendering.
```

### Data Table Prompt

```
Design a patient roster data table for Baptist clinicians.
- Toolbar: search input left, [Filter v] [Columns v] [Density v] middle,
  primary "Add Patient" button right
- Columns: checkbox | Patient (avatar 24px + name link) | MRN (code-sm) |
  DOB (with age) | Status (badge) | Last Visit (relative + tooltip) |
  Assigned Provider | Actions (icon buttons revealed on hover)
- Header: surface-subtle background, label-sm color text-secondary,
  sortable columns show chevron icon
- Row: 12px 16px padding (default density), border-bottom border-subtle,
  hover background neutral-50, selected background primary-50
- Numeric cells right-aligned with tabular-nums
- MRN column uses JetBrains Mono code-sm in text-secondary
- Status badges: Active (success), Pending (warning), Inactive (neutral)
- Demo data: 8 rows with fake names (Patient A, Patient B, Test Subject 1,
  etc.) — NEVER use real-sounding patient names in mockups
- Empty state: geometric illustration + "No patients found" + clear-filters
  link + add-patient primary button
- Pagination footer: row count + per-page selector + page navigation
- Render in both light AND dark mode
```

### Patient Detail Page Prompt

```
Design a Baptist patient detail page.
- Patient header banner (sticky on scroll): avatar 48px + name h2 + MRN
  code-md + DOB/age/sex/insurance badges + RED allergies badge if present +
  trailing action buttons [Edit] [Print] [Share]
- Below header: horizontal tabs (Summary | Visits | Labs | Medications |
  Documents | Billing)
- Summary tab content:
  - Two-column 8/4 layout
  - Left (8 cols): Vitals card, Active diagnoses card, Recent encounters
    timeline
  - Right (4 cols): Care team card with stacked avatars, Next appointment
    card, Insurance card
- All medical data wrapped in phi-container pattern (phi-tint background,
  3px phi-accent left border, "PHI" badge)
- Use demo data: "Patient X" name, MRN "MRN-DEMO-001," fake dates
- Light mode primary render, dark mode secondary
```

### Settings Page Prompt

```
Design a Baptist SaaS settings page (account/preferences pattern).
- Layout: left settings nav rail (4 cols) + content area (8 cols)
- Settings nav rail: vertical nav with sections (Profile, Security,
  Notifications, Preferences, Sessions, API Keys), active item highlighted
- Content area: card-based sections, each with:
  - h3 section title + body-sm description + optional [Edit] tertiary button
  - Form fields stacked
  - "Save Changes" primary button at bottom-right, "Cancel" secondary beside
- Switches for immediate-effect settings (notification toggles)
- Checkboxes for settings saved on submit (preference checkboxes)
- Sessions section shows active sessions list with device, location,
  last active, revoke icon-button
```

### Onboarding Wizard Prompt

```
Design a 4-step new-user onboarding wizard.
- Modal max-width-lg (720px), centered overlay
- Step indicator at top: 4 circles with connecting lines, current step
  larger and primary-500-filled with white center dot, completed steps
  filled primary-500 with white check, future steps empty with neutral-300
  border, step labels below circles in label-sm
- Step 1: Welcome (display-md Montserrat headline, body-lg description,
  illustration centered)
- Step 2: Profile (form fields: full name, role dropdown, department)
- Step 3: Preferences (notification switches, density selector)
- Step 4: Done (success checkmark illustration, "Get started" primary CTA)
- Footer always present: [« Back] [Skip optional]  spacer  [Continue »]
- Cannot dismiss until completed (no x close button)
```

### Empty State Prompt

```
Design an empty state for a Baptist SaaS data view.
Variants needed:
1. No data yet (first-time): geometric illustration 120px in primary-200 +
   cyan-200, h3 "Get started by adding your first patient", body-md
   text-secondary description, primary button "Add Patient"
2. No results from filter: same illustration palette but different shape,
   h3 "No results match your filters", body-md description with clickable
   "clear all filters" link, primary button position empty (focus on
   filter clearing)
3. No permissions: lock icon 24px text-tertiary, body-md text-secondary
   "You don't have permission to view this content", tertiary button
   "Request access"
4. Error: alert-triangle icon 24px error-500, h3 "Something went wrong",
   body-md description, secondary button "Try again", tertiary button
   "Contact support"
- All illustrations are flat geometric shapes — never DNA, never glowing
  medical imagery, never stock photography
```

### Login Page Prompt

```
Design the Baptist SaaS login page.
- Full-viewport, NOT inside the app shell
- Two-column 6/6 desktop, single-column mobile
- Left column: white background, centered content max-width 400px:
  - Baptist logo (blue horizontal, 200px wide) top
  - h1 "Welcome back" in Inter weight 600
  - body-lg text-secondary subtitle
  - Email field, password field with show/hide toggle, "Forgot password"
    tertiary link
  - "Sign in" primary button (size lg, full-width)
  - Divider with "or"
  - "Sign in with SSO" secondary button (full-width)
  - Bottom: "Don't have access? Contact your administrator." in body-sm
- Right column: primary-800 (#01305e) deep navy background with subtle
  decorative pattern — a single faint scattered-diamond cluster in primary-700
  bottom-right corner at 30% opacity. Centered white text testimonial or
  brand statement, h4 + body-md
- Mobile: single column, navy panel becomes a slim header bar with logo
- This is a marketing-adjacent surface — Montserrat display-lg permitted
  for the brand panel headline
```

---

## Token Cross-Reference Notes

- Components reference colors via semantic tokens (`{semantic-light.text-primary}`) — never raw scale tokens. This is what makes light + dark swap automatic.
- The `motifs` section is restricted: marketing motifs (scattered-diamonds, pin-dots) MUST NOT appear inside the app shell. SaaS-only motifs (empty-state-geometric, data-grid-watermark) are the only decorations permitted inside the app.
- All shadows use `rgba(15, 31, 46, ...)` — deep navy-tinted neutral, not pure black.
- All focus rings use `rgba(0, 86, 153, 0.20)` — brand-tinted, 3px width.

## Production Implementation Notes

- **Recommended stack:** Next.js (App Router) + Tailwind CSS + shadcn/ui (override defaults with Baptist tokens) + Radix UI primitives for accessibility
- **Font loading:** Use `next/font/google` for Inter, Montserrat, and JetBrains Mono with `display: 'swap'` and preload weights 400, 500, 600
- **Dark mode:** `class` strategy on root html element, persisted to localStorage and synced to OS preference
- **Icon library:** Lucide React (consistent stroke-width, healthcare-appropriate iconography) — never use multiple icon libraries
- **Animation library:** Framer Motion for complex transitions; native CSS for hover/focus/active states
- **State management:** TanStack Query for server state, Zustand for client UI state
- **Form validation:** Zod schemas + React Hook Form
- **A11y testing:** axe-core in CI, manual screen-reader testing per release
