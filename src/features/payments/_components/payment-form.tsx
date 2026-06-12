"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { paymentCreateSchema, type PaymentCreate } from "@/schemas";
import { useCreatePayment, useUpdatePayment, useMarkPaymentPaid } from "@/hooks/use-payments";
import { useLeases } from "@/hooks/use-leases";
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
import { Loader2, CheckCircle2 } from "lucide-react";
import { COPY } from "@/config/copy";

interface Props {
  defaultValues?: Partial<PaymentCreate>;
  editId?: string | null;
  onSuccess?: () => void;
}

export function PaymentForm({ defaultValues, editId, onSuccess }: Props) {
  const form = useForm<PaymentCreate>({
    resolver: zodResolver(paymentCreateSchema),
    defaultValues: {
      leaseId: "",
      tenantId: "",
      periodMonth: new Date().toISOString().slice(0, 7),
      amount: 0,
      dueDate: new Date().toISOString().slice(0, 10),
      paidDate: null,
      method: "bank",
      status: "pending",
      reference: "",
      ...defaultValues,
    },
  });

  const { data: leases = [] } = useLeases();
  const { mutate: create, isPending: isCreating } = useCreatePayment();
  const { mutate: update, isPending: isUpdating } = useUpdatePayment();
  const { mutate: markPaid, isPending: isMarking } = useMarkPaymentPaid();
  const isPending = isCreating || isUpdating || isMarking;

  const onSubmit = (data: PaymentCreate) => {
    if (editId && data.status === "paid" && !data.paidDate) {
      // Convenience: mark as paid with current date
      markPaid(
        {
          id: editId,
          paidDate: new Date().toISOString().slice(0, 10),
          method: data.method,
          reference: data.reference,
        },
        {
          onSuccess: () => { toast.success("Payment recorded as paid"); onSuccess?.(); },
          onError: (e) => toast.error(e.message),
        }
      );
      return;
    }
    if (editId) {
      update({ id: editId, data }, {
        onSuccess: () => { toast.success("Payment updated"); onSuccess?.(); },
        onError: (e) => toast.error(e.message),
      });
    } else {
      create(data, {
        onSuccess: () => { toast.success("Payment recorded"); onSuccess?.(); },
        onError: (e) => toast.error(e.message),
      });
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="leaseId">{COPY.payments.fields.lease}</Label>
        <Select
          value={form.watch("leaseId")}
          onValueChange={(v) => {
            const lease = leases.find((l) => l.id === v);
            form.setValue("leaseId", v);
            if (lease) {
              form.setValue("tenantId", lease.tenantId);
              form.setValue("amount", lease.monthlyRent);
            }
          }}
        >
          <SelectTrigger id="leaseId"><SelectValue placeholder="Select lease" /></SelectTrigger>
          <SelectContent>
            {leases
              .filter((l) => l.status === "active" || l.status === "expiring" || l.id === form.watch("leaseId"))
              .map((l) => (
                <SelectItem key={l.id} value={l.id}>
                  {l.tenant.fullName} · {l.office.building.name} {l.office.number}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="periodMonth">{COPY.payments.fields.periodMonth}</Label>
          <Input id="periodMonth" type="month" {...form.register("periodMonth")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="amount">{COPY.payments.fields.amount}</Label>
          <Input id="amount" type="number" min={0} {...form.register("amount", { valueAsNumber: true })} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="dueDate">{COPY.payments.fields.dueDate}</Label>
          <Input id="dueDate" type="date" {...form.register("dueDate")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="method">{COPY.payments.fields.method}</Label>
          <Select value={form.watch("method")} onValueChange={(v) => form.setValue("method", v as PaymentCreate["method"])}>
            <SelectTrigger id="method"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="bank">Bank transfer</SelectItem>
              <SelectItem value="telebirr">Telebirr</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="status">{COPY.payments.fields.status}</Label>
          <Select value={form.watch("status")} onValueChange={(v) => form.setValue("status", v as PaymentCreate["status"])}>
            <SelectTrigger id="status"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="paidDate">{COPY.payments.fields.paidDate}</Label>
          <Input id="paidDate" type="date" {...form.register("paidDate")} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="reference">{COPY.payments.fields.reference}</Label>
        <Input id="reference" {...form.register("reference")} placeholder="TRF-123456 / TB-9876543" />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onSuccess}>{COPY.common.cancel}</Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
          ) : editId ? (
            <><CheckCircle2 className="h-4 w-4" />{COPY.common.save}</>
          ) : (
            COPY.payments.addPayment
          )}
        </Button>
      </div>
    </form>
  );
}
