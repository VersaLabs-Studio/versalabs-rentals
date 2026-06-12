"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Plus, Search, Briefcase } from "lucide-react";
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
import { OfficeTable } from "./_components/office-table";
import { OfficeFormDialog } from "./_components/office-form-dialog";
import { useOffices, useDeleteOffice } from "@/hooks/use-offices";
import { useBuildings } from "@/hooks/use-buildings";
import { toast } from "@/components/ui/toast";
import { containerVariants, itemVariants } from "@/lib/motion";
import { COPY } from "@/config/copy";
import type { OfficeWithRelations } from "@/types";

export function OfficesListPage() {
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<"all" | "vacant" | "occupied" | "maintenance">("all");
  const [buildingFilter, setBuildingFilter] = React.useState<string>("all");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<OfficeWithRelations | null>(null);

  // Build URL-aware filter from query string
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const b = url.searchParams.get("building");
    if (b) setBuildingFilter(b);
  }, []);

  const { data: offices = [], isLoading } = useOffices({
    search: search || undefined,
    status: status === "all" ? undefined : status,
    buildingId: buildingFilter === "all" ? undefined : buildingFilter,
  });
  const { data: buildings = [] } = useBuildings();
  const { mutate: deleteOffice } = useDeleteOffice();

  const handleDelete = (id: string) => {
    if (!confirm("Delete this office?")) return;
    deleteOffice(id, {
      onSuccess: () => toast.success("Office deleted"),
      onError: (e) => toast.error(e.message),
    });
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={itemVariants}>
        <PageHeader
          title={COPY.offices.title}
          description={COPY.offices.description}
          breadcrumbs={[{ label: COPY.app.name, href: "/dashboard" }, { label: COPY.offices.title }]}
          action={
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              {COPY.offices.addOffice}
            </Button>
          }
        />
      </motion.div>

      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search offices, tenants, buildings…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={buildingFilter} onValueChange={setBuildingFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All buildings" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All buildings</SelectItem>
            {buildings.map((b) => (
              <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="vacant">Vacant</SelectItem>
            <SelectItem value="occupied">Occupied</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      <motion.div variants={itemVariants}>
        {isLoading || offices.length > 0 ? (
          <OfficeTable
            data={offices}
            isLoading={isLoading}
            onEdit={(o) => { setEditing(o); setDialogOpen(true); }}
            onDelete={handleDelete}
          />
        ) : (
          <EmptyState
            icon={<Briefcase className="h-6 w-6" />}
            title={COPY.offices.empty.title}
            description={COPY.offices.empty.description}
            action={
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4" />
                {COPY.offices.addOffice}
              </Button>
            }
          />
        )}
      </motion.div>

      <OfficeFormDialog
        open={dialogOpen}
        onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditing(null); }}
        editId={editing?.id}
        initialValues={editing ?? undefined}
      />
    </motion.div>
  );
}
