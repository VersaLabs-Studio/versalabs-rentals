"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Plus, Search, CreditCard } from "lucide-react";
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
import { PaymentTable } from "./_components/payment-table";
import { PaymentFormDialog } from "./_components/payment-form-dialog";
import {
  usePayments,
  useDeletePayment,
  useMarkPaymentPaid,
} from "@/hooks/use-payments";
import { toast } from "@/components/ui/toast";
import { containerVariants, itemVariants } from "@/lib/motion";
import { COPY } from "@/config/copy";
import type { PaymentWithRelations } from "@/types";

export function PaymentsListPage() {
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<"all" | "paid" | "pending" | "overdue">("all");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<PaymentWithRelations | null>(null);

  const { data: payments = [], isLoading } = usePayments({
    search: search || undefined,
    status: status === "all" ? undefined : status,
  });
  const { mutate: deletePayment } = useDeletePayment();
  const { mutate: markPaid } = useMarkPaymentPaid();

  const handleDelete = (id: string) => {
    if (!confirm("Delete this payment?")) return;
    deletePayment(id, {
      onSuccess: () => toast.success("Payment deleted"),
      onError: (e) => toast.error(e.message),
    });
  };

  const handleMarkPaid = (p: PaymentWithRelations) => {
    markPaid(
      {
        id: p.id,
        paidDate: new Date().toISOString().slice(0, 10),
        method: p.method,
        reference: p.reference,
      },
      {
        onSuccess: () => toast.success("Marked as paid"),
        onError: (e) => toast.error(e.message),
      }
    );
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={itemVariants}>
        <PageHeader
          title={COPY.payments.title}
          description={COPY.payments.description}
          breadcrumbs={[{ label: COPY.app.name, href: "/dashboard" }, { label: COPY.payments.title }]}
          action={
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              {COPY.payments.addPayment}
            </Button>
          }
        />
      </motion.div>

      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by tenant, company, reference…"
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
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      <motion.div variants={itemVariants}>
        {isLoading || payments.length > 0 ? (
          <PaymentTable
            data={payments}
            isLoading={isLoading}
            onEdit={(p) => { setEditing(p); setDialogOpen(true); }}
            onDelete={handleDelete}
            onMarkPaid={handleMarkPaid}
          />
        ) : (
          <EmptyState
            icon={<CreditCard className="h-6 w-6" />}
            title={COPY.payments.empty.title}
            description={COPY.payments.empty.description}
            action={
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4" />
                {COPY.payments.addPayment}
              </Button>
            }
          />
        )}
      </motion.div>

      <PaymentFormDialog
        open={dialogOpen}
        onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditing(null); }}
        editId={editing?.id}
        initialValues={editing ?? undefined}
      />
    </motion.div>
  );
}
