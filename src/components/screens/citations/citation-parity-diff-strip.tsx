"use client";

import { cn } from "@/lib/utils";
import { fmtPct } from "@/lib/format";
import { StatusPill, type PillTone } from "@/components/local/status-pill";
import type { CitationStatus, NAP } from "@/lib/data/types";

export type StatusFilter = CitationStatus | "all";

export const STATUS_LABEL: Record<CitationStatus, string> = {
  present: "Present",
  mismatch: "NAP mismatch",
  missing: "Missing",
  duplicate: "Duplicate",
};

export const STATUS_TONE: Record<CitationStatus, PillTone> = {
  present: "success",
  mismatch: "warning",
  missing: "neutral",
  duplicate: "error",
};

const SEGMENT_CLS: Record<CitationStatus, string> = {
  present: "bg-success-500",
  mismatch: "bg-warning-500",
  missing: "bg-neutral-400 dark:bg-neutral-500",
  duplicate: "bg-error-500",
};

const DOT_CLS = SEGMENT_CLS;
const ORDER: CitationStatus[] = ["present", "mismatch", "missing", "duplicate"];

export function ParityBand({
  breakdown,
  selected,
  onSelect,
  className,
}: {
  breakdown: Record<CitationStatus, number>;
  selected: StatusFilter;
  onSelect: (status: StatusFilter) => void;
  className?: string;
}) {
  const total = ORDER.reduce((sum, s) => sum + breakdown[s], 0);
  if (total === 0) return null;

  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      <div
        className="flex h-3 w-full overflow-hidden rounded-full"
        role="group"
        aria-label="Citation parity breakdown"
      >
        {ORDER.filter((s) => breakdown[s] > 0).map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => onSelect(selected === status ? "all" : status)}
            aria-pressed={selected === status}
            aria-label={`${STATUS_LABEL[status]}: ${breakdown[status]} of ${total} directories`}
            title={`${STATUS_LABEL[status]} · ${breakdown[status]} (${fmtPct((breakdown[status] / total) * 100)})`}
            className={cn(
              "h-full transition-opacity",
              SEGMENT_CLS[status],
              selected !== "all" && selected !== status && "opacity-30",
            )}
            style={{ width: `${(breakdown[status] / total) * 100}%` }}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        {ORDER.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => onSelect(selected === status ? "all" : status)}
            aria-pressed={selected === status}
            className={cn(
              "hover:bg-secondary flex min-h-6 items-center justify-between gap-2 rounded-md px-1.5 py-0.5 text-left text-[12px] transition-colors",
              selected === status && "bg-secondary",
            )}
          >
            <span className="text-text-secondary flex items-center gap-1.5">
              <span
                aria-hidden
                className={cn("size-2 shrink-0 rounded-full", DOT_CLS[status])}
              />
              {STATUS_LABEL[status]}
            </span>
            <span className="num text-foreground font-semibold">
              {breakdown[status]}
              <span className="text-text-tertiary ml-1 font-normal">
                {fmtPct((breakdown[status] / total) * 100)}
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

interface DiffSegments {
  pre: string;
  canonicalMid: string;
  observedMid: string;
  post: string;
}

export function diffSegments(canonical: string, observed: string): DiffSegments {
  let start = 0;
  const min = Math.min(canonical.length, observed.length);
  while (start < min && canonical[start] === observed[start]) start++;
  let endC = canonical.length;
  let endO = observed.length;
  while (endC > start && endO > start && canonical[endC - 1] === observed[endO - 1]) {
    endC--;
    endO--;
  }
  return {
    pre: canonical.slice(0, start),
    canonicalMid: canonical.slice(start, endC),
    observedMid: observed.slice(start, endO),
    post: canonical.slice(endC),
  };
}

function DiffValue({ segments, side }: { segments: DiffSegments; side: "canonical" | "observed" }) {
  const mid = side === "canonical" ? segments.canonicalMid : segments.observedMid;
  return (
    <span className="num text-[12px] break-all">
      {segments.pre}
      {mid ? (
        <mark
          className={cn(
            "rounded-[2px] px-0.5",
            side === "canonical"
              ? "bg-success-50 text-success-700 dark:bg-success-700/30 dark:text-success-100 font-semibold"
              : "bg-error-50 text-error-700 dark:bg-error-700/30 dark:text-error-100 font-semibold",
          )}
        >
          {mid}
        </mark>
      ) : (
        <mark
          aria-label="missing characters"
          className="bg-error-50 text-error-700 dark:bg-error-700/30 dark:text-error-100 rounded-[2px] px-0.5 font-semibold"
        >
          ∅
        </mark>
      )}
      {segments.post}
    </span>
  );
}

const FIELDS: Array<{ key: keyof Pick<NAP, "name" | "address" | "phone">; label: string }> = [
  { key: "name", label: "Name" },
  { key: "address", label: "Address" },
  { key: "phone", label: "Phone" },
];

export function ParityDiff({
  canonical,
  observed,
  fieldMatch,
  listed,
  className,
}: {
  canonical: NAP;
  observed?: Partial<NAP>;
  fieldMatch?: { name: boolean; address: boolean; phone: boolean };
  listed: boolean;
  className?: string;
}) {
  if (!listed) {
    return (
      <div className={cn("flex flex-col gap-1.5", className)}>
        <StatusPill tone="neutral">Not listed</StatusPill>
        <p className="text-text-secondary text-[12px]">
          No listing found on this directory — nothing to diff. A new listing would be created from
          the canonical NAP record.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {FIELDS.map(({ key, label }) => {
        const matches = fieldMatch?.[key] ?? true;
        const canonicalValue = canonical[key];
        const observedValue = observed?.[key];

        if (matches) {
          return (
            <div
              key={key}
              className="border-border bg-card flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border px-3 py-2"
            >
              <span className="eyebrow text-text-tertiary w-16 shrink-0">{label}</span>
              <span className="num text-text-secondary min-w-0 text-[12px] break-all">
                {canonicalValue}
              </span>
              <StatusPill
                tone="success"
                className="ml-auto shrink-0"
              >
                Match
              </StatusPill>
            </div>
          );
        }

        const segments = diffSegments(canonicalValue, observedValue ?? "");
        return (
          <div
            key={key}
            className="border-border border-l-warning-500 bg-card rounded-md border border-l-[3px] px-3 py-2"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="eyebrow text-text-tertiary">{label}</span>
              <StatusPill tone="warning">Mismatch</StatusPill>
            </div>
            <dl className="mt-1.5 flex flex-col gap-1">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <dt className="eyebrow text-text-tertiary w-[72px] shrink-0">Canonical</dt>
                <dd className="min-w-0">
                  <DiffValue
                    segments={segments}
                    side="canonical"
                  />
                </dd>
              </div>
              <div className="flex flex-wrap items-baseline gap-x-2">
                <dt className="eyebrow text-text-tertiary w-[72px] shrink-0">Observed</dt>
                <dd className="min-w-0">
                  {observedValue ? (
                    <DiffValue
                      segments={segments}
                      side="observed"
                    />
                  ) : (
                    <span className="text-text-tertiary text-[12px] italic">
                      Field not published on the live listing
                    </span>
                  )}
                </dd>
              </div>
            </dl>
          </div>
        );
      })}
    </div>
  );
}
