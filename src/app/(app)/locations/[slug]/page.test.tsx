import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeAll } from "vitest";
import { TooltipProvider } from "@/components/ui/tooltip";

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

function Wrapper({ children }: { children: React.ReactNode }) {
  return <TooltipProvider>{children}</TooltipProvider>;
}

vi.mock("next/navigation", () => ({
  usePathname: () => "/locations/baptist-memphis",
  useRouter: () => ({ push: vi.fn() }),
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

const useSlug = vi.hoisted(() => {
  let storedSlug = "";
  return {
    set: (slug: string) => {
      storedSlug = slug;
    },
    get: () => storedSlug,
  };
});

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    use: () => ({ slug: useSlug.get() }),
  };
});

const navLocations = [
  { slug: "baptist-memphis", name: "Baptist Memorial Hospital - Memphis", city: "Memphis, TN" },
  {
    slug: "baptist-collierville",
    name: "Baptist Memorial Hospital - Collierville",
    city: "Collierville, TN",
  },
];

vi.mock("@/hooks/use-location-overview", () => ({
  useLocationOverview: (slug: string) => {
    if (slug === "baptist-memphis") {
      return {
        data: {
          location: {
            slug: "baptist-memphis",
            name: "Baptist Memorial Hospital - Memphis",
            city: "Memphis",
            state: "TN",
            cid: "11001",
            place_id: null,
            lat: 35.1375,
            lng: -89.9792,
            listing_type: "facility",
            facility_type: "primary_care",
            rating: { value: 4.2, votes_count: 1240 },
            website: "https://www.baptistmedicalclinic.org/locations/memphis",
            phone: "(901) 226-5000",
            primary_category: "Medical clinic",
            is_claimed: true,
          },
          shortName: "Baptist Memorial Hospital - Memphis",
          lvi: { value: 72, band: "good" as const, delta: 3, components: {}, spark: [] },
          lviSource: "synthetic",
          navLocations,
          gbp: {
            status: "completed",
            score: 12,
            grade: "B",
            gbpScore: 78,
            citationScore: 65,
            verified: true,
            source: "synthetic",
          },
          geo: {
            avgRank: 6.2,
            delta: -0.5,
            top3Pct: 30,
            keywords: 3,
            pins: 300,
            dist: { top: 15, mid: 40, low: 30, out: 15 },
            source: "synthetic",
          },
          citations: {
            present: 50,
            mismatch: 5,
            missing: 14,
            duplicate: 0,
            total: 69,
            source: "synthetic",
          },
          reviews: {
            avg: 4.2,
            total: 1240,
            responseRate: 85,
            unanswered: 3,
            monthlyAvgSpark: [],
            source: "synthetic",
          },
          localAI: {
            chatbotCited: 2,
            chatbotTotal: 4,
            googleCited: 1,
            googleTotal: 2,
            bestSurface: { name: "Perplexity", cited: 2, total: 4 },
            source: "dataforseo",
          },
          competitive: {
            topRival: "Methodist Le Bonheur",
            topRivalWins: 12,
            rivalCount: 3,
            closest: { name: "Regional One Health", mi: 1.5 },
            source: "synthetic",
          },
          keywords: {
            total: 8,
            max: 10,
            scanned: 6,
            top: [
              { keyword: "primary care memphis", avg: 4.2 },
              { keyword: "family doctor memphis tn", avg: 6.8 },
              { keyword: "walk in clinic memphis", avg: 3.1 },
            ],
            source: "synthetic",
          },
          aiStats: [],
          aiSource: "dataforseo",
          attention: [],
          auditCost: {
            gridCells: 100,
            gridCost: 5.0,
            promptCount: 6,
            aiPerPrompt: 0.015,
            aiCost: 0.09,
            total: 5.09,
          },
          portfolioLVI: 64,
          fleetLocationCount: 5,
        },
        isLoading: false,
        error: null as Error | null,
      };
    }
    return { data: null, isLoading: false, error: null as Error | null };
  },
}));

import LocationOverviewPage from "./page";

describe("LocationOverviewPage", () => {
  it("renders the scope banner and heading for a known location", async () => {
    useSlug.set("baptist-memphis");
    render(
      <Wrapper>
        <LocationOverviewPage params={Promise.resolve({ slug: "baptist-memphis" })} />
      </Wrapper>,
    );
    expect(screen.getByText("Overview")).toBeDefined();
    expect(screen.getAllByText("Baptist Memorial Hospital - Memphis").length).toBeGreaterThan(0);
    expect(screen.getByText("Switch location")).toBeDefined();
    expect(
      screen.getByText("Baptist Memorial Hospital - Memphis", { selector: "h1" }),
    ).toBeDefined();
  });

  it("omits the scope banner for an unknown location slug", async () => {
    useSlug.set("nonexistent-slug");
    expect(() => {
      render(
        <Wrapper>
          <LocationOverviewPage params={Promise.resolve({ slug: "nonexistent-slug" })} />
        </Wrapper>,
      );
    }).toThrow("NEXT_NOT_FOUND");
  });
});
