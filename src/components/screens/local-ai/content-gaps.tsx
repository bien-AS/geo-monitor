"use client";

import Link from "next/link";
import { Icons } from "@/lib/icons";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { surfaceById } from "@/lib/surfaces";
import type { ContentGap } from "./helpers";

export function ContentGaps({ gaps, slug }: { gaps: ContentGap[]; slug: string }) {
  if (gaps.length === 0) {
    return (
      <Card className="gap-4 p-6">
        <div>
          <h2 className="text-lg font-semibold">Content gaps</h2>
          <p className="text-muted-foreground text-[13px]">
            No content gaps found — every prompt is cited on every surface.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="gap-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold">Content gaps</h2>
          <p className="text-muted-foreground text-[13px]">
            <span className="num text-foreground font-semibold">{gaps.length}</span> prompt
            {gaps.length === 1 ? "" : "s"} where Baptist is not cited by at least one engine —
            target these with GBP posts and on-site content
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {gaps.map((gap) => (
          <div
            key={gap.prompt}
            className="border-border flex flex-col gap-2 rounded-lg border p-4"
          >
            <p className="text-foreground text-[13px] leading-snug font-semibold">
              &ldquo;{gap.prompt}&rdquo;
            </p>

            <div className="flex flex-wrap gap-1">
              <span className="text-muted-foreground text-[11px]">Missed on: </span>
              {gap.missedSurfaceIds.map((sid) => {
                const s = surfaceById(sid);
                return s ? (
                  <Badge
                    key={sid}
                    variant="secondary"
                    className="text-[10px]"
                  >
                    {s.name}
                  </Badge>
                ) : null;
              })}
            </div>

            {gap.partialSurfaceIds.length > 0 && (
              <div className="flex flex-wrap gap-1">
                <span className="text-muted-foreground text-[11px]">Partial on: </span>
                {gap.partialSurfaceIds.map((sid) => {
                  const s = surfaceById(sid);
                  return s ? (
                    <Badge
                      key={sid}
                      variant="outline"
                      className="text-warning-700 text-[10px]"
                    >
                      {s.name}
                    </Badge>
                  ) : null;
                })}
              </div>
            )}

            {gap.topRival && (
              <p className="text-muted-foreground text-[12px]">
                Top rival:{" "}
                <span className="text-foreground font-semibold">{gap.topRival.domain}</span> (
                <span className="num">{gap.topRival.count}</span> checks)
              </p>
            )}

            <div className="mt-auto flex items-center gap-2 pt-1">
              <Link
                href={`/locations/${slug}/posts?compose=1`}
                className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-[12px] font-medium"
              >
                <Icons.fileText className="size-3" />
                Draft article
              </Link>
              <Link
                href={`/locations/${slug}/competitive`}
                className="text-muted-foreground hover:text-foreground text-[12px]"
              >
                <Icons.swords className="size-3" />
                <span className="ml-1">Who&apos;s winning</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
