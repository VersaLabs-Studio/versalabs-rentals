"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MaintenanceForm } from "./maintenance-form";
import type { MaintenanceWithRelations } from "@/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editId?: string | null;
  initialValues?: Partial<MaintenanceWithRelations> | null;
}

export function MaintenanceFormDialog({ open, onOpenChange, editId, initialValues }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editId ? "Edit request" : "New maintenance request"}</DialogTitle>
          <DialogDescription>
            {editId ? "Update the maintenance request." : "Report an issue that needs attention in one of your offices."}
          </DialogDescription>
        </DialogHeader>
        <MaintenanceForm
          editId={editId}
          defaultValues={
            initialValues
              ? {
                  officeId: initialValues.officeId,
                  tenantId: initialValues.tenantId,
                  title: initialValues.title,
                  description: initialValues.description,
                  priority: initialValues.priority,
                  status: initialValues.status,
                }
              : undefined
          }
          onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
