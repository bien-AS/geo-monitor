"use client";

import * as React from "react";
import type { DataSource } from "@/lib/data/types";
import type { CompetitiveModel } from "@/lib/competitive-derive";
import { TrackedRivals } from "./tracked-rivals";
import { RivalLeaderboard } from "./rival-leaderboard";
import { AIAnswerBattle } from "./ai-answer-battle";
import { RatingStrip } from "./rating-strip";
import { RivalProfileDrawer } from "./rival-profile-drawer";

export function CompetitiveView({
  slug,
  model,
  responseRate,
  responseRateSource,
}: {
  slug: string;
  model: CompetitiveModel;
  responseRate: number | null;
  responseRateSource: DataSource | null;
}) {
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const openRival = (rivalId: string) => {
    setSelectedId(rivalId);
    setDrawerOpen(true);
  };

  const selected = model.rivals.find((r) => r.id === selectedId) ?? null;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <TrackedRivals
          rivals={model.rivals}
          rosterSource={model.rosterSource}
          onSelect={openRival}
        />
        <RatingStrip
          you={model.you}
          rivals={model.rivals}
          responseRate={responseRate}
          responseRateSource={responseRateSource}
          onSelect={openRival}
        />
      </div>

      <RivalLeaderboard
        slug={slug}
        boards={model.boards}
        onSelect={openRival}
      />

      <AIAnswerBattle
        slug={slug}
        ai={model.ai}
        locationName={model.you.name}
      />

      <RivalProfileDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        rival={selected}
        you={model.you}
        slug={slug}
        allKeywords={model.boards.map((b) => b.keyword)}
      />
    </div>
  );
}
