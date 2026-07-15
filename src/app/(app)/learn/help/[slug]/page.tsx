"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icons } from "@/lib/icons";
import { Card } from "@/components/ui/card";
import { ArticleBody } from "@/components/screens/learn/article-renderer";
import { useGlossary, useHelpArticle } from "@/hooks/use-learn";

export default function HelpArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data: article } = useHelpArticle(slug);
  const { data: glossary } = useGlossary();

  if (!article) {
    notFound();
  }

  const glossaryById = Object.fromEntries(glossary.map((e) => [e.id, e]));

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div>
        <Link
          href="/learn/help"
          className="text-text-tertiary hover:text-text-secondary inline-flex items-center gap-1 text-[13px]"
        >
          <Icons.arrowLeft className="size-3.5" />
          Help articles
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">{article.title}</h1>
        <div className="text-text-tertiary mt-1.5 flex flex-wrap items-center gap-3 text-[13px]">
          <span className="eyebrow">{article.category}</span>
          <span className="inline-flex items-center gap-1 font-mono text-xs">
            <Icons.clock
              className="size-3"
              aria-hidden
            />
            {article.readMinutes} min read
          </span>
        </div>
      </div>

      <Card className="p-6">
        <ArticleBody blocks={article.blocks} />
      </Card>

      {article.relatedTerms.length > 0 ? (
        <Card className="gap-3 p-5">
          <div className="flex items-center gap-2">
            <Icons.bookOpenText
              className="text-primary-500 size-4"
              aria-hidden
            />
            <h2 className="text-sm font-semibold">Related terms</h2>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {article.relatedTerms.map((id) => {
              const term = glossaryById[id];
              if (!term) return null;
              return (
                <Link
                  key={id}
                  href={`/learn/glossary#${id}`}
                  className="text-text-secondary hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-300 inline-flex h-6 items-center rounded-full border px-2.5 text-xs font-medium transition-colors"
                >
                  {term.term.split(" (")[0]}
                </Link>
              );
            })}
          </div>
          <p className="text-text-tertiary text-[13px]">
            Every term above is explained in plain language in the{" "}
            <Link
              href="/learn/glossary"
              className="text-primary-600 dark:text-primary-300 font-medium hover:underline"
            >
              glossary
            </Link>
            .
          </p>
        </Card>
      ) : null}
    </div>
  );
}
