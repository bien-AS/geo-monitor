import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ThemeToggle } from "@/components/theme-toggle";

vi.mock("next-themes", () => ({
  useTheme: () => ({
    setTheme: vi.fn(),
    resolvedTheme: "light",
  }),
}));

describe("ThemeToggle", () => {
  it("renders toggle button with aria label", () => {
    render(<ThemeToggle />);
    const button = screen.getByLabelText("Toggle light/dark theme");
    expect(button).toBeDefined();
  });

  it("contains sun and moon icons", () => {
    render(<ThemeToggle />);
    const button = screen.getByLabelText("Toggle light/dark theme");
    expect(button.querySelector(".lucide-sun")).toBeTruthy();
    expect(button.querySelector(".lucide-moon")).toBeTruthy();
  });
});
