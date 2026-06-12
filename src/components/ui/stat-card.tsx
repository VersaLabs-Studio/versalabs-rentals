"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { itemVariants } from "@/lib/motion";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  delta?: { value: number; suffix?: string };
  icon?: LucideIcon;
  accent?: "primary" | "success" | "warning" | "danger" | "info" | "accent" | "muted";
  loading?: boolean;
  format?: (n: number) => string;
}

const accentMap = {
  primary: { bg: "bg-primary/10", text: "text-primary", border: "border-primary/20" },
  success: { bg: "bg-success/10", text: "text-success", border: "border-success/20" },
  warning: { bg: "bg-warning/10", text: "text-warning-foreground", border: "border-warning/30" },
  danger: { bg: "bg-destructive/10", text: "text-destructive", border: "border-destructive/20" },
  info: { bg: "bg-info/10", text: "text-info", border: "border-info/20" },
  accent: { bg: "bg-accent/15", text: "text-accent-foreground", border: "border-accent/30" },
  muted: { bg: "bg-muted", text: "text-muted-foreground", border: "border-border" },
};

export function StatCard({
  label,
  value,
  hint,
  delta,
  icon: Icon,
  accent = "primary",
  loading = false,
  format,
}: StatCardProps) {
  const a = accentMap[accent];

  const displayValue = React.useMemo(() => {
    if (loading) return "—";
    if (typeof value === "number") {
      return format ? format(value) : new Intl.NumberFormat("en-ET").format(value);
    }
    return value;
  }, [value, format, loading]);

  return (
    <motion.div variants={itemVariants}>
      <Card className="card-elevated overflow-hidden relative group hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {label}
              </p>
              <p className="mt-2 text-2xl font-bold tabular-nums text-foreground truncate">
                {displayValue}
              </p>
              {(hint || delta) && (
                <div className="mt-2 flex items-center gap-2 text-xs">
                  {delta && (
                    <span
                      className={cn(
                        "inline-flex items-center gap-0.5 font-medium",
                        delta.value >= 0 ? "text-success" : "text-destructive"
                      )}
                    >
                      {delta.value >= 0 ? "▲" : "▼"} {Math.abs(delta.value)}
                      {delta.suffix ?? "%"}
                    </span>
                  )}
                  {hint && <span className="text-muted-foreground">{hint}</span>}
                </div>
              )}
            </div>
            {Icon && (
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg border",
                  a.bg,
                  a.text,
                  a.border
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
