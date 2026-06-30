"use client";

import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { itemVariants } from "@/lib/motion";
export interface OccupancyDataPoint {
  name: string;
  total: number;
  occupied: number;
  vacant: number;
  rate: number;
}

interface Props {
  data: OccupancyDataPoint[];
  title?: string;
  description?: string;
  className?: string;
}

export function OccupancyBarChart({
  data,
  title = "Occupancy by building",
  description = "Percentage of offices occupied per building",
  className,
}: Props) {
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
              <BarChart
                data={data}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis
                  type="number"
                  domain={[0, 1]}
                  tickFormatter={(v) => `${Math.round(v * 100)}%`}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  axisLine={{ stroke: "var(--border)" }}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={110}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-md)",
                    fontSize: 12,
                  }}
                  formatter={(value: number) => [`${Math.round(value * 100)}%`, "Occupied"]}
                />
                <Bar dataKey="rate" radius={[0, 6, 6, 0]} maxBarSize={20}>
                  {data.map((entry, idx) => (
                    <Cell
                      key={idx}
                      fill={entry.rate >= 0.75 ? "oklch(0.65 0.18 145)" : entry.rate >= 0.5 ? "oklch(0.58 0.22 270)" : "oklch(0.78 0.16 75)"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
