import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ProgressMiniCard } from "@/components/screens/spot-check/progress-mini-card";
import { surfaceById } from "@/lib/surfaces";
import type { SpotResult } from "@/components/screens/spot-check/spot-check-data";

const chatgpt = surfaceById("chatgpt")!;

const result: SpotResult = {
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

describe("ProgressMiniCard", () => {
  it("shows 'Not selected' when the surface isn't part of the run", () => {
    render(
      <ProgressMiniCard
        surface={chatgpt}
        selected={false}
        phase={undefined}
        result={undefined}
      />,
    );
    expect(screen.getByText("Not selected")).toBeDefined();
  });

  it("shows 'Queued…' when selected but not yet started", () => {
    render(
      <ProgressMiniCard
        surface={chatgpt}
        selected={true}
        phase="pending"
        result={undefined}
      />,
    );
    expect(screen.getByText(/Queued/)).toBeDefined();
  });

  it("shows 'Querying surface…' mid-run", () => {
    render(
      <ProgressMiniCard
        surface={chatgpt}
        selected={true}
        phase="querying"
        result={undefined}
      />,
    );
    expect(screen.getByText(/Querying surface/)).toBeDefined();
  });

  it("shows the response latency once done", () => {
    render(
      <ProgressMiniCard
        surface={chatgpt}
        selected={true}
        phase="done"
        result={result}
      />,
    );
    expect(screen.getByText(/Response/)).toBeDefined();
    expect(screen.getByText("0:08")).toBeDefined();
  });
});
