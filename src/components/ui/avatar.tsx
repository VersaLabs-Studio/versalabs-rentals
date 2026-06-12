"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";

/**
 * Avatar with deterministic gradient + initials fallback.
 * No external network calls — colors are derived from a seed string.
 */
const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> & {
    seed?: string;
    name?: string;
    size?: "sm" | "default" | "lg" | "xl";
  }
>(({ className, seed, name, size = "default", ...props }, ref) => {
  const sizeClass = {
    sm: "h-7 w-7 text-[10px]",
    default: "h-9 w-9 text-xs",
    lg: "h-12 w-12 text-sm",
    xl: "h-16 w-16 text-base",
  }[size];

  const initials = React.useMemo(() => {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
    return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
  }, [name]);

  const gradient = React.useMemo(() => generateGradient(seed || name || "default"), [seed, name]);

  return (
    <AvatarPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full",
        sizeClass,
        className
      )}
      {...props}
    >
      <AvatarPrimitive.Fallback
        className="flex h-full w-full items-center justify-center font-semibold text-white"
        style={{ background: gradient }}
      >
        {initials}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
});
Avatar.displayName = AvatarPrimitive.Root.displayName;

export { Avatar };

/**
 * Deterministic gradient from a string seed.
 * Picks two OKLCH hue stops that feel cohesive.
 */
function generateGradient(seed: string): string {
  const hash = simpleHash(seed);
  const hue1 = hash % 360;
  const hue2 = (hue1 + 40 + (hash % 60)) % 360;
  return `linear-gradient(135deg, oklch(0.55 0.18 ${hue1}), oklch(0.65 0.16 ${hue2}))`;
}

function simpleHash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}
