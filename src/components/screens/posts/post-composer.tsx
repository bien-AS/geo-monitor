"use client";

import * as React from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApprovalLadder } from "@/components/local/approval-ladder";
import { useRole } from "@/components/shell/role-store";
import { Icons } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { fmtDate } from "@/lib/format";
import type { GBPPost, PostType } from "@/lib/data/types";
import { POST_TYPES, POST_TYPE_META, templateDraft } from "./post-meta";
import { PostPreviewBlock } from "./review-approve-ladder";
import { ImageGenerator } from "./image-generator";
import { usePostsSession } from "@/store/posts";

function parseDayParam(value?: string): Date | undefined {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}

const WORD_MIN = 40;
const WORD_MAX = 80;

function initialState(editingPost: GBPPost | null, website: string, initialDate?: string) {
  if (!editingPost) {
    return {
      type: "whats_new" as PostType,
      title: "",
      body: "",
      ctaLabel: "Learn more",
      ctaUrl: website,
      date: parseDayParam(initialDate),
      imageUrl: undefined as string | undefined,
      imageLabel: undefined as string | undefined,
    };
  }
  return {
    type: editingPost.type,
    title: editingPost.title,
    body: editingPost.body,
    ctaLabel: editingPost.cta?.label ?? "Learn more",
    ctaUrl: editingPost.cta?.url ?? website,
    date: editingPost.scheduled_for
      ? parseDayParam(editingPost.scheduled_for.slice(0, 10))
      : parseDayParam(initialDate),
    imageUrl: editingPost.image_url,
    imageLabel: editingPost.image_label,
  };
}

