"use client";

import * as React from "react";
import { toast } from "sonner";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StatusPill } from "@/components/local/status-pill";
import { useAuditLog } from "@/components/local/audit-log-store";
import { useRole } from "@/components/shell/role-store";
import { Icons } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { CitationAggregator, CitationRow } from "@/lib/data/types";
import { useCitations } from "./citations-store";

const PACKAGES = [
  { id: "cb0", label: "cb0", desc: "Aggregators only" },
  { id: "cb10", label: "cb10", desc: "10 citations" },
  { id: "cb15", label: "cb15", desc: "15 citations" },
  { id: "cb25", label: "cb25", desc: "25 citations" },
  { id: "cb30", label: "cb30", desc: "30 citations" },
  { id: "cb50", label: "cb50", desc: "50 citations" },
  { id: "cb75", label: "cb75", desc: "75 citations" },
  { id: "cb100", label: "cb100", desc: "100 citations" },
] as const;

function pkgCapacity(id: string): number {
  return id === "cb0" ? 0 : Number(id.replace("cb", ""));
}

function bestPackageFor(count: number): string {
  for (const p of PACKAGES.slice(1)) {
    if (pkgCapacity(p.id) >= count) return p.id;
  }
  return "cb100";
}

export function OrderDrawer({
  slug,
  locationName,
  missing,
  aggregators,
}: {
  slug: string;
  locationName: string;
  missing: CitationRow[];
  aggregators: CitationAggregator[];
}) {
  const role = useRole();
  const addEntry = useAuditLog((s) => s.addEntry);
  const recordOrder = useCitations((s) => s.recordOrder);

  const [open, setOpen] = React.useState(false);
  const [autoSelect, setAutoSelect] = React.useState(false);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [publishers, setPublishers] = React.useState<Set<string>>(new Set());
  const [express, setExpress] = React.useState(false);
  const [notes, setNotes] = React.useState("");
  const [confirming, setConfirming] = React.useState(false);

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) {
        setSelected(new Set(missing.slice(0, 10).map((m) => m.domain)));
        setPublishers(
          new Set(aggregators.filter((a) => a.status !== "synced").map((a) => a.bl_publisher)),
        );
        setAutoSelect(false);
        setExpress(false);
        setNotes("");
        setConfirming(false);
      }
      setOpen(nextOpen);
    },
    [missing, aggregators],
  );

  if (role !== "operator") return null;

  const count = autoSelect ? Math.min(missing.length, 25) : selected.size;
  const pkg = count === 0 && publishers.size > 0 ? "cb0" : bestPackageFor(count);
  const canOrder = count > 0 || publishers.size > 0;

  const toggle = (domain: string) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(domain)) next.delete(domain);
      else next.add(domain);
      return next;
    });

  const placeOrder = () => {
    setConfirming(true);
    const domains = autoSelect ? missing.slice(0, count).map((m) => m.domain) : [...selected];
    window.setTimeout(() => {
      recordOrder(slug, domains, pkg, express);
      addEntry({
        actor: "Agency Operator",
        role: "operator",
        verb: "create",
        action: `Ordered citations — ${pkg} (${domains.length} directories${publishers.size ? ` + ${publishers.size} aggregators` : ""})${express ? " · express" : ""}`,
        resource: `brightlocal:citation-builder:${slug}`,
        location_slug: slug,
        detail:
          "Demo mode — order simulated. Live: POST /manage/v1/citation-builder → PUT …/confirm (spends credits, env-gated).",
      });
      toast.success("Citation order placed", {
        description: `${pkg} · ${domains.length} directories queued — submission → indexing → index check will track per row`,
      });
      setOpen(false);
    }, 900);
  };

  return (
    <Sheet
      open={open}
      onOpenChange={handleOpenChange}
    >
      <SheetTrigger asChild>
        <Button size="sm">
          <Icons.package className="size-4" />
          Order missing citations
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-[480px]">
        <SheetHeader>
          <SheetTitle>Order citations — Bright Local</SheetTitle>
          <SheetDescription>
            {locationName} · <span className="num">{missing.length}</span> missing directories ·
            canonical NAP ships with the order
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-1 flex-col gap-5 px-4 pb-4">
          <div className="cost-preview-block rounded-r-md p-4">
            <p className="eyebrow text-text-tertiary">Order scope</p>
            <p className="num mt-1 text-[17px] font-bold">
              {pkg} · {count} directories
              {publishers.size > 0 && ` + ${publishers.size} aggregators`}
            </p>
            <p className="text-text-tertiary mt-1 text-[12px]">
              Packages: cb10–cb100 · cb0 = aggregators-only
            </p>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div>
              <Label
                htmlFor="auto-select"
                className="text-[13px] font-medium"
              >
                Let Bright Local pick sites
              </Label>
              <p className="text-text-tertiary text-[12px]">
                auto_select: true — BL chooses suitable directories
              </p>
            </div>
            <Switch
              id="auto-select"
              checked={autoSelect}
              onCheckedChange={setAutoSelect}
            />
          </div>
          {!autoSelect && (
            <div className="border-border flex max-h-64 flex-col gap-1 overflow-y-auto rounded-md border p-2">
              {missing.map((m) => (
                <label
                  key={m.domain}
                  className={cn(
                    "hover:bg-secondary/60 flex cursor-pointer items-center gap-2.5 rounded px-2 py-1.5 text-[12.5px]",
                    selected.has(m.domain) && "bg-primary-50/60 dark:bg-primary-700/15",
                  )}
                >
                  <Checkbox
                    checked={selected.has(m.domain)}
                    onCheckedChange={() => toggle(m.domain)}
                    aria-label={`Include ${m.domain}`}
                  />
                  <span className="min-w-0 flex-1 truncate">{m.domain}</span>
                  <span className="num text-text-tertiary text-[11px]">{m.authority}</span>
                </label>
              ))}
              {missing.length === 0 && (
                <p className="text-text-tertiary p-2 text-[12px]">
                  No missing directories — aggregators-only order (cb0).
                </p>
              )}
            </div>
          )}
          <div>
            <p className="eyebrow text-text-tertiary">Aggregator publishers</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {aggregators.map((a) => {
                const on = publishers.has(a.bl_publisher);
                const synced = a.status === "synced";
                return (
                  <button
                    key={a.id}
                    type="button"
                    disabled={synced}
                    onClick={() =>
                      setPublishers((s) => {
                        const next = new Set(s);
                        if (next.has(a.bl_publisher)) next.delete(a.bl_publisher);
                        else next.add(a.bl_publisher);
                        return next;
                      })
                    }
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-[11.5px] font-medium",
                      synced
                        ? "border-border text-text-disabled cursor-not-allowed"
                        : on
                          ? "border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-700/20 dark:text-primary-100"
                          : "border-border text-text-secondary hover:bg-secondary/60",
                    )}
                  >
                    {a.name}
                    {synced && " ✓"}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div>
              <Label
                htmlFor="express"
                className="flex items-center gap-1.5 text-[13px] font-medium"
              >
                <Icons.zap className="text-warning-500 size-3.5" />
                Express submission
              </Label>
              <p className="text-text-tertiary text-[12px]">Submitted within 24 hours</p>
            </div>
            <Switch
              id="express"
              checked={express}
              onCheckedChange={setExpress}
            />
          </div>
          <div>
            <Label
              htmlFor="order-notes"
              className="text-[13px] font-medium"
            >
              Notes for the submissions team
            </Label>
            <Textarea
              id="order-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. use the canonical suite format exactly; healthcare category preferred"
              className="mt-1.5 min-h-16 text-[13px]"
            />
          </div>
          <div className="flex items-center gap-2">
            <StatusPill tone="warning">Demo mode — order simulated</StatusPill>
          </div>
        </div>
        <SheetFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={placeOrder}
            disabled={!canOrder || confirming}
          >
            <Icons.rocket className="size-4" />
            {confirming ? "Placing order…" : `Confirm order (${pkg})`}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
