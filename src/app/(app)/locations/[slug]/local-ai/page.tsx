"use client";

import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import { useLocalAI } from "@/hooks/use-local-ai";
import { shortLocationName } from "@/lib/location-names";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ScopeBanner } from "@/components/shell/scope-banner";
import { Icons } from "@/lib/icons";
import { LocalAIScreen } from "@/components/screens/local-ai/local-ai-screen";

export default function LocalAIPage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const { data, isLoading, error } = useLocalAI(slug);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="skeleton h-10 w-full rounded-md" />
        <div className="skeleton h-8 w-64 rounded-md" />
        <div className="skeleton h-96 rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <p className="text-muted-foreground">Failed to load Local AI data.</p>
        <p className="text-muted-foreground text-[13px]">{error.message}</p>
      </div>
    );
  }

  if (!data) notFound();

  const { location, shortName, navLocations, prompts, rows, competitors } = data;

  return (
    <div className="flex flex-col gap-6">
      <ScopeBanner
        module="Local AI"
        locationName={location.name}
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
              <Link href={`/locations/${slug}`}>{shortName}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Local AI</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-heading text-foreground text-2xl font-bold tracking-tight">
          Local AI Visibility
        </h1>
        <Badge
          variant="secondary"
          className="text-[12px]"
        >
          <Icons.sparkles className="size-3" />
          <span className="num ml-1">{prompts.length}</span> prompts ·{" "}
          <span className="num">{rows.length}</span> checks
        </Badge>
      </div>

      <LocalAIScreen
        location={location}
        prompts={prompts}
        rows={rows}
        competitors={competitors}
      />
    </div>
  );
}
