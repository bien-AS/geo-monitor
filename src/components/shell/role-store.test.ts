import { describe, it, expect, beforeEach } from "vitest";
import { useUserStore } from "@/store/user";

describe("useRole (derived from user store)", () => {
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

  it("defaults to operator when user has operator role", () => {
    const user = useUserStore.getState().user;
    expect(user!.role).toBe("operator");
  });

  it("reflects client-viewer when user role changes", () => {
    useUserStore.getState().setUser({
      id: "u2",
      name: "Karen W.",
      initials: "KW",
      role: "client-viewer",
      organization: "Baptist Memorial Health Care",
    });

    const user = useUserStore.getState().user;
    expect(user!.role).toBe("client-viewer");
  });
});
