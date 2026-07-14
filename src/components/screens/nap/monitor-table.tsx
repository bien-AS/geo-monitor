"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusPill } from "@/components/local/status-pill";
import { SourceBadge } from "@/components/local/source-badge";
import { Icons } from "@/lib/icons";
import { CircleDashed } from "lucide-react";
import { fmtDateShort } from "@/lib/format";
import { CRITICAL_FIELDS, rowDrifting, type DriftItem } from "./lib";
import type { CitationRow, DataSource } from "@/lib/data/types";

const BAND_LABEL: Record<CitationRow["authority_band"], string> = {
  "very-high": "Very High",
  high: "High",
  medium: "Medium",
  low: "Low",
};

type Filter = "all" | "drifting" | "consistent" | "not-listed";

const FILTERS: Array<{ id: Filter; label: string }> = [
  { id: "all", label: "All" },
  { id: "drifting", label: "Drifting" },
  { id: "consistent", label: "Consistent" },
  { id: "not-listed", label: "Not listed" },
];

function FieldPill({
  field,
  letter,
  state,
}: {
  field: "name" | "address" | "phone";
  letter: string;
  state: "match" | "mismatch" | "na";
}) {
  if (state === "na") {
    return (
      <span
        title={`${letter} — not listed`}
        className="bg-secondary text-text-tertiary inline-flex h-5 w-9 items-center justify-center gap-0.5 rounded-full text-[10px] font-semibold"
      >
        <CircleDashed
          className="size-2.5"
          aria-hidden
        />
        {letter[0]}
      </span>
    );
  }
  const critical = CRITICAL_FIELDS.has(field);
  const mismatchCls = critical
    ? "bg-error-50 text-error-700 dark:bg-error-700/25 dark:text-error-100"
    : "bg-warning-50 text-warning-700 dark:bg-warning-700/25 dark:text-warning-100";
  const MismatchIcon = critical ? Icons.close : Icons.warning;
  return (
    <span
      title={
        state === "match"
          ? `${letter} — matches canonical`
          : `${letter} — differs from canonical${critical ? " (critical field)" : ""}`
      }
      className={cn(
        "inline-flex h-5 w-9 items-center justify-center gap-0.5 rounded-full text-[10px] font-semibold",
        state === "match"
          ? "bg-success-50 text-success-700 dark:bg-success-700/25 dark:text-success-100"
          : mismatchCls,
      )}
    >
      {state === "match" ? (
        <Icons.check
          className="size-2.5"
          aria-hidden
        />
      ) : (
        <MismatchIcon
          className="size-2.5"
          aria-hidden
        />
      )}
      {letter[0]}
      <span className="sr-only">{state === "match" ? "matches" : "differs"}</span>
    </span>
  );
}

function fieldState(
  row: CitationRow,
  field: "name" | "address" | "phone",
): "match" | "mismatch" | "na" {
  if (!row.listed) return "na";
  if (!row.field_match) return "match";
  return row.field_match[field] ? "match" : "mismatch";
}

