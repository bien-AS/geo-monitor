"use client";

import * as React from "react";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Tooltip } from "radix-ui";
import { toast } from "sonner";
import { transformError } from "@/lib/error-transformer";

const TooltipProvider = Tooltip.Provider;

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
          mutations: {
            onError: (error) => {
              const friendly = transformError(error);
              toast.error(friendly.message, { id: friendly.code });
            },
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        <TooltipProvider delayDuration={500}>{children}</TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
