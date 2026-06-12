"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Building2,
  Pencil,
  Trash2,
  FileSignature,
  CreditCard,
  Hash,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { TenantStatusBadge } from "./_components/tenant-status-badge";
import { TenantFormDialog } from "./_components/tenant-form-dialog";
import {
  useTenantWithLeases,
  useDeleteTenant,
} from "@/hooks/use-tenants";
import { usePaymentsByTenant } from "@/hooks/use-payments";
import { formatCurrency, formatDate } from "@/lib/format";
import { containerVariants, itemVariants } from "@/lib/motion";
import { COPY } from "@/config/copy";
import { toast } from "@/components/ui/toast";
import { Badge } from "@/components/ui/badge";
import { STATUS_BADGE } from "@/config/entities";

interface TenantDetailPageProps {
  id: string;
}

export function TenantDetailPage({ id }: TenantDetailPageProps) {
  const { data: tenant, isLoading } = useTenantWithLeases(id);
  const { data: payments = [] } = usePaymentsByTenant(id);
  const { mutate: deleteTenant } = useDeleteTenant();
  const [editOpen, setEditOpen] = React.useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!tenant) {
    return (
      <EmptyState
        title="Tenant not found"
        description="This tenant may have been deleted."
        action={
          <Button asChild>
            <Link href="/tenants">
              <ArrowLeft className="h-4 w-4" />
              {COPY.tenants.detail.backToTenants}
            </Link>
          </Button>
        }
      />
    );
  }

  const handleDelete = () => {
    if (!confirm(COPY.tenants.deleteConfirm)) return;
    deleteTenant(id, {
      onSuccess: () => {
        toast.success("Tenant deleted");
        window.location.href = "/tenants";
      },
      onError: (e) => toast.error(e.message),
    });
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={itemVariants}>
        <PageHeader
          title={tenant.fullName}
          description={tenant.company || "Tenant details"}
          breadcrumbs={[
            { label: COPY.app.name, href: "/dashboard" },
            { label: COPY.tenants.title, href: "/tenants" },
            { label: tenant.fullName },
          ]}
          action={
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditOpen(true)}>
                <Pencil className="h-4 w-4" />
                {COPY.common.edit}
              </Button>
              <Button variant="outline" onClick={handleDelete} className="text-destructive">
                <Trash2 className="h-4 w-4" />
                {COPY.common.delete}
              </Button>
            </div>
          }
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-1 space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-4">
                <Avatar name={tenant.fullName} seed={tenant.avatarSeed} size="xl" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{tenant.fullName}</h3>
                  {tenant.company && (
                    <p className="text-sm text-muted-foreground truncate">{tenant.company}</p>
                  )}
                  <div className="mt-2">
                    <TenantStatusBadge status={tenant.status} />
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${tenant.email}`} className="hover:text-primary transition-colors">
                    {tenant.email}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${tenant.phone}`} className="hover:text-primary transition-colors">
                    {tenant.phone}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Moved in {formatDate(tenant.moveInDate)}
                  </span>
                </div>
              </div>

              {tenant.notes && (
                <div className="pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm text-foreground leading-relaxed">{tenant.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {tenant.activeLease && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Active lease</CardTitle>
              </CardHeader>
              <CardContent>
                <Link
                  href={`/leases/${tenant.activeLease.id}`}
                  className="block p-3 rounded-lg border border-border hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">
                      {tenant.activeLease.office.building.name}
                    </span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-sm text-muted-foreground">
                      Office {tenant.activeLease.office.number}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-0.5">
                    <p>
                      {formatDate(tenant.activeLease.startDate)} — {formatDate(tenant.activeLease.endDate)}
                    </p>
                    <p className="font-semibold text-foreground tabular-nums">
                      {formatCurrency(tenant.activeLease.monthlyRent)} / month
                    </p>
                  </div>
                </Link>
              </CardContent>
            </Card>
          )}
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSignature className="h-4 w-4" />
                Leases ({tenant.leases.length})
              </CardTitle>
              <CardDescription>All leases for this tenant</CardDescription>
            </CardHeader>
            <CardContent>
              {tenant.leases.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  {COPY.tenants.detail.noLeases}
                </p>
              ) : (
                <div className="space-y-2">
                  {tenant.leases
                    .sort((a, b) => (a.startDate < b.startDate ? 1 : -1))
                    .map((lease) => (
                      <Link
                        key={lease.id}
                        href={`/leases/${lease.id}`}
                        className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border hover:border-primary/50 transition-colors"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 text-sm">
                            <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="font-medium">{lease.office.building.name}</span>
                            <span className="text-muted-foreground">·</span>
                            <span className="text-muted-foreground">{lease.office.number}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatDate(lease.startDate)} — {formatDate(lease.endDate)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={STATUS_BADGE.lease[lease.status]} size="sm">
                            {lease.status}
                          </Badge>
                          <span className="text-sm font-semibold tabular-nums">
                            {formatCurrency(lease.monthlyRent)}
                          </span>
                        </div>
                      </Link>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Recent payments ({payments.length})
              </CardTitle>
              <CardDescription>Payment history for this tenant</CardDescription>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  {COPY.tenants.detail.noPayments}
                </p>
              ) : (
                <div className="space-y-1.5">
                  {payments
                    .sort((a, b) => (a.dueDate < b.dueDate ? 1 : -1))
                    .slice(0, 12)
                    .map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between gap-3 p-2.5 rounded-md hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-xs font-semibold">
                            {p.periodMonth.split("-")[1]}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium">{p.periodMonth}</p>
                            <p className="text-xs text-muted-foreground">
                              Due {formatDate(p.dueDate)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={STATUS_BADGE.payment[p.status]} size="sm">
                            {p.status}
                          </Badge>
                          <span className="text-sm font-semibold tabular-nums">
                            {formatCurrency(p.amount)}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <TenantFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        editId={id}
        initialValues={tenant}
      />
    </motion.div>
  );
}
