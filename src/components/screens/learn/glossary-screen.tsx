"use client";

import * as React from "react";
import Link from "next/link";
import { Icons } from "@/lib/icons";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useGlossary } from "@/hooks/use-learn";
import type { GlossaryEntry } from "@/lib/data/types";

function groupByLetter(entries: GlossaryEntry[]) {
  const groups = new Map<string, GlossaryEntry[]>();
  for (const entry of [...entries].sort((a, b) => a.term.localeCompare(b.term))) {
    const letter = entry.term[0]?.toUpperCase() ?? "#";
    const bucket = groups.get(letter) ?? [];
    bucket.push(entry);
    groups.set(letter, bucket);
  }
  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
}

export function GlossaryScreen() {
  const { data: glossary } = useGlossary();
  const glossaryById = React.useMemo(
    () => Object.fromEntries(glossary.map((e) => [e.id, e])),
    [glossary],
  );

  const [query, setQuery] = React.useState("");
  const [openIds, setOpenIds] = React.useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    const id = window.location.hash.slice(1);
    return id && glossaryById[id] ? new Set([id]) : new Set();
  });

  React.useEffect(() => {
    const id = window.location.hash.slice(1);
    if (id && glossaryById[id]) {
      requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: "start" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const q = query.trim().toLowerCase();
  const filtered = q
    ? glossary.filter(
        (e) =>
          e.term.toLowerCase().includes(q) ||
          e.short.toLowerCase().includes(q) ||
          e.long.toLowerCase().includes(q),
      )
    : glossary;

  const groups = groupByLetter(filtered);

  const toggle = (id: string) =>
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const openEntry = (id: string) =>
    setOpenIds((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Icons.search
            className="text-text-tertiary pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
            aria-hidden
          />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search terms — try “NAP” or “review”"
            className="pl-9"
            aria-label="Search glossary terms"
          />
        </div>
        <p className="text-text-tertiary text-[13px]">
          <span className="text-text-secondary font-mono font-medium">{filtered.length}</span>{" "}
          {filtered.length === 1 ? "term" : "terms"}
          {q ? (
            <>
              {" "}
              matching <span className="text-text-secondary font-medium">“{query.trim()}”</span>
            </>
          ) : null}
        </p>
      </div>

      {groups.length === 0 ? (
        <Card className="p-8">
          <p className="text-text-tertiary text-[13px]">
            No terms match “{query.trim()}”. Try a shorter word — or{" "}
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-primary-600 dark:text-primary-300 font-medium hover:underline"
            >
              clear the search
            </button>
            .
          </p>
        </Card>
      ) : (
        groups.map(([letter, entries]) => (
          <section
            key={letter}
            className="flex flex-col gap-2"
          >
            <h2 className="eyebrow text-text-tertiary">{letter}</h2>
            {entries.map((entry) => {
              const open = openIds.has(entry.id);
              return (
                <Card
                  key={entry.id}
                  id={entry.id}
                  className="scroll-mt-24 gap-0 p-0"
                >
                  <button
                    type="button"
                    onClick={() => toggle(entry.id)}
                    aria-expanded={open}
                    className="flex w-full items-start justify-between gap-4 rounded-xl px-5 py-4 text-left"
                  >
                    <span>
                      <span className="block text-sm font-semibold">{entry.term}</span>
                      <span className="text-text-tertiary mt-0.5 block text-[13px] leading-relaxed">
                        {entry.short}
                      </span>
                    </span>
                    <Icons.chevronDown
                      className={cn(
                        "text-text-tertiary mt-1 size-4 shrink-0 transition-transform",
                        open && "rotate-180",
                      )}
                      aria-hidden
                    />
                  </button>
                  {open ? (
                    <div className="flex flex-col gap-4 border-t px-5 py-4">
                      <p className="text-text-secondary text-[13px] leading-relaxed">
                        {entry.long}
                      </p>
                      {entry.seeAlso.length > 0 ? (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="eyebrow text-text-tertiary mr-1">See also</span>
                          {entry.seeAlso.map((id) => {
                            const target = glossaryById[id];
                            if (!target) return null;
                            return (
                              <a
                                key={id}
                                href={`#${id}`}
                                onClick={() => openEntry(id)}
                                className="text-text-secondary hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-300 inline-flex h-6 items-center rounded-full border px-2.5 text-xs font-medium transition-colors"
                              >
                                {target.term.split(" (")[0]}
                              </a>
                            );
                          })}
                        </div>
                      ) : null}
                      {entry.whereYouSeeIt.length > 0 ? (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="eyebrow text-text-tertiary mr-1">
                            Where you&rsquo;ll see it
                          </span>
                          {entry.whereYouSeeIt.map((link) => (
                            <Link
                              key={link.href + link.label}
                              href={link.href}
                              className="border-primary-200 bg-primary-50 text-primary-700 hover:border-primary-500 dark:border-primary-700/50 dark:bg-primary-700/20 dark:text-primary-100 inline-flex h-6 items-center gap-1 rounded-full border px-2.5 text-xs font-medium transition-colors"
                            >
                              {link.label}
                              <Icons.arrowUpRight
                                className="size-3"
                                aria-hidden
                              />
                            </Link>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </Card>
              );
            })}
          </section>
        ))
      )}
    </div>
  );
}
