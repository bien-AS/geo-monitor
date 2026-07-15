"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/settings", label: "General" },
  { href: "/settings/users", label: "Users & roles" },
];

export function SettingsNav() {
  const pathname = usePathname();
  return (
    <nav
      className="border-border flex gap-1 border-b"
      aria-label="Settings sections"
    >
      {TABS.map((t) => {
        const active =
          t.href === "/settings" ? pathname === "/settings" : pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              "-mb-px border-b-2 px-3 py-2 text-[13.5px] font-medium transition-colors",
              active
                ? "border-primary-500 text-foreground"
                : "text-text-tertiary hover:text-text-secondary border-transparent",
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
