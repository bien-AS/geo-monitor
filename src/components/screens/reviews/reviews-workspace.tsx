"use client";

import * as React from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PHIContainer } from "@/components/local/phi-container";
import { AuditLogRow } from "@/components/local/audit-log-row";
import { useAuditLog } from "@/components/local/audit-log-store";
import { Icons } from "@/lib/icons";
import type { AuditLogEntry, Review, ReviewSentiment, ReviewStatus } from "@/lib/data/types";
import { fmtDateShort } from "@/lib/format";
import { ReviewRow } from "./review-row";
import { DetailPane } from "./detail-pane";
import type { SeoWeaveContext } from "./templates";
import { ReviewStatusChip, Stars } from "./chips";

type StatusFilter = "all" | ReviewStatus;
type SentimentFilter = "all" | ReviewSentiment;
type RatingFilter = "all" | "1" | "2" | "3" | "4" | "5";

const STATUS_SEGMENTS: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "unanswered", label: "Unanswered" },
  { id: "draft", label: "Drafted" },
  { id: "responded", label: "Responded" },
  { id: "handoff", label: "Handoff" },
];

function isStatusFilter(v: string | undefined): v is StatusFilter {
  return v != null && STATUS_SEGMENTS.some((s) => s.id === (v as StatusFilter));
}

function isSentimentFilter(v: string | undefined): v is SentimentFilter {
  return v != null && ["all", "positive", "neutral", "negative", "critical"].includes(v);
}

function isRatingFilter(v: string | undefined): v is RatingFilter {
  return v != null && ["all", "1", "2", "3", "4", "5"].includes(v);
}

