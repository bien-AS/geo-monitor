"use client";

import { use } from "react";
import { ActionCenterScreen } from "@/components/screens/action-center/action-center-screen";
import { useLocationActionCenter } from "@/hooks/use-action-center";
import { DASHBOARD_LOCATIONS } from "@/lib/data/fixtures";

export default function LocationActionCenterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { data, isLoading, error } = useLocationActionCenter(slug);
  const location = DASHBOARD_LOCATIONS.find((l) => l.slug === slug);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="skeleton h-12 w-full rounded-lg" />
        <div className="skeleton h-80 w-full rounded-lg" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-lg font-semibold">Failed to load action center</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Action Center</h1>
        <p className="text-text-tertiary mt-1 text-[13px]">
          Open recommendations for {location?.name ?? slug} - evidence attached, one click from the
          fix
        </p>
      </div>
      <ActionCenterScreen recs={data} />
    </div>
  );
}
