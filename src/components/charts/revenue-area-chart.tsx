"use client";

import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { itemVariants } from "@/lib/motion";
import { formatCurrency } from "@/lib/format";
import type { RevenuePoint } from "@/types";

interface RevenueChartProps {
  data: RevenuePoint[];
  title?: string;
  description?: string;
  className?: string;
}

export function RevenueAreaChart({
  data,
  title = "Revenue trend",
  description = "Monthly collected revenue vs. expected",
  className,
}: RevenueChartProps) {
  return (
    <motion.div variants={itemVariants} className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="rev-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.58 0.22 270)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="oklch(0.58 0.22 270)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="exp-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.65 0.18 145)" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="oklch(0.65 0.18 145)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="monthLabel"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  axisLine={{ stroke: "var(--border)" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-md)",
                    fontSize: 12,
                  }}
                  formatter={(value: number, name: string) => [
                    formatCurrency(value),
                    name === "revenue" ? "Collected" : name === "expected" ? "Expected" : "Overdue",
                  ]}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12, color: "var(--muted-foreground)" }}
                />
                <Area
                  type="monotone"
                  dataKey="expected"
                  stroke="oklch(0.65 0.18 145)"
                  strokeWidth={1.5}
                  fill="url(#exp-grad)"
                  strokeDasharray="4 4"
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="oklch(0.58 0.22 270)"
                  strokeWidth={2.5}
                  fill="url(#rev-grad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
