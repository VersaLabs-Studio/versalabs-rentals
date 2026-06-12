"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Search, UserX } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { TenantTable } from "./_components/tenant-table";
import { TenantFormDialog } from "./_components/tenant-form-dialog";
import { useTenantFilters } from "./_hooks/use-tenant-filters";
import {
  useTenantsWithLeases,
  useDeleteTenant,
  type TenantWithLeases,
} from "@/hooks/use-tenants";
import { toast } from "@/components/ui/toast";
import { containerVariants, itemVariants } from "@/lib/motion";
import { COPY } from "@/config/copy";

/**
 * Tenants list page — THE GOLDEN TEMPLATE.
 * Other modules (buildings, offices, leases, payments, invoices, maintenance)
 * follow this exact structure and hook shape.
 */
export function TenantsListPage() {
  const { filters, setSearch, setStatus } = useTenantFilters();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<TenantWithLeases | null>(null);

  const { data = [], isLoading } = useTenantsWithLeases({
    search: filters.search || undefined,
    status: filters.status === "all" ? undefined : filters.status,
  });

  const { mutate: deleteTenant } = useDeleteTenant();

  const handleEdit = (tenant: TenantWithLeases) => {
    setEditing(tenant);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm(COPY.tenants.deleteConfirm)) return;
    deleteTenant(id, {
      onSuccess: () => toast.success("Tenant deleted"),
      onError: (e) => toast.error(e.message),
    });
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditing(null);
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
          title={COPY.tenants.title}
          description={COPY.tenants.description}
          breadcrumbs={[{ label: COPY.app.name, href: "/dashboard" }, { label: COPY.tenants.title }]}
          action={
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              {COPY.tenants.addTenant}
            </Button>
          }
        />
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between"
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, company, email, phone…"
            className="pl-9"
            value={filters.search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={filters.status}
            onValueChange={(v) => setStatus(v as typeof filters.status)}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        {isLoading || data.length > 0 ? (
          <TenantTable
            data={data}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ) : (
          <EmptyState
            icon={<UserX className="h-6 w-6" />}
            title={COPY.tenants.empty.title}
            description={COPY.tenants.empty.description}
            action={
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4" />
                {COPY.tenants.addTenant}
              </Button>
            }
          />
        )}
      </motion.div>

      <TenantFormDialog
        open={dialogOpen}
        onOpenChange={handleClose}
        editId={editing?.id}
        initialValues={editing}
      />
    </motion.div>
  );
}
