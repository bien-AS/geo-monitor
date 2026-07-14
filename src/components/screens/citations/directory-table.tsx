"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { fmtDateShort } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusPill, type PillTone } from "@/components/local/status-pill";
import { SourceBadge } from "@/components/local/source-badge";
import { ApprovalLadder } from "@/components/local/approval-ladder";
import { Icons } from "@/lib/icons";
import { checkOutcome, useCitations } from "./citations-store";
import { furthestStage } from "./pipeline-stepper";
import type { CitationRow, NAP } from "@/lib/data/types";
import { ParityDiff, STATUS_LABEL, STATUS_TONE } from "./citation-parity-diff-strip";

const BAND_LABEL: Record<CitationRow["authority_band"], string> = {
  "very-high": "Very High",
  high: "High",
  medium: "Medium",
  low: "Low",
};

const BAND_TONE: Record<CitationRow["authority_band"], PillTone> = {
  "very-high": "success",
  high: "info",
  medium: "warning",
  low: "neutral",
};

const DELTA_LABEL: Record<CitationRow["delta_since_last"], string> = {
  stable: "Stable",
  changed: "Changed",
  fixed: "Fixed",
};

const DELTA_TONE: Record<CitationRow["delta_since_last"], PillTone> = {
  stable: "neutral",
  changed: "warning",
  fixed: "success",
};

function IndexCell({ row, slug }: { row: CitationRow; slug: string }) {
  const submitForIndexing = useCitations((s) => s.submitForIndexing);
  const recordIndexCheck = useCitations((s) => s.recordIndexCheck);
  const stage = furthestStage(row);
  const effective =
    stage === "indexed" ? "indexed" : stage === "indexing" ? "checking" : row.indexation;

  return (
    <span className="flex items-center gap-1.5">
      <IndexationPill status={effective} />
      {stage === "live" && (
        <ApprovalLadder
          trigger={
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-1.5 text-[11px]"
            >
              Submit
            </Button>
          }
          title={`Submit ${row.domain} for indexing`}
          description="Omega Indexer — pushes the live listing URL into the index queue"
          actionVerb="Approve & submit"
          auditAction={`Submitted ${row.domain} listing to Omega Indexer`}
          auditResource={`citations:${slug}:${row.domain}:index-submit`}
          auditVerb="create"
          locationSlug={slug}
          cost={{
            value: "$0.02",
            math: "1 URL × $0.02 Omega Indexer submission",
            subline: "Demo mode — submission simulated",
          }}
          preview={
            <p className="text-[13px]">
              <span className="num">{row.listing_url ?? row.domain}</span> enters the Omega queue;
              IndexCheckr verifies it in the next check pass.
            </p>
          }
          onCompleted={() => submitForIndexing(slug, [row.domain])}
        />
      )}
      {stage === "indexing" && (
        <ApprovalLadder
          trigger={
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-1.5 text-[11px]"
            >
              Check
            </Button>
          }
          title={`Check index status — ${row.domain}`}
          description="IndexCheckr — verifies the listing URL in Google's index"
          actionVerb="Approve & check"
          auditAction={`Ran index check on ${row.domain}`}
          auditResource={`citations:${slug}:${row.domain}:index-check`}
          auditVerb="create"
          locationSlug={slug}
          cost={{
            value: "$0.01",
            math: "1 URL × $0.01 IndexCheckr verification",
            subline: "Demo mode — check simulated",
          }}
          preview={
            <p className="text-[13px]">
              One verification pass on <span className="num">{row.domain}</span>.
            </p>
          }
          onCompleted={() =>
            recordIndexCheck(slug, [{ domain: row.domain, result: checkOutcome(row.domain) }])
          }
        />
      )}
    </span>
  );
}

function IndexationPill({ status }: { status?: import("@/lib/data/types").IndexationStatus }) {
  switch (status) {
    case "indexed":
      return <StatusPill tone="success">Indexed</StatusPill>;
    case "not_indexed":
      return <StatusPill tone="error">Not indexed</StatusPill>;
    case "checking":
      return <StatusPill tone="info">Checking</StatusPill>;
    default:
      return <StatusPill tone="neutral">Not checked</StatusPill>;
  }
}

