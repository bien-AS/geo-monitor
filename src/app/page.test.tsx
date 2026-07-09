import { describe, it, expect } from "vitest";
import Home from "./page";

describe("Home page", () => {
  it("redirects to /local", () => {
    expect(() => Home()).toThrow();
  });
});
