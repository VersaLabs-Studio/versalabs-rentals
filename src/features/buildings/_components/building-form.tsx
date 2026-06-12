"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  buildingCreateSchema,
  type BuildingCreate,
} from "@/schemas";
import { useCreateBuilding, useUpdateBuilding } from "@/hooks/use-buildings";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { DISTRICTS } from "@/config/entities";
import { COPY } from "@/config/copy";

interface BuildingFormProps {
  defaultValues?: Partial<BuildingCreate>;
  editId?: string | null;
  onSuccess?: () => void;
}

export function BuildingForm({ defaultValues, editId, onSuccess }: BuildingFormProps) {
  const form = useForm<BuildingCreate>({
    resolver: zodResolver(buildingCreateSchema),
    defaultValues: {
      name: "",
      address: "",
      district: "Bole",
      totalFloors: 5,
      photoSeed: "",
      notes: "",
      ...defaultValues,
    },
  });

  const { mutate: create, isPending: isCreating } = useCreateBuilding();
  const { mutate: update, isPending: isUpdating } = useUpdateBuilding();
  const isPending = isCreating || isUpdating;

  const onSubmit = (data: BuildingCreate) => {
    const payload = { ...data, photoSeed: data.photoSeed || data.name.toLowerCase().replace(/\s+/g, "-") };
    if (editId) {
      update({ id: editId, data: payload }, {
        onSuccess: () => { toast.success("Building updated"); onSuccess?.(); },
        onError: (e) => toast.error(e.message),
      });
    } else {
      create(payload, {
        onSuccess: () => { toast.success("Building added"); onSuccess?.(); },
        onError: (e) => toast.error(e.message),
      });
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">{COPY.buildings.fields.name}</Label>
        <Input id="name" {...form.register("name")} placeholder="Bole Tower" />
        {form.formState.errors.name && (
          <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="address">{COPY.buildings.fields.address}</Label>
        <Input id="address" {...form.register("address")} placeholder="Bole Road, Bole" />
        {form.formState.errors.address && (
          <p className="text-xs text-destructive">{form.formState.errors.address.message}</p>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="district">{COPY.buildings.fields.district}</Label>
          <Select
            value={form.watch("district")}
            onValueChange={(v) => form.setValue("district", v as BuildingCreate["district"])}
          >
            <SelectTrigger id="district">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DISTRICTS.map((d) => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="totalFloors">{COPY.buildings.fields.totalFloors}</Label>
          <Input
            id="totalFloors"
            type="number"
            min={1}
            max={60}
            {...form.register("totalFloors", { valueAsNumber: true })}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="notes">
          {COPY.buildings.fields.notes} <span className="text-muted-foreground font-normal">({COPY.common.optional})</span>
        </Label>
        <Textarea id="notes" {...form.register("notes")} rows={3} />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onSuccess}>{COPY.common.cancel}</Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
          ) : editId ? (
            COPY.common.save
          ) : (
            COPY.buildings.addBuilding
          )}
        </Button>
      </div>
    </form>
  );
}
