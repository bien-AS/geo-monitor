"use client";

import * as React from "react";
import { toast } from "sonner";
import { Icons } from "@/lib/icons";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { StatusPill } from "@/components/local/status-pill";
import { SourceBadge } from "@/components/local/source-badge";
import { useAuditLog } from "@/components/local/audit-log-store";
import { useRole } from "@/components/shell/role-store";
import { useKB } from "@/store/kb";
import { fmtDate, fmtTime } from "@/lib/format";
import { kbCompleteness } from "@/lib/kb";
import { cn } from "@/lib/utils";
import type { KBGroup, KBVersion } from "@/lib/data/types";

function GroupEditDialog({
  group,
  onSaved,
}: {
  group: KBGroup;
  onSaved: (edits: Record<string, string>) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [values, setValues] = React.useState<Record<string, string>>({});
  const editable = group.fields.filter((f) => f.editable);
  if (editable.length === 0) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) setValues(Object.fromEntries(editable.map((f) => [f.id, f.value ?? ""])));
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
        >
          <Icons.edit className="size-3.5" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit {group.title.toLowerCase()}</DialogTitle>
          <DialogDescription>
            Knowledge-base fields ground drafts, replies and posts - keep them factual.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          {editable.map((f) => (
            <div key={f.id}>
              <Label
                htmlFor={`kb-${f.id}`}
                className="text-[13px] font-medium"
              >
                {f.label}
              </Label>
              <Input
                id={`kb-${f.id}`}
                value={values[f.id] ?? ""}
                onChange={(e) => setValues((v) => ({ ...v, [f.id]: e.target.value }))}
                placeholder={f.missingNote ?? f.label}
                className="mt-1.5"
              />
            </div>
          ))}
          <StatusPill tone="warning">Demo mode - save simulated</StatusPill>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              const edits = Object.fromEntries(
                Object.entries(values).filter(([, v]) => v.trim() !== ""),
              );
              onSaved(edits);
              setOpen(false);
            }}
          >
            Save fields
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function KBScreen({
  slug,
  groups: baseGroups,
  seededVersions,
}: {
  slug: string;
  groups: KBGroup[];
  seededVersions: KBVersion[];
}) {
  const role = useRole();
  const addEntry = useAuditLog((s) => s.addEntry);
  const { overrides, versions, saveGroup } = useKB();

  const groups = React.useMemo(() => {
    const o = overrides[slug] ?? {};
    return baseGroups.map((g) => ({
      ...g,
      fields: g.fields.map((f) =>
        o[f.id] !== undefined ? { ...f, value: o[f.id], source: "synthetic" as const } : f,
      ),
    }));
  }, [baseGroups, overrides, slug]);

  const { filled, total, pct } = kbCompleteness(groups);
  const allVersions = [...seededVersions, ...(versions[slug] ?? [])].sort(
    (a, b) => b.version - a.version,
  );

  const handleSave = (group: KBGroup) => (edits: Record<string, string>) => {
    saveGroup(slug, edits, group.title);
    addEntry({
      actor: "Agency Operator",
      role: "operator",
      verb: "update",
      action: `Updated KB - ${group.title} (${Object.keys(edits).length} fields)`,
      resource: `kb:${slug}:${group.id}`,
      location_slug: slug,
      detail: "Demo mode - save simulated.",
    });
    toast.success("Knowledge base saved", { description: group.title });
  };

  return (
    <div className="flex flex-col gap-5">
      <Card className="flex flex-wrap items-center gap-6 p-6">
        <div className="relative size-20">
          <svg
            viewBox="0 0 80 80"
            className="size-20 -rotate-90"
          >
            <circle
              cx="40"
              cy="40"
              r="34"
              fill="none"
              strokeWidth="8"
              className="stroke-secondary"
            />
            <circle
              cx="40"
              cy="40"
              r="34"
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(pct / 100) * 2 * Math.PI * 34} ${2 * Math.PI * 34}`}
              className={cn(
                pct >= 80 ? "stroke-success" : pct >= 50 ? "stroke-warning" : "stroke-destructive",
              )}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[18px] font-bold tabular-nums">
            {pct}%
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Icons.bookUser className="text-text-tertiary size-4" />
            <h2 className="text-base font-semibold">Knowledge completeness</h2>
          </div>
          <p className="text-text-tertiary mt-1 text-[13px]">
            <span className="tabular-nums">
              {filled}/{total}
            </span>{" "}
            fields filled across <span className="tabular-nums">8</span> groups. This base grounds
            review replies, post drafts and description generation - missing fields are listed
            honestly, never fabricated.
          </p>
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
        <div className="flex flex-col gap-4">
          {groups.map((g) => (
            <Card
              key={g.id}
              className="gap-3 p-5"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-[15px] font-semibold">{g.title}</h3>
                  <p className="text-text-tertiary text-[12.5px]">{g.description}</p>
                </div>
                {role === "operator" && (
                  <GroupEditDialog
                    group={g}
                    onSaved={handleSave(g)}
                  />
                )}
              </div>
              <div className="grid gap-x-8 sm:grid-cols-2">
                {g.fields.map((f) => (
                  <div
                    key={f.id}
                    className="border-border-subtle flex items-start justify-between gap-4 border-b py-2.5 last:border-b-0 sm:[&:nth-last-child(2):nth-child(odd)]:border-b-0"
                  >
                    <div className="min-w-0">
                      <p className="text-text-secondary text-[12.5px] font-medium">{f.label}</p>
                      {f.value ? (
                        <p className="mt-0.5 text-[13px] break-words">{f.value}</p>
                      ) : (
                        <p className="text-text-tertiary mt-0.5 flex items-center gap-1.5 text-[12.5px] italic">
                          <Icons.circleDashed className="size-3.5 shrink-0" />
                          {f.missingNote ?? "Not collected yet"}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5 pt-0.5">
                      {f.value ? (
                        <SourceBadge source={f.source} />
                      ) : (
                        <StatusPill tone="neutral">Missing</StatusPill>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          <Card className="gap-3 p-5">
            <div className="flex items-center gap-2">
              <Icons.history className="text-text-tertiary size-4" />
              <h3 className="text-[15px] font-semibold">Versions</h3>
            </div>
            <ol className="flex flex-col gap-0">
              {allVersions.map((v, i) => (
                <li
                  key={v.version}
                  className={cn("flex gap-3 py-2.5", i > 0 && "border-border-subtle border-t")}
                >
                  <span className="border-border flex size-7 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold tabular-nums">
                    v{v.version}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[12.5px] font-medium">{v.label}</p>
                    <p className="text-text-tertiary mt-0.5 text-[11px] tabular-nums">
                      {v.actor} - {fmtDate(v.at)} {fmtTime(v.at)} - {v.fieldCount} fields
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>
    </div>
  );
}
