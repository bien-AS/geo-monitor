"use client";

import { use } from "react";
import { ReportsScreen } from "@/components/screens/reports/reports-screen";
import { PersonaPacks } from "@/components/screens/reports/persona-packs";
import { useLocationReports } from "@/hooks/use-reports";

export default function LocationReportsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data, isLoading, error } = useLocationReports(slug);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="skeleton h-12 w-full rounded-lg" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="skeleton h-40 rounded-lg" />
          <div className="skeleton h-40 rounded-lg" />
        </div>
        <div className="skeleton h-80 w-full rounded-lg" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-lg font-semibold">Failed to load reports</p>
      </div>
    );
  }

  const { reports, shortName, locations } = data;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Reports</h1>
        <p className="text-text-tertiary mt-1 text-[13px]">
          Artifacts for {shortName} - audits, snapshots, exports
        </p>
      </div>
      <PersonaPacks
        slug={slug}
        shortName={shortName}
      />
      <ReportsScreen
        reports={reports}
        locations={locations}
      />
    </div>
  );
}
