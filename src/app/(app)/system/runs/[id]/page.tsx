"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { RunDetail } from "@/components/screens/runs/run-detail";
import { useRunDetail } from "@/hooks/use-runs";

export default function RunDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading, error } = useRunDetail(id);

  if (isLoading) {
    return (
      <div className="flex max-w-4xl flex-col gap-6">
        <div className="skeleton h-10 w-full rounded-lg" />
        <div className="skeleton h-20 w-full rounded-lg" />
        <div className="skeleton h-40 w-full rounded-lg" />
        <div className="skeleton h-60 w-full rounded-lg" />
      </div>
    );
  }

  if (error || !data) {
    notFound();
  }

  return <RunDetail run={data} />;
}
