"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icons } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { useRole, ROLE_LABEL } from "./role-store";
import { useCurrentUser } from "@/hooks/use-user";
import { LocationSelector, slugFromPathname, type LocationNavItem } from "./location-selector";

interface NavEntry {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: (slug: string | null) => string;
  scoped: boolean;
  /** pathname prefixes (after /locations/[slug]) that mark this item active */
  match: (pathname: string, slug: string | null) => boolean;
}

/**
 * R-Pass IA (decision #29): the LOCAL lane is the product — every location
 * carries its own content, actions, reports and runs. SYSTEM is account
 * plumbing. ADMIN·AGENCY holds the fleet rollups and agency tools.
 */
const LOCAL_NAV: NavEntry[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: Icons.dashboard,
    href: () => "/local",
    scoped: false,
    match: (p) => p === "/local" || p.startsWith("/local/"),
  },
  {
    key: "overview",
    label: "Overview",
    icon: Icons.building,
    href: (s) => `/locations/${s}`,
    scoped: true,
    match: (p, s) => p === `/locations/${s}`,
  },
  {
    key: "geo-grid",
    label: "Geo-Grid",
    icon: Icons.map,
    href: (s) => `/locations/${s}/geo-grid`,
    scoped: true,
    match: (p, s) => p.startsWith(`/locations/${s}/geo-grid`),
  },
  {
    key: "keywords",
    label: "Keywords",
    icon: Icons.tags,
    href: (s) => `/locations/${s}/keywords`,
    scoped: true,
    match: (p, s) => p.startsWith(`/locations/${s}/keywords`),
  },
  {
    key: "gbp-health",
    label: "GBP Health",
    icon: Icons.clipboardCheck,
    href: (s) => `/locations/${s}/gbp-health`,
    scoped: true,
    match: (p, s) => p.startsWith(`/locations/${s}/gbp-health`),
  },
  {
    key: "citations",
    label: "Citations & NAP",
    icon: Icons.listChecks,
    href: (s) => `/locations/${s}/citations`,
    scoped: true,
    match: (p, s) =>
      p.startsWith(`/locations/${s}/citations`) || p.startsWith(`/locations/${s}/nap`),
  },
  {
    key: "reviews",
    label: "Reviews",
    icon: Icons.messageSquare,
    href: (s) => `/locations/${s}/reviews`,
    scoped: true,
    match: (p, s) => p.startsWith(`/locations/${s}/reviews`),
  },
  {
    key: "posts",
    label: "Posts",
    icon: Icons.calendarDays,
    href: (s) => `/locations/${s}/posts`,
    scoped: true,
    match: (p, s) => p.startsWith(`/locations/${s}/posts`),
  },
  {
    key: "local-ai",
    label: "Local AI",
    icon: Icons.sparkles,
    href: (s) => `/locations/${s}/local-ai`,
    scoped: true,
    match: (p, s) => p.startsWith(`/locations/${s}/local-ai`),
  },
  {
    key: "competitive",
    label: "Competitive",
    icon: Icons.swords,
    href: (s) => `/locations/${s}/competitive`,
    scoped: true,
    match: (p, s) => p.startsWith(`/locations/${s}/competitive`),
  },
  {
    key: "paa-studio",
    label: "PAA Studio",
    icon: Icons.blog,
    href: (s) => `/locations/${s}/paa-studio`,
    scoped: true,
    match: (p, s) => p.startsWith(`/locations/${s}/paa-studio`),
  },
  {
    key: "action-center",
    label: "Action Center",
    icon: Icons.listTodo,
    href: (s) => `/locations/${s}/action-center`,
    scoped: true,
    match: (p, s) => p.startsWith(`/locations/${s}/action-center`),
  },
  {
    key: "reports",
    label: "Reports",
    icon: Icons.fileText,
    href: (s) => `/locations/${s}/reports`,
    scoped: true,
    match: (p, s) => p.startsWith(`/locations/${s}/reports`),
  },
  {
    key: "runs",
    label: "Runs",
    icon: Icons.history,
    href: (s) => `/locations/${s}/runs`,
    scoped: true,
    match: (p, s) => p.startsWith(`/locations/${s}/runs`),
  },
  {
    key: "profile",
    label: "Location Profile",
    icon: Icons.bookUser,
    href: (s) => `/locations/${s}/profile`,
    scoped: true,
    match: (p, s) => p.startsWith(`/locations/${s}/profile`) || p.startsWith(`/locations/${s}/kb`),
  },
];

const SYSTEM_NAV: NavEntry[] = [
  {
    key: "notifications",
    label: "Notifications",
    icon: Icons.bell,
    href: () => "/system/notifications",
    scoped: false,
    match: (p) => p.startsWith("/system/notifications"),
  },
  {
    key: "settings",
    label: "Settings",
    icon: Icons.settings,
    href: () => "/settings",
    scoped: false,
    match: (p) => p === "/settings",
  },
  {
    key: "users",
    label: "Users & roles",
    icon: Icons.usersGroup,
    href: () => "/settings/users",
    scoped: false,
    match: (p) => p.startsWith("/settings/users"),
  },
  {
    key: "learn",
    label: "Learning Hub",
    icon: Icons.graduationCap,
    href: () => "/learn",
    scoped: false,
    match: (p) => p.startsWith("/learn"),
  },
];

