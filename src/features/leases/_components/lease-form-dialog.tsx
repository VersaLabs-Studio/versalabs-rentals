"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LeaseForm } from "./lease-form";
import type { LeaseWithRelations } from "@/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editId?: string | null;
  initialValues?: Partial<LeaseWithRelations> | null;
}

export function LeaseFormDialog({ open, onOpenChange, editId, initialValues }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editId ? "Edit lease" : "Add lease"}</DialogTitle>
          <DialogDescription>
            {editId ? "Update the lease terms." : "Connect a tenant to an office. Dates default to a 12-month term."}
          </DialogDescription>
        </DialogHeader>
        <LeaseForm
          editId={editId}
          defaultValues={
            initialValues
              ? {
                  tenantId: initialValues.tenantId,
                  officeId: initialValues.officeId,
                  startDate: initialValues.startDate?.slice(0, 10) ?? "",
                  endDate: initialValues.endDate?.slice(0, 10) ?? "",
                  monthlyRent: initialValues.monthlyRent ?? 0,
                  depositAmount: initialValues.depositAmount ?? 0,
                  status: initialValues.status ?? "active",
                }
              : undefined
          }
          onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
