/**
 * The 6 AI citation surfaces — canonical taxonomy.
 *
 * Two structurally distinct categories, grouped 4 + 2 with a 12px category
 * divider wherever surfaces render side by side. Chatbot SOV and Google
 * Search AI SOV are NEVER averaged together.
 *
 * Surface-rendering components iterate over SURFACES — never hardcode 6.
 * Surface hexes are third-party brand colors, exempt from Baptist token translation.
 */

export type SurfaceCategory = "chatbot" | "search-feature";

export interface AISurface {
  id: string;
  name: string;
  glyph: string;
  color: string;
  soft: string;
  dark: string;
  /** Category B surfaces share Google's color; they differ by mark. */
  mark?: "summary-bars" | "chat-bubble-sparkle";
  category: SurfaceCategory;
  /** Per-call cost in USD — a first-class UX affordance, never hidden. */
  cost: number;
}

export const SURFACES: readonly AISurface[] = [
  {
    id: "perplexity",
    name: "Perplexity",
    glyph: "PER",
    color: "#20B8CD",
    soft: "#E6F7FA",
    dark: "#147A8B",
    category: "chatbot",
    cost: 0.015,
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    glyph: "GPT",
    color: "#0F9F7A",
    soft: "#E6F5F0",
    dark: "#0A7558",
    category: "chatbot",
    cost: 0.015,
  },
  {
    id: "gemini",
    name: "Gemini",
    glyph: "GEM",
    color: "#9168C0",
    soft: "#F1ECF7",
    dark: "#6E47A0",
    category: "chatbot",
    cost: 0.015,
  },
  {
    id: "claude",
    name: "Claude",
    glyph: "CLA",
    color: "#D97757",
    soft: "#FBEDE6",
    dark: "#B95A3D",
    category: "chatbot",
    cost: 0.015,
  },
  {
    id: "ai-overviews",
    name: "AI Overviews",
    glyph: "AIO",
    color: "#4285F4",
    soft: "#EEF3FE",
    dark: "#1A65D8",
    mark: "summary-bars",
    category: "search-feature",
    cost: 0.005,
  },
  {
    id: "ai-mode",
    name: "AI Mode",
    glyph: "AIM",
    color: "#4285F4",
    soft: "#EEF3FE",
    dark: "#1A65D8",
    mark: "chat-bubble-sparkle",
    category: "search-feature",
    cost: 0.02,
  },
] as const;

export const CHATBOT_SURFACES = SURFACES.filter((s) => s.category === "chatbot");
export const SEARCH_FEATURE_SURFACES = SURFACES.filter((s) => s.category === "search-feature");

export function surfaceById(id: string): AISurface | undefined {
  return SURFACES.find((s) => s.id === id);
}

/** Cost of one prompt-check across a set of surfaces (JetBrains Mono, 3dp). */
export function surfaceMixCost(surfaceIds: string[]): number {
  return surfaceIds.reduce((sum, id) => sum + (surfaceById(id)?.cost ?? 0), 0);
}
