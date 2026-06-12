"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Plus, Search, Building2 as BuildingIcon } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { BuildingTable } from "./_components/building-table";
import { BuildingFormDialog } from "./_components/building-form-dialog";
import {
  useBuildingsWithStats,
  useDeleteBuilding,
} from "@/hooks/use-buildings";
import { toast } from "@/components/ui/toast";
import { containerVariants, itemVariants } from "@/lib/motion";
import { COPY } from "@/config/copy";
import type { BuildingWithStats } from "@/types";

export function BuildingsListPage() {
  const [search, setSearch] = React.useState("");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<BuildingWithStats | null>(null);

  const { data: buildings = [], isLoading } = useBuildingsWithStats();
  const { mutate: deleteBuilding } = useDeleteBuilding();

  const filtered = buildings.filter(
    (b) =>
      !search ||
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.address.toLowerCase().includes(search.toLowerCase()) ||
      b.district.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (!confirm(COPY.buildings.deleteConfirm)) return;
    deleteBuilding(id, {
      onSuccess: () => toast.success("Building deleted"),
      onError: (e) => toast.error(e.message),
    });
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={itemVariants}>
        <PageHeader
          title={COPY.buildings.title}
          description={COPY.buildings.description}
          breadcrumbs={[{ label: COPY.app.name, href: "/dashboard" }, { label: COPY.buildings.title }]}
          action={
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              {COPY.buildings.addBuilding}
            </Button>
          }
        />
      </motion.div>

      <motion.div variants={itemVariants} className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search buildings…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        {isLoading || filtered.length > 0 ? (
          <BuildingTable
            data={filtered}
            isLoading={isLoading}
            onEdit={(b) => { setEditing(b); setDialogOpen(true); }}
            onDelete={handleDelete}
          />
        ) : (
          <EmptyState
            icon={<BuildingIcon className="h-6 w-6" />}
            title={COPY.buildings.empty.title}
            description={COPY.buildings.empty.description}
            action={
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4" />
                {COPY.buildings.addBuilding}
              </Button>
            }
          />
        )}
      </motion.div>

      <BuildingFormDialog
        open={dialogOpen}
        onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditing(null); }}
        editId={editing?.id}
        initialValues={editing ?? undefined}
      />
    </motion.div>
  );
}
