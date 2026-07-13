"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusPill } from "@/components/local/status-pill";
import { ApprovalLadder } from "@/components/local/approval-ladder";
import { useRole } from "@/components/shell/role-store";
import { Icons } from "@/lib/icons";
import { cn } from "@/lib/utils";

export interface GenContext {
  locationName: string;
  shortName: string;
  city: string;
  state: string;
  facilityLabel: string;
  serviceSeeds: string[];
}

type Tone = "professional" | "warm" | "plain";

const TONE_LABEL: Record<Tone, string> = {
  professional: "Professional",
  warm: "Warm & welcoming",
  plain: "Plain language",
};

const GBP_LIMIT = 750;

function draftBusinessDescription(ctx: GenContext, tone: Tone, variant: number): string {
  const services = ctx.serviceSeeds.slice(0, 3).join(", ");
  const openers: Record<Tone, string[]> = {
    professional: [
      `${ctx.locationName} provides ${ctx.facilityLabel.toLowerCase()} services to the ${ctx.city}, ${ctx.state} community as part of Baptist Medical Group.`,
      `Part of Baptist Medical Group, ${ctx.locationName} delivers ${ctx.facilityLabel.toLowerCase()} care for patients across ${ctx.city} and surrounding areas.`,
    ],
    warm: [
      `At ${ctx.locationName}, neighbors in ${ctx.city}, ${ctx.state} find ${ctx.facilityLabel.toLowerCase()} care from a team that knows them by name \u2014 backed by Baptist Medical Group.`,
      `${ctx.locationName} welcomes ${ctx.city} families with ${ctx.facilityLabel.toLowerCase()} care rooted in the Baptist Medical Group tradition of service.`,
    ],
    plain: [
      `${ctx.locationName} is a ${ctx.facilityLabel.toLowerCase()} clinic in ${ctx.city}, ${ctx.state}. It is part of Baptist Medical Group.`,
      `${ctx.locationName} offers ${ctx.facilityLabel.toLowerCase()} care in ${ctx.city}, ${ctx.state} as part of Baptist Medical Group.`,
    ],
  };
  const middles = services
    ? [` Care includes ${services}.`, ` Patients come to us for ${services}.`]
    : [""];
  const closers = [
    ` Appointments are available for new and established patients; same-week scheduling is often possible. Find hours, directions and appointment links on this profile.`,
    ` The team accepts new patients and most major insurance plans. Hours, directions and booking options are listed on this profile.`,
  ];
  return (
    openers[tone][variant % openers[tone].length] +
    middles[variant % middles.length] +
    closers[variant % closers.length]
  ).slice(0, GBP_LIMIT);
}

function draftServiceDescriptions(ctx: GenContext, tone: Tone): string {
  const seeds = ctx.serviceSeeds.slice(0, 4);
  if (seeds.length === 0) return "No service seeds available for this facility type.";
  return seeds
    .map((s) => {
      const name = s
        .replace(new RegExp(`\\s*(${ctx.city}|${ctx.city} metro)\\s*$`, "i"), "")
        .trim();
      const line =
        tone === "warm"
          ? `Caring, unhurried ${name.toLowerCase()} for ${ctx.city} families.`
          : tone === "plain"
            ? `${name.charAt(0).toUpperCase() + name.slice(1)} at our ${ctx.city} clinic.`
            : `${name.charAt(0).toUpperCase() + name.slice(1)} delivered by Baptist Medical Group providers in ${ctx.city}.`;
      return `\u2022 ${name.charAt(0).toUpperCase() + name.slice(1)} \u2014 ${line}`;
    })
    .join("\n");
}

const SUPERLATIVE_RE = /\b(best|top-rated|#1|number one|greatest|leading|premier)\b/i;
const PHI_RE = /\b(patient named|diagnosed with|treated .* for|medical record)\b/i;

function LintPill({ ok, okLabel, failLabel }: { ok: boolean; okLabel: string; failLabel: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        ok
          ? "border-green-500/40 text-green-700 dark:text-green-400"
          : "border-red-500/40 text-red-600",
      )}
    >
      {ok ? <Icons.check className="size-3" /> : <Icons.alert className="size-3" />}
      {ok ? okLabel : failLabel}
    </span>
  );
}

