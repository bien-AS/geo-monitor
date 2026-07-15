"use client";

import * as React from "react";
import { toast } from "sonner";
import { Icons } from "@/lib/icons";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuditLog } from "@/components/local/audit-log-store";
import { useRole } from "@/components/shell/role-store";

const TIMEZONES = ["America/Chicago", "America/New_York", "America/Denver", "America/Los_Angeles"];

/** Org profile card — save is simulated (demo mode). */
export function OrgProfileCard() {
  const role = useRole();
  const addEntry = useAuditLog((s) => s.addEntry);
  const [name, setName] = React.useState("Baptist Memorial Health Care");
  const [domain, setDomain] = React.useState("baptistonline.org");
  const [tz, setTz] = React.useState("America/Chicago");
  const [dirty, setDirty] = React.useState(false);

  const save = () => {
    addEntry({
      actor: "Agency Operator",
      role: "operator",
      verb: "update",
      action: "Updated organization profile",
      resource: "settings:org-profile",
      detail: `name=${name} · domain=${domain} · tz=${tz} — Demo mode, write simulated.`,
    });
    toast.success("Organization profile saved");
    setDirty(false);
  };

  const readOnly = role !== "operator";

  return (
    <Card className="gap-4 p-6">
      <div className="flex items-center gap-2">
        <Icons.building className="text-text-tertiary size-4" />
        <h2 className="text-base font-semibold">Organization</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label
            htmlFor="org-name"
            className="text-[13px] font-medium"
          >
            Organization name
          </Label>
          <Input
            id="org-name"
            value={name}
            disabled={readOnly}
            onChange={(e) => {
              setName(e.target.value);
              setDirty(true);
            }}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label
            htmlFor="org-domain"
            className="text-[13px] font-medium"
          >
            Primary domain
          </Label>
          <Input
            id="org-domain"
            value={domain}
            disabled={readOnly}
            onChange={(e) => {
              setDomain(e.target.value);
              setDirty(true);
            }}
            className="mt-1.5"
          />
          <p className="text-text-tertiary mt-1 text-[12px]">
            Used for AI-citation and GBP-link checks across the fleet.
          </p>
        </div>
        <div>
          <Label className="text-[13px] font-medium">Timezone</Label>
          <Select
            value={tz}
            onValueChange={(v) => {
              setTz(v);
              setDirty(true);
            }}
            disabled={readOnly}
          >
            <SelectTrigger className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONES.map((t) => (
                <SelectItem
                  key={t}
                  value={t}
                >
                  <span className="num">{t}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-text-tertiary mt-1 text-[12px]">
            Scan schedules and reports render in this timezone.
          </p>
        </div>
      </div>
      {!readOnly && (
        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={save}
            disabled={!dirty}
          >
            <Icons.save className="size-4" />
            Save changes
          </Button>
        </div>
      )}
    </Card>
  );
}
