"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Icons } from "@/lib/icons";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { StatusPill } from "@/components/local/status-pill";
import { SourceBadge } from "@/components/local/source-badge";
import { useAuditLog } from "@/components/local/audit-log-store";
import { useRole } from "@/components/shell/role-store";
import { fmtDate } from "@/lib/format";
import type { ReportArtifact } from "@/lib/data/types";
import type { LucideIcon } from "lucide-react";

const FORMAT_ICON: Record<ReportArtifact["format"], keyof typeof Icons> = {
  PDF: "fileText",
  CSV: "fileSpreadsheet",
  XLSX: "fileSpreadsheet",
  ZIP: "filePlus",
};

const REPORT_TYPES = [
  { id: "fleet_lvi", label: "Fleet LVI Summary (PDF)" },
  { id: "location_deep_dive", label: "Location deep-dive (PDF)" },
  { id: "citations_csv", label: "Citations export (CSV)" },
  { id: "review_summary", label: "Review health summary (PDF)" },
  { id: "ai_evidence_pack", label: "AI visibility evidence pack (ZIP)" },
] as const;

interface SessionReport extends ReportArtifact {
  generating?: boolean;
}

function FormatIcon({ format }: { format: ReportArtifact["format"] }) {
  const name = FORMAT_ICON[format];
  const Icon = Icons[name] as LucideIcon;
  return (
    <Icon
      className="text-text-secondary size-4"
      aria-hidden
    />
  );
}

export function ReportsScreen({
  reports,
  locations,
}: {
  reports: ReportArtifact[];
  locations: Array<{ slug: string; name: string }>;
}) {
  const role = useRole();
  const addEntry = useAuditLog((s) => s.addEntry);
  const [session, setSession] = React.useState<SessionReport[]>([]);
  const [open, setOpen] = React.useState(false);
  const [type, setType] = React.useState<(typeof REPORT_TYPES)[number]["id"]>("fleet_lvi");
  const [scope, setScope] = React.useState("fleet");

  const all = [...session, ...reports];

  const generate = () => {
    const meta = REPORT_TYPES.find((t) => t.id === type)!;
    const loc = locations.find((l) => l.slug === scope);
    const scopeLabel = loc ? loc.name : "All 5 locations";
    const id = `session-rep-${Math.random().toString(36).slice(2, 8)}`;
    const format = meta.label.includes("CSV")
      ? ("CSV" as const)
      : meta.label.includes("ZIP")
        ? ("ZIP" as const)
        : ("PDF" as const);
    const report: SessionReport = {
      id,
      kind: type,
      title: `${meta.label.replace(/ \((PDF|CSV|ZIP)\)$/, "")} - ${scopeLabel}`,
      description: "Generated this session - demo mode, artifact simulated.",
      scope: scopeLabel,
      format,
      created_at: new Date().toISOString(),
      created_by: "Agency Operator",
      size_kb: 0,
      href: loc ? `/locations/${loc.slug}/gbp-health` : "/local",
      source: "synthetic",
      generating: true,
    };
    setSession((s) => [report, ...s]);
    setOpen(false);
    addEntry({
      actor: "Agency Operator",
      role: "operator",
      verb: "create",
      action: `Generated report: ${report.title}`,
      resource: `reports:${id}`,
      detail: "Demo mode - generation simulated.",
    });
    window.setTimeout(() => {
      setSession((s) =>
        s.map((r) =>
          r.id === id
            ? { ...r, generating: false, size_kb: 640 + Math.floor(Math.random() * 900) }
            : r,
        ),
      );
      toast.success("Report ready", { description: report.title });
    }, 1800);
  };

  return (
    <div className="flex max-w-4xl flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-text-tertiary text-[13px]">
          <span className="tabular-nums">{all.length}</span> artifacts - every report links back to
          the live screen it was generated from
        </p>
        {role === "operator" && (
          <Dialog
            open={open}
            onOpenChange={setOpen}
          >
            <DialogTrigger asChild>
              <Button size="sm">
                <Icons.filePlus className="size-4" />
                Generate report
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Generate a report</DialogTitle>
                <DialogDescription>
                  Rendered by the reporting worker and filed here when ready.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4">
                <div>
                  <Label className="text-[13px] font-medium">Report type</Label>
                  <Select
                    value={type}
                    onValueChange={(v) => setType(v as typeof type)}
                  >
                    <SelectTrigger className="mt-1.5 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {REPORT_TYPES.map((t) => (
                        <SelectItem
                          key={t.id}
                          value={t.id}
                        >
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[13px] font-medium">Scope</Label>
                  <Select
                    value={scope}
                    onValueChange={setScope}
                  >
                    <SelectTrigger className="mt-1.5 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fleet">All 5 locations</SelectItem>
                      {locations.map((l) => (
                        <SelectItem
                          key={l.slug}
                          value={l.slug}
                        >
                          {l.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <StatusPill tone="warning">Demo mode - generation simulated</StatusPill>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={generate}>Generate</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card className="gap-0 p-0">
        {all.map((r, i) => {
          const generating = "generating" in r && r.generating;
          return (
            <div
              key={r.id}
              className={`flex items-start gap-3 px-5 py-4 ${i > 0 ? "border-border-subtle border-t" : ""}`}
            >
              <span className="border-border bg-secondary flex size-9 shrink-0 items-center justify-center rounded-md border">
                <FormatIcon format={r.format} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[13.5px] font-semibold">{r.title}</p>
                  {generating ? (
                    <StatusPill tone="info">Generating...</StatusPill>
                  ) : (
                    <span className="border-border text-text-tertiary rounded-full border px-1.5 py-0.5 text-[10.5px] font-medium tabular-nums">
                      {r.format}
                    </span>
                  )}
                  <SourceBadge source={r.source} />
                </div>
                <p className="text-text-tertiary mt-0.5 text-[13px]">{r.description}</p>
                <p className="text-text-disabled mt-1 text-[11.5px] tabular-nums">
                  {r.scope} - {fmtDate(r.created_at)} - {r.created_by}
                  {r.size_kb > 0 && ` - ${(r.size_kb / 1024).toFixed(1)} MB`}
                </p>
              </div>
              {!generating && (
                <Link
                  href={r.href}
                  className="text-text-link mt-1 inline-flex shrink-0 items-center gap-1 text-[12.5px] font-medium hover:underline"
                >
                  Open source screen
                  <Icons.arrowUpRight className="size-3.5" />
                </Link>
              )}
            </div>
          );
        })}
      </Card>
    </div>
  );
}
