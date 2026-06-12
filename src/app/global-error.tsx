"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-premium-gradient">
          <div className="space-y-6 max-w-md">
            <div className="flex justify-center">
              <Logo size="lg" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Something went wrong</h1>
              <p className="text-sm text-muted-foreground mt-2">
                {error.message || "An unexpected error occurred."}
              </p>
            </div>
            <div className="flex justify-center gap-2">
              <Button onClick={() => reset()}>Try again</Button>
              <Button variant="outline" onClick={() => (window.location.href = "/dashboard")}>
                Reload
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
