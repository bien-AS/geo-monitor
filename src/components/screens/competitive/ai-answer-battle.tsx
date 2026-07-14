"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { fmtInt } from "@/lib/format";
import {
  CHATBOT_SURFACES,
  SEARCH_FEATURE_SURFACES,
  surfaceById,
  type AISurface,
} from "@/lib/surfaces";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SourceBadge } from "@/components/local/source-badge";
import { SurfacePill } from "@/components/local/surface-pill";
import type { AIAnswerCell, AIBattleData, DomainTally } from "@/lib/competitive-derive";
import { YouPill, YOU_NAME_CLS } from "./you-pill";

const domainRoot = (d: string) => d.split(".")[0] ?? d;

function TallyColumn({
  title,
  surfaces,
  tally,
  checks,
}: {
  title: string;
  surfaces: readonly AISurface[];
  tally: DomainTally[];
  checks: number;
}) {
  const max = Math.max(1, ...tally.map((t) => t.count));
  return (
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-1.5">
        {surfaces.map((s) => (
          <SurfacePill
            key={s.id}
            surface={s}
            size="sm"
            showName={false}
          />
        ))}
        <p className="text-foreground text-[12px] font-semibold">{title}</p>
      </div>
      <p className="text-text-tertiary mt-0.5 text-[11px]">
        Cited answer sources across <span className="num">{fmtInt(checks)}</span> checks
      </p>
      {tally.length === 0 ? (
        <p className="text-text-secondary mt-3 text-[12px]">
          No cited sources recorded on these surfaces yet.
        </p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {tally.map((t) => (
            <li
              key={t.domain}
              className="flex items-center gap-2"
            >
              <span
                className={cn(
                  "flex w-36 shrink-0 items-center gap-1 truncate text-[12px]",
                  t.isBaptist ? YOU_NAME_CLS : "text-text-secondary",
                )}
                title={t.domain}
              >
                <span className="truncate">{t.domain}</span>
                {t.isBaptist && <YouPill />}
              </span>
              <span className="bg-secondary h-2 flex-1 overflow-hidden rounded-full">
                <span
                  className={cn(
                    "block h-full rounded-full",
                    t.isBaptist ? "bg-primary-500" : "bg-neutral-400 dark:bg-neutral-500",
                  )}
                  style={{ width: `${(t.count / max) * 100}%` }}
                />
              </span>
              <span className="num w-6 shrink-0 text-right text-[12px] font-semibold">
                {fmtInt(t.count)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AnswerCell({
  slug,
  cell,
  locationName,
}: {
  slug: string;
  cell: AIAnswerCell | undefined;
  locationName: string;
}) {
  if (!cell) {
    return (
      <span className="border-border text-text-disabled flex h-7 w-full items-center justify-center rounded-md border border-dashed text-[10px]">
        &mdash;
      </span>
    );
  }
  const surface = surfaceById(cell.surfaceId);
  const baptist = cell.domain ? cell.domain.includes("baptist") : false;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={`/locations/${slug}/local-ai`}
          aria-label={`${surface?.name ?? cell.surfaceId}: cited source ${cell.domain ?? "none recorded"} — open Local AI visibility`}
          className={cn(
            "flex h-7 w-full min-w-0 items-center gap-1 rounded-md border px-1.5 text-[10px] font-medium",
            "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
            baptist
              ? "border-primary-200 bg-primary-50 text-primary-700 dark:border-primary-700 dark:bg-primary-500/15 dark:text-primary-100"
              : "border-border bg-card text-text-secondary hover:bg-secondary/60",
          )}
        >
          <span
            aria-hidden
            className="size-1.5 shrink-0 rounded-full"
            style={{ background: surface?.color }}
          />
          <span className={cn("truncate", cell.baptistCited === "yes" ? "font-semibold" : "num")}>
            {cell.baptistCited === "yes"
              ? locationName
              : baptist
                ? "Baptist · brand"
                : cell.domain
                  ? domainRoot(cell.domain)
                  : "none"}
          </span>
        </Link>
      </TooltipTrigger>
      <TooltipContent className="max-w-64">
        <p className="font-semibold">{surface?.name ?? cell.surfaceId}</p>
        <p className="mt-0.5">
          Cited source: <span className="num">{cell.domain ?? "none recorded"}</span>
        </p>
        <p className="mt-0.5">
          {cell.baptistCited === "yes"
            ? `${locationName} named as a recommendation`
            : cell.baptistCited === "partial"
              ? "Baptist brand cited — this location not named directly"
              : "This location not cited"}
          {cell.position != null && (
            <>
              {" "}
              &middot; position <span className="num">{cell.position}</span>
            </>
          )}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}

export function AIAnswerBattle({
  slug,
  ai,
  locationName,
}: {
  slug: string;
  ai: AIBattleData | null;
  locationName: string;
}) {
  const cellTruth = React.useMemo(() => {
    let named = 0;
    let brand = 0;
    let total = 0;
    for (const row of ai?.prompts ?? []) {
      for (const c of row.cells) {
        total += 1;
        if (c.baptistCited === "yes") named += 1;
        else if (c.baptistCited === "partial") brand += 1;
      }
    }
    return { named, brand, total };
  }, [ai]);
  return (
    <Card className="gap-0 overflow-hidden p-0">
      <div className="border-border flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
        <div>
          <p className="eyebrow text-text-tertiary">Battle 2 &middot; AI answers</p>
          <h2 className="text-foreground mt-0.5 flex items-center gap-1.5 text-[15px] font-semibold">
            <Sparkles
              className="text-text-tertiary size-4"
              aria-hidden
            />
            AI-answer battle &mdash; who gets cited
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {(ai?.sources ?? []).map((s) => (
            <SourceBadge
              key={s}
              source={s}
            />
          ))}
          <Link
            href={`/locations/${slug}/local-ai`}
            className="text-text-link hover:bg-secondary flex items-center gap-1 rounded-md px-2 py-1 text-[13px] font-medium"
          >
            Open Local AI visibility
            <ArrowUpRight
              className="size-3.5"
              aria-hidden
            />
          </Link>
        </div>
      </div>

      {!ai ? (
        <div className="flex flex-col items-center gap-2 p-8 text-center">
          <span
            aria-hidden
            className="flex items-center gap-1.5"
          >
            <span className="bg-primary-200 size-3.5 rotate-45" />
            <span className="size-3.5 rotate-45 bg-cyan-200" />
          </span>
          <h3 className="text-sm font-semibold">No AI answer checks yet</h3>
          <p className="text-text-secondary max-w-sm text-[12px]">
            Run the local AI prompt checks to see which sources the AI surfaces cite for this
            location&apos;s searches.
          </p>
          <Link
            href={`/locations/${slug}/local-ai`}
            className="text-text-link mt-1 text-[13px] font-medium hover:underline"
          >
            Go to Local AI visibility &rarr;
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-5 p-4">
          <p className="text-text-secondary text-[12px]">
            Chatbot answers and Google Search AI answers are separate battles &mdash; the two groups
            are never averaged together, and neither is blended with map-pack stats.
          </p>

          <div className="flex flex-col gap-3 md:flex-row">
            <TallyColumn
              title="Chatbot answers"
              surfaces={CHATBOT_SURFACES}
              tally={ai.chatbotTally}
              checks={ai.chatbotChecks}
            />
            <div
              aria-hidden
              className="bg-border hidden w-px self-stretch md:block"
            />
            <div
              aria-hidden
              className="bg-border h-px w-full md:hidden"
            />
            <TallyColumn
              title="Google AI answers"
              surfaces={SEARCH_FEATURE_SURFACES}
              tally={ai.searchTally}
              checks={ai.searchChecks}
            />
          </div>

          <p className="bg-accent text-accent-foreground rounded-md px-3 py-2 text-[12px]">
            <span className="num font-bold">{cellTruth.named}</span> of{" "}
            <span className="num">{cellTruth.total}</span> checks name{" "}
            <span className="font-semibold">{locationName}</span> directly &middot;{" "}
            <span className="num font-bold">{cellTruth.brand}</span> cite the Baptist brand without
            naming this location &mdash; a brand-level citation is visibility, not a location win.
          </p>

          <div>
            <p className="eyebrow text-text-tertiary">Cited source per prompt</p>
            <div className="mt-2 overflow-x-auto">
              <div className="flex min-w-[760px] flex-col gap-1.5">
                <div className="flex items-center gap-3">
                  <span className="w-64 shrink-0" />
                  <div className="grid flex-1 grid-cols-4 gap-1.5">
                    {CHATBOT_SURFACES.map((s) => (
                      <span
                        key={s.id}
                        className="num text-center text-[10px] font-bold"
                        style={{ color: s.dark }}
                      >
                        {s.glyph}
                      </span>
                    ))}
                  </div>
                  <span
                    aria-hidden
                    className="bg-border w-px self-stretch"
                  />
                  <div className="grid w-[27%] shrink-0 grid-cols-2 gap-1.5">
                    {SEARCH_FEATURE_SURFACES.map((s) => (
                      <span
                        key={s.id}
                        className="num text-center text-[10px] font-bold"
                        style={{ color: s.dark }}
                      >
                        {s.glyph}
                      </span>
                    ))}
                  </div>
                </div>
                {ai.prompts.map((row) => (
                  <div
                    key={row.prompt}
                    className="flex items-center gap-3"
                  >
                    <span
                      className="text-text-secondary w-64 shrink-0 truncate text-[12px]"
                      title={row.prompt}
                    >
                      {row.prompt}
                    </span>
                    <div className="grid flex-1 grid-cols-4 gap-1.5">
                      {CHATBOT_SURFACES.map((s) => (
                        <AnswerCell
                          key={s.id}
                          slug={slug}
                          locationName={locationName}
                          cell={row.cells.find((c) => c.surfaceId === s.id)}
                        />
                      ))}
                    </div>
                    <span
                      aria-hidden
                      className="bg-border w-px self-stretch"
                    />
                    <div className="grid w-[27%] shrink-0 grid-cols-2 gap-1.5">
                      {SEARCH_FEATURE_SURFACES.map((s) => (
                        <AnswerCell
                          key={s.id}
                          slug={slug}
                          locationName={locationName}
                          cell={row.cells.find((c) => c.surfaceId === s.id)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
