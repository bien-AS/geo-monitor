"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, ChevronDown, Search, UserRound } from "lucide-react";
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
import { useRole, ROLE_LABEL, type Role } from "./role-store";
import { NotificationBell, type BellItem } from "./notification-bell";
import type { LocationNavItem } from "./location-selector";

const ROLE_DESCRIPTIONS: Record<Role, string> = {
  operator: "Full access — operate and approve",
  "client-viewer": "Read-only — what Baptist sees",
};

export function Topbar({
  locations,
  bellItems = [],
}: {
  locations: LocationNavItem[];
  bellItems?: BellItem[];
}) {
  const [commandOpen, setCommandOpen] = React.useState(false);
  const { role, setRole } = useRole();

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
        <Search className="size-3.5 shrink-0" />
        <span className="flex-1 truncate">Search locations and screens…</span>
        <kbd className="text-sidebar-muted rounded bg-white/10 px-1.5 py-0.5 font-mono text-[11px]">
          ⌘K
        </kbd>
      </button>

      <div className="ml-auto flex shrink-0 items-center gap-1.5">
        <DropdownMenu>
          <DropdownMenuTrigger className="text-sidebar-foreground flex h-9 items-center gap-1.5 rounded-md border border-white/15 bg-white/5 px-2.5 text-[13px] font-medium transition-colors hover:bg-white/10">
            <span
              className={cn(
                "size-2 rounded-full",
                role === "operator" ? "bg-cyan-400" : "bg-neutral-300",
              )}
              aria-hidden
            />
            {ROLE_LABEL[role]}
            <ChevronDown className="text-sidebar-muted size-3.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-64"
          >
            <DropdownMenuLabel>View as role</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {(Object.keys(ROLE_LABEL) as Role[]).map((r) => (
              <DropdownMenuItem
                key={r}
                onSelect={() => setRole(r)}
              >
                <div className="flex-1">
                  <p className="text-[13px] font-medium">{ROLE_LABEL[r]}</p>
                  <p className="text-text-tertiary text-xs">{ROLE_DESCRIPTIONS[r]}</p>
                </div>
                {role === r && <Check className="text-primary size-4" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <NotificationBell items={bellItems} />

        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Account menu"
            className="flex size-9 items-center justify-center rounded-full transition-colors hover:bg-white/10"
          >
            <span className="bg-primary-500 flex size-7 items-center justify-center rounded-full text-[11px] font-semibold text-white">
              AS
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56"
          >
            <DropdownMenuLabel>
              <p className="text-[13px] font-semibold">Agency Operator</p>
              <p className="text-text-tertiary text-xs font-normal">Baptist Memorial Health Care</p>
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
                  <UserRound className="size-4" />
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
