import { ScopeBanner } from "@/components/shell/scope-banner";
import { getAdapter } from "@/lib/adapter";

export default async function LocationOverviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const adapter = getAdapter();
  const locations = await adapter.getLocations();
  const current = locations.find((l) => l.slug === slug);

  return (
    <div>
      {current && (
        <ScopeBanner
          module="Overview"
          locationName={current.name}
          locations={locations}
        />
      )}
      <h1 className="font-heading text-foreground text-2xl font-bold tracking-tight">Overview</h1>
      <p className="text-muted-foreground mt-2">Overview coming soon.</p>
    </div>
  );
}
