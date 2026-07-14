import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Topbar } from "@/components/shell/topbar";
import { type LocationNavItem } from "@/components/shell/location-selector";
import { useUserStore } from "@/store/user";

vi.mock("next/navigation", () => ({
  usePathname: () => "/local",
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/components/shell/command-menu", () => ({
  CommandMenu: () => <div data-testid="command-menu" />,
}));

vi.mock("@/components/shell/notification-bell", () => ({
  NotificationBell: ({ items }: { items: unknown[] }) => (
    <div
      data-testid="notification-bell"
      data-items={JSON.stringify(items ?? [])}
    />
  ),
}));

vi.mock("@/components/shell/role-switcher", () => ({
  RoleSwitcher: () => <div data-testid="role-switcher" />,
}));

const LOCATIONS: LocationNavItem[] = [
  { slug: "baptist-memphis", name: "Baptist Memphis", city: "Memphis, TN" },
];

describe("Topbar", () => {
  beforeEach(() => {
    useUserStore.setState({
      user: {
        id: "u1",
        name: "Zach B.",
        initials: "ZB",
        role: "operator",
        organization: "Baptist Memorial Health Care",
      },
    });
  });

  it("renders the Baptist logo", () => {
    render(<Topbar locations={LOCATIONS} />);
    expect(screen.getByAltText("Baptist Memorial Health Care")).toBeDefined();
  });

  it("renders search bar", () => {
    render(<Topbar locations={LOCATIONS} />);
    expect(screen.getByText("Search locations and screens…")).toBeDefined();
  });

  it("renders notification bell", () => {
    render(<Topbar locations={LOCATIONS} />);
    expect(screen.getByTestId("notification-bell")).toBeDefined();
  });

  it("renders theme toggle", () => {
    render(<Topbar locations={LOCATIONS} />);
    expect(screen.getByLabelText("Toggle light/dark theme")).toBeDefined();
  });

  it("renders account avatar with user initials", () => {
    render(<Topbar locations={LOCATIONS} />);
    expect(screen.getByText("ZB")).toBeDefined();
  });

  it("renders the role switcher", () => {
    render(<Topbar locations={LOCATIONS} />);
    expect(screen.getByTestId("role-switcher")).toBeDefined();
  });

  it("renders account menu with user name and organization", () => {
    render(<Topbar locations={LOCATIONS} />);
    const trigger = screen.getByLabelText("Account menu");
    expect(trigger).toBeDefined();
  });
});
