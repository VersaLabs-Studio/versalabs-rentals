"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InvoiceForm } from "./invoice-form";
import type { InvoiceWithRelations } from "@/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editId?: string | null;
  initialValues?: Partial<InvoiceWithRelations> | null;
}

export function InvoiceFormDialog({ open, onOpenChange, editId, initialValues }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editId ? "Edit invoice" : "Create invoice"}</DialogTitle>
          <DialogDescription>
            {editId ? "Update the invoice details." : "Generate a new invoice. Numbers are auto-assigned."}
          </DialogDescription>
        </DialogHeader>
        <InvoiceForm
          editId={editId}
          defaultValues={
            initialValues
              ? {
                  invoiceNumber: initialValues.invoiceNumber,
                  tenantId: initialValues.tenantId,
                  leaseId: initialValues.leaseId,
                  issueDate: initialValues.issueDate,
                  dueDate: initialValues.dueDate,
                  lineItems: initialValues.lineItems,
                  subtotal: initialValues.subtotal,
                  vat: initialValues.vat,
                  total: initialValues.total,
                  status: initialValues.status,
                  notes: initialValues.notes,
                }
              : undefined
          }
          onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
