import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Sidebar } from "@/components/shell/sidebar";
import { type LocationNavItem } from "@/components/shell/location-selector";
import { useUserStore } from "@/store/user";

vi.mock("next/navigation", () => ({
  usePathname: () => "/local",
  useRouter: () => ({ push: vi.fn() }),
}));

const LOCATIONS: LocationNavItem[] = [
  { slug: "baptist-memphis", name: "Baptist Memphis", city: "Memphis, TN" },
  { slug: "baptist-desoto", name: "Baptist DeSoto", city: "Southaven, MS" },
];

describe("Sidebar", () => {
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

  it("renders the sidebar with nav groups", () => {
    render(<Sidebar locations={LOCATIONS} />);

    expect(screen.getByText("Local")).toBeDefined();
    expect(screen.getByText("System")).toBeDefined();
    expect(screen.getByText("Dashboard")).toBeDefined();
  });

  it("shows ADMIN · agency group for operator role", () => {
    render(<Sidebar locations={LOCATIONS} />);
    expect(screen.getByText("Admin · agency")).toBeDefined();
    expect(screen.getByText("Fleet Action Center")).toBeDefined();
    expect(screen.getByText("Costs")).toBeDefined();
  });

  it("hides ADMIN · agency group for client-viewer role", () => {
    useUserStore.setState({
      user: {
        id: "u2",
        name: "Karen W.",
        initials: "KW",
        role: "client-viewer",
        organization: "Baptist Memorial Health Care",
      },
    });

    render(<Sidebar locations={LOCATIONS} />);
    expect(screen.queryByText("Fleet Action Center")).toBeNull();
    expect(screen.queryByText("Costs")).toBeNull();
  });

  it("renders account footer with user initials", () => {
    render(<Sidebar locations={LOCATIONS} />);
    expect(screen.getByText("ZB")).toBeDefined();
    expect(screen.getByText("Zach B.")).toBeDefined();
  });

  it("renders sign out button", () => {
    render(<Sidebar locations={LOCATIONS} />);
    expect(screen.getByLabelText("Sign out")).toBeDefined();
  });

  it("renders SYSTEM nav items", () => {
    render(<Sidebar locations={LOCATIONS} />);
    expect(screen.getByText("Notifications")).toBeDefined();
    expect(screen.getByText("Settings")).toBeDefined();
    expect(screen.getByText("Users & roles")).toBeDefined();
    expect(screen.getByText("Learning Hub")).toBeDefined();
  });

  it("renders LOCAL nav items", () => {
    render(<Sidebar locations={LOCATIONS} />);
    expect(screen.getByText("Dashboard")).toBeDefined();
    expect(screen.getByText("Overview")).toBeDefined();
    expect(screen.getByText("Geo-Grid")).toBeDefined();
    expect(screen.getByText("Keywords")).toBeDefined();
    expect(screen.getByText("GBP Health")).toBeDefined();
    expect(screen.getByText("Citations & NAP")).toBeDefined();
    expect(screen.getByText("Reviews")).toBeDefined();
    expect(screen.getByText("Posts")).toBeDefined();
    expect(screen.getByText("Local AI")).toBeDefined();
  });
});
