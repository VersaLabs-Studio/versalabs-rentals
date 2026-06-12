"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect, type ReactNode } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth-provider";
import { SeedBoot } from "@/components/seed-boot";
import { Toaster } from "sonner";

/**
 * Root providers: Query → Theme → Auth → SeedBoot.
 * Single client instance across the app (state survives navigation).
 */
export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
          mutations: {
            retry: 0,
          },
        },
      })
  );

  // SSR safety: ensure client is mounted before children
  useEffect(() => {
    // no-op, ensures effect-only run on client
  }, []);

  return (
    <QueryClientProvider client={client}>
      <ThemeProvider>
        <AuthProvider>
          <SeedBoot />
          {children}
          <Toaster
            position="top-right"
            theme="system"
            richColors
            closeButton
            toastOptions={{
              style: {
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border)",
                backdropFilter: "blur(12px)",
              },
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
