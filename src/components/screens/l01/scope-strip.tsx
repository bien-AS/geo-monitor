"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LVI_COMPONENTS } from "@/lib/lvi";

export function FleetScopeStrip({
  locationCount,
  snapshotDate,
}: {
  locationCount: number;
  snapshotDate: string;
}) {
  return (
    <div className="scope-banner bg-neutral-25 dark:bg-surface-muted flex min-h-10 flex-wrap items-center justify-between gap-3 rounded-r-md px-4 py-2">
      <p className="text-text-secondary text-[13px]">
        Viewing <span className="text-foreground font-medium">Local SEO</span> across the Baptist
        fleet · <span className="num">{locationCount}</span> locations · Portfolio LVI
        equal-weighted · Last scan: <span className="num">{snapshotDate}</span>
      </p>
      <Dialog>
        <DialogTrigger className="text-text-link hover:bg-secondary shrink-0 rounded-md px-2 py-1 text-[13px] font-medium">
          LVI methodology
        </DialogTrigger>
        <DialogContent className="max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Local Visibility Index — methodology</DialogTitle>
            <DialogDescription>
              A 9-component weighted composite, 0–100, healthcare-tuned: Review Health, NAP
              Integrity, and Local AI Citation carry elevated weight. Weights sum to exactly 1.00
              and live in one place (lib/lvi.ts).
            </DialogDescription>
          </DialogHeader>
          <div className="divide-border-subtle flex flex-col divide-y">
            {LVI_COMPONENTS.map((c) => (
              <div
                key={c.id}
                className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 py-2"
              >
                <span className="text-foreground text-[13px] font-medium">{c.label}</span>
                <span className="eyebrow text-text-tertiary">{c.module}</span>
                <span className="num text-foreground w-12 text-right text-[13px] font-bold">
                  {(c.weight * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
          <p className="text-text-tertiary text-[12px]">
            Fleet rollup: portfolio LVI = <span className="num">{locationCount}</span>-location
            equal-weight mean. Component sub-scores derive from the DataForSEO / Search Atlas
            snapshot of <span className="num">{snapshotDate}</span>.
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
