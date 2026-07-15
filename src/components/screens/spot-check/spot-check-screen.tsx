"use client";

import * as React from "react";
import { Icons } from "@/lib/icons";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/local/status-pill";
import { useAuditLog } from "@/components/local/audit-log-store";
import { useRole } from "@/components/shell/role-store";
import { SURFACES, surfaceMixCost } from "@/lib/surfaces";
import { QueryPanel, OTHER_STATE, STATES } from "@/components/screens/spot-check/query-panel";
import { FullResponseSheet } from "@/components/screens/spot-check/full-response-sheet";
import { ActiveCheckSection } from "@/components/screens/spot-check/active-check-section";
import { ResponseSection } from "@/components/screens/spot-check/response-section";
import { RecentChecksTable } from "@/components/screens/spot-check/recent-checks-table";
import type { SurfacePhase } from "@/components/screens/spot-check/progress-mini-card";
import {
  dotStatusFor,
  hashStr,
  replaySpotResult,
  simulateSpotResult,
  SEED_CHECK_COUNT,
  SEED_MONTH_SPEND,
  type DotStatus,
  type EvidenceLocation,
  type RecentCheck,
  type SpotResult,
} from "@/components/screens/spot-check/spot-check-data";

type Phase = "idle" | "running" | "done";

interface RunMeta {
  id: string;
  prompt: string;
  city: string;
  state: string;
  surfaceIds: string[];
  startedAt: string;
  matched: EvidenceLocation | null;
}

