import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SurfaceDotStrip } from "@/components/screens/spot-check/surface-dot-strip";
import { SURFACES } from "@/lib/surfaces";
import type { DotStatus } from "@/components/screens/spot-check/spot-check-data";

describe("SurfaceDotStrip", () => {
  it("renders one dot per surface, defaulting to not-run when a status is missing", () => {
    render(<SurfaceDotStrip statuses={{}} />);
    for (const s of SURFACES) {
      expect(screen.getByTitle(`${s.name}: not run`)).toBeDefined();
    }
  });

  it("labels a cited surface as Baptist cited", () => {
    const statuses: Record<string, DotStatus> = { chatgpt: "us" };
    render(<SurfaceDotStrip statuses={statuses} />);
    expect(screen.getByTitle("ChatGPT: Baptist cited")).toBeDefined();
  });

  it("labels a partial surface and a competitor-only surface distinctly", () => {
    const statuses: Record<string, DotStatus> = { gemini: "partial", claude: "competitor" };
    render(<SurfaceDotStrip statuses={statuses} />);
    expect(screen.getByTitle("Gemini: partial (via directory)")).toBeDefined();
    expect(screen.getByTitle("Claude: competitor-only")).toBeDefined();
  });
});
