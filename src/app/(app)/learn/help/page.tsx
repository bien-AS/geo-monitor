"use client";

import Link from "next/link";
import { Icons } from "@/lib/icons";
import { Card } from "@/components/ui/card";
import { useHelpArticles } from "@/hooks/use-learn";
import { HELP_CATEGORIES } from "@/lib/data/types";

export default function HelpPage() {
  const { data: articles } = useHelpArticles();
  const groups = HELP_CATEGORIES.map((category) => ({
    category,
    articles: articles.filter((a) => a.category === category),
  })).filter((g) => g.articles.length > 0);

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div>
        <Link
          href="/learn"
          className="text-text-tertiary hover:text-text-secondary inline-flex items-center gap-1 text-[13px]"
        >
          <Icons.arrowLeft className="size-3.5" />
          Learning Hub
        </Link>
        <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="text-2xl font-semibold">Help articles</h1>
          <p className="text-text-tertiary text-[13px]">
            <span className="text-text-secondary font-mono font-medium">{articles.length}</span>{" "}
            articles
          </p>
        </div>
        <p className="text-text-tertiary mt-1 text-[13px]">
          Step-by-step how-tos for everything you can do here — written in plain language, no SEO
          background assumed.
        </p>
      </div>

      {groups.map(({ category, articles: categoryArticles }) => (
        <section
          key={category}
          className="flex flex-col gap-2"
        >
          <h2 className="eyebrow text-text-tertiary">{category}</h2>
          <Card className="gap-0 divide-y p-0">
            {categoryArticles.map((article) => (
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
      ))}
    </div>
  );
}