function NapMicroPills({ row }: { row: CitationRow }) {
  if (!row.listed || !row.field_match) {
    return (
      <StatusPill
        tone="neutral"
        className="px-1.5"
      >
        Not listed
      </StatusPill>
    );
  }
  const fields = [
    { letter: "N", label: "Name", match: row.field_match.name },
    { letter: "A", label: "Address", match: row.field_match.address },
    { letter: "P", label: "Phone", match: row.field_match.phone },
  ];
  return (
    <span className="inline-flex items-center gap-1">
      {fields.map((f) => (
        <StatusPill
          key={f.letter}
          tone={f.match ? "success" : "warning"}
          className="px-1.5"
          aria-label={`${f.label} ${f.match ? "matches" : "does not match"} canonical`}
        >
          {f.letter}
        </StatusPill>
      ))}
    </span>
  );
}

function RowAction({ row, canonical, slug }: { row: CitationRow; canonical: NAP; slug: string }) {
  if (row.status === "present") {
    return <span className="text-text-tertiary text-[12px]">No action needed</span>;
  }

  if (row.status === "mismatch") {
    return (
      <ApprovalLadder
        trigger={
          <Button
            variant="outline"
            size="sm"
          >
            <Icons.wrench className="size-3.5" />
            Queue fix
          </Button>
        }
        title={`Queue NAP correction — ${row.directory}`}
        description="Sets the mismatched fields on the live listing to the canonical values"
        actionVerb="Approve & queue fix"
        auditAction={`Queued NAP correction to ${row.directory}`}
        auditResource={`${row.domain} listing`}
        auditVerb="update"
        locationSlug={slug}
        preview={
          <div className="flex flex-col gap-3">
            <ParityDiff
              canonical={canonical}
              observed={row.nap_observed}
              fieldMatch={row.field_match}
              listed={row.listed}
            />
            <p className="text-text-secondary text-[12px]">
              Mismatched fields are overwritten with the highlighted canonical values; matching
              fields are left untouched.
            </p>
          </div>
        }
      />
    );
  }

  if (row.status === "missing") {
    return (
      <ApprovalLadder
        trigger={
          <Button
            variant="outline"
            size="sm"
          >
            <Icons.filePlus className="size-3.5" />
            Submit listing
          </Button>
        }
        title={`Submit new listing — ${row.directory}`}
        description="Creates the listing from the canonical NAP record"
        actionVerb="Approve & submit"
        auditAction={`Submitted new listing to ${row.directory}`}
        auditResource={`${row.domain} listing`}
        auditVerb="create"
        locationSlug={slug}
        preview={
          <div className="flex flex-col gap-2">
            <p className="text-[13px]">
              Listing payload for <span className="font-semibold">{row.directory}</span> — exact
              canonical values:
            </p>
            <dl className="flex flex-col gap-1.5">
              {(
                [
                  ["Name", canonical.name],
                  ["Address", canonical.address],
                  ["Phone", canonical.phone],
                  ["Website", canonical.website],
                ] as const
              )
                .filter(([, v]) => Boolean(v))
                .map(([label, value]) => (
                  <div
                    key={label}
                    className="border-border bg-card rounded-md border px-2.5 py-1.5"
                  >
                    <dt className="eyebrow text-text-tertiary">{label}</dt>
                    <dd className="num mt-0.5 text-[12px] font-medium break-all">{value}</dd>
                  </div>
                ))}
            </dl>
          </div>
        }
      />
    );
  }

  return (
    <ApprovalLadder
      trigger={
        <Button
          variant="outline"
          size="sm"
        >
          <Icons.copy className="size-3.5" />
          Review duplicate
        </Button>
      }
      title={`Review duplicate — ${row.directory}`}
      description="Flags the competing listing for merge / removal request"
      actionVerb="Approve & flag for merge"
      auditAction={`Flagged duplicate ${row.directory} listing for merge`}
      auditResource={`${row.domain} duplicate listing`}
      auditVerb="update"
      locationSlug={slug}
      preview={
        <div className="flex flex-col gap-3">
          <div className="border-border border-l-success-500 bg-card rounded-md border border-l-[3px] px-3 py-2">
            <p className="eyebrow text-text-tertiary">Primary listing · canonical</p>
            <p className="num mt-1 text-[12px] font-medium break-all">{canonical.name}</p>
            <p className="num text-text-secondary text-[12px] break-all">
              {canonical.address} · {canonical.phone}
            </p>
          </div>
          <div className="border-border border-l-error-500 bg-card rounded-md border border-l-[3px] px-3 py-2">
            <p className="eyebrow text-text-tertiary">Duplicate variant observed</p>
            <p className="num mt-1 text-[12px] font-medium break-all">
              {row.nap_observed?.name ?? canonical.name}
            </p>
            <p className="num text-text-secondary text-[12px] break-all">
              {row.nap_observed?.address ?? "Address matches canonical"}
              {row.nap_observed?.phone ? ` · ${row.nap_observed.phone}` : ""}
            </p>
          </div>
          <p className="text-text-secondary text-[12px]">
            The duplicate splits reviews and rank signals across two records.
          </p>
        </div>
      }
    />
  );
}

