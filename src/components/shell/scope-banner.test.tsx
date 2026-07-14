import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ScopeBanner } from "@/components/shell/scope-banner";
import { type LocationNavItem } from "@/components/shell/location-selector";

vi.mock("next/navigation", () => ({
  usePathname: () => "/locations/baptist-memphis",
  useRouter: () => ({ push: vi.fn() }),
}));

const LOCATIONS: LocationNavItem[] = [
  { slug: "baptist-memphis", name: "Baptist Memphis", city: "Memphis, TN" },
];

describe("ScopeBanner", () => {
  it("renders the module label, location name, and switch-location trigger", () => {
    render(
      <ScopeBanner
        module="Overview"
        locationName="Baptist Memphis"
        locations={LOCATIONS}
      />,
    );
    expect(screen.getByText("Overview")).toBeDefined();
    expect(screen.getByText("Baptist Memphis")).toBeDefined();
    expect(screen.getByText("Switch location")).toBeDefined();
  });

  it("renders last scan text only when the lastScan prop is provided", () => {
    const { rerender } = render(
      <ScopeBanner
        module="Overview"
        locationName="Baptist Memphis"
        locations={LOCATIONS}
      />,
    );
    expect(screen.queryByText(/Last scan/)).toBeNull();

    rerender(
      <ScopeBanner
        module="Overview"
        locationName="Baptist Memphis"
        lastScan="2h ago"
        locations={LOCATIONS}
      />,
    );
    expect(screen.getByText(/Last scan/)).toBeDefined();
  });
});
