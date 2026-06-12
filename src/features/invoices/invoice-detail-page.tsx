"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Printer, Mail, Phone, Download, Pencil, Building2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Logo } from "@/components/layout/logo";
import { InvoiceFormDialog } from "./_components/invoice-form-dialog";
import { useInvoice, useDeleteInvoice, useUpdateInvoice } from "@/hooks/use-invoices";
import { useOrgSettings } from "@/hooks/use-org-settings";
import { formatCurrency, formatDate } from "@/lib/format";
import { containerVariants, itemVariants } from "@/lib/motion";
import { COPY } from "@/config/copy";
import { toast } from "@/components/ui/toast";
import { STATUS_BADGE } from "@/config/entities";

interface Props { id: string; }

export function InvoiceDetailPage({ id }: Props) {
  const { data: invoice, isLoading } = useInvoice(id);
  const { data: org } = useOrgSettings();
  const { mutate: deleteInvoice } = useDeleteInvoice();
  const { mutate: updateInvoice } = useUpdateInvoice();
  const [editOpen, setEditOpen] = React.useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <EmptyState
        title="Invoice not found"
        description="This invoice may have been deleted."
        action={
          <Button asChild>
            <Link href="/invoices">
              <ArrowLeft className="h-4 w-4" />{COPY.invoices.detail.backToInvoices}
            </Link>
          </Button>
        }
      />
    );
  }

  const handleDelete = () => {
    if (!confirm("Delete this invoice?")) return;
    deleteInvoice(id, {
      onSuccess: () => {
        toast.success("Invoice deleted");
        window.location.href = "/invoices";
      },
      onError: (e) => toast.error(e.message),
    });
  };

  const togglePaid = () => {
    updateInvoice(
      { id, data: { status: invoice.status === "paid" ? "unpaid" : "paid" } },
      {
        onSuccess: () => toast.success(invoice.status === "paid" ? "Marked unpaid" : "Marked paid"),
        onError: (e) => toast.error(e.message),
      }
    );
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6 print:space-y-2"
      >
        <motion.div variants={itemVariants} className="no-print">
          <PageHeader
            title={invoice.invoiceNumber}
            description={`${COPY.invoices.detail.title} for ${invoice.tenant.fullName}`}
            breadcrumbs={[
              { label: COPY.app.name, href: "/dashboard" },
              { label: COPY.invoices.title, href: "/invoices" },
              { label: invoice.invoiceNumber },
            ]}
            action={
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => setEditOpen(true)}>
                  <Pencil className="h-4 w-4" />{COPY.common.edit}
                </Button>
                <Button variant="outline" onClick={togglePaid}>
                  {invoice.status === "paid" ? "Mark unpaid" : "Mark paid"}
                </Button>
                <Button onClick={handlePrint}>
                  <Printer className="h-4 w-4" />{COPY.invoices.detail.print}
                </Button>
              </div>
            }
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden print:shadow-none print:border-2 print:border-gray-300">
            <CardContent className="p-8 sm:p-10 print:p-0">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 pb-6 border-b border-border">
                <div>
                  <Logo size="lg" />
                  <p className="mt-3 text-sm text-muted-foreground">{org?.orgName ?? "RentFlow"}</p>
                  {org?.address && <p className="text-xs text-muted-foreground">{org.address}</p>}
                  {org?.phone && <p className="text-xs text-muted-foreground">{org.phone}</p>}
                </div>
                <div className="text-left sm:text-right">
                  <h1 className="text-3xl font-bold tracking-tight">INVOICE</h1>
                  <p className="font-mono text-sm mt-1 text-muted-foreground">{invoice.invoiceNumber}</p>
                  <Badge
                    variant={STATUS_BADGE.invoice[invoice.status]}
                    className="mt-2 print:border print:border-gray-300"
                  >
                    {invoice.status}
                  </Badge>
                </div>
              </div>

              {/* Bill to + dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-border">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    {COPY.invoices.detail.billTo}
                  </p>
                  <p className="font-semibold">{invoice.tenant.fullName}</p>
                  {invoice.tenant.company && (
                    <p className="text-sm text-muted-foreground">{invoice.tenant.company}</p>
                  )}
                  {invoice.tenant.phone && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Phone className="h-3 w-3" /> {invoice.tenant.phone}
                    </p>
                  )}
                  {invoice.tenant.email && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3" /> {invoice.tenant.email}
                    </p>
                  )}
                </div>
                <div className="sm:text-right space-y-1.5">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      {COPY.invoices.detail.issueDate}
                    </p>
                    <p className="font-medium">{formatDate(invoice.issueDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      {COPY.invoices.detail.dueDate}
                    </p>
                    <p className="font-medium">{formatDate(invoice.dueDate)}</p>
                  </div>
                </div>
              </div>

              {/* Line items */}
              <div className="py-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="text-left font-semibold py-2 text-xs uppercase tracking-wider">
                        {COPY.invoices.detail.description}
                      </th>
                      <th className="text-right font-semibold py-2 text-xs uppercase tracking-wider w-32">
                        {COPY.invoices.detail.amount}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.lineItems.map((li, i) => (
                      <tr key={i} className="border-b border-border/60">
                        <td className="py-3">{li.description}</td>
                        <td className="py-3 text-right tabular-nums">{formatCurrency(li.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end pt-2">
                <div className="w-72 space-y-1.5 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>{COPY.invoices.detail.subtotal}</span>
                    <span className="tabular-nums">{formatCurrency(invoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>{COPY.invoices.detail.vat}</span>
                    <span className="tabular-nums">{formatCurrency(invoice.vat)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                    <span>{COPY.invoices.detail.total}</span>
                    <span className="tabular-nums">{formatCurrency(invoice.total)}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {invoice.notes && (
                <div className="mt-8 pt-6 border-t border-border text-sm">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Notes</p>
                  <p className="text-foreground/80 leading-relaxed">{invoice.notes}</p>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-border text-center text-xs text-muted-foreground print:mt-12">
                Thank you for your business. Payment due by {formatDate(invoice.dueDate)}.
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <InvoiceFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        editId={id}
        initialValues={invoice}
      />
    </>
  );
}