export function DirectoryTable({
  title,
  eyebrow,
  description,
  rows,
  totalInGroup,
  canonical,
  slug,
  healthAccent = false,
  filterLabel,
}: {
  title: string;
  eyebrow: string;
  description: string;
  rows: CitationRow[];
  totalInGroup: number;
  canonical: NAP;
  slug: string;
  healthAccent?: boolean;
  filterLabel?: string;
}) {
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());

  const toggle = (domain: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(domain)) next.delete(domain);
      else next.add(domain);
      return next;
    });

  const issues = rows.filter((r) => r.status !== "present").length;

  const copyCorrectionPacket = async (row: CitationRow) => {
    const mismatched = (
      [
        ["name", "Name"],
        ["address", "Address"],
        ["phone", "Phone"],
      ] as const
    ).filter(([key]) => row.field_match && !row.field_match[key]);
    const lines = [
      `Directory: ${row.directory} (${row.domain})`,
      ...mismatched.map(
        ([key, label]) =>
          `${label}: "${row.nap_observed?.[key] ?? "(unpublished)"}" → "${canonical[key]}"`,
      ),
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      toast.success("Correction packet copied", {
        description: `${row.directory} · ${mismatched.length} field${mismatched.length === 1 ? "" : "s"}`,
      });
    } catch {
      toast.error("Copy failed", { description: "Clipboard unavailable" });
    }
  };

  return (
    <Card className={cn("gap-4 p-6", healthAccent && "border-l-primary-500 border-l-[3px]")}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="eyebrow text-text-tertiary">{eyebrow}</p>
          <h2 className="mt-0.5 text-lg font-semibold">{title}</h2>
          <p className="text-text-secondary mt-0.5 text-[13px]">{description}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <SourceBadge source="synthetic" />
          <p className="text-text-tertiary text-[12px]">
            <span className="num text-foreground font-semibold">{rows.length}</span> of{" "}
            <span className="num">{totalInGroup}</span> shown
            {filterLabel ? ` · filtered to ${filterLabel}` : ""} ·{" "}
            <span className="num text-foreground font-semibold">{issues}</span> need attention
          </p>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="diamond-watermark border-border flex flex-col items-center gap-2 rounded-md border border-dashed py-10 text-center">
          <span
            aria-hidden
            className="flex items-center gap-1.5"
          >
            <span className="bg-primary-200 size-3 rotate-45" />
            <span className="size-3 rotate-45 bg-cyan-200" />
          </span>
          <h3 className="text-sm font-semibold">No {filterLabel ?? ""} listings in this group</h3>
          <p className="text-text-tertiary text-[13px]">
            Clear the status filter to see all {totalInGroup} directories.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[220px]">Directory</TableHead>
                <TableHead className="text-right">Authority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>NAP match</TableHead>
                <TableHead>Indexed</TableHead>
                <TableHead className="text-right">Last checked</TableHead>
                <TableHead>Δ since last</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => {
                const isOpen = expanded.has(row.domain);
                const panelId = `parity-${slug}-${row.domain.replace(/[^a-z0-9]/gi, "-")}`;
                return (
                  <React.Fragment key={row.domain}>
                    <TableRow
                      onClick={() => toggle(row.domain)}
                      aria-expanded={isOpen}
                      className={cn(
                        "cursor-pointer",
                        row.status === "mismatch" &&
                          "border-l-warning-500 bg-warning-50/40 dark:bg-warning-700/10 border-l-[3px]",
                        row.status === "duplicate" &&
                          "border-l-error-500 bg-error-50/40 dark:bg-error-700/10 border-l-[3px]",
                      )}
                    >
                      <TableCell>
                        <span className="flex items-center gap-2">
                          <button
                            type="button"
                            aria-expanded={isOpen}
                            aria-controls={panelId}
                            aria-label={`${isOpen ? "Collapse" : "Expand"} parity diff for ${row.directory}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggle(row.domain);
                            }}
                            className="text-text-tertiary hover:bg-secondary flex size-6 shrink-0 items-center justify-center rounded-md"
                          >
                            <Icons.chevronDown
                              aria-hidden
                              className={cn("size-4 transition-transform", isOpen && "rotate-180")}
                            />
                          </button>
                          <span className="min-w-0">
                            <span className="text-foreground block truncate text-[13px] font-medium">
                              {row.directory}
                            </span>
                            <span className="text-text-tertiary block truncate text-[12px]">
                              {row.domain}
                            </span>
                          </span>
                        </span>
                      </TableCell>
                      <TableCell className="tnum text-right">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="num text-[13px] font-semibold">{row.authority}</span>
                          <StatusPill tone={BAND_TONE[row.authority_band]}>
                            {BAND_LABEL[row.authority_band]}
                          </StatusPill>
                        </span>
                      </TableCell>
                      <TableCell>
                        {row.status === "missing" && row.pipeline_status === "ordered" ? (
                          <StatusPill tone="info">Ordered</StatusPill>
                        ) : (
                          <StatusPill tone={STATUS_TONE[row.status]}>
                            {STATUS_LABEL[row.status]}
                          </StatusPill>
                        )}
                      </TableCell>
                      <TableCell>
                        <NapMicroPills row={row} />
                      </TableCell>
                      <TableCell>
                        <IndexCell
                          row={row}
                          slug={slug}
                        />
                      </TableCell>
                      <TableCell className="tnum text-right">
                        <span className="num text-text-secondary text-[12px]">
                          {fmtDateShort(row.last_checked)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <StatusPill tone={DELTA_TONE[row.delta_since_last]}>
                          {DELTA_LABEL[row.delta_since_last]}
                        </StatusPill>
                      </TableCell>
                      <TableCell
                        className="text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <RowAction
                          row={row}
                          canonical={canonical}
                          slug={slug}
                        />
                      </TableCell>
                    </TableRow>
                    {isOpen && (
                      <TableRow className="hover:bg-transparent">
                        <TableCell
                          colSpan={8}
                          className="p-0"
                        >
                          <div
                            id={panelId}
                            className="border-l-border-emphasis bg-neutral-25 dark:bg-surface-muted flex flex-col gap-3 border-l-[3px] px-5 py-4"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="eyebrow text-text-tertiary">
                                Canonical vs observed · field-by-field
                              </p>
                              <SourceBadge source={row.source} />
                            </div>
                            <ParityDiff
                              canonical={canonical}
                              observed={row.nap_observed}
                              fieldMatch={row.field_match}
                              listed={row.listed}
                            />
                            {row.status !== "present" && (
                              <p className="bg-accent text-accent-foreground rounded-md px-3 py-2 text-[12px]">
                                What this costs you: inconsistent NAP fragments the entity graph
                                Google builds for this location, suppressing map-pack rank and
                                risking attribution drift to a sibling Baptist listing.
                              </p>
                            )}
                            <div className="flex flex-wrap items-center gap-2">
                              {row.status === "mismatch" && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => copyCorrectionPacket(row)}
                                  >
                                    <Icons.copy className="size-3.5" />
                                    Copy correction packet
                                  </Button>
                                  <Button
                                    asChild
                                    variant="outline"
                                    size="sm"
                                  >
                                    <Link href={`/locations/${slug}/citations`}>
                                      Tracked in NAP monitor
                                      <Icons.arrowRight className="size-3.5" />
                                    </Link>
                                  </Button>
                                </>
                              )}
                              {row.domain === "google.com" && (
                                <Button
                                  asChild
                                  variant="outline"
                                  size="sm"
                                >
                                  <Link href={`/locations/${slug}/gbp-health`}>
                                    Manage in GBP Health
                                    <Icons.arrowRight className="size-3.5" />
                                  </Link>
                                </Button>
                              )}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
}
