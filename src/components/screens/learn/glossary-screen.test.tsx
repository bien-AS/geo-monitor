import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { GlossaryScreen } from "@/components/screens/learn/glossary-screen";

describe("GlossaryScreen", () => {
  it("renders every glossary term grouped A–Z", () => {
    render(<GlossaryScreen />);
    expect(screen.getByText("LVI (Local Visibility Index)")).toBeDefined();
    expect(screen.getByText("GeoScan")).toBeDefined();
  });

  it("filters terms by search query", () => {
    render(<GlossaryScreen />);
    fireEvent.change(screen.getByLabelText("Search glossary terms"), {
      target: { value: "NAP" },
    });
    expect(screen.getByText("NAP")).toBeDefined();
    expect(screen.queryByText("GeoScan")).toBeNull();
  });

  it("shows an empty state with a clear-search action when nothing matches", () => {
    render(<GlossaryScreen />);
    fireEvent.change(screen.getByLabelText("Search glossary terms"), {
      target: { value: "zzz-no-match" },
    });
    expect(screen.getByText(/No terms match/)).toBeDefined();
    fireEvent.click(screen.getByText("clear the search"));
    expect(screen.getByText("LVI (Local Visibility Index)")).toBeDefined();
  });

  it("expands a term to reveal its long definition and links on click", () => {
    render(<GlossaryScreen />);
    const header = screen.getByText("LVI (Local Visibility Index)");
    expect(screen.queryByText(/LVI blends nine signals/)).toBeNull();
    fireEvent.click(header);
    expect(screen.getByText(/LVI blends nine signals/)).toBeDefined();
    fireEvent.click(header);
    expect(screen.queryByText(/LVI blends nine signals/)).toBeNull();
  });
});
