"use client";

import * as React from "react";
import { Icons } from "@/lib/icons";
import {
  CHATBOT_SURFACES,
  SEARCH_FEATURE_SURFACES,
  surfaceById,
  type AISurface,
} from "@/lib/surfaces";
import { fmtCost, fmtCostPerCall, fmtDate, fmtPct, fmtTime } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { SourceBadge } from "@/components/local/source-badge";
import { SurfacePill } from "@/components/local/surface-pill";
import {
  SerpPreviewModal,
  type SerpPreviewData,
} from "@/components/screens/geo-grid/serp-preview-modal";
import { ChatbotResponseModal } from "./chatbot-response-modal";
import { CitedSourceMix } from "./cited-source-mix";
import { ContentGaps } from "./content-gaps";
import { PromptSurfaceMatrix } from "./prompt-surface-matrix";
import { SurfaceBreakdown } from "./surface-breakdown";
import {
  bestWin,
  buildSerpPreview,
  citedSourceMix,
  contentGaps,
  domainFragmentation,
  dominantSource,
  groupShare,
  lastCheckedAt,
  liveRowCount,
  totalCheckCost,
  topRivalDomain,
  type AICheckRow,
  type CompetitorSlim,
  type LocalAILocationSlim,
} from "./helpers";

function SurfaceTile({ surface, rows }: { surface: AISurface; rows: AICheckRow[] }) {
  const share = groupShare(rows, [surface]);
  return (
    <div className="border-border flex flex-col gap-1.5 rounded-md border p-2.5">
      <SurfacePill
        surface={surface}
        size="sm"
        showName={false}
      />
      <p className="num text-primary text-[18px] leading-none font-bold">
        {share.cells > 0 ? fmtPct(share.pct) : "—"}
      </p>
      <p className="num text-muted-foreground text-[10px]">{fmtCostPerCall(surface.cost)}/call</p>
    </div>
  );
}

function ShareGroup({
  label,
  surfaces,
  rows,
  cols,
}: {
  label: string;
  surfaces: readonly AISurface[];
  rows: AICheckRow[];
  cols: string;
}) {
  const share = groupShare(rows, surfaces);
  return (
    <div className="min-w-0 flex-1">
      <p className="eyebrow text-muted-foreground">
        {label} · <span className="num">{surfaces.length}</span> surfaces
      </p>
      <p className="num text-primary mt-1 text-[34px] leading-none font-bold tracking-tight">
        {fmtPct(share.pct)}
      </p>
      <p className="text-muted-foreground mt-1.5 text-[13px]">
        <span className="num text-foreground font-semibold">
          {share.cited}/{share.cells}
        </span>{" "}
        checks cited
        {share.partial > 0 && (
          <>
            {" "}
            · <span className="num">{share.partial}</span> partial
          </>
        )}
      </p>
      <div className={`mt-3 grid gap-2 ${cols}`}>
        {surfaces.map((s) => (
          <SurfaceTile
            key={s.id}
            surface={s}
            rows={rows}
          />
        ))}
      </div>
    </div>
  );
}

