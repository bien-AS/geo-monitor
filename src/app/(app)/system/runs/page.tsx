"use client";

import { RunsList } from "@/components/screens/runs/runs-list";
import { useFleetRuns } from "@/hooks/use-runs";

export default function FleetRunsPage() {
  const { data, isLoading, error } = useFleetRuns();

  return (
    <div className="flex max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Fleet Runs</h1>
        <p className="text-text-tertiary mt-1 text-[13px]">
          Every provider job across the fleet - each location&apos;s own Runs lane shows just its
          slice
        </p>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-4">
          <div className="skeleton h-10 w-full rounded-lg" />
          <div className="skeleton h-80 w-full rounded-lg" />
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <p className="text-lg font-semibold">Failed to load runs</p>
        </div>
      )}

      {data && <RunsList runs={data} />}
    </div>
  );
}
