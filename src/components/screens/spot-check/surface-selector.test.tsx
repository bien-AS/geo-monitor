import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SurfaceSelector } from "@/components/screens/spot-check/surface-selector";
import { SURFACES } from "@/lib/surfaces";

describe("SurfaceSelector", () => {
  it("renders all 6 surfaces grouped as 4 chatbots + 2 search features", () => {
    render(
      <SurfaceSelector
        selected={new Set()}
        onToggle={vi.fn()}
        onPreset={vi.fn()}
      />,
    );
    for (const s of SURFACES) {
      expect(screen.getByText(s.name)).toBeDefined();
    }
  });

  it("marks selected surfaces as pressed", () => {
    render(
      <SurfaceSelector
        selected={new Set(["chatgpt"])}
        onToggle={vi.fn()}
        onPreset={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: /ChatGPT/ }).getAttribute("aria-pressed")).toBe(
      "true",
    );
    expect(screen.getByRole("button", { name: /Gemini/ }).getAttribute("aria-pressed")).toBe(
      "false",
    );
  });

  it("calls onToggle with the surface id when a card is clicked", () => {
    const onToggle = vi.fn();
    render(
      <SurfaceSelector
        selected={new Set()}
        onToggle={onToggle}
        onPreset={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Claude/ }));
    expect(onToggle).toHaveBeenCalledWith("claude");
  });

  it("calls onPreset with the matching id list when a preset is clicked", () => {
    const onPreset = vi.fn();
    render(
      <SurfaceSelector
        selected={new Set()}
        onToggle={vi.fn()}
        onPreset={onPreset}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Chatbots only" }));
    expect(onPreset).toHaveBeenCalledWith(["perplexity", "chatgpt", "gemini", "claude"]);
  });

  it("highlights the preset that exactly matches the current selection", () => {
    render(
      <SurfaceSelector
        selected={new Set(["perplexity", "chatgpt", "gemini", "claude"])}
        onToggle={vi.fn()}
        onPreset={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: "Chatbots only" }).className).toContain(
      "border-primary-500",
    );
    expect(screen.getByRole("button", { name: "All 6" }).className).not.toContain(
      "border-primary-500",
    );
  });
});
