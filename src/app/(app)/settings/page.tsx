"use client";

import { Icons } from "@/lib/icons";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SettingsNav } from "@/components/screens/settings/settings-nav";
import { OrgProfileCard } from "@/components/screens/settings/org-profile-card";
import { ProviderHealthCard } from "@/components/screens/settings/provider-health-card";
import { PolicyCard } from "@/components/screens/settings/policy-card";
import { NotificationPrefsCard } from "@/components/screens/settings/notification-prefs-card";
import { useSettings } from "@/hooks/use-settings";

export default function SettingsPage() {
  const { data } = useSettings();

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="font-heading text-foreground text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-text-tertiary mt-1 text-[13px]">Workspace configuration</p>
      </div>

      <SettingsNav />

      <OrgProfileCard />
      <PolicyCard />
      <NotificationPrefsCard />
      <ProviderHealthCard providers={data.providers} />

      <Card className="gap-4 p-6">
        <div className="flex items-center gap-2">
          <Icons.data className="text-text-tertiary size-4" />
          <h2 className="text-base font-semibold">Data mode</h2>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Fixtures (snapshot)</p>
            <p className="text-text-tertiary text-[13px]">
              Snapshot taken 2026-07-02 from Search Atlas + DataForSEO. Every record carries its{" "}
              <span className="num">source</span> tag. Live mode ships behind the same adapter
              interface.
            </p>
          </div>
          <Badge className="bg-accent text-accent-foreground border-transparent">
            DATA_MODE=fixtures
          </Badge>
        </div>
      </Card>
    </div>
  );
}
