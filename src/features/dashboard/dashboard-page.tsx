"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  TrendingUp,
  AlertCircle,
  ArrowRight,
  FileSignature,
  Activity,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { RevenueAreaChart } from "@/components/charts/revenue-area-chart";
import { OccupancyBarChart } from "@/components/charts/occupancy-bar-chart";
import { DonutChart } from "@/components/charts/donut-chart";
import { useDashboardMetrics, useOccupancyByBuilding } from "@/hooks/use-dashboard";
import { useRevenueByMonth, usePayments } from "@/hooks/use-payments";
import { useExpiringLeases } from "@/hooks/use-leases";
import { formatCurrency, formatDate } from "@/lib/format";
import { containerVariants, itemVariants } from "@/lib/motion";
import { COPY } from "@/config/copy";
import { STATUS_BADGE } from "@/config/entities";

export function DashboardPage() {
  const { data: metrics, isLoading: loadingMetrics } = useDashboardMetrics();
  const { data: revenue = [] } = useRevenueByMonth(12);
  const { data: occupancy = [] } = useOccupancyByBuilding();
  const { data: payments = [] } = usePayments();
  const { data: expiring = [] } = useExpiringLeases(60);

  const recentPayments = React.useMemo(
    () => [...payments].sort((a, b) => (a.dueDate < b.dueDate ? 1 : -1)).slice(0, 6),
    [payments]
  );

  const paymentMix = React.useMemo(() => {
    if (!metrics) return [];
    return [
      { name: "Paid", value: payments.filter((p) => p.status === "paid").length, color: "oklch(0.65 0.18 145)" },
      { name: "Pending", value: payments.filter((p) => p.status === "pending").length, color: "oklch(0.78 0.16 75)" },
      { name: "Overdue", value: payments.filter((p) => p.status === "overdue").length, color: "oklch(0.60 0.22 25)" },
    ];
  }, [payments, metrics]);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={itemVariants}>
        <PageHeader
          title={COPY.dashboard.title}
          description={COPY.dashboard.description}
        />
      </motion.div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={COPY.dashboard.metrics.occupancy}
          value={metrics ? `${Math.round(metrics.occupancyRate * 100)}%` : "—"}
          accent="primary"
          icon={Activity}
          loading={loadingMetrics}
        />
        <StatCard
          label={COPY.dashboard.metrics.monthlyRevenue}
          value={metrics?.totalRevenueLast30 ?? 0}
          format={(n) => formatCurrency(n)}
          accent="success"
          icon={TrendingUp}
          loading={loadingMetrics}
        />
        <StatCard
          label={COPY.dashboard.metrics.activeLeases}
          value={metrics?.activeLeases ?? 0}
          hint={metrics ? `${metrics.expiringLeases} expiring` : undefined}
          accent="info"
          icon={FileSignature}
          loading={loadingMetrics}
        />
        <StatCard
          label={COPY.dashboard.metrics.overduePayments}
          value={metrics?.overduePayments ?? 0}
          accent={metrics && metrics.overduePayments > 0 ? "danger" : "muted"}
          icon={AlertCircle}
          loading={loadingMetrics}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <RevenueAreaChart
          data={revenue}
          title={COPY.dashboard.sections.revenueTrend}
          description="Last 12 months — collected vs. expected"
          className="lg:col-span-2"
        />
        <DonutChart
          data={paymentMix}
          title={COPY.dashboard.sections.paymentStatusMix}
          description="All recorded payments"
        />
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <OccupancyBarChart
          data={occupancy}
          title={COPY.dashboard.sections.occupancyByBuilding}
          description="Occupied offices per building"
        />
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle className="text-base">{COPY.dashboard.sections.expiringLeases}</CardTitle>
              <CardDescription>Leases ending within 60 days</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/leases?status=expiring">
                View all
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {loadingMetrics ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
              </div>
            ) : expiring.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                {COPY.dashboard.empty.expiringLeases}
              </p>
            ) : (
              <div className="space-y-1.5">
                {expiring.slice(0, 6).map((l) => (
                  <Link
                    key={l.id}
                    href={`/leases/${l.id}`}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-md hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar name={l.tenant.fullName} seed={l.tenant.avatarSeed} size="sm" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{l.tenant.fullName}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {l.office.building.name} · {l.office.number}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Ends</p>
                        <p className="text-sm font-medium">{formatDate(l.endDate)}</p>
                      </div>
                      <Badge variant={STATUS_BADGE.lease[l.status]} size="sm">{l.status}</Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent activity */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle className="text-base">{COPY.dashboard.sections.recentPayments}</CardTitle>
            <CardDescription>Latest activity across your portfolio</CardDescription>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/payments">
              View all
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentPayments.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              {COPY.dashboard.empty.recentPayments}
            </p>
          ) : (
            <div className="space-y-1.5">
              {recentPayments.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-md hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-xs font-semibold">
                      {p.periodMonth.split("-")[1]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{p.tenant.fullName}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.periodMonth} · Due {formatDate(p.dueDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
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
  );
}