export function MonitorTable({
  rows,
  driftByDomain,
  fixtureSource,
  onView,
}: {
  rows: CitationRow[];
  driftByDomain: Map<string, DriftItem[]>;
  fixtureSource: DataSource | null;
  onView: (key: string) => void;
}) {
  const [filter, setFilter] = React.useState<Filter>("all");
  const [query, setQuery] = React.useState("");

  const sorted = React.useMemo(() => [...rows].sort((a, b) => b.authority - a.authority), [rows]);

  const counts = React.useMemo(
    () => ({
      all: rows.length,
      drifting: rows.filter(rowDrifting).length,
      consistent: rows.filter((r) => r.listed && !rowDrifting(r)).length,
      "not-listed": rows.filter((r) => !r.listed).length,
    }),
    [rows],
  );

  const visible = sorted.filter((row) => {
    if (filter === "drifting" && !rowDrifting(row)) return false;
    if (filter === "consistent" && (!row.listed || rowDrifting(row))) return false;
    if (filter === "not-listed" && row.listed) return false;
    if (query) {
      const q = query.toLowerCase();
      if (!row.directory.toLowerCase().includes(q) && !row.domain.toLowerCase().includes(q))
        return false;
    }
    return true;
  });

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-[15px]">Directory NAP status</CardTitle>
            <span className="num text-text-tertiary text-[12px]">{rows.length} directories</span>
            {fixtureSource ? <SourceBadge source={fixtureSource} /> : null}
          </div>
          <div className="relative">
            <Icons.search
              className="text-text-tertiary absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2"
              aria-hidden
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search directories…"
              aria-label="Search directories"
              className="h-8 w-52 pl-8 text-[13px]"
            />
          </div>
        </div>
        <div
          className="flex flex-wrap items-center gap-1"
          role="group"
          aria-label="Filter directories"
        >
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "flex h-7 items-center gap-1.5 rounded-md px-2.5 text-[12px] font-medium transition-colors",
                filter === f.id
                  ? "bg-accent text-accent-foreground"
                  : "text-text-secondary hover:bg-secondary",
              )}
            >
              {f.label}
              <span className="num text-text-tertiary text-[11px]">{counts[f.id]}</span>
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto px-0 pb-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">Directory</TableHead>
              <TableHead className="tnum text-right">Authority</TableHead>
              <TableHead>Listed</TableHead>
              <TableHead>N · A · P match</TableHead>
              <TableHead className="tnum text-right">Last checked</TableHead>
              <TableHead>Δ since last</TableHead>
              <TableHead className="pr-6 text-right">
                <span className="sr-only">Drift detail</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-text-tertiary py-8 text-center text-[13px]"
                >
                  No directories match this filter.
                </TableCell>
              </TableRow>
            )}
            {visible.map((row) => {
              const drifting = rowDrifting(row);
              const items = driftByDomain.get(row.domain) ?? [];
              const primary = items[0];
              return (
                <TableRow
                  key={row.domain}
                  className={cn(
                    drifting &&
                      "bg-warning-50/60 hover:bg-warning-50 dark:bg-warning-700/10 dark:hover:bg-warning-700/15",
                    row.delta_since_last === "changed" && "border-l-warning-500 border-l-[3px]",
                  )}
                >
                  <TableCell className="pl-6">
                    <p className="text-foreground text-[13px] font-medium">{row.directory}</p>
                    <p className="text-text-tertiary text-[11px]">{row.domain}</p>
                  </TableCell>
                  <TableCell className="tnum text-right">
                    <span className="num text-[13px] font-semibold">{row.authority}</span>
                    <Badge
                      variant="outline"
                      className="text-text-secondary ml-2 text-[10px] font-medium"
                    >
                      {BAND_LABEL[row.authority_band]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {row.listed ? (
                      <span className="text-success-600 dark:text-success-100 inline-flex items-center gap-1 text-[12px] font-medium">
                        <Icons.check
                          className="size-3.5"
                          aria-hidden
                        />{" "}
                        Listed
                      </span>
                    ) : (
                      <span className="text-text-tertiary inline-flex items-center gap-1 text-[12px]">
                        <CircleDashed
                          className="size-3.5"
                          aria-hidden
                        />{" "}
                        Not listed
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1">
                      <FieldPill
                        field="name"
                        letter="Name"
                        state={fieldState(row, "name")}
                      />
                      <FieldPill
                        field="address"
                        letter="Address"
                        state={fieldState(row, "address")}
                      />
                      <FieldPill
                        field="phone"
                        letter="Phone"
                        state={fieldState(row, "phone")}
                      />
                    </span>
                  </TableCell>
                  <TableCell className="tnum text-right">
                    <span className="num text-text-secondary text-[12px]">
                      {fmtDateShort(row.last_checked)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {row.delta_since_last === "changed" ? (
                      <StatusPill tone="warning">Changed</StatusPill>
                    ) : row.delta_since_last === "fixed" ? (
                      <StatusPill tone="success">Fixed</StatusPill>
                    ) : (
                      <span className="text-text-tertiary text-[12px]">—</span>
                    )}
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    {primary ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-text-link h-7 px-2 text-[12px]"
                        onClick={() => onView(primary.key)}
                        aria-label={`View drift detail for ${row.directory}`}
                      >
                        View
                        <Icons.arrowRight
                          className="size-3.5"
                          aria-hidden
                        />
                      </Button>
                    ) : (
                      <span className="text-text-tertiary pr-2 text-[12px]">—</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