export function ReviewsWorkspace({
  slug,
  reviews,
  checkUrl,
  fixtureAuditEntries,
  initialStatus,
  initialSentiment,
  initialRating,
  seoCtx,
}: {
  slug: string;
  reviews: Review[];
  checkUrl?: string | null;
  fixtureAuditEntries: AuditLogEntry[];
  initialStatus?: string;
  initialSentiment?: string;
  initialRating?: string;
  seoCtx?: SeoWeaveContext;
}) {
  const addEntry = useAuditLog((s) => s.addEntry);
  const sessionEntries = useAuditLog((s) => s.sessionEntries);

  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>(
    isStatusFilter(initialStatus) ? initialStatus : "all",
  );
  const [sentimentFilter, setSentimentFilter] = React.useState<SentimentFilter>(
    isSentimentFilter(initialSentiment) ? initialSentiment : "all",
  );
  const [ratingFilter, setRatingFilter] = React.useState<RatingFilter>(
    isRatingFilter(initialRating) ? initialRating : "all",
  );

  const [overrides, setOverrides] = React.useState<Record<string, ReviewStatus>>({});
  const [posted, setPosted] = React.useState<Record<string, { text: string; date: string }>>({});
  const [drafts, setDrafts] = React.useState<Record<string, string>>({});

  const effStatus = React.useCallback(
    (r: Review): ReviewStatus => overrides[r.id] ?? r.status,
    [overrides],
  );

  const sorted = React.useMemo(() => {
    const pinned = (r: Review) =>
      r.sentiment === "critical" || effStatus(r) === "handoff" ? 0 : 1;
    return [...reviews].sort(
      (a, b) => pinned(a) - pinned(b) || new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [reviews, effStatus]);

  const [selectedId, setSelectedId] = React.useState<string | null>(sorted[0]?.id ?? null);
  const selected = sorted.find((r) => r.id === selectedId) ?? null;

  const filtered = sorted.filter(
    (r) =>
      (statusFilter === "all" || effStatus(r) === statusFilter) &&
      (sentimentFilter === "all" || r.sentiment === sentimentFilter) &&
      (ratingFilter === "all" || r.rating === Number(ratingFilter)),
  );

  const countFor = (id: StatusFilter) =>
    id === "all" ? reviews.length : reviews.filter((r) => effStatus(r) === id).length;

  const filtersActive =
    statusFilter !== "all" || sentimentFilter !== "all" || ratingFilter !== "all";

  const handoffReviews = sorted.filter((r) => effStatus(r) === "handoff");

  const draftFor = (r: Review) => drafts[r.id] ?? r.draft?.text ?? "";

  const handleHandoff = (r: Review) => {
    setOverrides((o) => ({ ...o, [r.id]: "handoff" }));
    addEntry({
      actor: "Agency Operator",
      role: "operator",
      verb: "update",
      action: "Routed review to patient relations handoff",
      resource: `review:${r.id}`,
      location_slug: slug,
      detail: "Offline follow-up — no public clap-back; compliant acknowledgment recommended",
    });
    toast.success("Handed off to patient relations", {
      description: `${r.reviewer.name} · moved to the handoff lane · logged to audit trail`,
    });
  };

  const handlePosted = (r: Review, text: string) => {
    setOverrides((o) => ({ ...o, [r.id]: "responded" }));
    setPosted((p) => ({ ...p, [r.id]: { text, date: new Date().toISOString() } }));
  };

  const sessionForLocation = sessionEntries.filter((e) => e.location_slug === slug);
  const auditEntries = [...sessionForLocation, ...fixtureAuditEntries].slice(0, 8);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid items-start gap-4 xl:grid-cols-[420px_minmax(0,1fr)]">
        <Card className="gap-3 p-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-foreground text-[15px] font-semibold">Review inbox</h2>
            <span className="num text-text-tertiary text-[12px]">
              {filtered.length} of {reviews.length}
            </span>
          </div>
          <div
            role="tablist"
            aria-label="Filter by response status"
            className="bg-secondary flex flex-wrap gap-1 rounded-md p-1"
          >
            {STATUS_SEGMENTS.map((s) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={statusFilter === s.id}
                onClick={() => setStatusFilter(s.id)}
                className={cn(
                  "flex-1 rounded px-2 py-1.5 text-[12px] font-medium transition-colors",
                  statusFilter === s.id
                    ? "bg-card text-foreground ring-border shadow-none ring-1"
                    : "text-text-secondary hover:text-foreground",
                )}
              >
                {s.label} <span className="num">{countFor(s.id)}</span>
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={sentimentFilter}
              onValueChange={(v) => setSentimentFilter(v as SentimentFilter)}
            >
              <SelectTrigger
                size="sm"
                aria-label="Filter by sentiment"
                className="text-[12px]"
              >
                <span className="text-text-tertiary">Sentiment:</span>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="positive">Positive</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
                <SelectItem value="negative">Negative</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={ratingFilter}
              onValueChange={(v) => setRatingFilter(v as RatingFilter)}
            >
              <SelectTrigger
                size="sm"
                aria-label="Filter by star rating"
                className="text-[12px]"
              >
                <span className="text-text-tertiary">Rating:</span>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {(["5", "4", "3", "2", "1"] as const).map((r) => (
                  <SelectItem
                    key={r}
                    value={r}
                  >
                    {r}★
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filtersActive && (
              <button
                type="button"
                onClick={() => {
                  setStatusFilter("all");
                  setSentimentFilter("all");
                  setRatingFilter("all");
                }}
                className="text-text-link text-[12px] font-medium hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10">
              <div
                className="flex items-center gap-2"
                aria-hidden
              >
                <span className="bg-primary-200 size-5 rotate-45" />
                <span className="size-5 rounded-full bg-cyan-200" />
              </div>
              <h3 className="text-[14px] font-semibold">No reviews match your filters</h3>
              <button
                type="button"
                onClick={() => {
                  setStatusFilter("all");
                  setSentimentFilter("all");
                  setRatingFilter("all");
                }}
                className="text-text-link text-[13px] font-medium hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="flex max-h-[680px] flex-col gap-2 overflow-y-auto pr-1">
              {filtered.map((r) => (
                <ReviewRow
                  key={r.id}
                  review={r}
                  status={effStatus(r)}
                  selected={r.id === selectedId}
                  onSelect={() => setSelectedId(r.id)}
                />
              ))}
            </div>
          )}
        </Card>
        <Card className="gap-4 p-5">
          {selected ? (
            <DetailPane
              key={selected.id}
              review={selected}
              status={effStatus(selected)}
              draft={draftFor(selected)}
              onDraftChange={(text) => setDrafts((d) => ({ ...d, [selected.id]: text }))}
              postedReply={posted[selected.id]}
              onPosted={(text) => handlePosted(selected, text)}
              onHandoff={() => handleHandoff(selected)}
              checkUrl={checkUrl}
              slug={slug}
              seoCtx={seoCtx}
            />
          ) : (
            <div className="flex flex-col items-center gap-3 py-16">
              <Icons.empty
                className="text-text-tertiary size-6"
                aria-hidden
              />
              <p className="text-text-secondary text-[13px]">
                Select a review from the inbox to read and respond.
              </p>
            </div>
          )}
        </Card>
      </div>
      <Card className="gap-3 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-foreground flex items-center gap-2 text-[15px] font-semibold">
              <Icons.user
                className="text-error-500 size-4"
                aria-hidden
              />
              Patient relations handoff lane
            </h2>
            <p className="text-text-tertiary text-[13px]">
              Critical reviews route offline — public response is limited to a compliant
              acknowledgment, never a clap-back.
            </p>
          </div>
          <span className="num text-text-tertiary text-[12px]">
            {handoffReviews.length} in lane
          </span>
        </div>
        {handoffReviews.length === 0 ? (
          <p className="text-text-secondary text-[13px]">
            No reviews in the handoff lane for this location.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {handoffReviews.map((r) => (
              <div
                key={r.id}
                className="border-border border-l-error-500 flex flex-wrap items-start gap-3 rounded-r-md border border-l-[3px] p-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <Stars
                      rating={r.rating}
                      className="text-[12px]"
                    />
                    <span className="text-[13px] font-semibold">{r.reviewer.name}</span>
                    <span className="num text-text-tertiary text-[11px]">
                      {fmtDateShort(r.date)}
                    </span>
                    <ReviewStatusChip status="handoff" />
                  </div>
                  <PHIContainer className="mt-1.5 py-2">
                    <p className="text-text-secondary line-clamp-2 pr-1 text-[12px] leading-snug">
                      {r.text}
                    </p>
                  </PHIContainer>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedId(r.id)}
                >
                  Open in inbox
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
      <Card className="gap-3 p-5">
        <div>
          <h2 className="text-foreground text-[15px] font-semibold">Review response audit trail</h2>
          <p className="text-text-tertiary text-[13px]">
            Who approved what, when — every post and handoff lands here ·{" "}
            <span className="num">{sessionForLocation.length}</span> this session
          </p>
        </div>
        {auditEntries.length === 0 ? (
          <p className="text-text-secondary text-[13px]">
            No review writes logged yet. Approve a reply through the ladder and it will appear here.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {auditEntries.map((entry) => (
              <AuditLogRow
                key={entry.id}
                entry={entry}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
