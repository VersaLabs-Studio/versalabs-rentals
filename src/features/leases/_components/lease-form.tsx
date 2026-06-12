"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { leaseCreateSchema, type LeaseCreate } from "@/schemas";
import { useCreateLease, useUpdateLease } from "@/hooks/use-leases";
import { useTenantsWithLeases } from "@/hooks/use-tenants";
import { useOffices } from "@/hooks/use-offices";
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

interface Props {
  defaultValues?: Partial<LeaseCreate>;
  editId?: string | null;
  onSuccess?: () => void;
}

export function LeaseForm({ defaultValues, editId, onSuccess }: Props) {
  const form = useForm<LeaseCreate>({
    resolver: zodResolver(leaseCreateSchema),
    defaultValues: {
      tenantId: "",
      officeId: "",
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      monthlyRent: 0,
      depositAmount: 0,
      status: "active",
      notes: "",
      ...defaultValues,
    },
  });

  const { data: tenants = [] } = useTenantsWithLeases();
  const { data: offices = [] } = useOffices();

  const { mutate: create, isPending: isCreating } = useCreateLease();
  const { mutate: update, isPending: isUpdating } = useUpdateLease();
  const isPending = isCreating || isUpdating;

  const onSubmit = (data: LeaseCreate) => {
    if (editId) {
      update({ id: editId, data }, {
        onSuccess: () => { toast.success("Lease updated"); onSuccess?.(); },
        onError: (e) => toast.error(e.message),
      });
    } else {
      create(data, {
        onSuccess: () => { toast.success("Lease created"); onSuccess?.(); },
        onError: (e) => toast.error(e.message),
      });
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="tenantId">{COPY.leases.fields.tenant}</Label>
          <Select value={form.watch("tenantId")} onValueChange={(v) => form.setValue("tenantId", v)}>
            <SelectTrigger id="tenantId"><SelectValue placeholder="Select tenant" /></SelectTrigger>
            <SelectContent>
              {tenants.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.fullName}{t.company ? ` · ${t.company}` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="officeId">{COPY.leases.fields.office}</Label>
          <Select value={form.watch("officeId")} onValueChange={(v) => {
            form.setValue("officeId", v);
            const office = offices.find((o) => o.id === v);
            if (office) form.setValue("monthlyRent", office.monthlyRate);
          }}>
            <SelectTrigger id="officeId"><SelectValue placeholder="Select office" /></SelectTrigger>
            <SelectContent>
              {offices
                .filter((o) => o.status === "vacant" || o.id === form.watch("officeId"))
                .map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.building.name} · {o.number} · {o.status}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="startDate">{COPY.leases.fields.startDate}</Label>
          <Input id="startDate" type="date" {...form.register("startDate")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="endDate">{COPY.leases.fields.endDate}</Label>
          <Input id="endDate" type="date" {...form.register("endDate")} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="monthlyRent">{COPY.leases.fields.monthlyRent}</Label>
          <Input id="monthlyRent" type="number" min={0} {...form.register("monthlyRent", { valueAsNumber: true })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="depositAmount">{COPY.leases.fields.depositAmount}</Label>
          <Input id="depositAmount" type="number" min={0} {...form.register("depositAmount", { valueAsNumber: true })} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="status">{COPY.leases.fields.status}</Label>
        <Select
          value={form.watch("status")}
          onValueChange={(v) => form.setValue("status", v as LeaseCreate["status"])}
        >
          <SelectTrigger id="status"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="expiring">Expiring</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="terminated">Terminated</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onSuccess}>{COPY.common.cancel}</Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : editId ? COPY.common.save : COPY.leases.addLease}
        </Button>
      </div>
    </form>
  );
}
