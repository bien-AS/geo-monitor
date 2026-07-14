import type { GBPPost, PostStatus, PostType } from "@/lib/data/types";
import type { PillTone } from "@/components/local/status-pill";
import { Icons } from "@/lib/icons";

type IconType = React.ComponentType<{ className?: string }>;

export const POST_TYPES: PostType[] = [
  "whats_new",
  "event",
  "offer",
  "health_observance",
  "provider_announcement",
  "screening",
];

export const POST_TYPE_META: Record<PostType, { label: string; icon: IconType }> = {
  whats_new: { label: "What's New", icon: Icons.megaphone },
  event: { label: "Event", icon: Icons.calendarDays },
  offer: { label: "Offer", icon: Icons.badgePercent },
  health_observance: { label: "Health Observance", icon: Icons.heartPulse },
  provider_announcement: { label: "Provider Announcement", icon: Icons.userPlus },
  screening: { label: "Screening & Wellness", icon: Icons.stethoscope },
};

export const POST_STATUS_META: Record<
  PostStatus,
  {
    label: string;
    tone: PillTone;
    icon: IconType;
    chipCls: string;
    dotCls: string;
    laneTopCls: string;
    laneIconCls: string;
  }
> = {
  published: {
    label: "Published",
    tone: "success",
    icon: Icons.checkCircle,
    chipCls: "bg-success-50 text-success-700 dark:bg-success-700/25 dark:text-success-100",
    dotCls: "bg-success-500",
    laneTopCls: "border-t-success-500",
    laneIconCls: "text-success-500",
  },
  scheduled: {
    label: "Scheduled",
    tone: "info",
    icon: Icons.calendarClock,
    chipCls: "bg-accent text-accent-foreground",
    dotCls: "bg-primary dark:bg-primary",
    laneTopCls: "border-t-primary",
    laneIconCls: "text-primary",
  },
  pending_approval: {
    label: "Pending approval",
    tone: "warning",
    icon: Icons.hourglass,
    chipCls: "bg-warning-50 text-warning-700 dark:bg-warning-700/25 dark:text-warning-100",
    dotCls: "bg-warning-500",
    laneTopCls: "border-t-warning-500",
    laneIconCls: "text-warning-500",
  },
  draft: {
    label: "Draft",
    tone: "neutral",
    icon: Icons.fileText,
    chipCls: "bg-secondary text-muted-foreground",
    dotCls: "bg-muted-foreground/40",
    laneTopCls: "border-t-border",
    laneIconCls: "text-muted-foreground",
  },
};

export const STATUS_LANES: PostStatus[] = ["draft", "pending_approval", "scheduled", "published"];

export const ALLOWED_TRANSITIONS: Record<PostStatus, PostStatus[]> = {
  draft: ["pending_approval"],
  pending_approval: ["scheduled", "published"],
  scheduled: ["published", "draft"],
  published: [],
};

export function transitionBlockReason(from: PostStatus, to: PostStatus): string {
  if (from === "published") return "Published posts are read-only history.";
  if (from === "draft" && (to === "scheduled" || to === "published"))
    return "Drafts go through Pending approval first.";
  if (from === "pending_approval" && to === "draft")
    return "Pending posts: approve to move forward, or edit in the composer.";
  return `${POST_STATUS_META[from].label} posts can't move to ${POST_STATUS_META[to].label}.`;
}

export function postDateISO(post: GBPPost): string | null {
  return post.scheduled_for ?? post.published_at ?? null;
}

export function postDayKey(post: GBPPost): string | null {
  const iso = postDateISO(post);
  return iso ? iso.slice(0, 10) : null;
}

export function postsStats(posts: GBPPost[]) {
  const published = posts
    .filter((p) => p.status === "published" && p.published_at)
    .sort((a, b) => (b.published_at as string).localeCompare(a.published_at as string));
  const scheduled = posts
    .filter((p) => p.status === "scheduled" && p.scheduled_for)
    .sort((a, b) => (a.scheduled_for as string).localeCompare(b.scheduled_for as string));
  return {
    total: posts.length,
    lastPublishedISO: published[0]?.published_at ?? null,
    nextScheduledISO: scheduled[0]?.scheduled_for ?? null,
    pending: posts.filter((p) => p.status === "pending_approval").length,
    scheduledCount: scheduled.length,
  };
}

export function templateDraft(
  type: PostType,
  locationName: string,
  city: string,
): { title: string; body: string; ctaLabel: string } {
  switch (type) {
    case "whats_new":
      return {
        title: "Now welcoming new patients",
        body: `${locationName} in ${city} is currently welcoming new patients. Our team can help with scheduling, insurance questions, and finding an appointment time that works for you and your family. Same-week availability is often open for routine visits. Call our front desk or visit our website to get started.`,
        ctaLabel: "Learn more",
      };
    case "event":
      return {
        title: `Community wellness event in ${city}`,
        body: `Join us for an upcoming community wellness event in ${city}. Stop by for free blood pressure checks, wellness resources, and a chance to meet members of the ${locationName} care team. Watch this page for confirmed dates, times, and location details as they are finalized.`,
        ctaLabel: "Learn more",
      };
    case "offer":
      return {
        title: "Sports physicals season is here",
        body: `Back-to-school season means sports physicals, and ${locationName} makes them easy. Appointments are quick, and our team can complete the forms your school or league requires. Call ahead to confirm walk-in hours in ${city}, or schedule a time that fits your family's calendar before the season starts.`,
        ctaLabel: "Book appointment",
      };
    case "health_observance":
      return {
        title: "A health observance worth your attention",
        body: `National health observances are a helpful nudge to check in on your own wellness routine. This month, take a moment to review preventive care basics — routine checkups, screenings, and healthy habits. The care team at ${locationName} in ${city} can help you decide which steps make sense for you.`,
        ctaLabel: "Learn more",
      };
    case "provider_announcement":
      return {
        title: "Our care team is growing",
        body: `${locationName} is preparing to welcome a new provider to our ${city} office. New appointment slots will open in the coming weeks, and our front desk can add you to the interest list today. We look forward to serving more patients and families across the ${city} community.`,
        ctaLabel: "Learn more",
      };
    case "screening":
      return {
        title: "A reminder about preventive screenings",
        body: `Routine screenings are one of the simplest ways to stay ahead of your health. Many take only minutes, and early awareness gives you and your care team more options. Ask ${locationName} in ${city} which screenings are recommended for your age and history, and schedule at a time that suits you.`,
        ctaLabel: "Book appointment",
      };
  }
}
