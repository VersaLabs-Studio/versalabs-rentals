"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { officeCreateSchema, type OfficeCreate } from "@/schemas";
import { useCreateOffice, useUpdateOffice } from "@/hooks/use-offices";
import { useBuildings, useFloorsForBuilding } from "@/hooks/use-buildings";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { COPY } from "@/config/copy";
import * as React from "react";

interface Props {
  defaultValues?: Partial<OfficeCreate>;
  editId?: string | null;
  onSuccess?: () => void;
}

export function OfficeForm({ defaultValues, editId, onSuccess }: Props) {
  const form = useForm<OfficeCreate>({
    resolver: zodResolver(officeCreateSchema),
    defaultValues: {
      buildingId: "",
      floorId: "",
      number: "",
      area: 50,
      monthlyRate: 10000,
      status: "vacant",
      ...defaultValues,
    },
  });
  const buildingId = form.watch("buildingId");
  const { data: buildings = [] } = useBuildings();
  const { data: floors = [] } = useFloorsForBuilding(buildingId || null);

  const { mutate: create, isPending: isCreating } = useCreateOffice();
  const { mutate: update, isPending: isUpdating } = useUpdateOffice();
  const isPending = isCreating || isUpdating;

  const onSubmit = (data: OfficeCreate) => {
    if (editId) {
      update({ id: editId, data }, {
        onSuccess: () => { toast.success("Office updated"); onSuccess?.(); },
        onError: (e) => toast.error(e.message),
      });
    } else {
      create(data, {
        onSuccess: () => { toast.success("Office added"); onSuccess?.(); },
        onError: (e) => toast.error(e.message),
      });
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="buildingId">{COPY.offices.fields.building}</Label>
        <Select
          value={form.watch("buildingId")}
          onValueChange={(v) => {
            form.setValue("buildingId", v);
            form.setValue("floorId", "");
          }}
        >
          <SelectTrigger id="buildingId"><SelectValue placeholder="Select building" /></SelectTrigger>
          <SelectContent>
            {buildings.map((b) => (
              <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.formState.errors.buildingId && (
          <p className="text-xs text-destructive">{form.formState.errors.buildingId.message}</p>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="floorId">{COPY.offices.fields.floor}</Label>
          <Select
            value={form.watch("floorId")}
            onValueChange={(v) => form.setValue("floorId", v)}
            disabled={!buildingId}
          >
            <SelectTrigger id="floorId"><SelectValue placeholder="Select floor" /></SelectTrigger>
            <SelectContent>
              {floors.map((f) => (
                <SelectItem key={f.id} value={f.id}>{f.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="number">{COPY.offices.fields.number}</Label>
          <Input id="number" {...form.register("number")} placeholder="3A" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="area">{COPY.offices.fields.area}</Label>
          <Input id="area" type="number" min={1} {...form.register("area", { valueAsNumber: true })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="monthlyRate">{COPY.offices.fields.monthlyRate}</Label>
          <Input id="monthlyRate" type="number" min={0} {...form.register("monthlyRate", { valueAsNumber: true })} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="status">{COPY.offices.fields.status}</Label>
        <Select
          value={form.watch("status")}
          onValueChange={(v) => form.setValue("status", v as OfficeCreate["status"])}
        >
          <SelectTrigger id="status"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="vacant">Vacant</SelectItem>
            <SelectItem value="occupied">Occupied</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onSuccess}>{COPY.common.cancel}</Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : editId ? COPY.common.save : COPY.offices.addOffice}
        </Button>
      </div>
    </form>
  );
}
