import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SourceBadge } from "@/components/local/source-badge";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useUserStore } from "@/store/user";

function renderBadge(source: Parameters<typeof SourceBadge>[0]["source"]) {
  return render(
    <TooltipProvider>
      <SourceBadge source={source} />
    </TooltipProvider>,
  );
}

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

describe("SourceBadge", () => {
  it("renders nothing for the client-viewer role", () => {
    setRole("client-viewer");
    const { container } = renderBadge("searchatlas");
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing for synthetic source, even as operator", () => {
    setRole("operator");
    const { container } = renderBadge("synthetic");
    expect(container.firstChild).toBeNull();
  });

  it("renders the Search Atlas label for operator + searchatlas", () => {
    setRole("operator");
    renderBadge("searchatlas");
    expect(screen.getByText("Live · Search Atlas")).toBeDefined();
  });

  it("renders the DataForSEO label for operator + dataforseo", () => {
    setRole("operator");
    renderBadge("dataforseo");
    expect(screen.getByText("Live · DataForSEO")).toBeDefined();
  });
});
