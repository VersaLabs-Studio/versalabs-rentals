"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TenantForm } from "./tenant-form";
import type { Tenant } from "@/types";

interface TenantFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editId?: string | null;
  initialValues?: Partial<Tenant> | null;
}

export function TenantFormDialog({
  open,
  onOpenChange,
  editId,
  initialValues,
}: TenantFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editId ? "Edit tenant" : "Add tenant"}
          </DialogTitle>
          <DialogDescription>
            {editId
              ? "Update the tenant's contact and status information."
              : "Add a new tenant. They'll be available when creating leases."}
          </DialogDescription>
        </DialogHeader>
        <TenantForm
          editId={editId}
          defaultValues={
            initialValues
              ? {
                  fullName: initialValues.fullName,
                  company: initialValues.company,
                  phone: initialValues.phone,
                  email: initialValues.email,
                  avatarSeed: initialValues.avatarSeed,
                  status: initialValues.status,
                  moveInDate: initialValues.moveInDate,
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