const ADMIN_NAV: NavEntry[] = [
  {
    key: "fleet-action-center",
    label: "Fleet Action Center",
    icon: Icons.listTodo,
    href: () => "/action-center",
    scoped: false,
    match: (p) => p.startsWith("/action-center"),
  },
  {
    key: "fleet-reports",
    label: "Fleet Reports",
    icon: Icons.fileText,
    href: () => "/system/reports",
    scoped: false,
    match: (p) => p.startsWith("/system/reports"),
  },
  {
    key: "fleet-runs",
    label: "Fleet Runs",
    icon: Icons.history,
    href: () => "/system/runs",
    scoped: false,
    match: (p) => p.startsWith("/system/runs"),
  },
  {
    key: "spot-check",
    label: "Spot Check",
    icon: Icons.flask,
    href: () => "/tools/spot-check",
    scoped: false,
    match: (p) => p.startsWith("/tools/spot-check"),
  },
  {
    key: "costs",
    label: "Costs",
    icon: Icons.wallet,
    href: () => "/admin/costs",
    scoped: false,
    match: (p) => p.startsWith("/admin/costs"),
  },
];

function NavItem({
  entry,
  slug,
  defaultSlug,
  pathname,
}: {
  entry: NavEntry;
  slug: string | null;
  defaultSlug: string;
  pathname: string;
}) {
  const outOfScope = entry.scoped && !slug;
  const active = !outOfScope && entry.match(pathname, slug);
  const Icon = entry.icon;

  return (
    <Link
      href={entry.href(slug ?? defaultSlug)}
      title={
        outOfScope
          ? "Opens the first location (A–Z) — switch locations any time from the selector above"
          : undefined
      }
      className={cn(
        "relative flex h-9 items-center gap-2.5 rounded-md px-3 text-[13px] font-medium transition-colors",
        active
          ? "bg-sidebar-active text-white"
          : outOfScope
            ? "text-sidebar-foreground/55 hover:text-sidebar-foreground hover:bg-white/10"
            : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-white/10",
      )}
    >
      {active && (
        <span
          aria-hidden
          className="bg-sidebar-accent absolute inset-y-1 left-0 w-[3px] rounded-r"
        />
      )}
      <Icon className="size-4 shrink-0" />
      <span className="truncate">{entry.label}</span>
    </Link>
  );
}

export function Sidebar({ locations }: { locations: LocationNavItem[] }) {
  const pathname = usePathname();
  const slug = slugFromPathname(pathname);
  const role = useRole();
  const user = useCurrentUser();

  const defaultSlug = React.useMemo(
    () =>
      [...locations].sort((a, b) => a.name.localeCompare(b.name))[0]?.slug ??
      "belhaven-primary-care",
    [locations],
  );

  const renderGroup = (entries: NavEntry[]) => (
    <div className="flex flex-col gap-0.5">
      {entries.map((entry) => (
        <NavItem
          key={entry.key}
          entry={entry}
          slug={slug}
          defaultSlug={defaultSlug}
          pathname={pathname}
        />
      ))}
    </div>
  );

  return (
    <aside
      aria-label="Primary navigation"
      className="border-sidebar-border bg-sidebar fixed inset-y-0 top-14 left-0 z-40 hidden w-60 flex-col border-r md:flex"
    >
      <div className="p-3">
        <LocationSelector locations={locations} />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        <p className="eyebrow text-sidebar-muted px-3 pt-2 pb-1.5">Local</p>
        {renderGroup(LOCAL_NAV)}

        <p className="eyebrow text-sidebar-muted px-3 pt-5 pb-1.5">System</p>
        {renderGroup(SYSTEM_NAV)}

        {role === "operator" && (
          <>
            <p className="eyebrow text-sidebar-muted px-3 pt-5 pb-1.5">Admin · agency</p>
            {renderGroup(ADMIN_NAV)}
          </>
        )}
      </nav>

      <div className="border-sidebar-border border-t p-3">
        <div className="flex items-center gap-2.5">
          <span className="bg-primary-500 flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white">
            {user?.initials ?? "??"}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sidebar-foreground truncate text-[13px] font-semibold">
              {user?.name ?? "Unknown"}
            </p>
            <span
              className={cn(
                "eyebrow mt-0.5 inline-block rounded-full px-2 py-px",
                role === "operator"
                  ? "bg-primary-500 text-white"
                  : "text-primary-800 bg-neutral-300",
              )}
            >
              {ROLE_LABEL[role]}
            </span>
          </div>
          <form
            action="/api/auth/signout"
            method="post"
          >
            <button
              type="submit"
              aria-label="Sign out"
              className="text-sidebar-muted hover:text-sidebar-foreground flex size-8 items-center justify-center rounded-md transition-colors hover:bg-white/10"
            >
              <Icons.logOut className="size-4" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
