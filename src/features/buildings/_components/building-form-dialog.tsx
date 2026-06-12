"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BuildingForm } from "./building-form";
import type { Building } from "@/types";

const COPY_BUILDING_ADD = "Add building";
const COPY_BUILDING_EDIT = "Edit building";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editId?: string | null;
  initialValues?: Partial<Building> | null;
}

export function BuildingFormDialog({ open, onOpenChange, editId, initialValues }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editId ? COPY_BUILDING_EDIT : COPY_BUILDING_ADD}</DialogTitle>
          <DialogDescription>
            {editId
              ? "Update the building's information."
              : "Add a new building. Floors and offices can be added from the building detail page."}
          </DialogDescription>
        </DialogHeader>
        <BuildingForm
          editId={editId}
          defaultValues={initialValues ?? undefined}
          onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
