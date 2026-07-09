import { STUB_LOCATIONS, STUB_NOTIFICATIONS } from "@/lib/data/fixtures";
import type { LocationNavItem } from "@/components/shell/location-selector";
import type { BellItem } from "@/components/shell/notification-bell";

export interface Adapter {
  getLocations: () => Promise<LocationNavItem[]>;
  getNotifications: () => Promise<{ notifications: BellItem[] }>;
}

export function getAdapter(): Adapter {
  return {
    async getLocations() {
      return STUB_LOCATIONS;
    },
    async getNotifications() {
      return { notifications: STUB_NOTIFICATIONS };
    },
  };
}
