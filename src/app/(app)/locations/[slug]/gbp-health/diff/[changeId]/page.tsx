"use client";

import { useParams, notFound } from "next/navigation";
import { useGBPHealth } from "@/hooks/use-gbp-health";
import { shortLocationName } from "@/lib/location-names";
import { DiffSheet } from "@/components/screens/gbp-health/diff-sheet";

export default function DiffDetailPage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const changeId = typeof params.changeId === "string" ? params.changeId : "";
  const { data, isLoading } = useGBPHealth(slug);

  if (isLoading) {
    return <div className="skeleton h-screen w-full" />;
  }

  if (!data) notFound();

  const change = data.changes.find((c) => c.changeId === changeId);
  if (!change) notFound();

  const fieldHistoryCount = data.changes.filter((c) => c.field === change.field).length;

  return (
    <DiffSheet
      change={change}
      slug={slug}
      locationName={shortLocationName(data.location.name)}
      fieldHistoryCount={fieldHistoryCount}
    />
  );
}
