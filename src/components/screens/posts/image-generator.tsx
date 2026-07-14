"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Icons } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { PostType } from "@/lib/data/types";

const PALETTES = [
  { bg: "#005699", accent: "#7DB8E8", fg: "#FFFFFF", label: "Baptist blue" },
  { bg: "#EEF3FE", accent: "#005699", fg: "#0A3A66", label: "Soft sky" },
  { bg: "#0A3A66", accent: "#4FA3E0", fg: "#FFFFFF", label: "Deep navy" },
] as const;

const TYPE_MOTIF: Record<string, string> = {
  whats_new: "clinic announcement",
  event: "community event",
  offer: "service highlight",
  health_observance: "health guidance",
  provider_announcement: "provider announcement",
  screening: "screening reminder",
};

function svgVariant(
  postType: PostType,
  title: string,
  shortName: string,
  variant: number,
): { uri: string; label: string } {
  const p = PALETTES[variant % PALETTES.length];
  const motif = TYPE_MOTIF[postType] ?? "announcement";
  const safeTitle = (title || motif).replace(/[<>&"]/g, "").slice(0, 42);
  const safeName = shortName.replace(/[<>&"]/g, "").slice(0, 32);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="338" viewBox="0 0 600 338">
  <rect width="600" height="338" fill="${p.bg}"/>
  <circle cx="500" cy="60" r="110" fill="${p.accent}" opacity="0.25"/>
  <circle cx="60" cy="300" r="80" fill="${p.accent}" opacity="0.18"/>
  <g transform="translate(48,64)">
    <rect x="18" y="0" width="20" height="56" rx="4" fill="${p.accent}"/>
    <rect x="0" y="18" width="56" height="20" rx="4" fill="${p.accent}"/>
  </g>
  <text x="48" y="196" font-family="Montserrat, Inter, sans-serif" font-size="27" font-weight="700" fill="${p.fg}">${safeTitle}</text>
  <text x="48" y="240" font-family="Inter, sans-serif" font-size="15" fill="${p.accent}" opacity="0.92">${safeName}</text>
  <rect x="48" y="270" width="120" height="28" rx="6" fill="${p.accent}" opacity="0.3"/>
  <text x="62" y="289" font-family="Inter, sans-serif" font-size="13" font-weight="600" fill="${p.fg}">${motif}</text>
  <circle cx="160" cy="284" r="3" fill="${p.fg}" opacity="0.6"/>
  <circle cx="172" cy="284" r="3" fill="${p.fg}" opacity="0.4"/>
  <circle cx="184" cy="284" r="3" fill="${p.fg}" opacity="0.2"/>
</svg>`;

  return {
    uri: `data:image/svg+xml,${encodeURIComponent(svg)}`,
    label: `Variant ${variant + 1} — ${p.label}`,
  };
}

export function ImageGenerator({
  postType,
  title,
  shortName,
  imageUrl,
  imageLabel,
  onSelect,
  onClear,
}: {
  postType: PostType;
  title: string;
  shortName: string;
  imageUrl?: string;
  imageLabel?: string;
  onSelect: (uri: string, label: string) => void;
  onClear: () => void;
}) {
  const variants = React.useMemo(
    () => PALETTES.map((_, i) => svgVariant(postType, title, shortName, i)),
    [postType, title, shortName],
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-foreground text-[13px] font-medium">Post image</p>
        {imageUrl ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-[12px]"
            onClick={onClear}
          >
            <Icons.close className="size-3.5" />
            Remove
          </Button>
        ) : (
          <span className="text-muted-foreground text-[12px]">Demo — select a variant</span>
        )}
      </div>
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={imageLabel ?? "Post image"}
          className="border-border h-28 w-full rounded-md border object-cover"
        />
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {variants.map((v, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onSelect(v.uri, v.label)}
              aria-label={v.label}
              className="border-border hover:ring-primary/30 relative overflow-hidden rounded-md border hover:ring-2"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={v.uri}
                alt={v.label}
                className="h-16 w-full object-cover"
              />
              <span className="text-muted-foreground block py-0.5 text-center text-[10px]">
                {v.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
