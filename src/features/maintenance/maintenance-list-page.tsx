"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Plus, Search, Wrench } from "lucide-react";
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
import { MaintenanceTable } from "./_components/maintenance-table";
import { MaintenanceFormDialog } from "./_components/maintenance-form-dialog";
import { useMaintenanceRequests, useDeleteMaintenanceRequest } from "@/hooks/use-maintenance";
import { toast } from "@/components/ui/toast";
import { containerVariants, itemVariants } from "@/lib/motion";
import { COPY } from "@/config/copy";
import type { MaintenanceWithRelations } from "@/types";

export function MaintenanceListPage() {
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<"all" | "open" | "in_progress" | "resolved">("all");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<MaintenanceWithRelations | null>(null);

  const { data: requests = [], isLoading } = useMaintenanceRequests({
    search: search || undefined,
    status: status === "all" ? undefined : status,
  });
  const { mutate: deleteRequest } = useDeleteMaintenanceRequest();

  const handleDelete = (id: string) => {
    if (!confirm("Delete this request?")) return;
    deleteRequest(id, {
      onSuccess: () => toast.success("Request deleted"),
      onError: (e) => toast.error(e.message),
    });
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={itemVariants}>
        <PageHeader
          title={COPY.maintenance.title}
          description={COPY.maintenance.description}
          breadcrumbs={[{ label: COPY.app.name, href: "/dashboard" }, { label: COPY.maintenance.title }]}
          action={
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              {COPY.maintenance.addRequest}
            </Button>
          }
        />
      </motion.div>

      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, description, office…"
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
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      <motion.div variants={itemVariants}>
        {isLoading || requests.length > 0 ? (
          <MaintenanceTable
            data={requests}
            isLoading={isLoading}
            onEdit={(m) => { setEditing(m); setDialogOpen(true); }}
            onDelete={handleDelete}
          />
        ) : (
          <EmptyState
            icon={<Wrench className="h-6 w-6" />}
            title={COPY.maintenance.empty.title}
            description={COPY.maintenance.empty.description}
            action={
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4" />
                {COPY.maintenance.addRequest}
              </Button>
            }
          />
        )}
      </motion.div>

      <MaintenanceFormDialog
        open={dialogOpen}
        onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditing(null); }}
        editId={editing?.id}
        initialValues={editing ?? undefined}
      />
    </motion.div>
  );
}
