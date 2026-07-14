import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import LocationOverviewPage from "./page";

vi.mock("next/navigation", () => ({
  usePathname: () => "/locations/baptist-memphis",
  useRouter: () => ({ push: vi.fn() }),
}));

describe("LocationOverviewPage", () => {
  it("renders the scope banner and heading for a known location", async () => {
    render(await LocationOverviewPage({ params: Promise.resolve({ slug: "baptist-memphis" }) }));
    expect(screen.getByText("Overview", { selector: "h1" })).toBeDefined();
    expect(screen.getByText("Baptist Memorial Hospital - Memphis")).toBeDefined();
    expect(screen.getByText("Switch location")).toBeDefined();
  });

  it("omits the scope banner for an unknown location slug", async () => {
    render(await LocationOverviewPage({ params: Promise.resolve({ slug: "nonexistent-slug" }) }));
    expect(screen.getByText("Overview", { selector: "h1" })).toBeDefined();
    expect(screen.queryByText("Switch location")).toBeNull();
  });
});
