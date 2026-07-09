import { describe, it, expect, beforeEach } from "vitest";
import { useUserStore } from "@/store/user";

const DEFAULT_USER = {
  id: "u1",
  name: "Zach B.",
  initials: "ZB",
  role: "operator" as const,
  organization: "Baptist Memorial Health Care",
};

describe("useUserStore", () => {
  beforeEach(() => {
    useUserStore.setState({ user: DEFAULT_USER });
  });

  it("initializes with default operator user", () => {
    const user = useUserStore.getState().user;
    expect(user).not.toBeNull();
    expect(user!.name).toBe("Zach B.");
    expect(user!.initials).toBe("ZB");
    expect(user!.role).toBe("operator");
    expect(user!.organization).toBe("Baptist Memorial Health Care");
  });

  it("setUser updates all user fields", () => {
    useUserStore.getState().setUser({
      id: "u2",
      name: "Test User",
      initials: "TU",
      role: "client-viewer",
      organization: "Test Org",
    });

    const user = useUserStore.getState().user!;
    expect(user.id).toBe("u2");
    expect(user.name).toBe("Test User");
    expect(user.initials).toBe("TU");
    expect(user.role).toBe("client-viewer");
    expect(user.organization).toBe("Test Org");
  });

  it("supports null user for logged-out state", () => {
    useUserStore.getState().setUser(null as unknown as typeof DEFAULT_USER);
    expect(useUserStore.getState().user).toBeNull();
  });
});
