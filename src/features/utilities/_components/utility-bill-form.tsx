"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Droplets, Zap, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import { toast } from "@/components/ui/toast";
import {
  utilityBillCreateSchema,
  type UtilityBillCreate,
  type UtilityType,
} from "@/schemas";
import { useCreateUtilityBill } from "@/hooks/use-utility-bills";
import { SmsComposer } from "@/features/sms/_components/sms-composer";
import { COPY } from "@/config/copy";

interface UtilityBillFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pre-filled from the lease context */
  leaseId: string;
  tenantId: string;
  officeId: string;
  tenantName: string;
  tenantPhone?: string | null;
}

export function UtilityBillForm({
  open,
  onOpenChange,
  leaseId,
  tenantId,
  officeId,
  tenantName,
  tenantPhone,
}: UtilityBillFormProps) {
  const { mutate: createBill, isPending } = useCreateUtilityBill();
  const [smsOpen, setSmsOpen] = React.useState(false);
  const [createdBillId, setCreatedBillId] = React.useState<string | null>(null);
  const [createdAmount, setCreatedAmount] = React.useState(0);
  const [createdType, setCreatedType] = React.useState<UtilityType>("water");
  const [createdPeriod, setCreatedPeriod] = React.useState("");

  const form = useForm<UtilityBillCreate>({
    resolver: zodResolver(utilityBillCreateSchema),
    defaultValues: {
      leaseId,
      tenantId,
      officeId,
      type: "water",
      periodMonth: new Date().toISOString().slice(0, 7), // YYYY-MM
      meterPrev: null,
      meterCurr: null,
      amount: 0,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      status: "requested",
      requestedAt: new Date().toISOString(),
    },
  });

  // Reset form when opening
  React.useEffect(() => {
    if (open) {
      form.reset({
        leaseId,
        tenantId,
        officeId,
        type: "water",
        periodMonth: new Date().toISOString().slice(0, 7),
        meterPrev: null,
        meterCurr: null,
        amount: 0,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        status: "requested",
        requestedAt: new Date().toISOString(),
      });
      setCreatedBillId(null);
    }
  }, [open, leaseId, tenantId, officeId, form]);

  const handleCreateBill = (data: UtilityBillCreate) => {
    createBill(data, {
      onSuccess: (bill) => {
        toast.success(COPY.utilities.toasts.created);
        setCreatedBillId(bill.id);
        setCreatedAmount(bill.amount);
        setCreatedType(bill.type);
        setCreatedPeriod(bill.periodMonth);
        // Open SMS dialog
        setSmsOpen(true);
      },
      onError: (e) => toast.error(e.message),
    });
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open && !smsOpen} onOpenChange={(o) => { if (!o) handleClose(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {form.watch("type") === "water" ? (
                <Droplets className="h-4 w-4" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
              {COPY.utilities.actions.requestBill}
            </DialogTitle>
            <DialogDescription>
              For {tenantName} — lease {leaseId.slice(0, 8)}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(handleCreateBill)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>{COPY.utilities.fields.type}</Label>
                <Select
                  value={form.watch("type")}
                  onValueChange={(v) => form.setValue("type", v as UtilityType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="water">
                      <span className="flex items-center gap-2">
                        <Droplets className="h-3.5 w-3.5" /> {COPY.utilities.type.water}
                      </span>
                    </SelectItem>
                    <SelectItem value="electricity">
                      <span className="flex items-center gap-2">
                        <Zap className="h-3.5 w-3.5" /> {COPY.utilities.type.electricity}
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{COPY.utilities.fields.period}</Label>
                <Input
                  type="month"
                  {...form.register("periodMonth")}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>{COPY.utilities.fields.meterPrev}</Label>
                <Input
                  type="number"
                  placeholder="—"
                  {...form.register("meterPrev", { valueAsNumber: true, setValueAs: (v) => v === "" ? null : Number(v) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{COPY.utilities.fields.meterCurr}</Label>
                <Input
                  type="number"
                  placeholder="—"
                  {...form.register("meterCurr", { valueAsNumber: true, setValueAs: (v) => v === "" ? null : Number(v) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>{COPY.utilities.fields.amount}</Label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  {...form.register("amount", { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{COPY.utilities.fields.dueDate}</Label>
                <Input
                  type="date"
                  {...form.register("dueDate")}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={handleClose}>
                {COPY.common.cancel}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving…</>
                ) : (
                  COPY.utilities.actions.requestBill
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* SMS notification (opens after bill creation) */}
      <SmsComposer
        context="utility_bill"
        tenant={{ id: tenantId, fullName: tenantName, phone: tenantPhone }}
        relatedId={createdBillId}
        templateValues={{
          type: createdType,
          amount: String(createdAmount),
          period: createdPeriod,
          date: form.getValues("dueDate"),
        }}
        open={smsOpen}
        onOpenChange={(o) => {
          setSmsOpen(o);
          if (!o) handleClose();
        }}
      />
    </>
  );
}
