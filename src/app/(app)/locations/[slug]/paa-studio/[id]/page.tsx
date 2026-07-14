"use client";

import { useParams, notFound } from "next/navigation";
import { useMemo } from "react";
import { DASHBOARD_LOCATIONS } from "@/lib/data/fixtures";
import type { BaptistLocation } from "@/lib/data/types";
import type { PaaLocationCtx } from "@/lib/paa-articles";
import { PaaEditorResolver } from "@/components/screens/paa-studio/paa-editor-resolver";

function serviceLabel(facilityType: string | undefined): string {
  if (!facilityType) return "primary care";
  return facilityType
    .replace(/^specialty_/, "")
    .replace(/_/g, " ")
    .replace(/\bent\b/i, "ENT")
    .replace(/\bmfm\b/i, "maternal-fetal medicine")
    .replace(/\bpmr\b/i, "physical medicine & rehabilitation");
}

export default function PaaArticlePage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const id = typeof params.id === "string" ? params.id : "";

  const data = useMemo(() => {
    const locations = DASHBOARD_LOCATIONS as BaptistLocation[];
    const location = locations.find((l) => l.slug === slug);
    if (!location) return null;

    const locationCtx: PaaLocationCtx = {
      slug,
      name: location.name,
      shortName: location.name.split(" - ")[1] ?? location.name,
      city: location.city,
      state: location.state,
      service: serviceLabel(location.facility_type),
      domain: location.domain ?? null,
      rating: location.rating ?? null,
    };

    return { locationCtx };
  }, [slug]);

  if (!data) notFound();

  return (
    <PaaEditorResolver
      slug={slug}
      id={id}
      fixtureArticle={null}
      modelByArticleId={{}}
      modelByQuery={{}}
      locationCtx={data.locationCtx}
    />
  );
}
