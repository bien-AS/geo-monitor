"use client";

import * as React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams } from "next/navigation";
import { KBScreen } from "@/components/screens/kb/kb-screen";
import { ProfileSectionScreen } from "./profile-screen";
import type { KBVersion } from "@/lib/data/types";
import type { ProfileField, LocationProfileSections } from "@/lib/data/types";
import type { KBGroup } from "@/lib/data/types";

const TABS = [
  { id: "business", label: "Business Details" },
  { id: "brand-voice", label: "Brand & Voice" },
  { id: "audience", label: "Audience" },
  { id: "services-geo", label: "Services & Geography" },
  { id: "compliance", label: "Compliance" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function LocationProfile({
  slug,
  locationName,
  groups,
  seededVersions,
  sections,
}: {
  slug: string;
  locationName: string;
  groups: KBGroup[];
  seededVersions: KBVersion[];
  sections: LocationProfileSections;
}) {
  const params = useSearchParams();
  const initial = (params.get("tab") as TabId) ?? "business";
  const [tab, setTab] = React.useState<TabId>(
    TABS.some((t) => t.id === initial) ? initial : "business",
  );

  return (
    <div className="flex flex-col gap-5">
      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as TabId)}
      >
        <TabsList className="flex-wrap">
          {TABS.map((t) => (
            <TabsTrigger
              key={t.id}
              value={t.id}
            >
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {tab === "business" && (
        <KBScreen
          slug={slug}
          groups={groups}
          seededVersions={seededVersions}
        />
      )}
      {tab === "brand-voice" && (
        <ProfileSectionScreen
          sectionId={`${slug}:brand-voice`}
          title={`Brand & Voice - ${locationName}`}
          intro="How this location sounds in replies, posts, descriptions and articles."
          fields={sections.brandVoice}
        />
      )}
      {tab === "audience" && (
        <ProfileSectionScreen
          sectionId={`${slug}:audience`}
          title={`Audience - ${locationName}`}
          intro="Who this clinic serves - steers keywords, post topics and article briefs."
          fields={sections.audience}
        />
      )}
      {tab === "services-geo" && (
        <ProfileSectionScreen
          sectionId={`${slug}:services-geo`}
          title={`Services & Geography - ${locationName}`}
          intro="What this location offers and the ground it competes on."
          fields={sections.servicesGeo}
        />
      )}
      {tab === "compliance" && (
        <ProfileSectionScreen
          sectionId={`${slug}:compliance`}
          title={`Compliance - ${locationName}`}
          intro="The non-negotiables. Locked rows are structural policy enforced by the PHI gate and lint layers."
          fields={sections.compliance}
        />
      )}
    </div>
  );
}
