"use client";

import { ReportsScreen } from "@/components/screens/reports/reports-screen";
import { useFleetReports } from "@/hooks/use-reports";

export default function FleetReportsPage() {
  const { data, isLoading, error } = useFleetReports();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Fleet Reports</h1>
        <p className="text-text-tertiary mt-1 text-[13px]">
          Agency rollup across all 5 locations - per-location reports live in each location&apos;s
          own Reports lane
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
          <p className="text-lg font-semibold">Failed to load reports</p>
        </div>
      )}

      {data && (
        <ReportsScreen
          reports={data.reports}
          locations={data.locations}
        />
      )}
    </div>
  );
}