export function LocalAIScreen({
  location,
  prompts,
  rows,
  competitors,
}: {
  location: LocalAILocationSlim;
  prompts: string[];
  rows: AICheckRow[];
  competitors: CompetitorSlim[];
}) {
  const mix = React.useMemo(
    () => citedSourceMix(rows, location.gbpDomain),
    [rows, location.gbpDomain],
  );
  const fragmentation = React.useMemo(
    () => domainFragmentation(mix, location.gbpDomain),
    [mix, location.gbpDomain],
  );
  const gaps = React.useMemo(() => contentGaps(prompts, rows), [prompts, rows]);
  const win = React.useMemo(() => bestWin(rows), [rows]);
  const rival = React.useMemo(() => topRivalDomain(rows), [rows]);

  const totalCost = totalCheckCost(rows);
  const lastRun = lastCheckedAt(rows);
  const liveCount = liveRowCount(rows);
  const majority = dominantSource(rows);

  const [chatRow, setChatRow] = React.useState<AICheckRow | null>(null);
  const [chatOpen, setChatOpen] = React.useState(false);
  const [serpData, setSerpData] = React.useState<SerpPreviewData | null>(null);
  const [serpOpen, setSerpOpen] = React.useState(false);

  const openCell = React.useCallback(
    (row: AICheckRow) => {
      const surface = surfaceById(row.surface);
      if (!surface) return;
      if (surface.category === "search-feature") {
        setSerpData(buildSerpPreview(row, location, competitors, mix));
        setSerpOpen(true);
      } else {
        setChatRow(row);
        setChatOpen(true);
      }
    },
    [location, competitors, mix, setChatOpen, setSerpOpen],
  );

  const winSurface = win ? surfaceById(win.surfaceId) : null;

  return (
    <div className="flex flex-col gap-6">
      <Card className="gap-5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold">Citation share</h2>
            <p className="text-muted-foreground text-[13px]">
              Chatbot share and Google-AI share are tracked separately — the two groups are never
              averaged into one number
            </p>
          </div>
          <SourceBadge
            source={majority}
            note={
              liveCount > 0
                ? `Majority provenance — ${liveCount} of ${rows.length} checks are live DataForSEO responses`
                : "Synthetic demo checks, shaped like the live provider payloads"
            }
          />
        </div>

        <div className="flex flex-col gap-5 lg:flex-row lg:items-stretch">
          <ShareGroup
            label="Chatbot citation share"
            surfaces={CHATBOT_SURFACES}
            rows={rows}
            cols="grid-cols-2 sm:grid-cols-4"
          />

          <div
            aria-hidden
            className="hidden w-3 justify-center lg:flex"
          >
            <div className="bg-border w-px" />
          </div>
          <div
            aria-hidden
            className="flex h-3 items-center lg:hidden"
          >
            <div className="bg-border h-px w-full" />
          </div>

          <ShareGroup
            label="Google-AI citation share"
            surfaces={SEARCH_FEATURE_SURFACES}
            rows={rows}
            cols="grid-cols-2"
          />

          <div className="border-border flex shrink-0 flex-col gap-4 border-t pt-4 lg:w-52 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-5">
            <div>
              <p className="eyebrow text-muted-foreground">Last checked</p>
              <p className="num text-foreground mt-1 text-[17px] font-bold">
                {lastRun ? fmtDate(lastRun) : "—"}
              </p>
              {lastRun && (
                <p className="num text-muted-foreground text-[12px]">{fmtTime(lastRun)}</p>
              )}
            </div>
            <div>
              <p className="eyebrow text-muted-foreground">Total check cost</p>
              <p className="num text-foreground mt-1 text-[17px] font-bold">{fmtCost(totalCost)}</p>
              <p className="text-muted-foreground text-[12px]">
                <span className="num">{rows.length}</span> checks ·{" "}
                <span className="num">{liveCount}</span> live
              </p>
            </div>
          </div>
        </div>
      </Card>

      {(win || rival) && (
        <Card className="border-l-primary gap-3 border-l-[3px] p-5">
          <p className="text-foreground flex items-center gap-1.5 text-[13px] font-semibold">
            <Icons.sparkles
              className="text-primary size-4"
              aria-hidden
            />
            What the engines are saying
          </p>
          <ul className="text-muted-foreground flex list-disc flex-col gap-1.5 pl-5 text-[13px] leading-relaxed">
            {win && winSurface && (
              <li>
                <span className="text-foreground font-semibold">{winSurface.name}</span> cites{" "}
                {location.shortName}
                {win.position != null && (
                  <>
                    {" "}
                    at <span className="num text-foreground font-semibold">#{win.position}</span>
                  </>
                )}{" "}
                for &ldquo;{win.prompt}&rdquo;
                {win.domain && (
                  <>
                    {" "}
                    via <span className="font-medium">{win.domain}</span>
                  </>
                )}
                {win.live && " — captured in a live DataForSEO check"}.
              </li>
            )}
            {rival && (
              <li>
                <span className="text-foreground font-semibold">{rival.domain}</span> is cited
                instead of you on{" "}
                <span className="num text-foreground font-semibold">{rival.count}</span> check
                {rival.count === 1 ? "" : "s"} — mostly on{" "}
                {rival.surfaceIds
                  .map((id) => surfaceById(id)?.name ?? id)
                  .slice(0, 3)
                  .join(", ")}
                .
              </li>
            )}
            {fragmentation && (
              <li>
                Citations split across{" "}
                <span className="num text-foreground font-semibold">
                  {fragmentation.baptistDomains.length}
                </span>{" "}
                Baptist domains — see the fragmentation finding in the cited-source mix below.
              </li>
            )}
          </ul>
        </Card>
      )}

      <PromptSurfaceMatrix
        prompts={prompts}
        rows={rows}
        source={majority}
        liveCount={liveCount}
        onOpenCell={openCell}
      />

      <CitedSourceMix
        mix={mix}
        fragmentation={fragmentation}
        slug={location.slug}
        totalChecks={rows.length}
        onOpenCell={openCell}
      />

      <ContentGaps
        gaps={gaps}
        slug={location.slug}
      />

      <SurfaceBreakdown
        rows={rows}
        promptCount={prompts.length}
        onOpenCell={openCell}
      />

      <ChatbotResponseModal
        open={chatOpen}
        onOpenChange={setChatOpen}
        row={chatRow}
        mix={mix}
        gbpDomain={location.gbpDomain}
      />
      <SerpPreviewModal
        open={serpOpen}
        onOpenChange={setSerpOpen}
        data={serpData}
      />
    </div>
  );
}
