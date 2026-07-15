import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotificationsScreen } from "@/components/screens/notifications/notifications-screen";
import { useNotificationsStore } from "@/store/notifications";
import { useUserStore } from "@/store/user";
import type { AppNotification } from "@/lib/data/types";

vi.mock("next/navigation", () => ({
  usePathname: () => "/system/notifications",
  useRouter: () => ({ push: vi.fn() }),
}));

const NOTIFICATIONS: AppNotification[] = [
  {
    id: "n-1",
    kind: "rank_drop",
    severity: "warning",
    title: "Rank drop — Baptist Memphis",
    body: "Lost average positions since the last scan.",
    ts: "2026-07-15T09:00:00Z",
    href: "/locations/baptist-memphis/geo-grid",
    location_slug: "baptist-memphis",
    audience: "all",
    source: "synthetic",
  },
  {
    id: "n-2",
    kind: "review",
    severity: "info",
    title: "2 reviews need replies",
    body: "New reviews are waiting in the queue.",
    ts: "2026-07-14T09:00:00Z",
    href: "/locations/baptist-memphis/reviews",
    location_slug: "baptist-memphis",
    audience: "all",
    source: "synthetic",
  },
  {
    id: "n-3",
    kind: "run",
    severity: "error",
    title: "Run failed — AI spot check",
    body: "Provider calls timed out.",
    ts: "2026-07-13T09:00:00Z",
    href: "/system/runs/run-006",
    location_slug: "baptist-desoto",
    audience: "operator",
    source: "synthetic",
  },
];

describe("NotificationsScreen", () => {
  beforeEach(() => {
    useNotificationsStore.setState({ readIds: [] });
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

  it("renders all notifications by default", () => {
    render(<NotificationsScreen notifications={NOTIFICATIONS} />);
    expect(screen.getByText("Rank drop — Baptist Memphis")).toBeDefined();
    expect(screen.getByText("2 reviews need replies")).toBeDefined();
    expect(screen.getByText("Run failed — AI spot check")).toBeDefined();
  });

  it("narrows the list when a filter pill is selected", () => {
    render(<NotificationsScreen notifications={NOTIFICATIONS} />);
    fireEvent.click(screen.getByText("Reviews"));
    expect(screen.getByText("2 reviews need replies")).toBeDefined();
    expect(screen.queryByText("Rank drop — Baptist Memphis")).toBeNull();
  });

  it("hides operator-only notifications for the client-viewer role", () => {
    useUserStore.setState({
      user: {
        id: "u2",
        name: "Karen W.",
        initials: "KW",
        role: "client-viewer",
        organization: "Baptist Memorial Health Care",
      },
    });
    render(<NotificationsScreen notifications={NOTIFICATIONS} />);
    expect(screen.queryByText("Run failed — AI spot check")).toBeNull();
  });

  it("marking all read populates the store with every visible id", () => {
    render(<NotificationsScreen notifications={NOTIFICATIONS} />);
    fireEvent.click(screen.getByRole("button", { name: "Mark all read" }));
    expect(useNotificationsStore.getState().readIds).toEqual(
      expect.arrayContaining(["n-1", "n-2", "n-3"]),
    );
  });

  it("shows the empty state when a filter has no matches", () => {
    render(<NotificationsScreen notifications={[NOTIFICATIONS[0]!]} />);
    fireEvent.click(screen.getByText("NAP"));
    expect(screen.getByText("Nothing here — this filter has no notifications.")).toBeDefined();
  });
});
