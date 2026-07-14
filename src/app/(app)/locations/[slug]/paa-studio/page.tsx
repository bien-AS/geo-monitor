"use client";

import { useParams, notFound } from "next/navigation";
import { Suspense } from "react";
import { usePaaStudio as usePaaStudioHook } from "@/hooks/use-paa-studio";
import { StudioDashboard } from "@/components/screens/paa-studio/studio-dashboard";

export default function PaaStudioPage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const { data, isLoading, error } = usePaaStudioHook(slug);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="skeleton h-10 w-full rounded-md" />
        <div className="skeleton h-6 w-64 rounded-md" />
        <div className="skeleton h-96 rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <p className="text-muted-foreground">Failed to load PAA Studio data.</p>
        <p className="text-muted-foreground text-[13px]">{error.message}</p>
      </div>
    );
  }

  if (!data) notFound();

  const { ctx, opportunities, fixtureArticles, bakedQueries, pool, modelsByQuery, rivals } = data;

  return (
    <div className="flex max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">PAA Studio</h1>
        <p className="text-text-tertiary mt-1 text-[13px]">
          {data.location.name} — patient questions in, ranked articles and GBP posts out
        </p>
      </div>
      <Suspense>
        <StudioDashboard
          pool={pool}
          modelsByQuery={modelsByQuery}
          ctx={ctx}
          opportunities={opportunities}
          rivals={rivals}
          fixtureArticles={fixtureArticles}
          bakedQueries={bakedQueries}
        />
      </Suspense>
    </div>
  );
}
