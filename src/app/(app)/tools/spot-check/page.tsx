"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useFleetSpotCheck } from "@/hooks/use-spot-check";
import { SpotCheckScreen } from "@/components/screens/spot-check/spot-check-screen";

function SpotCheckPageContent() {
  const searchParams = useSearchParams();
  const { data, isLoading, error } = useFleetSpotCheck();

  return (
    <div className="flex max-w-5xl flex-col gap-6">
      {isLoading && (
        <div className="flex flex-col gap-4">
          <div className="skeleton h-10 w-full rounded-lg" />
          <div className="skeleton h-80 w-full rounded-lg" />
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <p className="text-lg font-semibold">Failed to load spot check</p>
        </div>
      )}

      {data && (
        <SpotCheckScreen
          evidence={data}
          initialLocationSlug={searchParams.get("location") ?? undefined}
          initialPrompt={searchParams.get("prompt") ?? undefined}
        />
      )}
    </div>
  );
}

export default function SpotCheckPage() {
  return (
    <Suspense fallback={<div className="skeleton h-80 w-full rounded-lg" />}>
      <SpotCheckPageContent />
    </Suspense>
  );
}
