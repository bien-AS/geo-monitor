import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { NotificationBell, type BellItem } from "@/components/shell/notification-bell";
import { useUserStore } from "@/store/user";

const ITEMS: BellItem[] = [
  { id: "n1", audience: "all" },
  { id: "n2", audience: "operator" },
  { id: "n3", audience: "all" },
];

describe("NotificationBell", () => {
  it("counts all items as unread for the operator role", () => {
    useUserStore.setState({
      user: {
        id: "u1",
        name: "Zach B.",
        initials: "ZB",
        role: "operator",
        organization: "Baptist Memorial Health Care",
      },
    });
    render(<NotificationBell items={ITEMS} />);
    expect(screen.getByLabelText("Notifications — 3 unread")).toBeDefined();
  });

  it("counts only audience:all items as unread for the client-viewer role", () => {
    useUserStore.setState({
      user: {
        id: "u2",
        name: "Karen W.",
        initials: "KW",
        role: "client-viewer",
        organization: "Baptist Memorial Health Care",
      },
    });
    render(<NotificationBell items={ITEMS} />);
    expect(screen.getByLabelText("Notifications — 2 unread")).toBeDefined();
  });

  it("shows 9+ when unread count exceeds 9", () => {
    useUserStore.setState({
      user: {
        id: "u1",
        name: "Zach B.",
        initials: "ZB",
        role: "operator",
        organization: "Baptist Memorial Health Care",
      },
    });
    const many: BellItem[] = Array.from({ length: 12 }, (_, i) => ({
      id: `n${i}`,
      audience: "all",
    }));
    render(<NotificationBell items={many} />);
    expect(screen.getByText("9+")).toBeDefined();
  });

  it("renders no badge when there are no unread items", () => {
    useUserStore.setState({
      user: {
        id: "u2",
        name: "Karen W.",
        initials: "KW",
        role: "client-viewer",
        organization: "Baptist Memorial Health Care",
      },
    });
    render(<NotificationBell items={[]} />);
    expect(screen.getByLabelText("Notifications — 0 unread")).toBeDefined();
    expect(screen.queryByText("0")).toBeNull();
  });
});
