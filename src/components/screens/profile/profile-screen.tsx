"use client";

import * as React from "react";
import { toast } from "sonner";
import { Icons } from "@/lib/icons";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StatusPill } from "@/components/local/status-pill";
import { useAuditLog } from "@/components/local/audit-log-store";
import { useRole } from "@/components/shell/role-store";
import { useProfile } from "@/store/profile";
import type { ProfileField } from "@/lib/data/types";

export { type ProfileField } from "@/lib/data/types";

export function ProfileSectionScreen({
  sectionId,
  title,
  intro,
  fields,
}: {
  sectionId: string;
  title: string;
  intro: string;
  fields: ProfileField[];
}) {
  const role = useRole();
  const addEntry = useAuditLog((s) => s.addEntry);
  const { overrides, save } = useProfile();
  const [draft, setDraft] = React.useState<Record<string, string>>({});

  const effective = (f: ProfileField) =>
    draft[`${sectionId}:${f.id}`] ?? overrides[`${sectionId}:${f.id}`] ?? f.value;

  const dirty = Object.keys(draft).length > 0;
  const isOperator = role === "operator";

  const commit = () => {
    save(draft);
    addEntry({
      actor: "Agency Operator",
      role: "operator",
      verb: "update",
      action: `Updated client profile - ${title} (${Object.keys(draft).length} fields)`,
      resource: `profile:${sectionId}`,
      detail: "Demo mode - save simulated.",
    });
    toast.success("Client profile saved", { description: title });
    setDraft({});
  };

  return (
    <div className="flex max-w-3xl flex-col gap-5">
      <p className="text-text-secondary text-[13px]">{intro}</p>

      <Card className="gap-5 p-6">
        {fields.map((f) => (
          <div key={f.id}>
            <div className="flex items-center justify-between gap-2">
              <Label
                htmlFor={`pf-${f.id}`}
                className="text-[13px] font-medium"
              >
                {f.label}
              </Label>
              {f.locked && <StatusPill tone="neutral">Policy - locked</StatusPill>}
            </div>
            {f.hint && <p className="text-text-tertiary mt-0.5 text-[12px]">{f.hint}</p>}
            <Textarea
              id={`pf-${f.id}`}
              value={effective(f)}
              disabled={!isOperator || f.locked}
              onChange={(e) =>
                setDraft((d) => ({ ...d, [`${sectionId}:${f.id}`]: e.target.value }))
              }
              className="mt-1.5 min-h-20 text-[13px] leading-relaxed"
            />
          </div>
        ))}

        {isOperator && (
          <div className="flex items-center justify-between gap-3">
            <StatusPill tone="warning">Demo mode - save simulated</StatusPill>
            <Button
              size="sm"
              onClick={commit}
              disabled={!dirty}
            >
              <Icons.save className="size-4" />
              Save section
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
