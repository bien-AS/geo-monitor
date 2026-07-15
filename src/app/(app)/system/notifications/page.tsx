"use client";

import { NotificationsScreen } from "@/components/screens/notifications/notifications-screen";
import { useNotifications } from "@/hooks/use-notifications";

export default function NotificationsPage() {
  const { data, isLoading, error } = useNotifications();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Notifications</h1>
        <p className="text-text-tertiary mt-1 text-[13px]">
          Rank moves, review queues, NAP drift and run outcomes across the fleet
        </p>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-6">
          <div className="skeleton h-12 w-full rounded-lg" />
          <div className="skeleton h-80 w-full rounded-lg" />
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <p className="text-foreground text-lg font-semibold">Failed to load notifications</p>
          <p className="text-text-tertiary text-[13px]">
            {typeof error === "object" && error !== null && "message" in error
              ? String(error.message)
              : "An unknown error occurred"}
          </p>
        </div>
      )}

      {data && <NotificationsScreen notifications={data} />}
    </div>
  );
}
