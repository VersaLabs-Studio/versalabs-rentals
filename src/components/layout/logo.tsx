import * as React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "default" | "lg";
  withText?: boolean;
}

/**
 * RentFlow wordmark + monogram.
 * Pure SVG — no external network calls.
 */
export function Logo({ className, size = "default", withText = true }: LogoProps) {
  const dim = { sm: 24, default: 32, lg: 40 }[size];
  const textSize = { sm: "text-sm", default: "text-base", lg: "text-lg" }[size];

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <svg
        width={dim}
        height={dim}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="RentFlow"
      >
        <defs>
          <linearGradient id="rentflow-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="oklch(0.58 0.22 270)" />
            <stop offset="100%" stopColor="oklch(0.78 0.16 80)" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="36" height="36" rx="10" fill="url(#rentflow-grad)" />
        <path
          d="M12 13.5C12 12.6716 12.6716 12 13.5 12H20.5C23.8137 12 26.5 14.6863 26.5 18C26.5 20.0454 25.4604 21.8421 23.8735 22.8767L26.5 28H22.5L20.5 24H16V28H12V13.5Z"
          fill="white"
        />
        <circle cx="29" cy="13" r="3" fill="oklch(0.78 0.16 80)" stroke="white" strokeWidth="1.5" />
      </svg>
      {withText && (
        <span className={cn("font-bold tracking-tight text-foreground", textSize)}>
          Rent<span className="text-gradient">Flow</span>
        </span>
      )}
    </div>
  );
}
