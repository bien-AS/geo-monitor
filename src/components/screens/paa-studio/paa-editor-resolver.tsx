"use client";

import Link from "next/link";
import { ArrowLeft, CircleAlert } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { ContentArticle, TermModel } from "@/lib/data/types";
import type { PaaLocationCtx } from "@/lib/paa-articles";
import { usePaaStudio } from "@/store/paa-studio";
import { PaaEditor } from "./paa-editor";

export function PaaEditorResolver({
  slug,
  id,
  fixtureArticle,
  modelByArticleId = {},
  modelByQuery = {},
  locationCtx,
}: {
  slug: string;
  id: string;
  fixtureArticle: ContentArticle | null;
  modelByArticleId?: Record<string, TermModel>;
  modelByQuery?: Record<string, TermModel>;
  locationCtx?: PaaLocationCtx;
}) {
  const pkg = usePaaStudio((s) => s.packages[id]) ?? null;
  const article = pkg?.article ?? fixtureArticle;

  if (!article) {
    return (
      <Card className="flex max-w-xl flex-col items-start gap-3 p-8">
        <CircleAlert className="text-warning-500 size-6" />
        <div>
          <h2 className="text-base font-semibold">Article not found</h2>
          <p className="text-text-tertiary mt-1 text-[13px]">
            Generated drafts live in session state and reset on reload — regenerate from an
            opportunity in the studio.
          </p>
        </div>
        <Link
          href={`/locations/${slug}/paa-studio`}
          className="text-primary-600 dark:text-primary-300 inline-flex items-center gap-1 text-[13px] font-medium hover:underline"
        >
          <ArrowLeft className="size-3.5" />
          Back to PAA Studio
        </Link>
      </Card>
    );
  }

  const model =
    modelByArticleId[id] ??
    modelByQuery[article.target_keyword.toLowerCase().replace(/\?+$/, "").trim()] ??
    null;

  return (
    <PaaEditor
      article={article}
      pkg={pkg}
      slug={slug}
      model={model}
      locationCtx={locationCtx}
    />
  );
}
