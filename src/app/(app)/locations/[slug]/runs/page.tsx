"use client";

import { use } from "react";
import { RunsList } from "@/components/screens/runs/runs-list";
import { useLocationRuns } from "@/hooks/use-runs";
import { shortLocationName } from "@/lib/location-names";
import { DASHBOARD_LOCATIONS } from "@/lib/data/fixtures";

export default function LocationRunsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data, isLoading, error } = useLocationRuns(slug);
  const location = DASHBOARD_LOCATIONS.find((l) => l.slug === slug);

  return (
    <div className="flex max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Runs</h1>
        <p className="text-text-tertiary mt-1 text-[13px]">
          Provider jobs that touched {location ? shortLocationName(location.name) : slug} -
          fleet-wide runs included where this location was in scope
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
