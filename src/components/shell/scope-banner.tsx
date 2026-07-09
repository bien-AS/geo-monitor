"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
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
import {
  pathForLocation,
  shortLocationName,
  slugFromPathname,
  type LocationNavItem,
} from "./location-selector";

/**
 * Scope banner (PROJECT_CONTEXT.md §8 translated via 02_SCREEN_MAP.md §3):
 * every location-scoped screen renders this directly under the top bar.
 */
export function ScopeBanner({
  module: moduleLabel,
  locationName,
  lastScan,
  locations,
}: {
  module: string;
  locationName: string;
  lastScan?: string;
  locations: LocationNavItem[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const currentSlug = slugFromPathname(pathname);

  return (
    <div className="scope-banner border-border bg-neutral-25 dark:bg-surface-muted -mx-6 -mt-6 mb-6 flex min-h-10 items-center justify-between gap-3 border-b px-6 py-2">
      <p className="text-text-secondary min-w-0 truncate text-[13px]">
        Viewing <span className="text-foreground font-medium">{moduleLabel}</span> for{" "}
        <span className="text-foreground font-medium">{shortLocationName(locationName)}</span>
        {lastScan ? (
          <>
            {" "}
            · Last scan: <span className="num">{lastScan}</span>
          </>
        ) : null}
      </p>
      <DropdownMenu>
        <DropdownMenuTrigger className="text-text-link hover:bg-secondary flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-[13px] font-medium">
          Switch location
          <Icons.chevronDown className="size-3.5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="max-h-80 w-72 overflow-y-auto"
        >
          <DropdownMenuLabel>Switch location</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {locations.map((loc) => (
            <DropdownMenuItem
              key={loc.slug}
              onSelect={() => router.push(pathForLocation(pathname, loc.slug))}
            >
              <Icons.check
                className={cn(
                  "size-4 shrink-0",
                  currentSlug === loc.slug ? "opacity-100" : "opacity-0",
                )}
              />
              <span className="min-w-0 flex-1 truncate">{shortLocationName(loc.name)}</span>
              <span className="text-text-tertiary text-xs">{loc.city}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
