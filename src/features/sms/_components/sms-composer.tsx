"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, CheckCircle2, Clock, Loader2, MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useSendSms, useSmsMessages } from "@/hooks/use-sms-messages";
import { toast } from "@/components/ui/toast";
import { COPY } from "@/config/copy";
import type { SmsContext } from "@/schemas";
import { formatDateTime } from "@/lib/format";
import { useOrgSettings } from "@/hooks/use-org-settings";

interface SmsComposerProps {
  /** The SMS context (determines template + badge). */
  context: SmsContext;
  /** Tenant info. */
  tenant: {
    id: string;
    fullName: string;
    phone?: string | null;
  };
  /** Pre-filled body. If empty, generated from template. */
  prefilledBody?: string;
  /** Optional related entity ID (lease, invoice, etc.). */
  relatedId?: string | null;
  /** Template interpolation values. */
  templateValues?: Record<string, string>;
  /** Open state. */
  open: boolean;
  /** Close handler. */
  onOpenChange: (open: boolean) => void;
}

type Step = "compose" | "sending" | "done";

export function SmsComposer({
  context,
  tenant,
  prefilledBody,
  relatedId,
  templateValues = {},
  open,
  onOpenChange,
}: SmsComposerProps) {
  const { data: org } = useOrgSettings();
  const { mutate: sendSms, isPending: isSending } = useSendSms();
  const { refetch: refetchMessages } = useSmsMessages();

  const [step, setStep] = React.useState<Step>("compose");
  const [body, setBody] = React.useState("");
  const [sentId, setSentId] = React.useState<string | null>(null);
  const [displayStatus, setDisplayStatus] = React.useState<"queued" | "sending" | "delivered">("queued");
  const [deliveredAt, setDeliveredAt] = React.useState<string | null>(null);

  // Generate template body on mount
  React.useEffect(() => {
    if (open) {
      const orgName = org?.orgName ?? "RentFlow";
      const templates: Record<SmsContext, string> = {
        lease_expiry: COPY.sms.templates.lease_expiry,
        invoice_due: COPY.sms.templates.invoice_due,
        utility_bill: COPY.sms.templates.utility_bill,
        manual: "",
      };
      let tpl = prefilledBody ?? templates[context] ?? "";
      tpl = tpl.replace(/\{name\}/g, tenant.fullName);
      tpl = tpl.replace(/\{office\}/g, templateValues.office ?? "");
      tpl = tpl.replace(/\{date\}/g, templateValues.date ?? "");
      tpl = tpl.replace(/\{invoiceNo\}/g, templateValues.invoiceNo ?? "");
      tpl = tpl.replace(/\{amount\}/g, templateValues.amount ?? "");
      tpl = tpl.replace(/\{type\}/g, templateValues.type ?? "");
      tpl = tpl.replace(/\{period\}/g, templateValues.period ?? "");
      tpl = tpl.replace(/\{org\}/g, orgName);
      setBody(tpl);
      setStep("compose");
      setDisplayStatus("queued");
      setDeliveredAt(null);
      setSentId(null);
    }
  }, [open, context, tenant.fullName, prefilledBody, templateValues, org]);

  // Listen for SMS status changes to update the animated stepper
  React.useEffect(() => {
    if (!sentId || step !== "sending") return;
    const handler = () => {
      // Re-read from localStorage
      if (typeof window === "undefined") return;
      const raw = window.localStorage.getItem("rentflow:smsMessages");
      if (!raw) return;
      try {
        const msgs = JSON.parse(raw) as any[];
        const msg = msgs.find((m: any) => m.id === sentId);
        if (!msg) return;
        setDisplayStatus(msg.status);
        if (msg.status === "delivered") {
          setDeliveredAt(msg.deliveredAt);
          setTimeout(() => setStep("done"), 600);
        }
      } catch {}
    };
    window.addEventListener("rentflow:sms-status-changed", handler);
    return () => window.removeEventListener("rentflow:sms-status-changed", handler);
  }, [sentId, step]);

  const handleSend = () => {
    if (!body.trim()) {
      toast.error("Message body is required");
      return;
    }
    if (!tenant.phone) {
      toast.error("Tenant has no phone number");
      return;
    }

    sendSms(
      {
        tenantId: tenant.id,
        recipientName: tenant.fullName,
        phone: tenant.phone,
        context,
        relatedId: relatedId ?? null,
        body: body.trim(),
      },
      {
        onSuccess: (msg) => {
          setSentId(msg.id);
          setStep("sending");
          setDisplayStatus("queued");
          toast.success(COPY.sms.toasts.sent);
        },
        onError: (e) => {
          toast.error(e.message);
        },
      }
    );
  };

  const handleDone = () => {
    refetchMessages();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleDone(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            {COPY.sms.compose}
          </DialogTitle>
          <DialogDescription>
            Send an SMS to {tenant.fullName}
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === "compose" && (
            <motion.div
              key="compose"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <Label>{COPY.sms.fields.recipient}</Label>
                <Input value={tenant.fullName} readOnly className="bg-muted/30" />
              </div>
              <div className="space-y-1.5">
                <Label>{COPY.sms.fields.phone}</Label>
                <Input value={tenant.phone ?? "—"} readOnly className="bg-muted/30 font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label>{COPY.sms.fields.body}</Label>
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={4}
                  className="resize-none"
                  placeholder="Type your message…"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" onClick={() => onOpenChange(false)}>
                  {COPY.common.cancel}
                </Button>
                <Button onClick={handleSend} disabled={isSending || !body.trim()}>
                  {isSending ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" />{COPY.sms.actions.sending}</>
                  ) : (
                    <><Send className="h-4 w-4 mr-2" />{COPY.sms.actions.send}</>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {step === "sending" && (
            <motion.div
              key="sending"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-6 py-4"
            >
              <div className="text-center space-y-2">
                <MessageSquare className="h-8 w-8 mx-auto text-primary" />
                <p className="font-medium">{COPY.sms.actions.track}</p>
              </div>

              {/* Animated stepper */}
              <div className="space-y-3">
                {/* Step 1: Queued */}
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    {displayStatus === "queued" ? (
                      <Clock className="h-4 w-4 text-warning animate-pulse" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{COPY.sms.stepper.queued}</p>
                  </div>
                </div>

                {/* Step 2: Sending */}
                <div className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  displayStatus === "sending" || displayStatus === "delivered"
                    ? "border-primary/30 bg-primary/5"
                    : "border-border opacity-50"
                }`}>
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    displayStatus === "sending"
                      ? "bg-primary/20"
                      : displayStatus === "delivered"
                      ? "bg-success/20"
                      : "bg-muted"
                  }`}>
                    {displayStatus === "sending" ? (
                      <Loader2 className="h-4 w-4 text-primary animate-spin" />
                    ) : displayStatus === "delivered" ? (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    ) : (
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{COPY.sms.stepper.sending}</p>
                  </div>
                </div>

                {/* Step 3: Delivered */}
                <div className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  displayStatus === "delivered"
                    ? "border-success/30 bg-success/5"
                    : "border-border opacity-50"
                }`}>
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    displayStatus === "delivered" ? "bg-success/20" : "bg-muted"
                  }`}>
                    {displayStatus === "delivered" ? (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    ) : (
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{COPY.sms.stepper.delivered}</p>
                    {displayStatus === "delivered" && deliveredAt && (
                      <p className="text-xs text-muted-foreground">
                        {COPY.sms.stepper.sentAt} {formatDateTime(deliveredAt)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="space-y-4 py-4 text-center"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success/10 mx-auto">
                <CheckCircle2 className="h-7 w-7 text-success" />
              </div>
              <div>
                <p className="font-semibold text-lg">SMS Delivered</p>
                <p className="text-sm text-muted-foreground">
                  Your message to {tenant.fullName} has been delivered.
                </p>
                {deliveredAt && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {COPY.sms.stepper.sentAt} {formatDateTime(deliveredAt)}
                  </p>
                )}
              </div>
              <Button onClick={handleDone} className="mt-4">
                {COPY.sms.actions.close}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
