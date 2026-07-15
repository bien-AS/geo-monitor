"use client";

import Link from "next/link";
import { Icons } from "@/lib/icons";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/local/status-pill";
import { useTutorials } from "@/hooks/use-learn";

export default function TutorialsPage() {
  const { data: tutorialGroups } = useTutorials();
  const tutorialCount = tutorialGroups.reduce((sum, g) => sum + g.videos.length, 0);

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div>
        <Link
          href="/learn"
          className="text-text-tertiary hover:text-text-secondary inline-flex items-center gap-1 text-[13px]"
        >
          <Icons.arrowLeft className="size-3.5" />
          Learning Hub
        </Link>
        <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="text-2xl font-semibold">Tutorial videos</h1>
          <p className="text-text-tertiary text-[13px]">
            <span className="text-text-secondary font-mono font-medium">{tutorialCount}</span>{" "}
            videos planned
          </p>
        </div>
        <p className="text-text-tertiary mt-1 text-[13px]">
          Recordings land here — the catalog below is the production list.
        </p>
      </div>

      {tutorialGroups.map((group) => (
        <section
          key={group.group}
          className="flex flex-col gap-2"
        >
          <div>
            <h2 className="text-base font-semibold">{group.group}</h2>
            <p className="text-text-tertiary text-[13px]">{group.blurb}</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {group.videos.map((video) => (
              <Card
                key={video.id}
                className="gap-3 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <Icons.playSquare
                    className="text-primary-500 size-5 shrink-0"
                    aria-hidden
                  />
                  <StatusPill tone="neutral">Coming soon</StatusPill>
                </div>
                <h3 className="text-sm leading-snug font-semibold">{video.title}</h3>
                <p className="text-text-tertiary text-[13px] leading-relaxed">
                  {video.description}
                </p>
                <div className="mt-auto flex items-center gap-2 pt-1">
                  <span className="text-text-secondary inline-flex h-6 items-center gap-1 rounded-full border px-2.5 text-xs font-medium">
                    <Icons.usersGroup
                      className="size-3"
                      aria-hidden
                    />
                    {video.audience}
                  </span>
                  <span className="text-text-tertiary inline-flex items-center gap-1 font-mono text-xs">
                    <Icons.clock
                      className="size-3"
                      aria-hidden
                    />
                    {video.duration}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
