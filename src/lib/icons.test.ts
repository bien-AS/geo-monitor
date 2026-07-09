import { describe, it, expect } from "vitest";
import { Icons } from "@/lib/icons";

describe("Icon registry", () => {
  it("exports valid lucide components", () => {
    expect(Icons.dashboard).toBeDefined();
    expect(Icons.sun).toBeDefined();
    expect(Icons.moon).toBeDefined();
  });

  it("has all shell navigation icons", () => {
    const required = [
      "dashboard",
      "building",
      "map",
      "tags",
      "clipboardCheck",
      "listChecks",
      "messageSquare",
      "calendarDays",
      "sparkles",
      "swords",
      "blog",
      "listTodo",
      "fileText",
      "history",
      "bookUser",
      "bell",
      "settings",
      "usersGroup",
      "graduationCap",
      "flask",
      "wallet",
      "logOut",
      "search",
      "chevronDown",
      "chevronsUpDown",
      "user",
    ] as const;

    for (const key of required) {
      expect(Icons[key], `missing icon: ${key}`).toBeDefined();
    }
  });

  it("has theme icons", () => {
    expect(Icons.sun).toBeDefined();
    expect(Icons.moon).toBeDefined();
  });
});
