export const fonts = {
  display: "Montserrat, var(--font-inter), Arial, Helvetica, sans-serif",
  body: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  mono: "JetBrains Mono, 'SF Mono', Menlo, Monaco, 'Courier New', monospace",
} as const;

export const typeScale = {
  displayXl: { font: "display", size: "3.75rem", weight: 700, lineHeight: 1.1 },
  displayLg: { font: "display", size: "2.5rem", weight: 700, lineHeight: 1.15 },
  displayMd: { font: "display", size: "2rem", weight: 600, lineHeight: 1.2 },
  displaySm: { font: "display", size: "1.5rem", weight: 600, lineHeight: 1.25 },
  h1: { font: "display", size: "1.375rem", weight: 700, lineHeight: 1.25 },
  h2: { font: "display", size: "1.125rem", weight: 600, lineHeight: 1.3 },
  h3: { font: "display", size: "1rem", weight: 600, lineHeight: 1.35 },
  bodyLg: { font: "body", size: "1rem", weight: 400, lineHeight: 1.6 },
  bodyMd: { font: "body", size: "0.875rem", weight: 400, lineHeight: 1.55 },
  bodySm: { font: "body", size: "0.8125rem", weight: 400, lineHeight: 1.5 },
  data: { font: "mono", size: "0.8125rem", weight: 500, tabular: true },
  codeSm: { font: "mono", size: "0.75rem", weight: 400 },
  eyebrow: {
    font: "display",
    size: "0.6875rem",
    weight: 600,
    uppercase: true,
    letterSpacing: "0.05em",
  },
} as const;

export type TypeToken = keyof typeof typeScale;
