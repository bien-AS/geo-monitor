import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { FullResponseSheet } from "@/components/screens/spot-check/full-response-sheet";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useUserStore } from "@/store/user";
import type { SpotResult } from "@/components/screens/spot-check/spot-check-data";

function setRole(role: "operator" | "client-viewer") {
  useUserStore.setState({
    user: {
      id: "u1",
      name: "Zach B.",
      initials: "ZB",
      role,
      organization: "Baptist Memorial Health Care",
    },
  });
}

const citedResult: SpotResult = {
  surface: "chatgpt",
  cited: true,
  sourceCited: "baptistmedicalclinic.org",
  citedDomains: ["baptistmedicalclinic.org"],
  snippet: "Baptist appears among the top recommended options.",
  checkedAt: "2026-07-10T00:00:00Z",
  cost: 0.015,
  source: "dataforseo",
  real: true,
  responseMs: 8000,
};

function renderSheet(overrides: Partial<Parameters<typeof FullResponseSheet>[0]> = {}) {
  setRole("operator");
  return render(
    <TooltipProvider>
      <FullResponseSheet
        surfaceId="chatgpt"
        result={citedResult}
        prompt="best orthopedic surgeon near me"
        onOpenChange={vi.fn()}
        {...overrides}
      />
    </TooltipProvider>,
  );
}

describe("FullResponseSheet", () => {
  it("renders nothing when there is no surfaceId/result", () => {
    renderSheet({ surfaceId: null, result: undefined });
    expect(screen.queryByText(/response$/)).toBeNull();
  });

  it("renders the surface name, prompt, and cited state when open", () => {
    renderSheet();
    expect(screen.getByText("ChatGPT")).toBeDefined();
    expect(screen.getByText(/best orthopedic surgeon near me/)).toBeDefined();
    expect(screen.getByText("Cited")).toBeDefined();
  });

  it("shows the chatbot methodology blurb for a chatbot surface", () => {
    renderSheet();
    expect(screen.getByText(/provider response endpoints/)).toBeDefined();
  });

  it("shows the search-feature methodology blurb for a search-feature surface", () => {
    renderSheet({
      surfaceId: "ai-overviews",
      result: { ...citedResult, surface: "ai-overviews" },
    });
    expect(screen.getByText(/geolocated SERP/)).toBeDefined();
  });

  it("shows 'Simulated' instead of a SourceBadge for a non-real result", () => {
    renderSheet({ result: { ...citedResult, real: false, source: "synthetic" } });
    expect(screen.getByText("Simulated")).toBeDefined();
  });

  it("omits the cited-sources block when there are no cited domains", () => {
    renderSheet({ result: { ...citedResult, citedDomains: [] } });
    expect(screen.queryByText("Cited sources")).toBeNull();
  });
});
