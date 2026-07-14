import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { CommandMenu } from "@/components/shell/command-menu";

vi.mock("next/navigation", () => ({
  usePathname: () => "/local",
  useRouter: () => ({ push: vi.fn() }),
}));

describe("CommandMenu", () => {
  it("does not render dialog content when closed", () => {
    render(
      <CommandMenu
        open={false}
        onOpenChange={vi.fn()}
        locations={[]}
      />,
    );
    expect(screen.queryByPlaceholderText("Search locations and screens…")).toBeNull();
  });

  it("renders the search input when open", () => {
    render(
      <CommandMenu
        open={true}
        onOpenChange={vi.fn()}
        locations={[]}
      />,
    );
    expect(screen.getByPlaceholderText("Search locations and screens…")).toBeDefined();
  });
});
