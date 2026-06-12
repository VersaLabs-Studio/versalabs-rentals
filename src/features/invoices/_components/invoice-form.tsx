"use client";

import * as React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { invoiceCreateSchema, type InvoiceCreate, type InvoiceLineItem } from "@/schemas";
import { useCreateInvoice, useUpdateInvoice } from "@/hooks/use-invoices";
import { useTenantsWithLeases } from "@/hooks/use-tenants";
import { useLeases } from "@/hooks/use-leases";
import { useOrgSettings } from "@/hooks/use-org-settings";
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
import { Plus, Trash2, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { COPY } from "@/config/copy";

interface Props {
  defaultValues?: Partial<InvoiceCreate>;
  editId?: string | null;
  onSuccess?: () => void;
}

export function InvoiceForm({ defaultValues, editId, onSuccess }: Props) {
  const form = useForm<InvoiceCreate>({
    resolver: zodResolver(invoiceCreateSchema),
    defaultValues: {
      invoiceNumber: "",
      tenantId: "",
      leaseId: "",
      issueDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      lineItems: [{ description: "Office rent", amount: 0 }],
      subtotal: 0,
      vat: 0,
      total: 0,
      status: "unpaid",
      notes: "",
      ...defaultValues,
    },
  });

  const { data: tenants = [] } = useTenantsWithLeases();
  const { data: leases = [] } = useLeases();
  const { data: org } = useOrgSettings();
  const { mutate: create, isPending: isCreating } = useCreateInvoice();
  const { mutate: update, isPending: isUpdating } = useUpdateInvoice();
  const isPending = isCreating || isUpdating;

  const { fields, append, remove, update: updateLine } = useFieldArray({
    control: form.control,
    name: "lineItems",
  });

  const lineItems = form.watch("lineItems");
  const subtotal = lineItems.reduce((s, l) => s + (l.amount || 0), 0);
  const vatRate = org?.vatRate ?? 0.15;
  const vat = subtotal * vatRate;
  const total = subtotal + vat;

  // Keep form state in sync
  React.useEffect(() => {
    form.setValue("subtotal", subtotal);
    form.setValue("vat", vat);
    form.setValue("total", total);
  }, [subtotal, vat, total, form]);

  const onSubmit = (data: InvoiceCreate) => {
    if (editId) {
      update({ id: editId, data }, {
        onSuccess: () => { toast.success("Invoice updated"); onSuccess?.(); },
        onError: (e) => toast.error(e.message),
      });
    } else {
      create(data, {
        onSuccess: () => { toast.success("Invoice created"); onSuccess?.(); },
        onError: (e) => toast.error(e.message),
      });
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="tenantId">{COPY.invoices.fields.tenant}</Label>
          <Select
            value={form.watch("tenantId")}
            onValueChange={(v) => {
              form.setValue("tenantId", v);
              // Try to auto-pick active lease for tenant
              const lease = leases.find((l) => l.tenantId === v && (l.status === "active" || l.status === "expiring"));
              if (lease) {
                form.setValue("leaseId", lease.id);
                form.setValue("lineItems", [{ description: `Office rent — ${lease.office.building.name} ${lease.office.number}`, amount: lease.monthlyRent }]);
              }
            }}
          >
            <SelectTrigger id="tenantId"><SelectValue placeholder="Select tenant" /></SelectTrigger>
            <SelectContent>
              {tenants.map((t) => (
                <SelectItem key={t.id} value={t.id}>{t.fullName}{t.company ? ` · ${t.company}` : ""}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="leaseId">Lease (optional)</Label>
          <Select value={form.watch("leaseId")} onValueChange={(v) => form.setValue("leaseId", v)}>
            <SelectTrigger id="leaseId"><SelectValue placeholder="Pick lease" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">— None —</SelectItem>
              {leases
                .filter((l) => l.tenantId === form.watch("tenantId"))
                .map((l) => (
                  <SelectItem key={l.id} value={l.id}>{l.office.building.name} {l.office.number}</SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="issueDate">{COPY.invoices.fields.issueDate}</Label>
          <Input id="issueDate" type="date" {...form.register("issueDate")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="dueDate">{COPY.invoices.fields.dueDate}</Label>
          <Input id="dueDate" type="date" {...form.register("dueDate")} />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Line items</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => append({ description: "", amount: 0 })}
          >
            <Plus className="h-3.5 w-3.5" /> Add line
          </Button>
        </div>
        <div className="space-y-2">
          {fields.map((f, i) => (
            <div key={f.id} className="flex items-center gap-2">
              <Input
                placeholder="Description"
                value={lineItems[i]?.description ?? ""}
                onChange={(e) => updateLine(i, { ...lineItems[i]!, description: e.target.value })}
                className="flex-1"
              />
              <Input
                type="number"
                min={0}
                placeholder="Amount"
                value={lineItems[i]?.amount ?? 0}
                onChange={(e) => updateLine(i, { ...lineItems[i]!, amount: Number(e.target.value) })}
                className="w-32"
              />
              {fields.length > 1 && (
                <Button type="button" variant="ghost" size="icon-sm" onClick={() => remove(i)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          ))}
        </div>
        <div className="border-t border-border pt-2 text-sm space-y-1">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span className="tabular-nums">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>VAT ({(vatRate * 100).toFixed(0)}%)</span>
            <span className="tabular-nums">{formatCurrency(vat)}</span>
          </div>
          <div className="flex justify-between font-semibold text-base">
            <span>Total</span>
            <span className="tabular-nums">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="status">{COPY.invoices.detail.status}</Label>
        <Select
          value={form.watch("status")}
          onValueChange={(v) => form.setValue("status", v as InvoiceCreate["status"])}
        >
          <SelectTrigger id="status"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="unpaid">Unpaid</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" {...form.register("notes")} rows={2} />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onSuccess}>{COPY.common.cancel}</Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : editId ? COPY.common.save : COPY.invoices.addInvoice}
        </Button>
      </div>
    </form>
  );
}
