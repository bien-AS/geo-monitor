"use client";

import * as React from "react";
import { toast } from "sonner";
import { create } from "zustand";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusPill } from "@/components/local/status-pill";
import { useAuditLog } from "@/components/local/audit-log-store";
import { useRole } from "@/components/shell/role-store";
import { Icons } from "@/lib/icons";

export interface AddableCandidate {
  name: string;
  cid: string;
  rating: number | null;
  votes: number | null;
  near: string;
  source: string;
}

export interface SessionLocation {
  name: string;
  cid: string;
  rating: number | null;
  votes: number | null;
  near: string;
  added_at: string;
}

/** Locations added this session (simulated create, local state). */
export const useSessionLocations = create<{
  added: SessionLocation[];
  add: (l: SessionLocation) => void;
}>((set) => ({
  added: [],
  add: (l) => set((s) => ({ added: [...s.added, l] })),
}));

/** Extract a CID or place_id from a Maps URL / bare id. */
function parseInput(raw: string): { cid?: string; placeId?: string } | null {
  const v = raw.trim();
  if (!v) return null;
  const cidMatch = v.match(/[?&]cid=(\d{6,25})/) ?? v.match(/^(\d{6,25})$/);
  if (cidMatch) return { cid: cidMatch[1] };
  const pidMatch = v.match(/(ChIJ[A-Za-z0-9_-]{10,})/);
  if (pidMatch) return { placeId: pidMatch[1] };
  return null;
}

type Resolution =
  | { kind: "invalid" }
  | { kind: "in-fleet"; name: string }
  | { kind: "rejected"; cid: string }
  | { kind: "candidate"; candidate: AddableCandidate };

export function AddLocationModal({
  candidates,
  fleet,
}: {
  candidates: AddableCandidate[];
  fleet: Array<{ cid: string | null; place_id: string | null; name: string }>;
}) {
  const role = useRole();
  const addEntry = useAuditLog((s) => s.addEntry);
  const { added, add } = useSessionLocations();
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
  const [resolution, setResolution] = React.useState<Resolution | null>(null);

  if (role !== "operator") return null;

  const resolve = () => {
    const parsed = parseInput(value);
    if (!parsed) {
      setResolution({ kind: "invalid" });
      return;
    }
    const inFleet = fleet.find(
      (l) =>
        (parsed.cid && l.cid === parsed.cid) || (parsed.placeId && l.place_id === parsed.placeId),
    );
    if (inFleet) {
      setResolution({ kind: "in-fleet", name: inFleet.name });
      return;
    }
    const alreadyAdded = added.find((l) => l.cid === parsed.cid);
    if (alreadyAdded) {
      setResolution({ kind: "in-fleet", name: alreadyAdded.name });
      return;
    }
    const candidate = parsed.cid ? candidates.find((c) => c.cid === parsed.cid) : undefined;
    if (candidate) {
      setResolution({ kind: "candidate", candidate });
      return;
    }
    setResolution({ kind: "rejected", cid: parsed.cid ?? parsed.placeId ?? "" });
  };

  const createLocation = (c: AddableCandidate) => {
    add({
      name: c.name,
      cid: c.cid,
      rating: c.rating,
      votes: c.votes,
      near: c.near,
      added_at: new Date().toISOString(),
    });
    addEntry({
      actor: "Agency Operator",
      role: "operator",
      verb: "create",
      action: `Added location — ${c.name}`,
      resource: `location:cid=${c.cid}`,
      detail: "Demo mode — create simulated · first scan pending",
    });
    toast.success("Location added", {
      description: `${c.name} · onboarding — first audit + scan queue on connect`,
    });
    setOpen(false);
    setValue("");
    setResolution(null);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) {
          setValue("");
          setResolution(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
        >
          <Icons.add className="size-4" />
          Add location
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icons.mapPin className="text-primary-500 size-4" />
            Add a location
          </DialogTitle>
          <DialogDescription>
            Paste a Google Maps URL, CID, or place id — the profile is resolved and checked against
            the Baptist registry before anything is created.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2">
          <Input
            autoFocus
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setResolution(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && resolve()}
            placeholder="https://www.google.com/maps?cid=… or 15544711465520857866"
            className="h-10 font-mono text-[12.5px]"
          />
          <Button
            onClick={resolve}
            disabled={!value.trim()}
          >
            Resolve
          </Button>
        </div>

        {resolution?.kind === "invalid" && (
          <p className="bg-warning-50 text-warning-700 dark:bg-warning-700/25 dark:text-warning-100 rounded-md px-3 py-2 text-[13px] font-medium">
            Couldn&apos;t find a CID or place id in that input. Paste a Google Maps link that
            contains <span className="num">?cid=</span> or a <span className="num">ChIJ…</span>{" "}
            place id.
          </p>
        )}

        {resolution?.kind === "in-fleet" && (
          <p className="bg-accent text-accent-foreground rounded-md px-3 py-2 text-[13px] font-medium">
            {resolution.name} is already in the fleet.
          </p>
        )}

        {resolution?.kind === "rejected" && (
          <div
            role="alert"
            className="bg-error-50 text-error-700 dark:bg-error-700/20 dark:text-error-100 flex items-start gap-2 rounded-md p-3 text-[13px]"
          >
            <Icons.shieldX className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className="font-semibold">Not a registry-listed Baptist asset</p>
              <p className="mt-0.5">
                <span className="num">{resolution.cid}</span> didn&apos;t resolve to a Baptist
                Memorial listing. Cross-client assets can&apos;t enter this workspace — verify the
                profile and contact the AS admin if this is a new Baptist acquisition.
              </p>
            </div>
          </div>
        )}

        {resolution?.kind === "candidate" && (
          <div className="border-border rounded-md border p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5">
                <span className="bg-primary-50 text-primary-700 dark:bg-primary-700/25 dark:text-primary-100 flex size-9 items-center justify-center rounded-md">
                  <Icons.building className="size-4" />
                </span>
                <div>
                  <p className="text-[14px] font-semibold">{resolution.candidate.name}</p>
                  <p className="text-text-tertiary text-[12px]">
                    near {resolution.candidate.near} · CID{" "}
                    <span className="num">{resolution.candidate.cid}</span>
                  </p>
                  <p className="num text-text-secondary mt-1 text-[12.5px]">
                    {resolution.candidate.rating != null
                      ? `${resolution.candidate.rating.toFixed(1)}★ · ${resolution.candidate.votes ?? 0} reviews`
                      : "No reviews yet"}
                  </p>
                </div>
              </div>
              <StatusPill tone="success">Baptist verified</StatusPill>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          {resolution?.kind === "candidate" && (
            <Button onClick={() => createLocation(resolution.candidate)}>
              <Icons.add className="size-4" />
              Add to fleet
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
