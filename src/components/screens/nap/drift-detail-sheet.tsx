"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ApprovalLadder } from "@/components/local/approval-ladder";
import { StatusPill } from "@/components/local/status-pill";
import { SourceBadge } from "@/components/local/source-badge";
import { Icons } from "@/lib/icons";
import { fmtDate } from "@/lib/format";
import { charDiff, correctionPacket, FIELD_LABEL, recommendationFor, type DriftItem } from "./lib";
import { SEVERITY_TONE, STATUS_LABEL, STATUS_TONE } from "./drift-queue";

function DiffBlock({ item }: { item: DriftItem }) {
  const d = charDiff(item.canonical_value, item.observed_value);
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div className="border-border border-l-success-500 rounded-md border border-l-[3px] p-3.5">
        <p className="eyebrow text-text-tertiary">Canonical · source of truth</p>
        <p className="num mt-2 text-[13px] leading-relaxed break-words">
          {d.prefix}
          {d.aMid ? (
            <span className="bg-success-50 text-success-700 dark:bg-success-700/25 dark:text-success-100 rounded-sm px-0.5 font-semibold">
              {d.aMid}
            </span>
          ) : null}
          {d.suffix}
        </p>
      </div>
      <div className="border-border border-l-warning-500 rounded-md border border-l-[3px] p-3.5">
        <p className="eyebrow text-text-tertiary">Observed on {item.directory}</p>
        <p className="num mt-2 text-[13px] leading-relaxed break-words">
          {d.prefix}
          {d.bMid ? (
            <span className="bg-warning-50 text-warning-700 dark:bg-warning-700/25 dark:text-warning-100 rounded-sm px-0.5 font-semibold line-through">
              {d.bMid}
            </span>
          ) : null}
          {d.suffix}
        </p>
      </div>
    </div>
  );
}

export function DriftDetailSheet({
  item,
  slug,
  locationName,
  onOpenChange,
  onQueued,
}: {
  item: DriftItem | null;
  slug: string;
  locationName: string;
  onOpenChange: (open: boolean) => void;
  onQueued: (key: string) => void;
}) {
  const [justQueued, setJustQueued] = React.useState<string | null>(null);
  const prevKeyRef = React.useRef(item?.key ?? null);

  if (item?.key !== prevKeyRef.current) {
    prevKeyRef.current = item?.key ?? null;
    if (justQueued !== null) {
      setJustQueued(null);
    }
  }

  return (
    <Sheet
      open={item !== null}
      onOpenChange={onOpenChange}
    >
      <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-[560px]">
        {item && (
          <>
            <SheetHeader>
              <SheetTitle>
                {item.directory} — {FIELD_LABEL[item.field]} drift
              </SheetTitle>
              <SheetDescription>
                {locationName} · {item.domain}
              </SheetDescription>
            </SheetHeader>
            <div className="flex flex-1 flex-col gap-4 px-4 pb-4">
              <div className="flex flex-wrap items-center gap-1.5">
                <StatusPill tone={SEVERITY_TONE[item.severity]}>{item.severity}</StatusPill>
                <StatusPill tone={STATUS_TONE[item.status]}>{STATUS_LABEL[item.status]}</StatusPill>
                {typeof item.authority === "number" && (
                  <Badge
                    variant="outline"
                    className="text-text-secondary text-[10px] font-medium"
                  >
                    Authority <span className="num ml-1">{item.authority}</span>
                  </Badge>
                )}
                <SourceBadge source={item.source} />
              </div>
              <p className="text-text-tertiary text-[12px]">
                Detected <span className="num">{fmtDate(item.detected_at)}</span>
                {item.derived
                  ? " · observed in the citation scan (derived)"
                  : " · weekly auto-diff vs canonical"}
              </p>
              <DiffBlock item={item} />
              <div className="bg-accent text-accent-foreground flex items-start gap-2 rounded-md p-3 text-[13px] leading-relaxed">
                <Icons.lightbulb
                  className="mt-0.5 size-4 shrink-0"
                  aria-hidden
                />
                <p>
                  <span className="font-semibold">Recommendation:</span> {recommendationFor(item)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {item.status === "open" || justQueued === item.key ? (
                  <ApprovalLadder
                    trigger={
                      justQueued === item.key ? (
                        <span
                          className="hidden"
                          aria-hidden
                        />
                      ) : (
                        <Button size="sm">
                          <Icons.wrench
                            className="size-3.5"
                            aria-hidden
                          />
                          Queue fix
                        </Button>
                      )
                    }
                    title={`Queue ${FIELD_LABEL[item.field].toLowerCase()} fix — ${item.directory}`}
                    description={locationName}
                    actionVerb="Approve & queue fix"
                    auditAction={`Queued NAP ${item.field} correction to ${item.directory}`}
                    auditResource={`${item.domain} listing`}
                    auditVerb="update"
                    locationSlug={slug}
                    preview={
                      <div className="flex flex-col gap-3 text-[13px]">
                        <p>
                          Replace the live{" "}
                          <span className="font-semibold">{FIELD_LABEL[item.field]}</span> on{" "}
                          <span className="font-semibold">{item.directory}</span> with the canonical
                          value:
                        </p>
                        <div className="flex flex-col gap-1.5">
                          <p className="num bg-error-50 text-error-700 dark:bg-error-700/25 dark:text-error-100 rounded-sm px-1.5 py-1 break-words line-through">
                            {item.observed_value}
                          </p>
                          <p className="num bg-success-50 text-success-700 dark:bg-success-700/25 dark:text-success-100 rounded-sm px-1.5 py-1 font-semibold break-words">
                            {item.canonical_value}
                          </p>
                        </div>
                        <p className="text-text-tertiary text-[12px]">
                          The row moves to Fix queued; the next weekly re-scan verifies the
                          correction landed.
                        </p>
                      </div>
                    }
                    onCompleted={() => {
                      setJustQueued(item.key);
                      onQueued(item.key);
                    }}
                  />
                ) : null}
                {item.status !== "open" && (
                  <StatusPill tone={STATUS_TONE[item.status]}>
                    {item.status === "fix_queued"
                      ? "Fix queued — verified by next re-scan"
                      : "Fixed — verified"}
                  </StatusPill>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    void navigator.clipboard.writeText(correctionPacket(item, locationName));
                    toast.success("Correction packet copied");
                  }}
                >
                  <Icons.clipboard
                    className="size-3.5"
                    aria-hidden
                  />
                  Copy packet
                </Button>
              </div>
            </div>
            <SheetFooter className="border-border border-t">
              <Link
                href={`/locations/${slug}/citations`}
                className="text-text-link inline-flex items-center gap-1 text-[13px] font-medium hover:underline"
              >
                Coverage context in Citation tracker
                <Icons.arrowRight
                  className="size-3.5"
                  aria-hidden
                />
              </Link>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
