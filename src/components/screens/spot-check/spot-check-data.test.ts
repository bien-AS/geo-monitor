import { describe, it, expect } from "vitest";
import { surfaceById } from "@/lib/surfaces";
import {
  hashStr,
  simulateSpotResult,
  replaySpotResult,
  dotStatusFor,
  fmtLatency,
  type EvidenceResult,
} from "@/components/screens/spot-check/spot-check-data";

describe("hashStr", () => {
  it("is deterministic for the same input", () => {
    expect(hashStr("memphis|tn|best orthopedic surgeon near me|chatgpt")).toBe(
      hashStr("memphis|tn|best orthopedic surgeon near me|chatgpt"),
    );
  });

  it("returns different hashes for different inputs", () => {
    expect(hashStr("memphis|tn|x|chatgpt")).not.toBe(hashStr("memphis|tn|y|chatgpt"));
  });
});

describe("simulateSpotResult", () => {
  const surface = surfaceById("chatgpt")!;

  it("is deterministic — same inputs always produce the same result", () => {
    const a = simulateSpotResult("Memphis", "TN", "best orthopedic surgeon near me", surface);
    const b = simulateSpotResult("Memphis", "TN", "best orthopedic surgeon near me", surface);
    expect(a.cited).toBe(b.cited);
    expect(a.sourceCited).toBe(b.sourceCited);
    expect(a.citedDomains).toEqual(b.citedDomains);
    expect(a.snippet).toBe(b.snippet);
    expect(a.responseMs).toBe(b.responseMs);
  });

  it("is case- and whitespace-insensitive on city/state/prompt", () => {
    const a = simulateSpotResult("Memphis", "TN", "Best Orthopedic Surgeon", surface);
    const b = simulateSpotResult(" memphis ", " tn ", " best orthopedic surgeon ", surface);
    expect(a.cited).toBe(b.cited);
    expect(a.citedDomains).toEqual(b.citedDomains);
  });

  it("marks simulated results as not real and synthetic-sourced", () => {
    const result = simulateSpotResult("Oxford", "MS", "urgent care vs primary care", surface);
    expect(result.real).toBe(false);
    expect(result.source).toBe("synthetic");
    expect(result.surface).toBe("chatgpt");
  });

  it("cites baptistmedicalclinic.org whenever cited === true", () => {
    const hits = Array.from({ length: 50 }, (_, i) =>
      simulateSpotResult("Memphis", "TN", `prompt-${i}`, surface),
    ).filter((r) => r.cited === true);
    expect(hits.length).toBeGreaterThan(0);
    for (const r of hits) {
      expect(r.sourceCited).toBe("baptistmedicalclinic.org");
      expect(r.citedDomains).toContain("baptistmedicalclinic.org");
    }
  });
});

describe("replaySpotResult", () => {
  it("maps a baked evidence row onto a real SpotResult", () => {
    const evidence: EvidenceResult = {
      prompt: "best orthopedic surgeon near me",
      surface: "chatgpt",
      cited: true,
      source_cited: "baptistmedicalclinic.org",
      snippet: "Baptist appears in the response.",
      checked_at: "2026-07-10",
      cost: 0.015,
      source: "dataforseo",
    };
    const result = replaySpotResult(evidence);
    expect(result.real).toBe(true);
    expect(result.cited).toBe(true);
    expect(result.sourceCited).toBe("baptistmedicalclinic.org");
    expect(result.citedDomains).toEqual(["baptistmedicalclinic.org"]);
    expect(result.source).toBe("dataforseo");
    expect(result.checkedAt).toBe("2026-07-10");
  });

  it("produces no cited domains when source_cited is null", () => {
    const evidence: EvidenceResult = {
      prompt: "emergency room wait times",
      surface: "gemini",
      cited: false,
      source_cited: null,
      snippet: "No Baptist mention.",
      checked_at: "2026-07-10",
      cost: 0.015,
      source: "dataforseo",
    };
    expect(replaySpotResult(evidence).citedDomains).toEqual([]);
  });

  it("is deterministic for the same evidence row", () => {
    const evidence: EvidenceResult = {
      prompt: "cardiology specialist Baptist hospital",
      surface: "claude",
      cited: "partial",
      source_cited: "healthgrades.com",
      snippet: "Mentioned in passing.",
      checked_at: "2026-07-10",
      cost: 0.015,
      source: "dataforseo",
    };
    expect(replaySpotResult(evidence).responseMs).toBe(replaySpotResult(evidence).responseMs);
  });
});

describe("dotStatusFor", () => {
  it("returns notrun for an undefined result", () => {
    expect(dotStatusFor(undefined)).toBe("notrun");
  });

  it("returns us for cited === true", () => {
    const surface = surfaceById("chatgpt")!;
    const result = simulateSpotResult("Memphis", "TN", "best orthopedic surgeon near me", surface);
    expect(dotStatusFor({ ...result, cited: true })).toBe("us");
  });

  it("returns partial for cited === 'partial'", () => {
    const surface = surfaceById("chatgpt")!;
    const result = simulateSpotResult("Memphis", "TN", "best orthopedic surgeon near me", surface);
    expect(dotStatusFor({ ...result, cited: "partial" })).toBe("partial");
  });

  it("returns competitor for cited === false", () => {
    const surface = surfaceById("chatgpt")!;
    const result = simulateSpotResult("Memphis", "TN", "best orthopedic surgeon near me", surface);
    expect(dotStatusFor({ ...result, cited: false })).toBe("competitor");
  });
});

describe("fmtLatency", () => {
  it("formats milliseconds as m:ss", () => {
    expect(fmtLatency(8000)).toBe("0:08");
    expect(fmtLatency(65000)).toBe("1:05");
    expect(fmtLatency(0)).toBe("0:00");
  });
});
