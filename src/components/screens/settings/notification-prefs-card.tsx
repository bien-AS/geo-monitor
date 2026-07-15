"use client";

import { Icons } from "@/lib/icons";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  PREF_META,
  useNotificationPrefsStore,
  type NotificationPrefs,
} from "@/store/notification-prefs";

/** Notification preferences — feeds the Notification Center. */
export function NotificationPrefsCard() {
  const prefs = useNotificationPrefsStore((s) => s.prefs);
  const setPref = useNotificationPrefsStore((s) => s.setPref);

  return (
    <Card className="gap-4 p-6">
      <div className="flex items-center gap-2">
        <Icons.bell className="text-text-tertiary size-4" />
        <h2 className="text-base font-semibold">Notifications</h2>
      </div>
      <div className="divide-border-subtle flex flex-col divide-y">
        {(Object.keys(PREF_META) as Array<keyof NotificationPrefs>).map((key) => (
          <div
            key={key}
            className="flex items-start justify-between gap-4 py-3"
          >
            <div>
              <Label
                htmlFor={`pref-${key}`}
                className="text-sm font-medium"
              >
                {PREF_META[key].label}
              </Label>
              <p className="text-text-tertiary mt-0.5 text-[13px]">{PREF_META[key].detail}</p>
            </div>
            <Switch
              id={`pref-${key}`}
              checked={prefs[key]}
              onCheckedChange={(v) => setPref(key, v)}
            />
          </div>
        ))}
      </div>
    </Card>
  );
}
