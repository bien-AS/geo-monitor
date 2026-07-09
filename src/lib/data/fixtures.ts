import type { LocationNavItem } from "@/components/shell/location-selector";
import type { BellItem } from "@/components/shell/notification-bell";

export const STUB_LOCATIONS: LocationNavItem[] = [
  { slug: "baptist-memphis", name: "Baptist Memorial Hospital - Memphis", city: "Memphis, TN" },
  {
    slug: "baptist-collierville",
    name: "Baptist Memorial Hospital - Collierville",
    city: "Collierville, TN",
  },
  { slug: "baptist-desoto", name: "Baptist Memorial Hospital - DeSoto", city: "Southaven, MS" },
  {
    slug: "baptist-north-mississippi",
    name: "Baptist Memorial Hospital - North Mississippi",
    city: "Oxford, MS",
  },
  {
    slug: "baptist-golden-triangle",
    name: "Baptist Memorial Hospital - Golden Triangle",
    city: "Columbus, MS",
  },
  {
    slug: "baptist-union-city",
    name: "Baptist Memorial Hospital - Union City",
    city: "Union City, TN",
  },
  {
    slug: "baptist-booneville",
    name: "Baptist Memorial Hospital - Booneville",
    city: "Booneville, MS",
  },
  {
    slug: "baptist-huntingdon",
    name: "Baptist Memorial Hospital - Huntingdon",
    city: "Huntingdon, TN",
  },
];

export const STUB_NOTIFICATIONS: BellItem[] = [
  { id: "n1", audience: "all" },
  { id: "n2", audience: "operator" },
  { id: "n3", audience: "all" },
  { id: "n4", audience: "all" },
];
