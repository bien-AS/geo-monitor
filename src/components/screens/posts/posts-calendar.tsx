"use client";

import * as React from "react";
import {
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Icons } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { fmtDate } from "@/lib/format";
import type { GBPPost } from "@/lib/data/types";
import { POST_STATUS_META, POST_TYPE_META, postDateISO, postDayKey } from "./post-meta";

function buildCalendar(month: Date) {
  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 0 });
  const end = endOfWeek(endOfMonth(month), { weekStartsOn: 0 });
  const weeks: Date[][] = [];
  let current = start;
  while (current <= end) {
    const week: Date[] = [];
    for (let d = 0; d < 7; d++) {
      week.push(new Date(current));
      current = new Date(current);
      current.setDate(current.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

export function PostsCalendar({
  posts,
  onEditPost,
}: {
  posts: GBPPost[];
  onEditPost: (post: GBPPost) => void;
}) {
  const [month, setMonth] = React.useState(new Date(2026, 6, 1));
  const [selected, setSelected] = React.useState<Date | null>(null);
  const [sheetOpen, setSheetOpen] = React.useState(false);

  const postsByDay = React.useMemo(() => {
    const map = new Map<string, GBPPost[]>();
    for (const post of posts) {
      const day = postDayKey(post);
      if (!day) continue;
      const list = map.get(day) ?? [];
      list.push(post);
      map.set(day, list);
    }
    return map;
  }, [posts]);

  const weeks = buildCalendar(month);
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const dayPosts = selected ? (postsByDay.get(format(selected, "yyyy-MM-dd")) ?? []) : [];

  const goTo = (dir: -1 | 1) => setMonth((m) => addMonths(m, dir));

  return (
    <Card className="gap-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Posting calendar</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => goTo(-1)}
          >
            <Icons.chevronDown className="size-4 rotate-90" />
          </Button>
          <span className="num w-36 text-center text-[15px] font-semibold">
            {format(month, "MMMM yyyy")}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => goTo(1)}
          >
            <Icons.chevronDown className="size-4 -rotate-90" />
          </Button>
        </div>
      </div>

      <div className="border-border bg-border grid grid-cols-7 gap-px overflow-hidden rounded-lg border text-center">
        {dayNames.map((d) => (
          <div
            key={d}
            className="bg-card text-muted-foreground px-1 py-2 text-[11px] font-semibold uppercase"
          >
            {d}
          </div>
        ))}
        {weeks.map((week, wi) =>
          week.map((day, di) => {
            const key = format(day, "yyyy-MM-dd");
            const dayEntries = postsByDay.get(key) ?? [];
            const inMonth = isSameMonth(day, month);
            const isToday = isSameDay(day, new Date());
            const isSel = selected ? isSameDay(day, selected) : false;

            return (
              <button
                key={`${wi}-${di}`}
                type="button"
                onClick={() => {
                  setSelected(day);
                  setSheetOpen(true);
                }}
                className={cn(
                  "hover:bg-muted/50 flex min-h-[72px] flex-col gap-0.5 p-1.5 text-left transition-colors",
                  "border-border bg-card border-t",
                  !inMonth && "opacity-40",
                  isToday && "ring-primary ring-1 ring-inset",
                  isSel && "bg-primary/5 ring-primary ring-1 ring-inset",
                )}
              >
                <span
                  className={cn(
                    "text-[11px] font-semibold",
                    inMonth ? "text-foreground" : "text-muted-foreground",
                    isToday && "text-primary",
                  )}
                >
                  {format(day, "d")}
                </span>
                <div className="flex flex-wrap gap-0.5">
                  {dayEntries.slice(0, 3).map((post) => {
                    const meta = POST_STATUS_META[post.status];
                    return (
                      <span
                        key={post.id}
                        title={post.title}
                        className={cn("block h-1.5 w-1.5 rounded-full", meta.dotCls)}
                      />
                    );
                  })}
                  {dayEntries.length > 3 && (
                    <span className="text-muted-foreground text-[9px]">
                      +{dayEntries.length - 3}
                    </span>
                  )}
                </div>
              </button>
            );
          }),
        )}
      </div>

      <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px]">
        {(["published", "scheduled", "pending_approval", "draft"] as const).map((s) => {
          const meta = POST_STATUS_META[s];
          return (
            <span
              key={s}
              className="flex items-center gap-1"
            >
              <span className={cn("size-2 rounded-full", meta.dotCls)} />
              {meta.label}
            </span>
          );
        })}
      </div>

      <Sheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      >
        <SheetContent
          side="right"
          className="flex w-[420px] flex-col gap-4"
        >
          <SheetHeader>
            <SheetTitle>
              {selected ? format(selected, "MMMM d, yyyy") : "No date selected"}
            </SheetTitle>
            <SheetDescription>
              {dayPosts.length === 0
                ? "No posts on this day."
                : `${dayPosts.length} post${dayPosts.length === 1 ? "" : "s"}`}
            </SheetDescription>
          </SheetHeader>
          {dayPosts.length > 0 && (
            <div className="flex flex-col gap-3">
              {dayPosts.map((post) => {
                const type = POST_TYPE_META[post.type];
                const status = POST_STATUS_META[post.status];
                const TypeIcon = type.icon;
                const StatusIcon = status.icon;
                return (
                  <div
                    key={post.id}
                    className="border-border rounded-lg border p-3"
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-1.5">
                      <Badge
                        variant="outline"
                        className="text-[11px]"
                      >
                        <TypeIcon
                          className="size-3"
                          aria-hidden
                        />
                        {type.label}
                      </Badge>
                      <span
                        className={cn(
                          "eyebrow inline-flex h-5 items-center gap-1 rounded-full px-2",
                          status.chipCls,
                        )}
                      >
                        <StatusIcon
                          className="size-3"
                          aria-hidden
                        />
                        {status.label}
                      </span>
                    </div>
                    <p className="text-[13px] font-semibold">{post.title}</p>
                    <p className="text-muted-foreground mt-1 line-clamp-2 text-[12px] leading-snug">
                      {post.body}
                    </p>
                    {post.cta && (
                      <p className="mt-1.5 text-[11px]">
                        <span className="text-muted-foreground">CTA: </span>
                        {post.cta.label}
                        <span className="text-muted-foreground"> → </span>
                        <span className="text-muted-foreground text-[10px]">{post.cta.url}</span>
                      </p>
                    )}
                    <div className="text-muted-foreground mt-2 flex items-center justify-between gap-2 text-[11px]">
                      <span>
                        {post.status === "published"
                          ? `Published ${post.published_at ? fmtDate(post.published_at) : ""}`
                          : post.status === "scheduled"
                            ? `Scheduled for ${post.scheduled_for ? fmtDate(post.scheduled_for) : ""}`
                            : status.label}
                      </span>
                      {post.status !== "published" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-[11px]"
                          onClick={() => {
                            onEditPost(post);
                            setSheetOpen(false);
                          }}
                        >
                          Edit in composer
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </Card>
  );
}
