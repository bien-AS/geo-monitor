import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { LocationSelector, type LocationNavItem } from "@/components/shell/location-selector";

let mockPathname = "/local";

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({ push: vi.fn() }),
}));

const LOCATIONS: LocationNavItem[] = [
  { slug: "baptist-memphis", name: "Baptist Memphis", city: "Memphis, TN" },
];

describe("LocationSelector", () => {
  it('shows "All locations" and a closed trigger when no location is in scope', () => {
    mockPathname = "/local";
    render(<LocationSelector locations={LOCATIONS} />);
    expect(screen.getByText("All locations")).toBeDefined();
    const trigger = screen.getByLabelText("Select location scope");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("shows the current location name when scoped to a location", () => {
    mockPathname = "/locations/baptist-memphis";
    render(<LocationSelector locations={LOCATIONS} />);
    expect(screen.getByText("Baptist Memphis")).toBeDefined();
  });
});
