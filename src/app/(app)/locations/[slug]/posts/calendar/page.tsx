"use client";

import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import { usePosts } from "@/hooks/use-posts";
import { shortLocationName } from "@/lib/location-names";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ScopeBanner } from "@/components/shell/scope-banner";
import { Icons } from "@/lib/icons";
import { PostsTabs } from "@/components/screens/posts/posts-tabs";
import { PostsCalendar } from "@/components/screens/posts/posts-calendar";
import { postsStats } from "@/components/screens/posts/post-meta";
import type { GBPPost } from "@/lib/data/types";

export default function PostsCalendarPage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const { data, isLoading, error } = usePosts(slug);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="skeleton h-10 w-full rounded-md" />
        <div className="skeleton h-8 w-64 rounded-md" />
        <div className="skeleton h-96 rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <p className="text-muted-foreground">Failed to load posts data.</p>
        <p className="text-muted-foreground text-[13px]">{error.message}</p>
      </div>
    );
  }

  if (!data) notFound();

  const { location, shortName, navLocations, posts } = data;
  const stats = postsStats(posts);

  const handleEdit = (_post: GBPPost) => {
    // Redirect to manager in composer mode with post pre-filled
  };

  return (
    <div className="flex flex-col gap-6">
      <ScopeBanner
        module="Posts"
        locationName={location.name}
        locations={navLocations}
      />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/local">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/locations/${slug}`}>{shortName}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/locations/${slug}/posts`}>Posts</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Calendar</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-heading text-foreground text-2xl font-bold tracking-tight">
            Posting Calendar
          </h1>
          <Badge
            variant="secondary"
            className="text-[12px]"
          >
            <Icons.calendar className="size-3" />
            <span className="num ml-1">{stats.total}</span> posts
          </Badge>
          {stats.nextScheduledISO && (
            <Badge
              variant="outline"
              className="text-[11px]"
            >
              Next: <span className="num ml-1">{shortLocationName(location.name)}</span>
            </Badge>
          )}
        </div>
        <PostsTabs
          slug={slug}
          active="calendar"
        />
      </div>

      <PostsCalendar
        posts={posts}
        onEditPost={handleEdit}
      />
    </div>
  );
}
