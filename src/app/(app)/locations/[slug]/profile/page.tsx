"use client";

import { use } from "react";
import { Suspense } from "react";
import { LocationProfile } from "@/components/screens/profile/location-profile";
import { useLocationProfile } from "@/hooks/use-location-profile";
import { DASHBOARD_LOCATIONS } from "@/lib/data/fixtures";

export default function LocationProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data, isLoading, error } = useLocationProfile(slug);
  const location = DASHBOARD_LOCATIONS.find((l) => l.slug === slug);

  if (isLoading) {
    return (
      <div className="flex max-w-5xl flex-col gap-6">
        <div className="skeleton h-10 w-full rounded-lg" />
        <div className="skeleton h-12 w-full rounded-lg" />
        <div className="skeleton h-60 w-full rounded-lg" />
        <div className="skeleton h-60 w-full rounded-lg" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-lg font-semibold">Failed to load location profile</p>
      </div>
    );
  }

  const { locationName, groups, sections, seededVersions } = data;

  return (
    <div className="flex max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Location Profile</h1>
        <p className="text-text-tertiary mt-1 text-[13px]">
          {location?.name ?? slug} - this location&apos;s own business details, voice and
          guardrails; the grounding behind every draft
        </p>
      </div>
      <Suspense>
        <LocationProfile
          slug={slug}
          locationName={locationName}
          groups={groups}
          seededVersions={seededVersions}
          sections={sections}
        />
      </Suspense>
    </div>
  );
}
