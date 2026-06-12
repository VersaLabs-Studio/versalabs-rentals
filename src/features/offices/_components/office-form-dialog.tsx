"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OfficeForm } from "./office-form";
import type { OfficeWithRelations } from "@/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editId?: string | null;
  initialValues?: Partial<OfficeWithRelations> | null;
}

export function OfficeFormDialog({ open, onOpenChange, editId, initialValues }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editId ? "Edit office" : "Add office"}</DialogTitle>
          <DialogDescription>
            {editId ? "Update the office's details." : "Add a new office to a floor of one of your buildings."}
          </DialogDescription>
        </DialogHeader>
        <OfficeForm
          editId={editId}
          defaultValues={
            initialValues
              ? {
                  buildingId: initialValues.buildingId,
                  floorId: initialValues.floorId,
                  number: initialValues.number,
                  area: initialValues.area,
                  monthlyRate: initialValues.monthlyRate,
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
