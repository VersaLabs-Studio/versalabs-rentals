"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Pencil,
  Building2,
  User,
  Calendar,
  DollarSign,
  FileSignature,
  CreditCard,
  CheckCircle2,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/ui/stat-card";
import { LeaseFormDialog } from "./_components/lease-form-dialog";
import { useLease, useDeleteLease } from "@/hooks/use-leases";
import { usePaymentsByLease } from "@/hooks/use-payments";
import { formatCurrency, formatDate } from "@/lib/format";
import { containerVariants, itemVariants } from "@/lib/motion";
import { COPY } from "@/config/copy";
import { toast } from "@/components/ui/toast";
import { STATUS_BADGE } from "@/config/entities";

interface Props { id: string; }

export function LeaseDetailPage({ id }: Props) {
  const { data: lease, isLoading } = useLease(id);
  const { data: payments = [] } = usePaymentsByLease(id);
  const { mutate: deleteLease } = useDeleteLease();
  const [editOpen, setEditOpen] = React.useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!lease) {
    return (
      <EmptyState
        title="Lease not found"
        description="This lease may have been deleted."
        action={
          <Button asChild>
            <Link href="/leases"><ArrowLeft className="h-4 w-4" />{COPY.leases.detail.backToLeases}</Link>
          </Button>
        }
      />
    );
  }

  const handleDelete = () => {
    if (!confirm("Delete this lease?")) return;
    deleteLease(id, {
      onSuccess: () => {
        toast.success("Lease deleted");
        window.location.href = "/leases";
      },
      onError: (e) => toast.error(e.message),
    });
  };

  const paidPayments = payments.filter((p) => p.status === "paid");
  const totalPaid = paidPayments.reduce((s, p) => s + p.amount, 0);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={itemVariants}>
        <PageHeader
          title={`Lease — ${lease.tenant.fullName}`}
          description={`${lease.office.building.name} · Office ${lease.office.number}`}
          breadcrumbs={[
            { label: COPY.app.name, href: "/dashboard" },
            { label: COPY.leases.title, href: "/leases" },
            { label: `${lease.tenant.fullName}` },
          ]}
          action={
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditOpen(true)}>
                <Pencil className="h-4 w-4" />{COPY.common.edit}
              </Button>
              <Button variant="outline" onClick={handleDelete} className="text-destructive">
                <ArrowLeft className="h-4 w-4" />{COPY.common.delete}
              </Button>
            </div>
          }
        />
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Monthly rent" value={formatCurrency(lease.monthlyRent)} accent="primary" icon={DollarSign} />
        <StatCard label="Deposit" value={formatCurrency(lease.depositAmount)} accent="info" icon={DollarSign} />
        <StatCard label="Total paid" value={formatCurrency(totalPaid)} accent="success" icon={CheckCircle2} />
        <StatCard
          label="Status"
          value={lease.status}
          accent={lease.status === "active" ? "success" : lease.status === "expiring" ? "warning" : "danger"}
          icon={FileSignature}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Parties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link
                href={`/tenants/${lease.tenant.id}`}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50"
              >
                <Avatar name={lease.tenant.fullName} seed={lease.tenant.avatarSeed} size="default" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{lease.tenant.fullName}</p>
                  <p className="text-xs text-muted-foreground truncate">{lease.tenant.company}</p>
                </div>
                <User className="h-4 w-4 text-muted-foreground" />
              </Link>
              <Link
                href={`/buildings`}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Building2 className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{lease.office.building.name}</p>
                  <p className="text-xs text-muted-foreground">Office {lease.office.number}</p>
                </div>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Period</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Start</span>
                <span className="font-medium">{formatDate(lease.startDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">End</span>
                <span className="font-medium">{formatDate(lease.endDate)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={STATUS_BADGE.lease[lease.status]}>{lease.status}</Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />Payments ({payments.length})
              </CardTitle>
              <CardDescription>All payments recorded against this lease</CardDescription>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">No payments recorded yet.</p>
              ) : (
                <div className="space-y-1.5">
                  {payments
                    .sort((a, b) => (a.dueDate < b.dueDate ? 1 : -1))
                    .map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between gap-3 p-2.5 rounded-md hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-xs font-semibold">
                            {p.periodMonth.split("-")[1]}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{p.periodMonth}</p>
                            <p className="text-xs text-muted-foreground">Due {formatDate(p.dueDate)}</p>
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
      </div>

      <LeaseFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        editId={id}
        initialValues={lease}
      />
    </motion.div>
  );
}
