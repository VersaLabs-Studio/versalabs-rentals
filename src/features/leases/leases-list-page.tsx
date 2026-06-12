"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Plus, Search, FileSignature } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LeaseTable } from "./_components/lease-table";
import { LeaseFormDialog } from "./_components/lease-form-dialog";
import { useLeases, useDeleteLease } from "@/hooks/use-leases";
import { toast } from "@/components/ui/toast";
import { containerVariants, itemVariants } from "@/lib/motion";
import { COPY } from "@/config/copy";
import type { LeaseWithRelations } from "@/types";

export function LeasesListPage() {
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<"all" | "active" | "expiring" | "expired" | "terminated">("all");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<LeaseWithRelations | null>(null);

  const { data: leases = [], isLoading } = useLeases({
    search: search || undefined,
    status: status === "all" ? undefined : status,
  });
  const { mutate: deleteLease } = useDeleteLease();

  const handleDelete = (id: string) => {
    if (!confirm("Delete this lease?")) return;
    deleteLease(id, {
      onSuccess: () => toast.success("Lease deleted"),
      onError: (e) => toast.error(e.message),
    });
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={itemVariants}>
        <PageHeader
          title={COPY.leases.title}
          description={COPY.leases.description}
          breadcrumbs={[{ label: COPY.app.name, href: "/dashboard" }, { label: COPY.leases.title }]}
          action={
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              {COPY.leases.addLease}
            </Button>
          }
        />
      </motion.div>

      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by tenant, office, building…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="expiring">Expiring</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="terminated">Terminated</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      <motion.div variants={itemVariants}>
        {isLoading || leases.length > 0 ? (
          <LeaseTable
            data={leases}
            isLoading={isLoading}
            onEdit={(l) => { setEditing(l); setDialogOpen(true); }}
            onDelete={handleDelete}
          />
        ) : (
          <EmptyState
            icon={<FileSignature className="h-6 w-6" />}
            title={COPY.leases.empty.title}
            description={COPY.leases.empty.description}
            action={
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4" />
                {COPY.leases.addLease}
              </Button>
            }
          />
        )}
      </motion.div>

      <LeaseFormDialog
        open={dialogOpen}
        onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditing(null); }}
        editId={editing?.id}
        initialValues={editing ?? undefined}
      />
    </motion.div>
  );
}
