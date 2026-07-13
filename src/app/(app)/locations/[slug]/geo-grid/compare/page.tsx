"use client";

import { useSearchParams, useParams } from "next/navigation";
import { useGeoGrid } from "@/hooks/use-geo-grid";
import { GeoGridCompareScreen } from "@/components/screens/geo-grid/compare-screen";
import { Card } from "@/components/ui/card";

export default function GeoGridComparePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const { data, isLoading, error } = useGeoGrid(slug);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Card className="animate-pulse items-center gap-3 p-12" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col gap-6">
        <Card className="items-center gap-3 p-12 text-center">
          <h3 className="text-base font-semibold">Location not found</h3>
          <p className="text-muted-foreground text-[13px]">
            The requested location could not be loaded.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <GeoGridCompareScreen
      location={data.location}
      grids={data.grids}
      locations={data.locations}
      initialKeyword={searchParams.get("kw") ?? undefined}
      initialA={searchParams.get("a") ?? undefined}
      initialB={searchParams.get("b") ?? undefined}
    />
  );
}
