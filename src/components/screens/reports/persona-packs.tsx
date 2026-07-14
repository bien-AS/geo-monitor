"use client";

import * as React from "react";
import { toast } from "sonner";
import { Icons } from "@/lib/icons";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/local/status-pill";
import { useAuditLog } from "@/components/local/audit-log-store";
import { useRole } from "@/components/shell/role-store";

export function PersonaPacks({ slug, shortName }: { slug: string; shortName: string }) {
  const role = useRole();
  const addEntry = useAuditLog((s) => s.addEntry);
  const [generating, setGenerating] = React.useState<string | null>(null);

  const packs = [
    {
      id: "seo",
      icon: Icons.analytics,
      title: "SEO pack",
      audience: "For the agency & marketing team",
      contents: [
        "Geo-grid snapshot PDF (all keywords, cycle deltas)",
        "Keyword movement table (range-filtered CSV)",
        "Citations & indexation export (CSV)",
        "AI-visibility evidence (6 surfaces, receipts)",
      ],
    },
    {
      id: "operator",
      icon: Icons.stethoscope,
      title: "Clinic operator pack",
      audience: "For the practice manager - pre-meeting one-pager",
      contents: [
        "This month: rating, new reviews & replies sent",
        "How patients found the profile (views, calls, directions)",
        "Posts published + what's scheduled next",
        "One 'needs your eyes' item from the Action Center",
      ],
    },
  ] as const;

  const generate = (pack: (typeof packs)[number]) => {
    setGenerating(pack.id);
    addEntry({
      actor: role === "operator" ? "Agency Operator" : "Client Admin",
      role: role === "operator" ? "operator" : "client-viewer",
      verb: "create",
      action: `Generated ${pack.title} - ${shortName}`,
      resource: `reports:${slug}:${pack.id}-pack`,
      location_slug: slug,
      detail: "Demo mode - generation simulated.",
    });
    window.setTimeout(() => {
      setGenerating(null);
      toast.success(`${pack.title} ready`, {
        description: `${shortName} - PDF download simulated - filed in this location's report list`,
      });
    }, 1400);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {packs.map((p) => {
        const Icon = p.icon;
        return (
          <Card
            key={p.id}
            className="gap-3 p-5"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <Icon
                  className="text-primary-500 size-4"
                  aria-hidden
                />
                <h2 className="text-[15px] font-semibold">{p.title}</h2>
              </div>
              <StatusPill tone="neutral">{p.id === "seo" ? "Agency" : "Clinic"}</StatusPill>
            </div>
            <p className="text-text-tertiary text-[12.5px]">{p.audience}</p>
            <ul className="flex flex-col gap-1">
              {p.contents.map((c) => (
                <li
                  key={c}
                  className="text-text-secondary flex items-start gap-2 text-[12.5px]"
                >
                  <span
                    aria-hidden
                    className="bg-primary-500 mt-1.5 size-1 shrink-0 rounded-full"
                  />
                  {c}
                </li>
              ))}
            </ul>
            <Button
              size="sm"
              className="mt-1 self-start"
              onClick={() => generate(p)}
              disabled={generating !== null}
            >
              <Icons.download className="size-4" />
              {generating === p.id ? "Generating..." : "Generate now"}
            </Button>
          </Card>
        );
      })}
    </div>
  );
}
