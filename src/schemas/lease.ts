import { z } from "zod";
import { baseEntitySchema, baseCreateOmit } from "./base";

export const leaseStatusSchema = z.enum(["active", "expiring", "expired", "terminated"]);
export type LeaseStatus = z.infer<typeof leaseStatusSchema>;

export const leaseSchema = baseEntitySchema.extend({
  tenantId: z.string().min(1),
  officeId: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  monthlyRent: z.number().positive(),
  depositAmount: z.number().nonnegative(),
  status: leaseStatusSchema,
  notes: z.string().max(2000).optional().default(""),
});

export const leaseCreateSchema = leaseSchema.omit(baseCreateOmit);
export const leaseUpdateSchema = leaseCreateSchema.partial();

export type Lease = z.infer<typeof leaseSchema>;
export type LeaseCreate = z.infer<typeof leaseCreateSchema>;
export type LeaseUpdate = z.infer<typeof leaseUpdateSchema>;