export function PostComposer({
  slug,
  locationShortName,
  city,
  website,
  editingPost,
  initialDate,
  onDone,
}: {
  slug: string;
  locationShortName: string;
  city: string;
  website: string;
  editingPost: GBPPost | null;
  initialDate?: string;
  onDone: () => void;
}) {
  const role = useRole();
  const addPost = usePostsSession((s) => s.addPost);
  const patchPost = usePostsSession((s) => s.patchPost);

  const init = React.useMemo(
    () => initialState(editingPost, website, initialDate),
    [editingPost?.id, website],
  );

  const [type, setType] = React.useState<PostType>(init.type);
  const [title, setTitle] = React.useState(init.title);
  const [body, setBody] = React.useState(init.body);
  const [ctaLabel, setCtaLabel] = React.useState(init.ctaLabel);
  const [ctaUrl, setCtaUrl] = React.useState(init.ctaUrl);
  const [date, setDate] = React.useState<Date | undefined>(init.date);
  const [isTemplate, setIsTemplate] = React.useState(false);
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [imageUrl, setImageUrl] = React.useState<string | undefined>(init.imageUrl);
  const [imageLabel, setImageLabel] = React.useState<string | undefined>(init.imageLabel);

  const reset = () => {
    setType("whats_new");
    setTitle("");
    setBody("");
    setCtaLabel("Learn more");
    setCtaUrl(website);
    setDate(undefined);
    setImageUrl(undefined);
    setImageLabel(undefined);
    setIsTemplate(false);
    onDone();
  };

  if (role === "client-viewer") return null;

  const words = body.trim() === "" ? 0 : body.trim().split(/\s+/).length;
  const wordsInRange = words >= WORD_MIN && words <= WORD_MAX;
  const valid =
    title.trim().length > 0 &&
    body.trim().length > 0 &&
    ctaLabel.trim().length > 0 &&
    ctaUrl.trim().length > 0;

  const scheduledISO = date ? `${format(date, "yyyy-MM-dd")}T14:00:00Z` : undefined;
  const landsAs = date ? "scheduled" : "pending_approval";

  const previewPost: GBPPost = {
    id: editingPost?.id ?? `post-${slug}-session-draft`,
    type,
    title: title.trim(),
    body: body.trim(),
    cta: { label: ctaLabel.trim(), url: ctaUrl.trim() },
    status: landsAs,
    scheduled_for: scheduledISO,
    image_url: imageUrl,
    image_label: imageLabel,
    source: "synthetic",
  };

  const applyTemplate = () => {
    const t = templateDraft(type, locationShortName, city);
    setTitle(t.title);
    setBody(t.body);
    setCtaLabel(t.ctaLabel);
    setCtaUrl(website);
    setIsTemplate(true);
  };

  const complete = () => {
    if (editingPost) {
      patchPost(slug, editingPost.id, {
        type,
        title: title.trim(),
        body: body.trim(),
        cta: { label: ctaLabel.trim(), url: ctaUrl.trim() },
        status: landsAs,
        scheduled_for: scheduledISO,
        image_url: imageUrl,
        image_label: imageLabel,
        published_at: undefined,
      });
    } else {
      addPost(slug, {
        ...previewPost,
        id: `post-${slug}-session-${Date.now().toString(36)}`,
      });
    }
    reset();
  };

  return (
    <Card
      id="composer"
      className="scroll-mt-24 gap-5 p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Icons.edit
              className="text-primary size-4"
              aria-hidden
            />
            {editingPost ? "Edit post" : "Compose post"}
          </h2>
          <p className="text-muted-foreground text-[13px]">
            {editingPost ? (
              <>
                Editing <span className="font-medium">&quot;{editingPost.title}&quot;</span> —
                submit re-runs the approval ladder
              </>
            ) : (
              "Every submission runs preview → approve → simulated write → audit log"
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {editingPost ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={reset}
            >
              <Icons.close className="size-3.5" />
              Cancel edit
            </Button>
          ) : null}
          <Button
            variant="outline"
            size="sm"
            onClick={applyTemplate}
          >
            <Icons.sparkles className="size-3.5" />
            Generate template draft
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="post-type">Post type</Label>
            <Select
              value={type}
              onValueChange={(v) => setType(v as PostType)}
            >
              <SelectTrigger
                id="post-type"
                className="w-full"
              >
                <SelectValue placeholder="Select a post type" />
              </SelectTrigger>
              <SelectContent>
                {POST_TYPES.map((t) => {
                  const meta = POST_TYPE_META[t];
                  const Icon = meta.icon;
                  return (
                    <SelectItem
                      key={t}
                      value={t}
                    >
                      <span className="flex items-center gap-2">
                        <Icon
                          className="text-muted-foreground size-3.5"
                          aria-hidden
                        />
                        {meta.label}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="post-title">Title</Label>
            <Input
              id="post-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Flu shot walk-in hours for the fall"
              maxLength={100}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="post-body">Body</Label>
              {isTemplate ? (
                <Badge
                  variant="outline"
                  className="border-warning-500/40 bg-warning-50 text-warning-700 dark:bg-warning-700/20 dark:text-warning-100"
                >
                  Template draft — demo
                </Badge>
              ) : null}
            </div>
            <Textarea
              id="post-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write the post body. Keep it factual and patient-friendly — no patient stories, no outcome claims."
              rows={7}
            />
            <p
              className={cn(
                "text-[12px]",
                words === 0
                  ? "text-muted-foreground"
                  : wordsInRange
                    ? "text-success-700 dark:text-success-100"
                    : "text-warning-700 dark:text-warning-100",
              )}
              aria-live="polite"
            >
              <span className="num font-semibold">{words}</span> words · GBP guidance{" "}
              <span className="num">
                {WORD_MIN}–{WORD_MAX}
              </span>
              {words > 0 && !wordsInRange
                ? words < WORD_MIN
                  ? " — a little short"
                  : " — trim it down"
                : ""}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="post-cta-label">CTA label</Label>
              <Input
                id="post-cta-label"
                value={ctaLabel}
                onChange={(e) => setCtaLabel(e.target.value)}
                placeholder="Learn more"
                maxLength={30}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="post-cta-url">CTA URL</Label>
              <Input
                id="post-cta-url"
                value={ctaUrl}
                onChange={(e) => setCtaUrl(e.target.value)}
                placeholder={website}
                className="num text-[12px]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="post-date">Schedule date</Label>
            <div className="flex items-center gap-2">
              <Popover
                open={pickerOpen}
                onOpenChange={setPickerOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    id="post-date"
                    variant="outline"
                    className={cn(
                      "w-full justify-start font-normal",
                      !date && "text-muted-foreground",
                    )}
                  >
                    <Icons.calendar
                      className="size-4"
                      aria-hidden
                    />
                    {date ? (
                      <span className="num">{format(date, "MMM d, yyyy")}</span>
                    ) : (
                      "Pick a date (optional)"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={date}
                    defaultMonth={date ?? new Date(2026, 6, 1)}
                    onSelect={(d) => {
                      setDate(d);
                      setPickerOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
              {date ? (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Clear schedule date"
                  onClick={() => setDate(undefined)}
                >
                  <Icons.close className="size-4" />
                </Button>
              ) : null}
            </div>
            <p className="text-muted-foreground text-[12px]">
              With a date the post lands as{" "}
              <span className="text-foreground font-medium">Scheduled</span> on approval; without
              one it lands in <span className="text-foreground font-medium">Pending approval</span>.
            </p>
          </div>

          <ImageGenerator
            postType={type}
            title={title}
            shortName={locationShortName}
            imageUrl={imageUrl}
            imageLabel={imageLabel}
            onSelect={(uri, label) => {
              setImageUrl(uri);
              setImageLabel(label);
            }}
            onClear={() => {
              setImageUrl(undefined);
              setImageLabel(undefined);
            }}
          />

          <div className="border-border border-l-primary bg-accent text-accent-foreground rounded-md border border-l-[3px] p-3 text-[12px] leading-relaxed">
            Healthcare compliance: no patient stories without consent on file, no outcome or cure
            claims, provider names only from the verified roster. Demo mode — submissions are
            simulated writes to local state.
          </div>

          <div className="mt-auto flex justify-end">
            <ApprovalLadder
              trigger={
                <Button disabled={!valid}>
                  <Icons.send className="size-4" />
                  {date ? "Submit & schedule" : "Submit for approval"}
                </Button>
              }
              title={editingPost ? "Resubmit GBP post" : "Submit GBP post"}
              description={
                date
                  ? `Schedules "${title.trim() || "Untitled post"}" for ${fmtDate(
                      scheduledISO as string,
                    )}`
                  : `Queues "${title.trim() || "Untitled post"}" for approval`
              }
              actionVerb={date ? "Approve & schedule" : "Approve & queue"}
              auditAction={
                date
                  ? `Scheduled GBP post "${title.trim()}" for ${fmtDate(scheduledISO as string)}`
                  : `Queued GBP post "${title.trim()}" for approval`
              }
              auditResource={`gbp_post:${previewPost.id}`}
              auditVerb={editingPost ? "update" : "create"}
              locationSlug={slug}
              preview={<PostPreviewBlock post={previewPost} />}
              cost={{
                value: "$0.00",
                math: "1 GBP post × 1 location — scheduling has no API spend",
                subline: "Demo mode — the profile write is simulated",
              }}
              onCompleted={complete}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
