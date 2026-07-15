import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CitationSummaryCard } from "@/components/screens/spot-check/citation-summary-card";
import type { SpotResult } from "@/components/screens/spot-check/spot-check-data";

function result(overrides: Partial<SpotResult>): SpotResult {
  return {
    surface: "chatgpt",
    cited: false,
    sourceCited: null,
    citedDomains: [],
    snippet: "",
    checkedAt: "2026-07-10T00:00:00Z",
    cost: 0.015,
    source: "synthetic",
    real: false,
    responseMs: 8000,
    ...overrides,
  };
}

describe("CitationSummaryCard", () => {
  it("computes citation rate and shows Strong when >= 50% cited", () => {
    render(
      <CitationSummaryCard
        domain="baptistmedicalclinic.org"
        results={{
          perplexity: result({ cited: true }),
          chatgpt: result({ cited: true }),
        }}
        selectedIds={new Set(["perplexity", "chatgpt"])}
        briefHref="/tools/spot-check"
      />,
    );
    expect(screen.getByText(/cited in/)).toBeDefined();
    expect(screen.getByText("100%")).toBeDefined();
    expect(screen.getByText("Strong")).toBeDefined();
  });

  it("shows Building when some but under half are cited", () => {
    const { container } = render(
      <CitationSummaryCard
        domain="baptistmedicalclinic.org"
        results={{
          perplexity: result({ cited: "partial", citedDomains: ["healthgrades.com"] }),
          chatgpt: result({ cited: false }),
        }}
        selectedIds={new Set(["perplexity", "chatgpt"])}
        briefHref="/tools/spot-check"
      />,
    );
    expect(screen.getByText("Building")).toBeDefined();
    expect(container.textContent).toContain("1 partial");
  });

  it("shows Absent and a fallback message when nothing is cited or co-cited", () => {
    render(
      <CitationSummaryCard
        domain="baptistmedicalclinic.org"
        results={{ perplexity: result({ cited: false }) }}
        selectedIds={new Set(["perplexity"])}
        briefHref="/tools/spot-check"
      />,
    );
    expect(screen.getByText("Absent")).toBeDefined();
    expect(screen.getByText("No co-cited domains captured.")).toBeDefined();
  });

  it("ranks top co-cited (non-Baptist) domains by frequency", () => {
    render(
      <CitationSummaryCard
        domain="baptistmedicalclinic.org"
        results={{
          perplexity: result({ cited: false, citedDomains: ["healthgrades.com", "webmd.com"] }),
          chatgpt: result({ cited: false, citedDomains: ["healthgrades.com"] }),
        }}
        selectedIds={new Set(["perplexity", "chatgpt"])}
        briefHref="/tools/spot-check"
      />,
    );
    const items = screen.getAllByRole("listitem");
    expect(items[0]?.textContent).toContain("healthgrades.com");
    expect(items[0]?.textContent).toContain("(2 of 2)");
  });
});
