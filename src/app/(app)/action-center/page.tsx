"use client";

import { ActionCenterScreen } from "@/components/screens/action-center/action-center-screen";
import { useFleetActionCenter } from "@/hooks/use-action-center";

export default function FleetActionCenterPage() {
  const { data, isLoading, error } = useFleetActionCenter();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Fleet Action Center</h1>
        <p className="text-text-tertiary mt-1 text-[13px]">
          Agency view: every open recommendation across all 5 locations - each location&apos;s own
          Action Center shows just its lane
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
          <p className="text-foreground text-lg font-semibold">Failed to load action center</p>
          <p className="text-text-tertiary text-[13px]">
            {typeof error === "object" && error !== null && "message" in error
              ? String(error.message)
              : "An unknown error occurred"}
          </p>
        </div>
      )}

      {data && <ActionCenterScreen recs={data} />}
    </div>
  );
}
