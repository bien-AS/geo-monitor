import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ResponseCard } from "@/components/screens/spot-check/response-card";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useUserStore } from "@/store/user";
import { surfaceById } from "@/lib/surfaces";
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

const chatgpt = surfaceById("chatgpt")!;

const citedResult: SpotResult = {
  surface: "chatgpt",
  cited: true,
  sourceCited: "baptistmedicalclinic.org",
  citedDomains: ["baptistmedicalclinic.org", "healthgrades.com"],
  snippet: "Baptist appears among the top recommended options.",
  checkedAt: "2026-07-10T00:00:00Z",
  cost: 0.015,
  source: "dataforseo",
  real: true,
  responseMs: 8000,
};

function renderCard(overrides: Partial<Parameters<typeof ResponseCard>[0]> = {}) {
  setRole("operator");
  return render(
    <TooltipProvider>
      <ResponseCard
        surface={chatgpt}
        result={citedResult}
        aiModeOff={false}
        onRerunWithAIMode={vi.fn()}
        onOpenFull={vi.fn()}
        {...overrides}
      />
    </TooltipProvider>,
  );
}

describe("ResponseCard", () => {
  it("renders a dim not-run card when there is no result", () => {
    renderCard({ result: undefined });
    expect(screen.getByText("Not run")).toBeDefined();
    expect(screen.getByText(/was not selected for this spot check/)).toBeDefined();
  });

  it("offers a re-run link only when aiModeOff is true and there's no result", () => {
    const onRerun = vi.fn();
    renderCard({ result: undefined, aiModeOff: true, onRerunWithAIMode: onRerun });
    fireEvent.click(screen.getByText(/Re-run with AI Mode/));
    expect(onRerun).toHaveBeenCalled();
  });

  it("shows the Cited pill and citation chips for a cited result", () => {
    renderCard();
    expect(screen.getByText("Cited")).toBeDefined();
    expect(screen.getByText("baptistmedicalclinic.org")).toBeDefined();
    expect(screen.getByText("healthgrades.com")).toBeDefined();
  });

  it("shows Partial for a partial result and Not cited for a false result", () => {
    const { rerender } = renderCard({ result: { ...citedResult, cited: "partial" } });
    expect(screen.getByText("Partial")).toBeDefined();
    rerender(
      <TooltipProvider>
        <ResponseCard
          surface={chatgpt}
          result={{ ...citedResult, cited: false }}
          aiModeOff={false}
          onRerunWithAIMode={vi.fn()}
          onOpenFull={vi.fn()}
        />
      </TooltipProvider>,
    );
    expect(screen.getByText("Not cited")).toBeDefined();
  });

  it("shows 'Simulated' instead of a SourceBadge when the result isn't real", () => {
    renderCard({ result: { ...citedResult, real: false, source: "synthetic" } });
    expect(screen.getByText("Simulated")).toBeDefined();
  });

  it("calls onOpenFull with the surface id when 'View full response' is clicked", () => {
    const onOpenFull = vi.fn();
    renderCard({ onOpenFull });
    fireEvent.click(screen.getByText(/View full response/));
    expect(onOpenFull).toHaveBeenCalledWith("chatgpt");
  });
});
