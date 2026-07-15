import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { SpotCheckScreen } from "@/components/screens/spot-check/spot-check-screen";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useUserStore } from "@/store/user";
import { useAuditLog } from "@/components/local/audit-log-store";
import type { EvidenceLocation } from "@/components/screens/spot-check/spot-check-data";

function setRole(role: "operator" | "client-viewer") {
  useUserStore.setState({
    user: {
      id: "u1",
      name: "Zach B.",
      initials: "ZB",
      role,
      organization: "Baptist Memorial Health Care",
    },
  });
}

const PROMPT = "best orthopedic surgeon near me";

const evidence: EvidenceLocation[] = [
  {
    slug: "baptist-memphis",
    name: "Baptist Memorial Hospital - Memphis",
    city: "Memphis",
    state: "TN",
    domain: "baptistmedicalclinic.org",
    prompts: [PROMPT],
    results: [
      {
        prompt: PROMPT,
        surface: "perplexity",
        cited: true,
        source_cited: "baptistmedicalclinic.org",
        snippet: "Baptist appears in the response.",
        checked_at: "2026-07-10",
        cost: 0.015,
        source: "dataforseo",
      },
      {
        prompt: PROMPT,
        surface: "chatgpt",
        cited: true,
        source_cited: "baptistmedicalclinic.org",
        snippet: "Baptist appears in the response.",
        checked_at: "2026-07-10",
        cost: 0.015,
        source: "dataforseo",
      },
      {
        prompt: PROMPT,
        surface: "gemini",
        cited: false,
        source_cited: null,
        snippet: "No Baptist mention.",
        checked_at: "2026-07-10",
        cost: 0.015,
        source: "dataforseo",
      },
      {
        prompt: PROMPT,
        surface: "claude",
        cited: "partial",
        source_cited: "healthgrades.com",
        snippet: "Mentioned briefly.",
        checked_at: "2026-07-10",
        cost: 0.015,
        source: "dataforseo",
      },
      {
        prompt: PROMPT,
        surface: "ai-overviews",
        cited: true,
        source_cited: "baptistmedicalclinic.org",
        snippet: "Baptist appears in the response.",
        checked_at: "2026-07-10",
        cost: 0.005,
        source: "dataforseo",
      },
    ],
  },
];

function renderScreen() {
  setRole("operator");
  useAuditLog.setState({ sessionEntries: [] });
  return render(
    <TooltipProvider>
      <SpotCheckScreen evidence={evidence} />
    </TooltipProvider>,
  );
}

describe("SpotCheckScreen — role gate", () => {
  it("locks the console for the client-viewer role", () => {
    setRole("client-viewer");
    render(
      <TooltipProvider>
        <SpotCheckScreen evidence={evidence} />
      </TooltipProvider>,
    );
    expect(screen.getByText("Agency-only tool")).toBeDefined();
    expect(screen.queryByText("Run a spot check")).toBeNull();
  });

  it("shows the full console for the operator role", () => {
    renderScreen();
    expect(screen.queryByText("Agency-only tool")).toBeNull();
    expect(screen.getByText("Run a spot check")).toBeDefined();
  });
});

describe("SpotCheckScreen — query form", () => {
  it("disables Run until city and prompt minimums are met", () => {
    renderScreen();
    const runButton = screen.getByRole("button", { name: /Run spot check/ });
    expect(runButton.hasAttribute("disabled")).toBe(true);

    fireEvent.change(screen.getByPlaceholderText("e.g. Memphis"), { target: { value: "Memphis" } });
    expect(runButton.hasAttribute("disabled")).toBe(true);

    fireEvent.change(screen.getByPlaceholderText(/best orthopedic surgeon/), {
      target: { value: PROMPT },
    });
    expect(runButton.hasAttribute("disabled")).toBe(false);
  });
});

describe("SpotCheckScreen — run flow", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.scrollTo = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("replays real evidence, appends a session recent-check, and logs an audit entry", () => {
    const { container } = renderScreen();
    fireEvent.change(screen.getByPlaceholderText("e.g. Memphis"), { target: { value: "Memphis" } });
    fireEvent.change(screen.getByPlaceholderText(/best orthopedic surgeon/), {
      target: { value: PROMPT },
    });

    expect(container.textContent).toContain("matches the Baptist Memorial Hospital - Memphis bake");

    fireEvent.click(screen.getByRole("button", { name: /Run spot check/ }));

    act(() => {
      vi.runAllTimers();
    });

    expect(screen.getByText(/Surface responses for/)).toBeDefined();
    expect(container.textContent).toContain("matched the Baptist Memorial Hospital - Memphis bake");
    expect(screen.getByText("This session")).toBeDefined();

    const entries = useAuditLog.getState().sessionEntries;
    expect(entries).toHaveLength(1);
    expect(entries[0]?.detail).toContain(
      "replayed from the Baptist Memorial Hospital - Memphis bake",
    );
  });

  it("simulates deterministically when no baked evidence matches", () => {
    renderScreen();
    fireEvent.change(screen.getByPlaceholderText("e.g. Memphis"), { target: { value: "Oxford" } });
    fireEvent.change(screen.getByPlaceholderText(/best orthopedic surgeon/), {
      target: { value: "urgent care vs primary care" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Run spot check/ }));

    act(() => {
      vi.runAllTimers();
    });

    expect(screen.getByText(/Surface responses for/)).toBeDefined();
    expect(screen.getByText(/deterministic demo-mode simulations/)).toBeDefined();

    const entries = useAuditLog.getState().sessionEntries;
    expect(entries[0]?.detail).toContain("simulated deterministically");
  });

  it("reloads the form and clears results when Re-run is clicked on a recent check", () => {
    renderScreen();
    fireEvent.change(screen.getByPlaceholderText("e.g. Memphis"), { target: { value: "Memphis" } });
    fireEvent.change(screen.getByPlaceholderText(/best orthopedic surgeon/), {
      target: { value: PROMPT },
    });
    fireEvent.click(screen.getByRole("button", { name: /Run spot check/ }));
    act(() => {
      vi.runAllTimers();
    });
    expect(screen.getByText(/Surface responses for/)).toBeDefined();

    fireEvent.click(screen.getAllByText("Re-run")[0]!);

    expect(screen.queryByText(/Surface responses for/)).toBeNull();
    expect((screen.getByPlaceholderText("e.g. Memphis") as HTMLInputElement).value).toBe("Memphis");
  });
});
