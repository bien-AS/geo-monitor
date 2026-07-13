"use client";

import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import Link from "next/link";
import { useKeywords } from "@/hooks/use-keywords";
import { shortLocationName } from "@/lib/location-names";
import { fmtDate } from "@/lib/format";
import { ScopeBanner } from "@/components/shell/scope-banner";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { KeywordsTracker } from "@/components/screens/keywords/keywords-tracker";

export default function KeywordsPage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const { data, isLoading, error } = useKeywords(slug);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="skeleton h-10 w-full rounded-md" />
        <div className="skeleton h-6 w-64 rounded-md" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="skeleton h-24 rounded-lg"
            />
          ))}
        </div>
        <div className="skeleton h-64 rounded-lg" />
        <div className="skeleton h-96 rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <p className="text-muted-foreground">Failed to load keywords data.</p>
        <p className="text-muted-foreground text-[13px]">{error.message}</p>
      </div>
    );
  }

  if (!data) notFound();

  const navLocations = data.locations.map((l) => ({
    slug: l.slug,
    name: l.name,
    city: l.city,
  }));

  return (
    <div className="flex flex-col gap-6">
      <ScopeBanner
        module="Keywords"
        locationName={data.location.name}
        lastScan={data.lastScan ? fmtDate(data.lastScan) : undefined}
        locations={navLocations}
      />

      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/local">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/locations/${slug}`}>{shortLocationName(data.location.name)}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Keywords</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <KeywordsTracker
        slug={slug}
        locationName={shortLocationName(data.location.name)}
        locationLabel={data.locationLabel}
        maxKeywords={data.maxKeywords}
        rows={data.rows}
      />
    </div>
  );
}
