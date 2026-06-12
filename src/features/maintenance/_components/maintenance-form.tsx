"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  maintenanceRequestCreateSchema,
  type MaintenanceRequestCreate,
} from "@/schemas";
import { useCreateMaintenanceRequest, useUpdateMaintenanceRequest } from "@/hooks/use-maintenance";
import { useOffices } from "@/hooks/use-offices";
import { useTenantsWithLeases } from "@/hooks/use-tenants";
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
import { COPY } from "@/config/copy";

interface Props {
  defaultValues?: Partial<MaintenanceRequestCreate>;
  editId?: string | null;
  onSuccess?: () => void;
}

export function MaintenanceForm({ defaultValues, editId, onSuccess }: Props) {
  const form = useForm<MaintenanceRequestCreate>({
    resolver: zodResolver(maintenanceRequestCreateSchema),
    defaultValues: {
      officeId: "",
      tenantId: "",
      title: "",
      description: "",
      priority: "medium",
      status: "open",
      ...defaultValues,
    },
  });

  const { data: offices = [] } = useOffices();
  const { data: tenants = [] } = useTenantsWithLeases();
  const { mutate: create, isPending: isCreating } = useCreateMaintenanceRequest();
  const { mutate: update, isPending: isUpdating } = useUpdateMaintenanceRequest();
  const isPending = isCreating || isUpdating;

  const onSubmit = (data: MaintenanceRequestCreate) => {
    if (editId) {
      update({ id: editId, data }, {
        onSuccess: () => { toast.success("Request updated"); onSuccess?.(); },
        onError: (e) => toast.error(e.message),
      });
    } else {
      create(data, {
        onSuccess: () => { toast.success("Request created"); onSuccess?.(); },
        onError: (e) => toast.error(e.message),
      });
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="title">{COPY.maintenance.fields.title}</Label>
        <Input id="title" {...form.register("title")} placeholder="Brief description of the issue" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="description">{COPY.maintenance.fields.description}</Label>
        <Textarea id="description" {...form.register("description")} rows={3} placeholder="Provide more detail…" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="officeId">{COPY.maintenance.fields.office}</Label>
          <Select value={form.watch("officeId")} onValueChange={(v) => form.setValue("officeId", v)}>
            <SelectTrigger id="officeId"><SelectValue placeholder="Select office" /></SelectTrigger>
            <SelectContent>
              {offices.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.building.name} · {o.number}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tenantId">
            {COPY.maintenance.fields.tenant} <span className="text-muted-foreground font-normal">({COPY.common.optional})</span>
          </Label>
          <Select value={form.watch("tenantId") ?? ""} onValueChange={(v) => form.setValue("tenantId", v)}>
            <SelectTrigger id="tenantId"><SelectValue placeholder="Select tenant" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">— None —</SelectItem>
              {tenants.map((t) => (
                <SelectItem key={t.id} value={t.id}>{t.fullName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="priority">{COPY.maintenance.fields.priority}</Label>
          <Select value={form.watch("priority")} onValueChange={(v) => form.setValue("priority", v as MaintenanceRequestCreate["priority"])}>
            <SelectTrigger id="priority"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="status">{COPY.maintenance.fields.status}</Label>
          <Select value={form.watch("status")} onValueChange={(v) => form.setValue("status", v as MaintenanceRequestCreate["status"])}>
            <SelectTrigger id="status"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onSuccess}>{COPY.common.cancel}</Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : editId ? COPY.common.save : COPY.maintenance.addRequest}
        </Button>
      </div>
    </form>
  );
}
