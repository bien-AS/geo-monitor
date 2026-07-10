"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Icons } from "@/lib/icons";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { pathForLocation, shortLocationName, slugFromPathname } from "@/lib/location-names";

export { pathForLocation, shortLocationName, slugFromPathname };

export interface LocationNavItem {
  slug: string;
  name: string;
  city: string;
}

export function LocationSelector({
  locations,
  variant = "sidebar",
}: {
  locations: LocationNavItem[];
  variant?: "sidebar" | "banner";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  const currentSlug = slugFromPathname(pathname);
  const current = locations.find((l) => l.slug === currentSlug) ?? null;

  const isSidebar = variant === "sidebar";

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label="Select location scope"
          className={cn(
            "flex w-full items-center gap-2 rounded-md border px-3 py-2 text-left text-[13px] font-medium transition-colors",
            isSidebar
              ? "text-sidebar-foreground border-white/15 bg-white/5 hover:bg-white/10"
              : "border-border-emphasis bg-card text-foreground hover:bg-secondary",
          )}
        >
          <Icons.mapPin
            className={cn("size-4 shrink-0", isSidebar ? "text-cyan-400" : "text-primary-500")}
          />
          <span className="min-w-0 flex-1 truncate">
            {current ? shortLocationName(current.name) : "All locations"}
          </span>
          <Icons.chevronsUpDown
            className={cn(
              "size-3.5 shrink-0",
              isSidebar ? "text-sidebar-foreground/70" : "text-text-tertiary",
            )}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[280px] p-0"
        align="start"
      >
        <Command>
          <CommandInput placeholder="Search locations…" />
          <CommandList>
            <CommandEmpty>No location found.</CommandEmpty>
            <CommandGroup heading="Scope">
              <CommandItem
                value="all-locations"
                onSelect={() => {
                  setOpen(false);
                  router.push("/local");
                }}
              >
                <Icons.check
                  className={cn("size-4", current === null ? "opacity-100" : "opacity-0")}
                />
                All locations
              </CommandItem>
            </CommandGroup>
            <CommandGroup heading="Locations">
              {locations.map((loc) => (
                <CommandItem
                  key={loc.slug}
                  value={`${loc.name} ${loc.city}`}
                  onSelect={() => {
                    setOpen(false);
                    router.push(
                      current ? pathForLocation(pathname, loc.slug) : `/locations/${loc.slug}`,
                    );
                  }}
                >
                  <Icons.check
                    className={cn(
                      "size-4",
                      current?.slug === loc.slug ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span className="min-w-0 flex-1 truncate">{shortLocationName(loc.name)}</span>
                  <span className="text-text-tertiary text-xs">{loc.city}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