export function GenerationDrawer({
  mode,
  ctx,
  slug,
  itemLabel,
  triggerLabel,
}: {
  mode: "business_description" | "service_descriptions";
  ctx: GenContext;
  slug: string;
  itemLabel: string;
  triggerLabel: string;
}) {
  const role = useRole();
  const [open, setOpen] = React.useState(false);
  const [tone, setTone] = React.useState<Tone>("professional");
  const [variant, setVariant] = React.useState(0);
  const [text, setText] = React.useState("");
  const [generated, setGenerated] = React.useState(false);
  const [generating, setGenerating] = React.useState(false);

  if (role !== "operator") return null;

  const generate = (v: number) => {
    setGenerating(true);
    window.setTimeout(() => {
      setText(
        mode === "business_description"
          ? draftBusinessDescription(ctx, tone, v)
          : draftServiceDescriptions(ctx, tone),
      );
      setGenerated(true);
      setGenerating(false);
    }, 700);
  };

  const superlativeHit = SUPERLATIVE_RE.test(text);
  const phiHit = PHI_RE.test(text);
  const overLimit = mode === "business_description" && text.length > GBP_LIMIT;
  const lintPass = generated && !superlativeHit && !phiHit && !overLimit && text.trim().length > 0;

  return (
    <Sheet
      open={open}
      onOpenChange={setOpen}
    >
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
        >
          <Icons.sparkles className="size-3.5" />
          {triggerLabel}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-[520px]">
        <SheetHeader>
          <SheetTitle>
            {mode === "business_description"
              ? "Generate business description"
              : "Generate service descriptions"}
          </SheetTitle>
          <SheetDescription>
            {ctx.locationName} \u00b7 {itemLabel}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4 px-4 pb-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[13px] font-medium">Tone</Label>
              <Select
                value={tone}
                onValueChange={(v) => setTone(v as Tone)}
              >
                <SelectTrigger className="mt-1.5 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(TONE_LABEL) as Tone[]).map((t) => (
                    <SelectItem
                      key={t}
                      value={t}
                    >
                      {TONE_LABEL[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant={generated ? "outline" : "default"}
                className="w-full"
                onClick={() => {
                  const v = generated ? variant + 1 : variant;
                  setVariant(v);
                  generate(v);
                }}
                disabled={generating}
              >
                {generating ? (
                  "Drafting\u2026"
                ) : generated ? (
                  <>
                    <Icons.refreshCcw className="size-4" />
                    Regenerate
                  </>
                ) : (
                  <>
                    <Icons.sparkles className="size-4" />
                    Generate draft
                  </>
                )}
              </Button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label
                htmlFor="gen-draft"
                className="text-[13px] font-medium"
              >
                Draft {generated && `\u00b7 v${variant + 1}`}
              </Label>
              {mode === "business_description" && (
                <span
                  className={cn(
                    "num text-[11.5px]",
                    overLimit ? "font-semibold text-red-600" : "text-muted-foreground",
                  )}
                >
                  {text.length}/{GBP_LIMIT}
                </span>
              )}
            </div>
            <Textarea
              id="gen-draft"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Generate a draft, then edit freely before approval."
              className="mt-1.5 min-h-44 text-[13px] leading-relaxed"
            />
          </div>

          {generated && (
            <div className="flex flex-wrap gap-1.5">
              <LintPill
                ok={!phiHit}
                okLabel="No PHI"
                failLabel="PHI language detected"
              />
              <LintPill
                ok={!superlativeHit}
                okLabel="No superlative claims"
                failLabel="Superlative claim \u2014 rephrase"
              />
              {mode === "business_description" && (
                <LintPill
                  ok={!overLimit}
                  okLabel="Within GBP 750"
                  failLabel="Over GBP 750-char limit"
                />
              )}
            </div>
          )}

          <p className="text-muted-foreground text-[12px]">
            Drafted locally from fixture facts (name, city, service lines). Live mode: Claude Sonnet
            5 (Vertex) with the same knobs and lint gates.
          </p>
          <StatusPill tone="warning">Demo mode \u2014 write simulated</StatusPill>
        </div>

        <SheetFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <ApprovalLadder
            trigger={
              <Button disabled={!lintPass}>
                <Icons.approve className="size-4" />
                Approve & queue write
              </Button>
            }
            title={
              mode === "business_description"
                ? "Queue business description write"
                : "Queue service description write"
            }
            description={ctx.shortName}
            actionVerb="Approve & queue write"
            auditAction={
              mode === "business_description"
                ? "Queued business description write"
                : "Queued service description write"
            }
            auditResource={`gbp:${slug}/description`}
            auditVerb="update"
            locationSlug={slug}
            preview={
              <div className="flex flex-col gap-2 text-[13px]">
                <p>
                  Write the following{" "}
                  {mode === "business_description"
                    ? "business description"
                    : "service descriptions"}{" "}
                  to the GBP:
                </p>
                <div className="border-border bg-muted/30 max-h-48 overflow-y-auto rounded border p-3 text-[12px] leading-relaxed whitespace-pre-wrap">
                  {text}
                </div>
              </div>
            }
            gate={
              !lintPass
                ? {
                    blocked: true,
                    label: "Cannot approve \u2014 lint check failed",
                    detail: "Resolve all flagged issues before writing.",
                  }
                : undefined
            }
          />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
