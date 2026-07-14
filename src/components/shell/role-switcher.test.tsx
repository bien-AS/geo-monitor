import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { RoleSwitcher } from "@/components/shell/role-switcher";
import { useUserStore } from "@/store/user";

describe("RoleSwitcher", () => {
  it("shows the operator label on the trigger", () => {
    useUserStore.setState({
      user: {
        id: "u1",
        name: "Zach B.",
        initials: "ZB",
        role: "operator",
        organization: "Baptist Memorial Health Care",
      },
    });
    render(<RoleSwitcher />);
    expect(screen.getByLabelText("View as role")).toBeDefined();
    expect(screen.getByText("Operator")).toBeDefined();
  });

  it("shows the client-viewer label on the trigger", () => {
    useUserStore.setState({
      user: {
        id: "u2",
        name: "Karen W.",
        initials: "KW",
        role: "client-viewer",
        organization: "Baptist Memorial Health Care",
      },
    });
    render(<RoleSwitcher />);
    expect(screen.getByText("Baptist Viewer")).toBeDefined();
  });
});
