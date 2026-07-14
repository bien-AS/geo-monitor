import Link from "next/link";
import { Icons } from "@/lib/icons";
import { cn } from "@/lib/utils";

export function PostsTabs({ slug, active }: { slug: string; active: "manager" | "calendar" }) {
  const tabs = [
    {
      id: "manager" as const,
      label: "Posts manager",
      href: `/locations/${slug}/posts`,
      icon: Icons.layoutList,
    },
    {
      id: "calendar" as const,
      label: "Calendar",
      href: `/locations/${slug}/posts/calendar`,
      icon: Icons.calendarRange,
    },
  ];
  return (
    <nav
      aria-label="Posts views"
      className="border-border bg-secondary/60 flex w-fit items-center gap-1 rounded-lg border p-1"
    >
      {tabs.map((t) => {
        const Icon = t.icon;
        const isActive = active === t.id;
        return (
          <Link
            key={t.id}
            href={t.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex h-8 items-center gap-1.5 rounded-md px-3 text-[13px] font-medium transition-colors",
              isActive
                ? "border-border bg-card text-foreground border"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon
              className="size-3.5"
              aria-hidden
            />
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
