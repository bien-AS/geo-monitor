import Link from "next/link";
import { cn } from "@/lib/utils";

export function ReviewsTabNav({ slug, active }: { slug: string; active: "inbox" | "trends" }) {
  const tabs = [
    { id: "inbox" as const, label: "Inbox", href: `/locations/${slug}/reviews` },
    { id: "trends" as const, label: "Trends", href: `/locations/${slug}/reviews/trends` },
  ];
  return (
    <nav
      aria-label="Reviews sections"
      className="border-border flex items-center gap-1 border-b"
    >
      {tabs.map((t) => (
        <Link
          key={t.id}
          href={t.href}
          aria-current={active === t.id ? "page" : undefined}
          className={cn(
            "-mb-px border-b-2 px-3 py-2 text-[13px] font-medium transition-colors",
            active === t.id
              ? "border-primary-500 text-foreground"
              : "text-text-secondary hover:text-foreground border-transparent",
          )}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
