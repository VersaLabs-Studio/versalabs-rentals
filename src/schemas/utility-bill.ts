import { z } from "zod";
import { baseEntitySchema, baseCreateOmit } from "./base";

export const utilityTypeSchema = z.enum(["water", "electricity"]);
export type UtilityType = z.infer<typeof utilityTypeSchema>;

export const utilityStatusSchema = z.enum(["requested", "paid", "overdue"]);
export type UtilityStatus = z.infer<typeof utilityStatusSchema>;

export const utilityBillSchema = baseEntitySchema.extend({
  leaseId: z.string().min(1),
  tenantId: z.string().min(1),
  officeId: z.string().min(1),
  type: utilityTypeSchema,
  periodMonth: z.string().min(1), // YYYY-MM
  meterPrev: z.number().nullable().optional(),
  meterCurr: z.number().nullable().optional(),
  amount: z.number().positive(),
  dueDate: z.string().min(1),
  status: utilityStatusSchema,
  requestedAt: z.string().datetime(),
  paidDate: z.string().datetime().nullable().optional(),
});

export const utilityBillCreateSchema = utilityBillSchema.omit(baseCreateOmit);
export const utilityBillUpdateSchema = utilityBillCreateSchema.partial();

export type UtilityBill = z.infer<typeof utilityBillSchema>;
export type UtilityBillCreate = z.infer<typeof utilityBillCreateSchema>;
export type UtilityBillUpdate = z.infer<typeof utilityBillUpdateSchema>;
