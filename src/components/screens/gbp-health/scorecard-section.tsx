import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusPill, type PillTone } from "@/components/local/status-pill";
import { SourceBadge } from "@/components/local/source-badge";
import { ApprovalLadder } from "@/components/local/approval-ladder";
import { Icons } from "@/lib/icons";
import type { ScorecardItem } from "@/lib/data/types";
import { SCORECARD_IMPACT } from "@/lib/scorecard";
import type { ItemProposal } from "./proposals";
import { GenerationDrawer, type GenContext } from "./generation-drawer";

const STATUS_TONE: Record<ScorecardItem["status"], PillTone> = {
  pass: "success",
  attention: "warning",
  fail: "error",
  unknown: "neutral",
};

const STATUS_LABEL: Record<ScorecardItem["status"], string> = {
  pass: "Pass",
  attention: "Attention",
  fail: "Fail",
  unknown: "Unknown",
};

export function ScorecardSection({
  items,
  proposals,
  slug,
  genCtx,
}: {
  items: ScorecardItem[];
  proposals: Record<string, ItemProposal>;
  slug: string;
  genCtx: GenContext;
}) {
  return (
    <Card className="gap-5 p-6">
      <div>
        <h2 className="text-lg font-semibold">16-point healthcare scorecard</h2>
        <p className="text-muted-foreground text-[13px]">
          Every failing item ends in a verb \u2014 preview, approve, simulated write, audit log
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        {items.map((item) => {
          const proposal = proposals[item.id];
          return (
            <div
              key={item.id}
              className="border-border flex flex-col gap-2.5 rounded-lg border p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-start gap-2.5">
                  <span className="num bg-secondary text-muted-foreground mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md text-[11px] font-bold">
                    {item.n}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[13px] leading-snug font-semibold">{item.label}</p>
                    <p className="text-muted-foreground mt-0.5 text-[12px] leading-snug">
                      {item.detail}
                    </p>
                    {SCORECARD_IMPACT[item.id] && (
                      <p className="border-border text-muted-foreground mt-1.5 border-l-2 pl-2 text-[11.5px] leading-snug">
                        <span className="text-foreground font-semibold">Why it matters:</span>{" "}
                        {SCORECARD_IMPACT[item.id]}
                      </p>
                    )}
                  </div>
                </div>
                <StatusPill
                  tone={STATUS_TONE[item.status]}
                  className="shrink-0"
                >
                  {STATUS_LABEL[item.status]}
                </StatusPill>
              </div>
              <div className="flex min-h-8 items-center justify-between gap-2 pl-[34px]">
                <SourceBadge source={item.source} />
                {item.id === "description_profile" ? (
                  <GenerationDrawer
                    mode="business_description"
                    ctx={genCtx}
                    slug={slug}
                    itemLabel={item.label}
                    triggerLabel={item.action ?? "Refresh description"}
                  />
                ) : item.id === "services_menu" ? (
                  <GenerationDrawer
                    mode="service_descriptions"
                    ctx={genCtx}
                    slug={slug}
                    itemLabel={item.label}
                    triggerLabel={item.action ?? "Draft service copy"}
                  />
                ) : item.action ? (
                  item.id === "reviews_health" ? (
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                    >
                      <Link href={`/locations/${slug}/reviews`}>
                        {item.action}
                        <Icons.arrowRight className="size-3.5" />
                      </Link>
                    </Button>
                  ) : proposal ? (
                    <ApprovalLadder
                      trigger={
                        <Button
                          variant="outline"
                          size="sm"
                        >
                          {item.action}
                          <Icons.arrowRight className="size-3.5" />
                        </Button>
                      }
                      title={`${item.action} \u2014 item ${item.n} of 16`}
                      description={item.label}
                      actionVerb="Approve & queue write"
                      auditAction={proposal.auditAction}
                      auditResource={proposal.auditResource}
                      auditVerb={proposal.auditVerb}
                      locationSlug={slug}
                      preview={
                        <ProposalPreview
                          item={item}
                          proposal={proposal}
                        />
                      }
                    />
                  ) : null
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function ProposalPreview({ item, proposal }: { item: ScorecardItem; proposal: ItemProposal }) {
  return (
    <div className="flex flex-col gap-3 text-[13px]">
      <div>
        <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.05em] uppercase">
          Current finding
        </p>
        <p className="text-muted-foreground mt-1">{item.detail}</p>
      </div>
      <div>
        <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.05em] uppercase">
          Proposed write
        </p>
        <p className="mt-1">{proposal.intro}</p>
        {proposal.changes && proposal.changes.length > 0 ? (
          <div className="mt-2 flex flex-col gap-1.5">
            {proposal.changes.map((ch, i) => (
              <div
                key={`${ch.label}-${i}`}
                className="border-border bg-card rounded-md border p-2.5"
              >
                <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.05em] uppercase">
                  {ch.label}
                </p>
                {ch.from ? (
                  <p className="num mt-0.5 text-[12px] text-red-700 line-through dark:text-red-300">
                    {ch.from}
                  </p>
                ) : null}
                <p className="num mt-0.5 text-[12px] font-semibold text-green-700 dark:text-green-300">
                  {ch.to}
                </p>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
