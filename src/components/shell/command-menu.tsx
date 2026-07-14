"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Icons } from "@/lib/icons";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { shortLocationName, slugFromPathname, type LocationNavItem } from "./location-selector";

const MODULES: Array<{ label: string; suffix: string }> = [
  { label: "Overview", suffix: "" },
  { label: "Geo-Grid", suffix: "/geo-grid" },
  { label: "Keywords", suffix: "/keywords" },
  { label: "GBP Health", suffix: "/gbp-health" },
  { label: "Citations", suffix: "/citations" },
  { label: "NAP", suffix: "/nap" },
  { label: "Reviews", suffix: "/reviews" },
  { label: "Posts", suffix: "/posts" },
  { label: "Local AI", suffix: "/local-ai" },
  { label: "Competitive", suffix: "/competitive" },
  { label: "PAA Studio", suffix: "/paa-studio" },
];

export function CommandMenu({
  open,
  onOpenChange,
  locations,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locations: LocationNavItem[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const slug = slugFromPathname(pathname);
  const current = locations.find((l) => l.slug === slug);

  const go = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Search"
      description="Jump to a screen or location"
    >
      <Command>
        <CommandInput placeholder="Search locations and screens…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Screens">
            <CommandItem onSelect={() => go("/local")}>
              <Icons.dashboard className="size-4" />
              Dashboard
            </CommandItem>
            {current &&
              MODULES.map((m) => (
                <CommandItem
                  key={m.suffix || "overview"}
                  onSelect={() => go(`/locations/${current.slug}${m.suffix}`)}
                >
                  <Icons.building className="size-4" />
                  {m.label}
                  <span className="text-text-tertiary ml-auto text-xs">
                    {shortLocationName(current.name)}
                  </span>
                </CommandItem>
              ))}
            <CommandItem onSelect={() => go("/settings")}>
              <Icons.settings className="size-4" />
              Settings
            </CommandItem>
            <CommandItem onSelect={() => go("/settings/users")}>
              <Icons.usersGroup className="size-4" />
              Users &amp; roles
            </CommandItem>
            <CommandItem onSelect={() => go("/learn")}>
              <Icons.graduationCap className="size-4" />
              Learning Hub
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Locations">
            {locations.map((loc) => (
              <CommandItem
                key={loc.slug}
                value={`${loc.name} ${loc.city}`}
                onSelect={() => go(`/locations/${loc.slug}`)}
              >
                <Icons.mapPin className="size-4" />
                <span className="min-w-0 flex-1 truncate">{shortLocationName(loc.name)}</span>
                <span className="text-text-tertiary text-xs">{loc.city}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
