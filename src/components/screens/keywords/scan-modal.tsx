"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icons } from "@/lib/icons";
import { useRole } from "@/components/shell/role-store";
import { useAuditLog } from "@/components/local/audit-log-store";
import { useKeywords } from "@/store/keywords";
import { simulateScan } from "./scan-sim";

export function ScanModal({
  open,
  onOpenChange,
  slug,
  keyword = null,
  editable = false,
  existingKeywords = [],
  center,
  onComplete,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  slug: string;
  keyword?: string | null;
  editable?: boolean;
  existingKeywords?: string[];
  center: { lat: number; lng: number };
  onComplete?: (keyword: string) => void;
}) {
  const role = useRole();
  const addEntry = useAuditLog((s) => s.addEntry);
  const { recordScan, addKeyword } = useKeywords();
  const [kw, setKw] = React.useState(keyword ?? "");
  const [gridSize, setGridSize] = React.useState<"10x10" | "5x5">("10x10");
  const [phase, setPhase] = React.useState<"idle" | "scanning" | "done">("idle");
  const [progress, setProgress] = React.useState(0);
  const [elapsed, setElapsed] = React.useState(0);
  const cells = gridSize === "10x10" ? 100 : 25;

  const resetState = React.useCallback((kwVal: string | null) => {
    setKw(kwVal ?? "");
    setPhase("idle");
    setProgress(0);
    setElapsed(0);
  }, []);

  const handleOpenChange = React.useCallback(
    (o: boolean) => {
      if (o) {
        resetState(keyword);
      }
      onOpenChange(o);
    },
    [onOpenChange, keyword, resetState],
  );

  React.useEffect(() => {
    if (phase !== "scanning") return;
    const started = Date.now();
    let completed = false;
    const id = window.setInterval(() => {
      setElapsed(Math.round((Date.now() - started) / 1000));
      setProgress((p) => {
        const next = p + Math.max(2, Math.floor(cells / 40));
        const final = next >= cells ? cells : next;
        if (final >= cells && !completed && kw) {
          completed = true;
          const scan = simulateScan({ keyword: kw, center, gridSize });
          const scanRecord = {
            slug,
            keyword: kw,
            scanned_at: new Date().toISOString(),
            gridSize,
            avg_rank: scan.avg_rank,
            best_position: scan.best_position,
            total_pins: scan.total_pins,
            position_distribution: scan.position_distribution,
          };
          recordScan(scanRecord);
          addEntry({
            actor: "Agency Operator",
            role: "operator",
            verb: "create",
            action: `Ran geo-grid scan \u2014 "${kw}" (${gridSize})`,
            resource: `geo-grid:${slug}`,
            location_slug: slug,
            detail: "Demo mode \u2014 scan simulated",
          });
          setPhase("done");
          toast.success("Scan complete", {
            description: `"${kw}" \u00b7 avg rank ${scan.avg_rank || "\u2013"} across ${scan.total_pins} cells`,
          });
          onComplete?.(kw);
        }
        return final;
      });
    }, 120);
    return () => window.clearInterval(id);
  }, [phase, cells, kw, slug, center, gridSize, recordScan, addEntry, onComplete]);

  const startScan = () => {
    const target = kw.trim().toLowerCase();
    if (!target) return;
    if (editable && !existingKeywords.includes(target)) {
      if (existingKeywords.length >= 20) {
        toast.error("Keyword cap reached (20 per location)");
        return;
      }
      addKeyword(slug, {
        keyword: target,
        status: "not_scanned",
        added_at: new Date().toISOString().slice(0, 10),
        in_geo_grid: false,
        in_local_ai: false,
        in_competitive: false,
        source: "synthetic",
      });
    }
    setKw(target);
    setPhase("scanning");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icons.radar className="text-primary size-4" />
            Run geo-grid scan
          </DialogTitle>
          <DialogDescription>
            {editable && !keyword
              ? "Scan a new keyword \u2014 scope preview before anything runs"
              : `\u201c${kw}\u201d \u00b7 scan scope preview before anything runs`}
          </DialogDescription>
        </DialogHeader>

        {phase === "idle" && (
          <div className="flex flex-col gap-4">
            {editable && (
              <Input
                autoFocus
                value={kw}
                onChange={(e) => setKw(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && startScan()}
                placeholder="e.g. sinus specialist madison"
                className="h-10"
              />
            )}
            <div className="flex gap-2">
              {(["10x10", "5x5"] as const).map((gs) => (
                <button
                  key={gs}
                  type="button"
                  onClick={() => setGridSize(gs)}
                  className={
                    gridSize === gs
                      ? "bg-primary text-primary-foreground rounded-md px-3 py-1.5 text-[13px] font-semibold"
                      : "border-border text-muted-foreground hover:bg-secondary rounded-md border px-3 py-1.5 text-[13px] font-medium"
                  }
                >
                  {gs === "10x10" ? "10\u00d710 \u00b7 100 sq mi" : "5\u00d75 \u00b7 25 sq mi"}
                </button>
              ))}
            </div>
            <div className="rounded-r-md border-l-[3px] border-l-slate-400 p-4">
              <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.05em] uppercase">
                Scan scope
              </p>
              <p className="num mt-1 text-[17px] font-bold">{cells} cells \u00b7 1 keyword</p>
              <p className="text-muted-foreground mt-1 text-[12px]">
                Fresh ranks at every cell \u00b7 previous scan is kept in history
              </p>
              {role === "operator" && (
                <p className="num text-muted-foreground mt-1 text-[12px]">
                  Internal: {cells * 4} checks/mo if kept on weekly cadence
                </p>
              )}
            </div>
          </div>
        )}

        {phase === "scanning" && (
          <div className="flex flex-col items-center gap-3 py-6">
            <Icons.loading className="text-primary size-6 animate-spin" />
            <p className="num text-sm font-semibold">
              scanning {Math.min(progress, cells)} / {cells} cells
            </p>
            <p className="num text-muted-foreground text-[12px]">{elapsed}s elapsed</p>
          </div>
        )}

        {phase === "done" && (
          <div className="rounded-md bg-green-50 p-3 text-[13px] font-medium text-green-700 dark:bg-green-950 dark:text-green-200">
            Scan recorded \u2014 the grid, chips, and scan history now include &ldquo;{kw}&rdquo;.
          </div>
        )}

        <DialogFooter>
          {phase === "idle" && (
            <>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={startScan}
                disabled={!kw.trim()}
              >
                <Icons.rocket className="size-4" />
                Run scan
              </Button>
            </>
          )}
          {phase === "done" && <Button onClick={() => onOpenChange(false)}>Done</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
