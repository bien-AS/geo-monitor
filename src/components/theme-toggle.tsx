"use client";

import * as React from "react";
import { Icons } from "@/lib/icons";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();

  return (
    <button
      type="button"
      aria-label="Toggle light/dark theme"
      className="text-sidebar-foreground/80 hover:text-sidebar-foreground inline-flex size-9 items-center justify-center rounded-md hover:bg-white/10"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <Icons.sun className="block size-4 dark:hidden" />
      <Icons.moon className="hidden size-4 dark:block" />
    </button>
  );
}
