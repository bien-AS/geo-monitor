"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Icons } from "@/lib/icons";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { StatusPill, type PillTone } from "@/components/local/status-pill";
import { ApprovalLadder } from "@/components/local/approval-ladder";
import { useRole } from "@/components/shell/role-store";
import { useRecs } from "@/store/action-center";
import { fmtDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ActionRec, RecStatus } from "@/lib/data/types";

const KIND_META: Record<ActionRec["kind"], { label: string; tone: PillTone }> = {
  nap_drift: { label: "NAP", tone: "warning" },
  citations: { label: "Citations", tone: "info" },
  ai_gap: { label: "AI visibility", tone: "error" },
  reviews: { label: "Reviews", tone: "info" },
  gbp_content: { label: "GBP content", tone: "neutral" },
};

const SEV_TONE: Record<ActionRec["severity"], PillTone> = {
  high: "error",
  medium: "warning",
  low: "neutral",
};

export function ActionCenterScreen({ recs: baseRecs }: { recs: ActionRec[] }) {
  const role = useRole();
  const { moves, move } = useRecs();
  const [tab, setTab] = React.useState<RecStatus>("backlog");
  const [detail, setDetail] = React.useState<ActionRec | null>(null);

  const recs = baseRecs.map((r) => ({ ...r, status: moves[r.id] ?? r.status }));
  const byStatus = (s: RecStatus) => recs.filter((r) => r.status === s);
  const counts: Record<RecStatus, number> = {
    backlog: byStatus("backlog").length,
    in_approval: byStatus("in_approval").length,
    published: byStatus("published").length,
  };
  const isOperator = role === "operator";

  return (
    <div className="flex max-w-4xl flex-col gap-5">
      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as RecStatus)}
      >
        <TabsList>
          <TabsTrigger value="backlog">
            Backlog <span className="ml-1 tabular-nums">{counts.backlog}</span>
          </TabsTrigger>
          <TabsTrigger value="in_approval">
            Approval queue <span className="ml-1 tabular-nums">{counts.in_approval}</span>
          </TabsTrigger>
          <TabsTrigger value="published">
            Published & impact <span className="ml-1 tabular-nums">{counts.published}</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Card className="gap-0 p-0">
        {byStatus(tab).map((r, i) => (
          <div
            key={r.id}
            className={cn(
              "flex items-center gap-3 px-5 py-4",
              i > 0 && "border-border-subtle border-t",
            )}
          >
            <button
              type="button"
              onClick={() => setDetail(r)}
              className="min-w-0 flex-1 text-left"
            >
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill tone={SEV_TONE[r.severity]}>
                  {r.severity === "high" ? "High" : r.severity === "medium" ? "Medium" : "Low"}
                </StatusPill>
                <StatusPill tone={KIND_META[r.kind].tone}>{KIND_META[r.kind].label}</StatusPill>
                <p className="text-[13.5px] font-semibold hover:underline">{r.title}</p>
              </div>
              <p className="text-text-tertiary mt-0.5 text-[12.5px]">
                {r.location_name} - {r.impact}
                {r.status === "published" && r.outcome && (
                  <span className="text-success ml-1 font-medium">- {r.outcome}</span>
                )}
              </p>
            </button>
            <div className="flex shrink-0 items-center gap-1.5">
              {r.status === "published" && r.measure_window && (
                <StatusPill tone="success">
                  <Icons.trendingUp className="size-3" />
                  Measured {r.measure_window}
                </StatusPill>
              )}
              {isOperator && r.status === "backlog" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    move(r.id, "in_approval");
                    toast.success("Sent to approval queue", { description: r.title });
                  }}
                >
                  <Icons.send className="size-3.5" />
                  Send to approval
                </Button>
              )}
              {isOperator && r.status === "in_approval" && (
                <ApprovalLadder
                  trigger={
                    <Button
                      variant="outline"
                      size="sm"
                    >
                      Approve & publish
                    </Button>
                  }
                  title={`Publish: ${r.title}`}
                  description={`${r.location_name} - ${KIND_META[r.kind].label}`}
                  actionVerb="Approve & publish"
                  auditAction={`Published action: ${r.title} (${r.location_name})`}
                  auditResource={`action-center:${r.id}`}
                  auditVerb="create"
                  locationSlug={r.location_slug}
                  preview={
                    <div className="space-y-1.5 text-[13px]">
                      <p className="font-semibold">{r.title}</p>
                      <p className="text-text-secondary">{r.impact}</p>
                      <p className="text-text-tertiary text-[12px]">
                        Impact re-measures at 14/30/90-day windows after publish.
                      </p>
                    </div>
                  }
                  onCompleted={() => move(r.id, "published")}
                />
              )}
            </div>
          </div>
        ))}
        {byStatus(tab).length === 0 && (
          <div className="flex flex-col items-center gap-2 p-10">
            <Icons.listTodo className="text-text-tertiary size-6" />
            <p className="text-text-tertiary text-[13px]">Nothing in this lane.</p>
          </div>
        )}
      </Card>

      <Sheet
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
      >
        <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-[460px]">
          {detail && (
            <>
              <SheetHeader>
                <SheetTitle>{detail.title}</SheetTitle>
                <SheetDescription>
                  {detail.location_name} - {KIND_META[detail.kind].label} - {detail.impact}
                </SheetDescription>
              </SheetHeader>
              <div className="flex flex-1 flex-col gap-4 px-4 pb-4">
                <div>
                  <p className="eyebrow text-text-tertiary">Evidence</p>
                  <ul className="mt-1.5 flex flex-col gap-1.5">
                    {detail.evidence.map((e) => (
                      <li
                        key={e}
                        className="border-border-subtle bg-secondary rounded-md border px-3 py-2 text-[12.5px] leading-snug"
                      >
                        {e}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="eyebrow text-text-tertiary flex items-center gap-1.5">
                    <Icons.flask className="size-3.5" />
                    Methodology
                  </p>
                  <p className="text-text-secondary mt-1.5 text-[12.5px] leading-relaxed">
                    {detail.methodology}
                  </p>
                </div>
                {detail.published_at && (
                  <p className="text-text-tertiary text-[12px] tabular-nums">
                    Published {fmtDate(detail.published_at)} - impact window {detail.measure_window}
                  </p>
                )}
                <Button
                  asChild
                  className="mt-auto"
                >
                  <Link href={detail.generate_href}>
                    {detail.generate_label}
                    <Icons.arrowUpRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
