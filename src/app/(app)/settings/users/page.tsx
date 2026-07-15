"use client";

import { SettingsNav } from "@/components/screens/settings/settings-nav";
import { UsersScreen } from "@/components/screens/settings/users-screen";

export default function UsersPage() {
  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="font-heading text-foreground text-2xl font-bold tracking-tight">
          Users & roles
        </h1>
        <p className="text-text-tertiary mt-1 text-[13px]">
          Who can see and approve what across the Baptist Local workspace
        </p>
      </div>
      <SettingsNav />
      <UsersScreen />
    </div>
  );
}
