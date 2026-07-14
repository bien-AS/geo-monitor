"use client";

import * as React from "react";
import { Icons } from "@/lib/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useRole, ROLE_LABEL, ROLE_DESCRIPTION, type Role } from "./role-store";
import { useUserStore } from "@/store/user";

const ROLES: Role[] = ["operator", "client-viewer"];

export function RoleSwitcher() {
  const role = useRole();
  const setRole = useUserStore((s) => s.setRole);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="View as role"
        className="text-sidebar-foreground hidden h-9 shrink-0 items-center gap-1.5 rounded-md border border-white/15 bg-white/5 px-3 text-[13px] font-medium transition-colors hover:bg-white/10 sm:flex"
      >
        {ROLE_LABEL[role]}
        <Icons.chevronDown className="size-3.5 shrink-0" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-64"
      >
        <DropdownMenuLabel>View as role</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {ROLES.map((r) => (
          <DropdownMenuItem
            key={r}
            onSelect={() => setRole(r)}
          >
            <Icons.check
              className={cn("size-4 shrink-0", role === r ? "opacity-100" : "opacity-0")}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{ROLE_LABEL[r]}</p>
              <p className="text-text-tertiary truncate text-xs font-normal">
                {ROLE_DESCRIPTION[r]}
              </p>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
