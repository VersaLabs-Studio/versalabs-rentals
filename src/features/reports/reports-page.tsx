"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { RevenueAreaChart } from "@/components/charts/revenue-area-chart";
import { OccupancyBarChart } from "@/components/charts/occupancy-bar-chart";
import { useRevenueByMonth, useOverduePayments } from "@/hooks/use-payments";
import { useOccupancyByBuilding } from "@/hooks/use-dashboard";
import { useExpiringLeases } from "@/hooks/use-leases";
import { formatCurrency, formatDate } from "@/lib/format";
import { containerVariants, itemVariants } from "@/lib/motion";
import { COPY } from "@/config/copy";
import { STATUS_BADGE } from "@/config/entities";
import { CalendarClock, AlertCircle, ArrowRight, BarChart3 } from "lucide-react";

export function ReportsPage() {
  const { data: revenue = [], isLoading: l1 } = useRevenueByMonth(12);
  const { data: occupancy = [], isLoading: l2 } = useOccupancyByBuilding();
  const { data: overdue = [], isLoading: l3 } = useOverduePayments();
  const { data: expiring = [], isLoading: l4 } = useExpiringLeases(60);

  const isLoading = l1 || l2 || l3 || l4;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={itemVariants}>
        <PageHeader
          title={COPY.reports.title}
          description={COPY.reports.description}
          breadcrumbs={[{ label: COPY.app.name, href: "/dashboard" }, { label: COPY.reports.title }]}
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {isLoading ? (
          <>
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
          </>
        ) : (
          <>
            <RevenueAreaChart
              data={revenue}
              title={COPY.reports.sections.revenue}
              description="Last 12 months revenue trend"
            />
            <OccupancyBarChart
              data={occupancy}
              title={COPY.reports.sections.occupancy}
              description="Occupancy rate by building"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-warning-foreground" />
                <div>
                  <CardTitle className="text-base">{COPY.reports.sections.upcoming}</CardTitle>
                  <CardDescription>Leases expiring within 60 days</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
              ) : expiring.length === 0 ? (
                <EmptyState title="No upcoming renewals" description="No leases are expiring in the next 60 days." />
              ) : (
                <div className="space-y-1.5">
                  {expiring.map((l) => (
                    <Link
                      key={l.id}
                      href={`/leases/${l.id}`}
                      className="flex items-center justify-between gap-3 p-2.5 rounded-md hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar name={l.tenant.fullName} seed={l.tenant.avatarSeed} size="sm" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{l.tenant.fullName}</p>
                          <p className="text-xs text-muted-foreground">
                            {l.office.building.name} · {l.office.number}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <p className="text-xs text-muted-foreground">Ends {formatDate(l.endDate)}</p>
                        <Badge variant={STATUS_BADGE.lease[l.status]} size="sm">{l.status}</Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <div>
                  <CardTitle className="text-base">{COPY.reports.sections.overdue}</CardTitle>
                  <CardDescription>Payments past their due date</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
              ) : overdue.length === 0 ? (
                <EmptyState title="No overdue payments" description="All caught up. Great work." />
              ) : (
                <div className="space-y-1.5">
                  {overdue.slice(0, 10).map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between gap-3 p-2.5 rounded-md hover:bg-muted/30 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium">{p.tenant.fullName}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.periodMonth} · Due {formatDate(p.dueDate)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={STATUS_BADGE.payment[p.status]} size="sm">{p.status}</Badge>
                        <span className="text-sm font-semibold tabular-nums">{formatCurrency(p.amount)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
