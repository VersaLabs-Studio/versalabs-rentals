"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PaymentForm } from "./payment-form";
import type { PaymentWithRelations } from "@/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editId?: string | null;
  initialValues?: Partial<PaymentWithRelations> | null;
}

export function PaymentFormDialog({ open, onOpenChange, editId, initialValues }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editId ? "Edit payment" : "Record payment"}</DialogTitle>
          <DialogDescription>
            {editId ? "Update this payment record." : "Record a new payment against a lease."}
          </DialogDescription>
        </DialogHeader>
        <PaymentForm
          editId={editId}
          defaultValues={
            initialValues
              ? {
                  leaseId: initialValues.leaseId,
                  tenantId: initialValues.tenantId,
                  periodMonth: initialValues.periodMonth,
                  amount: initialValues.amount,
                  dueDate: initialValues.dueDate,
                  paidDate: initialValues.paidDate,
                  method: initialValues.method,
                  status: initialValues.status,
                  reference: initialValues.reference,
                }
              : undefined
          }
          onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
