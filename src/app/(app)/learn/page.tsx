"use client";

import Link from "next/link";
import { Icons } from "@/lib/icons";
import { Card } from "@/components/ui/card";
import { useGlossary, useHelpArticles, useTutorials } from "@/hooks/use-learn";

const START_HERE_SLUGS = [
  "understanding-your-lvi",
  "how-to-read-your-geo-grid",
  "reply-to-reviews-hipaa-safe",
];

export default function LearnPage() {
  const { data: glossary } = useGlossary();
  const { data: tutorialGroups } = useTutorials();
  const { data: helpArticles } = useHelpArticles();

  const tutorialCount = tutorialGroups.reduce((sum, g) => sum + g.videos.length, 0);
  const helpBySlug = Object.fromEntries(helpArticles.map((a) => [a.slug, a]));
  const startHere = START_HERE_SLUGS.map((slug) => helpBySlug[slug]).filter(Boolean);

  const sections = [
    {
      href: "/learn/glossary",
      icon: Icons.bookOpenText,
      title: "Glossary",
      count: glossary.length,
      unit: "terms",
      blurb:
        "Every term this platform uses — LVI, NAP, citations, geo-grids, PAA — in plain language, with a clinic example and links to where each one appears.",
    },
    {
      href: "/learn/tutorials",
      icon: Icons.playSquare,
      title: "Tutorial videos",
      count: tutorialCount,
      unit: "videos planned",
      blurb:
        "Short walkthroughs of the core workflows, organized by audience — from reading your first geo-grid to approving content as a clinic admin.",
    },
    {
      href: "/learn/help",
      icon: Icons.graduationCap,
      title: "Help articles",
      count: helpArticles.length,
      unit: "articles",
      blurb:
        "Step-by-step how-tos for everything you can do here: replying to reviews safely, ordering citations, running the PAA Studio, prepping a report.",
    },
  ];

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Learning Hub</h1>
        <p className="text-text-tertiary mt-1 text-[13px]">
          Everything you need to get comfortable with local SEO and this platform — no jargon
          required, no SEO background assumed
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.href}
              href={s.href}
              className="group"
            >
              <Card className="group-hover:border-primary-500 h-full gap-3 p-6 transition-colors">
                <div className="flex items-center justify-between">
                  <Icon
                    className="text-primary-500 size-6"
                    aria-hidden
                  />
                  <span className="text-text-tertiary text-[13px]">
                    <span className="text-text-secondary font-mono font-medium">{s.count}</span>{" "}
                    {s.unit}
                  </span>
                </div>
                <h2 className="text-base font-semibold">{s.title}</h2>
                <p className="text-text-tertiary text-[13px] leading-relaxed">{s.blurb}</p>
                <span className="text-primary-600 dark:text-primary-300 mt-auto inline-flex items-center gap-1 text-[13px] font-medium">
                  Open
                  <Icons.arrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Card>
            </Link>
          );
        })}
      </div>

      <section className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Icons.sparkles
            className="text-primary-500 size-4"
            aria-hidden
          />
          <h2 className="text-sm font-semibold">Start here</h2>
          <span className="text-text-tertiary text-[13px]">
            — the three reads that make everything else make sense
          </span>
        </div>
        <Card className="gap-0 divide-y p-0">
          {startHere.map((article) => (
            <Link
              key={article.slug}
              href={`/learn/help/${article.slug}`}
              className="group hover:bg-secondary/60 flex items-center gap-4 px-5 py-3.5 transition-colors first:rounded-t-xl last:rounded-b-xl"
            >
              <span className="min-w-0 flex-1">
                <span className="group-hover:text-primary-600 dark:group-hover:text-primary-300 block text-sm font-medium">
                  {article.title}
                </span>
                <span className="text-text-tertiary mt-0.5 block text-[13px]">
                  {article.summary}
                </span>
              </span>
              <span className="text-text-tertiary shrink-0 font-mono text-xs">
                {article.readMinutes} min
              </span>
              <Icons.chevronRight
                className="text-text-tertiary size-4 shrink-0 transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>
          ))}
        </Card>
      </section>
    </div>
  );
}
