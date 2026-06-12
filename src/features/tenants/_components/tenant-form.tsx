"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { tenantCreateSchema, type TenantCreate } from "@/schemas";
import { useCreateTenant, useUpdateTenant } from "@/hooks/use-tenants";
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

interface TenantFormProps {
  defaultValues?: Partial<TenantCreate>;
  editId?: string | null;
  onSuccess?: () => void;
}

export function TenantForm({ defaultValues, editId, onSuccess }: TenantFormProps) {
  const form = useForm<TenantCreate>({
    resolver: zodResolver(tenantCreateSchema),
    defaultValues: {
      fullName: "",
      company: "",
      phone: "+251 ",
      email: "",
      avatarSeed: "",
      status: "active",
      moveInDate: new Date().toISOString().slice(0, 10),
      notes: "",
      ...defaultValues,
    },
  });

  const { mutate: create, isPending: isCreating } = useCreateTenant();
  const { mutate: update, isPending: isUpdating } = useUpdateTenant();
  const isPending = isCreating || isUpdating;

  const onSubmit = (data: TenantCreate) => {
    const payload: TenantCreate = {
      ...data,
      avatarSeed: data.avatarSeed || data.fullName,
    };
    if (editId) {
      update(
        { id: editId, data: payload },
        {
          onSuccess: () => {
            toast.success("Tenant updated");
            onSuccess?.();
          },
          onError: (e) => toast.error(e.message),
        }
      );
    } else {
      create(payload, {
        onSuccess: () => {
          toast.success("Tenant added");
          onSuccess?.();
        },
        onError: (e) => toast.error(e.message),
      });
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="fullName">{COPY.tenants.fields.fullName}</Label>
          <Input
            id="fullName"
            {...form.register("fullName")}
            placeholder="Abebe Bekele"
          />
          {form.formState.errors.fullName && (
            <p className="text-xs text-destructive">{form.formState.errors.fullName.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="company">
            {COPY.tenants.fields.company} <span className="text-muted-foreground font-normal">({COPY.common.optional})</span>
          </Label>
          <Input
            id="company"
            {...form.register("company")}
            placeholder="Selam Trading PLC"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="phone">{COPY.tenants.fields.phone}</Label>
          <Input id="phone" {...form.register("phone")} placeholder="+251 911 223 344" />
          {form.formState.errors.phone && (
            <p className="text-xs text-destructive">{form.formState.errors.phone.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">{COPY.tenants.fields.email}</Label>
          <Input id="email" type="email" {...form.register("email")} placeholder="name@company.et" />
          {form.formState.errors.email && (
            <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="status">{COPY.tenants.fields.status}</Label>
          <Select
            value={form.watch("status")}
            onValueChange={(v) => form.setValue("status", v as "active" | "inactive")}
          >
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="moveInDate">{COPY.tenants.fields.moveInDate}</Label>
          <Input id="moveInDate" type="date" {...form.register("moveInDate")} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">
          {COPY.tenants.fields.notes} <span className="text-muted-foreground font-normal">({COPY.common.optional})</span>
        </Label>
        <Textarea id="notes" {...form.register("notes")} placeholder="Internal notes…" rows={3} />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onSuccess}>
          {COPY.common.cancel}
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : editId ? (
            COPY.common.save
          ) : (
            COPY.tenants.addTenant
          )}
        </Button>
      </div>
    </form>
  );
}
