"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Icons } from "@/lib/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { CommandMenu } from "./command-menu";
import { useRole, ROLE_LABEL } from "./role-store";
import { NotificationBell, type BellItem } from "./notification-bell";
import { useCurrentUser } from "@/hooks/use-user";
import type { LocationNavItem } from "./location-selector";

export function Topbar({
  locations,
  bellItems = [],
}: {
  locations: LocationNavItem[];
  bellItems?: BellItem[];
}) {
  const [commandOpen, setCommandOpen] = React.useState(false);
  const role = useRole();
  const user = useCurrentUser();

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="border-sidebar-border bg-sidebar fixed inset-x-0 top-0 z-50 flex h-14 items-center gap-4 border-b px-4">
      <Link
        href="/local"
        className="flex shrink-0 items-center gap-3"
        aria-label="Baptist Local GBP — Dashboard"
      >
        <Image
          src="/brand/Baptist-Logo-White-Horizontal.svg"
          alt="Baptist Memorial Health Care"
          width={150}
          height={28}
          priority
          className="h-6 w-auto"
        />
        <span
          aria-hidden
          className="hidden h-5 w-px bg-white/20 sm:block"
        />
        <span className="eyebrow hidden text-cyan-300 sm:block">Local GBP</span>
      </Link>

      <button
        type="button"
        onClick={() => setCommandOpen(true)}
        className="text-sidebar-muted ml-2 hidden h-9 max-w-[480px] flex-1 items-center gap-2 rounded-md border border-white/15 bg-white/5 px-3 text-left text-[13px] transition-colors hover:bg-white/10 md:flex"
      >
        <Icons.search className="size-3.5 shrink-0" />
        <span className="flex-1 truncate">Search locations and screens…</span>
        <kbd className="text-sidebar-muted rounded bg-white/10 px-1.5 py-0.5 font-mono text-[11px]">
          {typeof window !== "undefined" && window.navigator.platform.includes("Mac")
            ? "⌘K"
            : "Ctrl+K"}
        </kbd>
      </button>

      <div className="ml-auto flex shrink-0 items-center gap-1.5">
        <NotificationBell items={bellItems} />

        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Account menu"
            className="flex size-9 items-center justify-center rounded-full transition-colors hover:bg-white/10"
          >
            <span className="bg-primary-500 flex size-7 items-center justify-center rounded-full text-[11px] font-semibold text-white">
              {user?.initials ?? "??"}
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56"
          >
            <DropdownMenuLabel>
              <p className="text-[13px] font-semibold">{user?.name ?? "Unknown"}</p>
              <p className="text-text-tertiary text-xs font-normal">{user?.organization ?? ""}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <form
              action="/api/auth/signout"
              method="post"
            >
              <DropdownMenuItem asChild>
                <button
                  type="submit"
                  className="w-full"
                >
                  <Icons.user className="size-4" />
                  Sign out
                </button>
              </DropdownMenuItem>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CommandMenu
        open={commandOpen}
        onOpenChange={setCommandOpen}
        locations={locations}
      />
    </header>
  );
}
