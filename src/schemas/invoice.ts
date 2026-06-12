import { z } from "zod";
import { baseEntitySchema, baseCreateOmit } from "./base";

export const invoiceStatusSchema = z.enum(["paid", "unpaid"]);
export type InvoiceStatus = z.infer<typeof invoiceStatusSchema>;

export const invoiceLineItemSchema = z.object({
  description: z.string().min(1).max(200),
  amount: z.number().nonnegative(),
});
export type InvoiceLineItem = z.infer<typeof invoiceLineItemSchema>;

export const invoiceSchema = baseEntitySchema.extend({
  invoiceNumber: z.string().min(1),
  tenantId: z.string().min(1),
  leaseId: z.string().min(1).optional().default(""),
  issueDate: z.string().min(1),
  dueDate: z.string().min(1),
  lineItems: z.array(invoiceLineItemSchema).min(1),
  subtotal: z.number().nonnegative(),
  vat: z.number().nonnegative(),
  total: z.number().nonnegative(),
  status: invoiceStatusSchema,
  notes: z.string().max(1000).optional().default(""),
});

export const invoiceCreateSchema = invoiceSchema.omit(baseCreateOmit);
export const invoiceUpdateSchema = invoiceCreateSchema.partial();

export type Invoice = z.infer<typeof invoiceSchema>;
export type InvoiceCreate = z.infer<typeof invoiceCreateSchema>;
export type InvoiceUpdate = z.infer<typeof invoiceUpdateSchema>;
