"use client";

import Image from "next/image";
import { Icons } from "@/lib/icons";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/local/status-pill";
import { MapFallback } from "@/components/maps/map-fallback";
import { staticMapUrl } from "@/components/maps/static-map";
import { GbpMarker } from "@/components/maps/gbp-marker";
import { shortLocationName } from "@/lib/location-names";
import { fmtInt } from "@/lib/format";
import type { BaptistLocation } from "@/lib/data/types";
import { RunAuditButton, type RunAuditCost } from "./run-audit-button";

const LISTING_META: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  facility: { label: "Facility", icon: Icons.building },
  department: { label: "Department", icon: Icons.network },
  practitioner: { label: "Practitioner", icon: Icons.stethoscope },
};

const DAY_KEYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

function fmtHour(h: { hour: number; minute?: number }): string {
  const minute = h.minute ?? 0;
  const suffix = h.hour >= 12 ? "PM" : "AM";
  const hr12 = ((h.hour + 11) % 12) + 1;
  return `${hr12}:${String(minute).padStart(2, "0")} ${suffix}`;
}

function hoursToday(location: BaptistLocation): string | null {
  const timetable = location.work_time?.timetable;
  if (!timetable) return null;
  const spans = timetable[DAY_KEYS[new Date().getDay()]];
  if (!spans || spans.length === 0) return "Closed today";
  return spans.map((s) => `${fmtHour(s.open)} – ${fmtHour(s.close)}`).join(" · ");
}

export function LocationHeader({
  location,
  cost,
}: {
  location: BaptistLocation;
  cost: RunAuditCost;
}) {
  const listing = LISTING_META[location.listing_type];
  const ListingIcon = listing.icon;
  const hours = hoursToday(location);

  const hasCoords = location.lat != null && location.lng != null;
  const mapLight = hasCoords
    ? staticMapUrl({
        lat: location.lat as number,
        lng: location.lng as number,
        zoom: 14,
        width: 480,
        height: 220,
        marker: false,
      })
    : null;
  const mapDark = hasCoords
    ? staticMapUrl({
        lat: location.lat as number,
        lng: location.lng as number,
        zoom: 14,
        width: 480,
        height: 220,
        dark: true,
        marker: false,
      })
    : null;

  return (
    <Card className="flex-col gap-6 p-6 lg:flex-row lg:items-start">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-foreground text-2xl font-semibold">
            {shortLocationName(location.name)}
          </h1>
          <Badge
            variant="outline"
            className="gap-1"
          >
            <ListingIcon
              className="size-3"
              aria-hidden
            />
            {listing.label}
          </Badge>
          {location.is_claimed ? (
            <StatusPill tone="success">GBP claimed</StatusPill>
          ) : (
            <StatusPill tone="warning">Unclaimed</StatusPill>
          )}
        </div>

        <dl className="text-text-secondary mt-4 grid gap-x-8 gap-y-2 text-[13px] sm:grid-cols-2">
          <div className="flex items-start gap-2">
            <Icons.mapPin
              className="text-text-tertiary mt-0.5 size-3.5 shrink-0"
              aria-hidden
            />
            <div>
              <dt className="sr-only">Address</dt>
              <dd>
                {location.address}
                {location.primary_category ? (
                  <span className="text-text-tertiary"> · {location.primary_category}</span>
                ) : null}
              </dd>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Icons.phone
              className="text-text-tertiary size-3.5 shrink-0"
              aria-hidden
            />
            <dt className="sr-only">Phone</dt>
            <dd className="num">{location.phone ?? "—"}</dd>
          </div>
          <div className="flex items-center gap-2">
            <Icons.clock
              className="text-text-tertiary size-3.5 shrink-0"
              aria-hidden
            />
            <dt className="sr-only">Hours today</dt>
            <dd>
              {hours ? (
                <>
                  Today <span className="num">{hours}</span>
                </>
              ) : (
                "Hours not published"
              )}
            </dd>
          </div>
          <div className="flex items-center gap-2">
            <Icons.star
              className="fill-warning-500 text-warning-500 size-3.5 shrink-0"
              aria-hidden
            />
            <dt className="sr-only">Google rating</dt>
            <dd>
              {location.rating ? (
                <>
                  <span className="num text-foreground font-semibold">
                    {location.rating.value.toFixed(1)}
                  </span>{" "}
                  · <span className="num">{fmtInt(location.rating.votes_count)}</span> Google
                  reviews
                </>
              ) : (
                "No Google rating yet"
              )}
            </dd>
          </div>
        </dl>

        <div className="mt-5 flex flex-wrap items-center gap-4">
          {location.check_url ? (
            <a
              href={location.check_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-link inline-flex min-h-9 items-center gap-1.5 text-[13px] font-medium hover:underline"
            >
              View on Google Maps
              <Icons.external
                className="size-3.5"
                aria-hidden
              />
            </a>
          ) : null}
          <RunAuditButton
            slug={location.slug}
            locationName={shortLocationName(location.name)}
            cost={cost}
          />
        </div>
      </div>

      <div className="w-full shrink-0 lg:w-[300px]">
        {mapLight && mapDark ? (
          <div className="border-border relative overflow-hidden rounded-md border">
            <Image
              src={mapLight}
              alt={`Map location of ${shortLocationName(location.name)}`}
              width={480}
              height={220}
              unoptimized
              className="h-40 w-full object-cover dark:hidden"
            />
            <Image
              src={mapDark}
              alt={`Map location of ${shortLocationName(location.name)}`}
              width={480}
              height={220}
              unoptimized
              className="hidden h-40 w-full object-cover dark:block"
            />
            <div
              className="pointer-events-none absolute top-1/2 left-1/2"
              style={{ transform: "translate(-50%, -50%)" }}
            >
              <GbpMarker
                name={shortLocationName(location.name)}
                address={location.address ?? ""}
                size={30}
              />
            </div>
          </div>
        ) : (
          <MapFallback
            label="Location map"
            className="min-h-40"
          />
        )}
      </div>
    </Card>
  );
}
