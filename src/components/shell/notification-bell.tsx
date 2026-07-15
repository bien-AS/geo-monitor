"use client";

import Link from "next/link";
import { Icons } from "@/lib/icons";
import { useNotificationsStore } from "@/store/notifications";
import { useRole } from "./role-store";

export interface BellItem {
  id: string;
  audience: "all" | "operator";
}

export function NotificationBell({ items }: { items: BellItem[] }) {
  const role = useRole();
  const readIds = useNotificationsStore((s) => s.readIds);

  const unread = items.filter(
    (n) => (n.audience === "all" || role === "operator") && !readIds.includes(n.id),
  ).length;

  return (
    <Link
      href="/system/notifications"
      aria-label={`Notifications — ${unread} unread`}
      className="relative flex size-9 items-center justify-center rounded-md transition-colors hover:bg-white/10"
    >
      <Icons.bell className="text-sidebar-foreground size-[18px]" />
      {unread > 0 && (
        <span className="bg-error-500 absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 font-mono text-[10px] leading-none font-bold text-white">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </Link>
  );
}
