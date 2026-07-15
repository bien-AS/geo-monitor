"use client";

import { cn } from "@/lib/utils";
import {
  CHATBOT_SURFACES,
  SEARCH_FEATURE_SURFACES,
  SURFACES,
  type AISurface,
} from "@/lib/surfaces";
import { SurfacePill } from "@/components/local/surface-pill";

export function SurfaceSelector({
  selected,
  onToggle,
  onPreset,
  disabled,
}: {
  selected: Set<string>;
  onToggle: (id: string) => void;
  onPreset: (ids: string[]) => void;
  disabled?: boolean;
}) {
  const presets: Array<{ label: string; ids: string[] }> = [
    { label: "All 6", ids: SURFACES.map((s) => s.id) },
    { label: "Chatbots only", ids: CHATBOT_SURFACES.map((s) => s.id) },
    { label: "Google Search AI only", ids: SEARCH_FEATURE_SURFACES.map((s) => s.id) },
    {
      label: "Affordable (excl AI Mode)",
      ids: SURFACES.filter((s) => s.id !== "ai-mode").map((s) => s.id),
    },
  ];

  const isPresetActive = (ids: string[]) =>
    ids.length === selected.size && ids.every((id) => selected.has(id));

  return (
    <div>
      <p className="eyebrow text-text-tertiary mb-2">AI chatbots</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {CHATBOT_SURFACES.map((s) => (
          <SurfaceCard
            key={s.id}
            surface={s}
            on={selected.has(s.id)}
            onToggle={onToggle}
            disabled={disabled}
          />
        ))}
      </div>
      <div
        aria-hidden
        className="h-3"
      />
      <p className="eyebrow text-text-tertiary mb-2">Google search features</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {SEARCH_FEATURE_SURFACES.map((s) => (
          <SurfaceCard
            key={s.id}
            surface={s}
            on={selected.has(s.id)}
            onToggle={onToggle}
            disabled={disabled}
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {presets.map((p) => (
          <button
            key={p.label}
            type="button"
            disabled={disabled}
            onClick={() => onPreset(p.ids)}
            className={cn(
              "rounded-full border px-2.5 py-1 text-[11.5px] font-medium transition-colors disabled:opacity-50",
              isPresetActive(p.ids)
                ? "border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-100"
                : "border-border text-text-secondary hover:bg-secondary/60",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function SurfaceCard({
  surface,
  on,
  onToggle,
  disabled,
}: {
  surface: AISurface;
  on: boolean;
  onToggle: (id: string) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      disabled={disabled}
      onClick={() => onToggle(surface.id)}
      className={cn(
        "flex items-center gap-2.5 rounded-lg border p-3 text-left transition-colors disabled:opacity-60",
        on ? "border-border bg-card" : "border-border-subtle opacity-55 hover:opacity-80",
      )}
    >
      <SurfacePill
        surface={surface}
        size="md"
        showName={false}
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-semibold">{surface.name}</span>
        <span className="num text-text-tertiary block text-[11px]">
          ${surface.cost.toFixed(3)}/call
        </span>
      </span>
      <span
        aria-hidden
        className={cn(
          "relative h-4 w-7 shrink-0 rounded-full transition-colors",
          on ? "bg-primary" : "bg-border",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-3 rounded-full bg-white transition-transform",
            on ? "translate-x-3.5" : "translate-x-0.5",
          )}
        />
      </span>
    </button>
  );
}
