"use client";

import { Icons } from "@/lib/icons";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CostPreview } from "@/components/local/cost-preview";
import { SurfaceSelector } from "@/components/screens/spot-check/surface-selector";
import { SUGGESTED_QUERIES } from "@/components/screens/spot-check/spot-check-data";
import { surfaceMixCost, SURFACES } from "@/lib/surfaces";

export const STATES = ["MS", "TN", "AR", "AL"] as const;
export const OTHER_STATE = "other";
export const PROMPT_MAX = 280;

export function QueryPanel({
  city,
  onCityChange,
  stateSel,
  onStateSelChange,
  stateOther,
  onStateOtherChange,
  prompt,
  onPromptChange,
  selected,
  onToggleSurface,
  onPresetSurfaces,
  running,
  liveMatchName,
  canRun,
  onRun,
}: {
  city: string;
  onCityChange: (v: string) => void;
  stateSel: string;
  onStateSelChange: (v: string) => void;
  stateOther: string;
  onStateOtherChange: (v: string) => void;
  prompt: string;
  onPromptChange: (v: string) => void;
  selected: Set<string>;
  onToggleSurface: (id: string) => void;
  onPresetSurfaces: (ids: string[]) => void;
  running: boolean;
  liveMatchName: string | null;
  canRun: boolean;
  onRun: () => void;
}) {
  const chosenSurfaces = SURFACES.filter((s) => selected.has(s.id));
  const cost = surfaceMixCost([...selected]);

  const applySuggestion = (q: string) => {
    const cityV = city.trim() || "Jackson";
    if (!city.trim()) onCityChange("Jackson");
    onPromptChange(q.replace("{city}", cityV));
  };

  return (
    <Card className="border-l-primary-500 gap-5 border-l-[3px] p-6">
      <div>
        <h2 className="text-base font-semibold">Run a spot check</h2>
        <p className="text-text-tertiary mt-0.5 text-[13px]">
          Type any query patients might ask, set the city it should be asked from, and we&apos;ll
          fire it at the selected AI surfaces — showing responses and which domains they cite.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
          <div>
            <Label
              htmlFor="sc-city"
              className="text-[13px] font-medium"
            >
              City <span className="text-error-500">*</span>
            </Label>
            <Input
              id="sc-city"
              value={city}
              disabled={running}
              onChange={(e) => onCityChange(e.target.value)}
              placeholder="e.g. Memphis"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label className="text-[13px] font-medium">State</Label>
            <Select
              value={stateSel}
              onValueChange={onStateSelChange}
              disabled={running}
            >
              <SelectTrigger className="mt-1.5 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATES.map((st) => (
                  <SelectItem
                    key={st}
                    value={st}
                  >
                    {st}
                  </SelectItem>
                ))}
                <SelectItem value={OTHER_STATE}>Other…</SelectItem>
              </SelectContent>
            </Select>
            {stateSel === OTHER_STATE && (
              <Input
                aria-label="Other state"
                value={stateOther}
                disabled={running}
                onChange={(e) => onStateOtherChange(e.target.value)}
                placeholder="State"
                className="mt-2"
              />
            )}
          </div>
        </div>

        <div>
          <Label
            htmlFor="sc-prompt"
            className="text-[13px] font-medium"
          >
            Prompt <span className="text-error-500">*</span>
          </Label>
          <Textarea
            id="sc-prompt"
            value={prompt}
            disabled={running}
            maxLength={PROMPT_MAX}
            onChange={(e) => onPromptChange(e.target.value)}
            placeholder='e.g. "best orthopedic surgeon near me" or "do i need a referral for a rheumatologist"'
            className="mt-1.5 min-h-24"
          />
          <div className="mt-1.5 flex items-center justify-between gap-3">
            <p className="text-text-tertiary text-[11px]">
              <span className="num font-semibold">
                {prompt.length} / {PROMPT_MAX}
              </span>{" "}
              — short prompts match real patient query intent
              {liveMatchName && (
                <span className="text-success-700 dark:text-success-100 ml-2">
                  · matches the {liveMatchName} bake — real evidence will replay
                </span>
              )}
            </p>
            <DropdownMenu>
              <DropdownMenuTrigger
                disabled={running}
                className="text-primary inline-flex shrink-0 items-center gap-1 text-[12px] font-semibold hover:underline disabled:opacity-50"
              >
                Try a suggested query <Icons.chevronDown className="size-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-80"
              >
                {SUGGESTED_QUERIES.map((q) => (
                  <DropdownMenuItem
                    key={q}
                    onClick={() => applySuggestion(q)}
                  >
                    <span className="truncate text-[12.5px]">
                      {q.replace("{city}", city.trim() || "Jackson")}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <SurfaceSelector
        selected={selected}
        onToggle={onToggleSurface}
        onPreset={onPresetSurfaces}
        disabled={running}
      />

      <div className="border-border-subtle flex flex-wrap items-end justify-between gap-4 border-t pt-4">
        <CostPreview
          value={`$${cost.toFixed(3)}`}
          math={
            selected.size > 0
              ? `${chosenSurfaces.length} surface${chosenSurfaces.length === 1 ? "" : "s"} selected`
              : "No surfaces selected"
          }
          perSurface={chosenSurfaces.map((s) => ({
            label: s.name,
            value: `$${s.cost.toFixed(3)}`,
            color: s.color,
          }))}
        />
        <div className="flex flex-col items-end gap-1.5">
          <Button
            onClick={onRun}
            disabled={!canRun}
          >
            {running ? (
              <Icons.loading className="size-4 animate-spin" />
            ) : (
              <Icons.play className="size-4" />
            )}
            {running ? "Running…" : "Run spot check"}
            {!running && <span className="num">· ${cost.toFixed(3)}</span>}
          </Button>
          <p className="text-text-tertiary text-[11px]">
            Results in <span className="num">~10–30</span> seconds · captured to Runs
          </p>
        </div>
      </div>
    </Card>
  );
}