export function SpotCheckScreen({
  evidence,
  initialLocationSlug,
  initialPrompt,
}: {
  evidence: EvidenceLocation[];
  initialLocationSlug?: string;
  initialPrompt?: string;
}) {
  const role = useRole();
  const addEntry = useAuditLog((s) => s.addEntry);

  const prefillLoc = React.useMemo(
    () =>
      initialLocationSlug ? (evidence.find((e) => e.slug === initialLocationSlug) ?? null) : null,
    [initialLocationSlug, evidence],
  );

  const [city, setCity] = React.useState(prefillLoc?.city ?? "");
  const [stateSel, setStateSel] = React.useState<string>(() => {
    const st = prefillLoc?.state;
    if (st && !(STATES as readonly string[]).includes(st)) return OTHER_STATE;
    return st ?? "MS";
  });
  const [stateOther, setStateOther] = React.useState(() => {
    const st = prefillLoc?.state;
    return st && !(STATES as readonly string[]).includes(st) ? st : "";
  });
  const [prompt, setPrompt] = React.useState(initialPrompt ?? prefillLoc?.prompts[0] ?? "");
  const [selected, setSelected] = React.useState<Set<string>>(
    () => new Set(SURFACES.filter((s) => s.id !== "ai-mode").map((s) => s.id)),
  );

  const [phase, setPhase] = React.useState<Phase>("idle");
  const [surfacePhases, setSurfacePhases] = React.useState<Record<string, SurfacePhase>>({});
  const [results, setResults] = React.useState<Record<string, SpotResult>>({});
  const [runMeta, setRunMeta] = React.useState<RunMeta | null>(null);
  const [elapsed, setElapsed] = React.useState(0);
  const [sessionChecks, setSessionChecks] = React.useState<RecentCheck[]>([]);
  const [sheetSurface, setSheetSurface] = React.useState<string | null>(null);

  const timeoutsRef = React.useRef<number[]>([]);
  const intervalRef = React.useRef<number | null>(null);
  const runCounterRef = React.useRef(SEED_CHECK_COUNT);

  React.useEffect(() => {
    const timeouts = timeoutsRef.current;
    return () => {
      timeouts.forEach((t) => window.clearTimeout(t));
      if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
    };
  }, []);

  const stateValue = stateSel === OTHER_STATE ? stateOther : stateSel;

  const findMatch = React.useCallback(
    (cityV: string, promptV: string): EvidenceLocation | null =>
      evidence.find(
        (e) =>
          e.city.trim().toLowerCase() === cityV.trim().toLowerCase() &&
          e.prompts.includes(promptV.trim()),
      ) ?? null,
    [evidence],
  );
  const liveMatch = findMatch(city, prompt);

  const monthChecks = SEED_CHECK_COUNT + sessionChecks.length;
  const monthSpend = SEED_MONTH_SPEND + sessionChecks.reduce((a, c) => a + c.cost, 0);

  const canRun =
    phase !== "running" &&
    city.trim().length >= 2 &&
    prompt.trim().length >= 3 &&
    selected.size >= 1;

  const toggleSurface = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const startRun = React.useCallback(
    (cityV: string, stateV: string, promptV: string, ids: string[]) => {
      const chosen = SURFACES.filter((s) => ids.includes(s.id));
      if (!chosen.length || promptV.trim().length < 3 || cityV.trim().length < 2) return;

      runCounterRef.current += 1;
      const checkId = `spot_${String(runCounterRef.current).padStart(4, "0")}`;
      const matched = findMatch(cityV, promptV);
      const runCost = surfaceMixCost(ids);

      timeoutsRef.current.forEach((t) => window.clearTimeout(t));
      timeoutsRef.current = [];
      if (intervalRef.current !== null) window.clearInterval(intervalRef.current);

      const meta: RunMeta = {
        id: checkId,
        prompt: promptV.trim(),
        city: cityV.trim(),
        state: stateV.trim(),
        surfaceIds: ids,
        startedAt: new Date().toISOString(),
        matched,
      };
      setRunMeta(meta);
      setPhase("running");
      setResults({});
      setSurfacePhases(Object.fromEntries(chosen.map((s) => [s.id, "pending" as const])));
      setElapsed(0);
      intervalRef.current = window.setInterval(() => setElapsed((e) => e + 1), 1000);

      addEntry({
        actor: "Agency Operator",
        role: "operator",
        verb: "create",
        action: `Spot check ${checkId}: "${meta.prompt}" — ${chosen.length} surfaces (${meta.city}, ${meta.state || "—"})`,
        resource: `spot-check:${checkId}`,
        location_slug: matched?.slug,
        detail: `Demo mode — reproduction ${
          matched
            ? `replayed from the ${matched.name} bake (real evidence)`
            : "simulated deterministically (no baked evidence for this city + prompt)"
        }. Est. $${runCost.toFixed(3)}.`,
      });

      const collected: Record<string, SpotResult> = {};
      let t = 300;
      chosen.forEach((surface, i) => {
        const step = 500 + (hashStr(`${checkId}|${surface.id}`) % 401);
        const tQuery = t;
        t += step;
        const tDone = t;

        timeoutsRef.current.push(
          window.setTimeout(() => {
            setSurfacePhases((p) => ({ ...p, [surface.id]: "querying" }));
          }, tQuery),
        );
        timeoutsRef.current.push(
          window.setTimeout(() => {
            const baked = matched?.results.find(
              (r) => r.prompt === meta.prompt && r.surface === surface.id,
            );
            const result = baked
              ? replaySpotResult(baked)
              : simulateSpotResult(meta.city, meta.state, meta.prompt, surface);
            collected[surface.id] = result;
            setResults((r) => ({ ...r, [surface.id]: result }));
            setSurfacePhases((p) => ({ ...p, [surface.id]: "done" }));

            if (i === chosen.length - 1) {
              if (intervalRef.current !== null) {
                window.clearInterval(intervalRef.current);
                intervalRef.current = null;
              }
              setPhase("done");
              const statuses: Record<string, DotStatus> = Object.fromEntries(
                SURFACES.map((s) => [s.id, dotStatusFor(collected[s.id])]),
              );
              setSessionChecks((prev) => [
                {
                  id: checkId,
                  prompt: meta.prompt,
                  city: meta.city,
                  state: meta.state,
                  surfaces: ids,
                  cost: runCost,
                  citedCount: Object.values(collected).filter((x) => x.cited === true).length,
                  total: chosen.length,
                  at: new Date().toISOString(),
                  statuses,
                  session: true,
                },
                ...prev,
              ]);
            }
          }, tDone),
        );
      });
    },
    [addEntry, findMatch],
  );

  const rerunWithAIMode = () => {
    if (!runMeta) return;
    const ids = [...new Set([...runMeta.surfaceIds, "ai-mode"])];
    setSelected(new Set(ids));
    startRun(runMeta.city, runMeta.state, runMeta.prompt, ids);
  };

  const reloadCheck = (check: RecentCheck) => {
    setCity(check.city);
    if ((STATES as readonly string[]).includes(check.state)) {
      setStateSel(check.state);
      setStateOther("");
    } else {
      setStateSel(OTHER_STATE);
      setStateOther(check.state);
    }
    setPrompt(check.prompt);
    setSelected(new Set(check.surfaces));
    setPhase("idle");
    setResults({});
    setRunMeta(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (role !== "operator") {
    return (
      <Card className="flex max-w-xl flex-col items-start gap-3 p-8">
        <Icons.lock className="text-text-tertiary size-6" />
        <div>
          <h2 className="text-base font-semibold">Agency-only tool</h2>
          <p className="text-text-tertiary mt-1 text-[13px]">
            The spot-check console fires live provider calls and shows spend — it stays behind the
            agency wall.
          </p>
        </div>
      </Card>
    );
  }

  const summaryDomain = runMeta?.matched?.domain ?? "baptistmedicalclinic.org";
  const briefSlug = runMeta?.matched?.slug ?? "baptist-memphis";
  const briefHref = `/locations/${briefSlug}/paa-studio?brief=${encodeURIComponent(runMeta?.prompt ?? prompt.trim())}`;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-2xl font-semibold">Spot check</h1>
          <StatusPill tone="neutral">Ad-hoc query tool</StatusPill>
          <span className="num bg-secondary text-text-secondary rounded-full px-2.5 py-1 text-[11px] font-semibold">
            {monthChecks} spot checks this month · ${monthSpend.toFixed(2)} spent
          </span>
        </div>
        <p className="text-text-tertiary mt-1 text-[13px]">
          Type any healthcare query, pick surfaces, get instant AI responses with citation receipts.
          Each spot check runs <span className="num">~$0.06–$0.10</span> depending on surface mix.
          Results are captured to Runs.
        </p>
      </div>

      <QueryPanel
        city={city}
        onCityChange={setCity}
        stateSel={stateSel}
        onStateSelChange={setStateSel}
        stateOther={stateOther}
        onStateOtherChange={setStateOther}
        prompt={prompt}
        onPromptChange={setPrompt}
        selected={selected}
        onToggleSurface={toggleSurface}
        onPresetSurfaces={(ids) => setSelected(new Set(ids))}
        running={phase === "running"}
        liveMatchName={liveMatch?.name ?? null}
        canRun={canRun}
        onRun={() => startRun(city, stateValue, prompt, [...selected])}
      />

      {phase === "running" && runMeta && (
        <ActiveCheckSection
          checkId={runMeta.id}
          startedAt={runMeta.startedAt}
          elapsed={elapsed}
          surfaceIds={runMeta.surfaceIds}
          surfacePhases={surfacePhases}
          results={results}
        />
      )}

      {phase === "done" && runMeta && (
        <ResponseSection
          prompt={runMeta.prompt}
          startedAt={runMeta.startedAt}
          matchedName={runMeta.matched?.name ?? null}
          surfaceIds={runMeta.surfaceIds}
          results={results}
          summaryDomain={summaryDomain}
          briefHref={briefHref}
          onRerunWithAIMode={rerunWithAIMode}
          onOpenFull={setSheetSurface}
        />
      )}

      <RecentChecksTable
        sessionChecks={sessionChecks}
        totalChecks={monthChecks}
        onReRun={reloadCheck}
      />

      <FullResponseSheet
        surfaceId={sheetSurface}
        result={sheetSurface ? results[sheetSurface] : undefined}
        prompt={runMeta?.prompt ?? prompt}
        onOpenChange={(open) => {
          if (!open) setSheetSurface(null);
        }}
      />
    </div>
  );
}
