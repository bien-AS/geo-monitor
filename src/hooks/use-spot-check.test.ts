import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useFleetSpotCheck } from "@/hooks/use-spot-check";

describe("useFleetSpotCheck", () => {
  it("returns an evidence index covering every fleet location", () => {
    const { result } = renderHook(() => useFleetSpotCheck());
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.data).toHaveLength(5);
  });

  it("gives each location its 4 baked prompts", () => {
    const { result } = renderHook(() => useFleetSpotCheck());
    for (const location of result.current.data) {
      expect(location.prompts).toHaveLength(4);
      expect(location.prompts).toContain("best orthopedic surgeon near me");
    }
  });

  it("defaults optional result fields instead of leaving them undefined", () => {
    const { result } = renderHook(() => useFleetSpotCheck());
    const memphis = result.current.data.find((l) => l.slug === "baptist-memphis");
    expect(memphis).toBeDefined();
    for (const r of memphis!.results) {
      expect(typeof r.snippet).toBe("string");
      expect(r.checked_at).toBeTruthy();
      expect(typeof r.cost).toBe("number");
      expect(r.source).toBeTruthy();
      expect(r.source_cited === null || typeof r.source_cited === "string").toBe(true);
    }
  });

  it("normalizes each location's domain (no protocol, no www.)", () => {
    const { result } = renderHook(() => useFleetSpotCheck());
    for (const location of result.current.data) {
      if (location.domain) {
        expect(location.domain.startsWith("http")).toBe(false);
        expect(location.domain.startsWith("www.")).toBe(false);
      }
    }
  });
});
