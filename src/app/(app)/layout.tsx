import { Toaster } from "@/components/ui/sonner";
import { getAdapter } from "@/lib/adapter";
import { Sidebar } from "@/components/shell/sidebar";
import { Topbar } from "@/components/shell/topbar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const adapter = getAdapter();
  const locations = await adapter.getLocations();
  const notifications = await adapter.getNotifications();
  const bellItems = (notifications?.notifications ?? []).map((n) => ({
    id: n.id,
    audience: n.audience,
  }));
  const navLocations = locations.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="min-h-screen">
      <Topbar
        locations={navLocations}
        bellItems={bellItems}
      />
      <Sidebar locations={navLocations} />
      <main className="pt-14 md:pl-60">
        <div className="mx-auto max-w-[1440px] px-6 py-6">{children}</div>
      </main>
      <Toaster />
    </div>
  );
}
