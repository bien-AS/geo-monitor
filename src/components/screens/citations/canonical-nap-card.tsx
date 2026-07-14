"use client";

import Link from "next/link";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SourceBadge } from "@/components/local/source-badge";
import { Icons } from "@/lib/icons";
import type { DataSource, NAP } from "@/lib/data/types";

export function CanonicalNapCard({
  canonical,
  source,
  slug,
}: {
  canonical: NAP;
  source: DataSource;
  slug: string;
}) {
  const copy = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Copied to clipboard", { description: `${label}: ${value}` });
    } catch {
      toast.error("Copy failed", { description: "Clipboard unavailable" });
    }
  };

  const fields: Array<{ label: string; value?: string }> = [
    { label: "Name", value: canonical.name },
    { label: "Address", value: canonical.address },
    { label: "Phone", value: canonical.phone },
    { label: "Website", value: canonical.website },
  ];

  return (
    <Card className="border-l-primary-500 gap-4 border-l-[3px] p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="eyebrow text-text-tertiary">Canonical NAP · source of truth</p>
        <SourceBadge source={source} />
      </div>
      <dl className="flex flex-col gap-2">
        {fields
          .filter((f): f is { label: string; value: string } => Boolean(f.value))
          .map((field) => (
            <div
              key={field.label}
              className="border-border bg-neutral-25 dark:bg-surface-muted flex items-center justify-between gap-2 rounded-md border px-3 py-2"
            >
              <div className="min-w-0">
                <dt className="eyebrow text-text-tertiary">{field.label}</dt>
                <dd className="num text-foreground mt-0.5 text-[13px] font-medium break-all">
                  {field.value}
                </dd>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label={`Copy canonical ${field.label.toLowerCase()}`}
                onClick={() => copy(field.label, field.value)}
              >
                <Icons.copy aria-hidden />
              </Button>
            </div>
          ))}
      </dl>
      <div className="border-border-subtle flex flex-wrap items-center justify-between gap-2 border-t pt-3">
        <p className="text-text-tertiary text-[12px]">
          Every directory listing below is diffed field-by-field against this record.
        </p>
        <Button
          asChild
          variant="outline"
          size="sm"
        >
          <Link href={`/locations/${slug}/citations`}>
            NAP monitor tab
            <Icons.arrowRight className="size-3.5" />
          </Link>
        </Button>
      </div>
    </Card>
  );
}
