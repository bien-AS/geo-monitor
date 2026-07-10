"use client";

import { Database, FlaskConical, Satellite } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DataSource } from "@/lib/data/types";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useRole } from "@/components/shell/role-store";

/**
 * Data-provenance badge — AS roles ONLY (Zach update #4): client roles see
 * clean data with no provider labels at all. Synthetic rows render no badge
 * for anyone (decision #20); provenance stays in the fixtures' `source` tags.
 */
export function SourceBadge({
  source,
  className,
  note,
}: {
  source: DataSource;
  className?: string;
  note?: string;
}) {
  const role = useRole();
  if (role !== "operator") return null;
  if (source === "synthetic") return null;

  const config = {
    searchatlas: {
      label: "Live · Search Atlas",
      icon: Satellite,
      cls: "bg-accent text-accent-foreground",
      tip: "Real data snapshotted from the Search Atlas API",
    },
    dataforseo: {
      label: "Live · DataForSEO",
      icon: Database,
      cls: "bg-accent text-accent-foreground",
      tip: "Real data snapshotted from the DataForSEO API",
    },
    synthetic: {
      label: "Demo data",
      icon: FlaskConical,
      cls: "bg-secondary text-text-secondary",
      tip: "Synthetic demo data, shaped like the live provider payloads",
    },
  }[source];

  const Icon = config.icon;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            "eyebrow inline-flex items-center gap-1 rounded-full px-2 py-0.5",
            config.cls,
            className,
          )}
        >
          <Icon
            className="size-3"
            aria-hidden
          />
          {config.label}
        </span>
      </TooltipTrigger>
      <TooltipContent>{note ?? config.tip}</TooltipContent>
    </Tooltip>
  );
}
