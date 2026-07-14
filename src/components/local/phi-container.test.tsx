import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PHIContainer } from "@/components/local/phi-container";

describe("PHIContainer", () => {
  it("renders a labeled region with the default sr-only label and children", () => {
    render(<PHIContainer>Patient review text</PHIContainer>);
    const region = screen.getByRole("region", { name: "Protected health information" });
    expect(region).toBeDefined();
    expect(
      screen.getByText("Patient-generated content — handle as potentially containing PHI"),
    ).toBeDefined();
    expect(screen.getByText("Patient review text")).toBeDefined();
  });

  it("renders a custom sr-only label when provided", () => {
    render(<PHIContainer label="Custom PHI notice">Content</PHIContainer>);
    expect(screen.getByText("Custom PHI notice")).toBeDefined();
  });
});
