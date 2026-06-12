"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Plus, Search, Receipt } from "lucide-react";
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
import { InvoiceTable } from "./_components/invoice-table";
import { InvoiceFormDialog } from "./_components/invoice-form-dialog";
import { useInvoices, useDeleteInvoice } from "@/hooks/use-invoices";
import { toast } from "@/components/ui/toast";
import { containerVariants, itemVariants } from "@/lib/motion";
import { COPY } from "@/config/copy";
import type { InvoiceWithRelations } from "@/types";

export function InvoicesListPage() {
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<"all" | "paid" | "unpaid">("all");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<InvoiceWithRelations | null>(null);

  const { data: invoices = [], isLoading } = useInvoices({
    search: search || undefined,
    status: status === "all" ? undefined : status,
  });
  const { mutate: deleteInvoice } = useDeleteInvoice();

  const handleDelete = (id: string) => {
    if (!confirm("Delete this invoice?")) return;
    deleteInvoice(id, {
      onSuccess: () => toast.success("Invoice deleted"),
      onError: (e) => toast.error(e.message),
    });
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={itemVariants}>
        <PageHeader
          title={COPY.invoices.title}
          description={COPY.invoices.description}
          breadcrumbs={[{ label: COPY.app.name, href: "/dashboard" }, { label: COPY.invoices.title }]}
          action={
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              {COPY.invoices.addInvoice}
            </Button>
          }
        />
      </motion.div>

      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by invoice #, tenant, company…"
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
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="unpaid">Unpaid</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      <motion.div variants={itemVariants}>
        {isLoading || invoices.length > 0 ? (
          <InvoiceTable
            data={invoices}
            isLoading={isLoading}
            onEdit={(i) => { setEditing(i); setDialogOpen(true); }}
            onDelete={handleDelete}
          />
        ) : (
          <EmptyState
            icon={<Receipt className="h-6 w-6" />}
            title={COPY.invoices.empty.title}
            description={COPY.invoices.empty.description}
            action={
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4" />
                {COPY.invoices.addInvoice}
              </Button>
            }
          />
        )}
      </motion.div>

      <InvoiceFormDialog
        open={dialogOpen}
        onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditing(null); }}
        editId={editing?.id}
        initialValues={editing ?? undefined}
      />
    </motion.div>
  );
}
