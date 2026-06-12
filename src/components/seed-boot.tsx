"use client";

import { useEffect } from "react";
import { ensureSeeded } from "@/lib/mock/seed-client";

/**
 * Bootstraps the localStorage seed on first mount.
 * Renders nothing.
 */
export function SeedBoot() {
  useEffect(() => {
    ensureSeeded();
  }, []);
  return null;
}
