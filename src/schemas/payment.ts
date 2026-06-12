import { z } from "zod";
import { baseEntitySchema, baseCreateOmit } from "./base";

export const paymentMethodSchema = z.enum(["cash", "bank", "telebirr"]);
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;

export const paymentStatusSchema = z.enum(["paid", "pending", "overdue"]);
export type PaymentStatus = z.infer<typeof paymentStatusSchema>;

export const paymentSchema = baseEntitySchema.extend({
  leaseId: z.string().min(1),
  tenantId: z.string().min(1),
  periodMonth: z.string().min(1), // YYYY-MM
  amount: z.number().positive(),
  dueDate: z.string().min(1),
  paidDate: z.string().nullable().optional(),
  method: paymentMethodSchema,
  status: paymentStatusSchema,
  reference: z.string().max(80).optional().default(""),
});

export const paymentCreateSchema = paymentSchema.omit(baseCreateOmit);
export const paymentUpdateSchema = paymentCreateSchema.partial();

export type Payment = z.infer<typeof paymentSchema>;
export type PaymentCreate = z.infer<typeof paymentCreateSchema>;
export type PaymentUpdate = z.infer<typeof paymentUpdateSchema>;
