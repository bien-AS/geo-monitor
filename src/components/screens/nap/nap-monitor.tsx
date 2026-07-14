"use client";

import * as React from "react";
import type { CitationRow, DataSource } from "@/lib/data/types";
import { MonitorTable } from "./monitor-table";
import { DriftQueue } from "./drift-queue";
import { DriftDetailSheet } from "./drift-detail-sheet";
import type { DriftItem, DriftStatus } from "./lib";

export function NAPMonitor({
  slug,
  locationName,
  rows,
  items,
  fixtureSource,
}: {
  slug: string;
  locationName: string;
  rows: CitationRow[];
  items: DriftItem[];
  fixtureSource: DataSource | null;
}) {
  const [overrides, setOverrides] = React.useState<Record<string, DriftStatus>>({});
  const [selectedKey, setSelectedKey] = React.useState<string | null>(null);

  const effective = React.useMemo(
    () => items.map((i) => (overrides[i.key] ? { ...i, status: overrides[i.key] } : i)),
    [items, overrides],
  );

  const driftByDomain = React.useMemo(() => {
    const map = new Map<string, DriftItem[]>();
    for (const item of effective) {
      const list = map.get(item.domain) ?? [];
      list.push(item);
      map.set(item.domain, list);
    }
    return map;
  }, [effective]);

  const selected = effective.find((i) => i.key === selectedKey) ?? null;

  return (
    <>
      <MonitorTable
        rows={rows}
        driftByDomain={driftByDomain}
        fixtureSource={fixtureSource}
        onView={setSelectedKey}
      />
      <DriftQueue
        items={effective}
        onView={setSelectedKey}
      />
      <DriftDetailSheet
        item={selected}
        slug={slug}
        locationName={locationName}
        onOpenChange={(open) => {
          if (!open) setSelectedKey(null);
        }}
        onQueued={(key) => setOverrides((prev) => ({ ...prev, [key]: "fix_queued" }))}
      />
    </>
  );
}
