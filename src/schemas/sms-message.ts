import { z } from "zod";
import { baseEntitySchema, baseCreateOmit } from "./base";

export const smsContextSchema = z.enum(["lease_expiry", "invoice_due", "utility_bill", "manual"]);
export type SmsContext = z.infer<typeof smsContextSchema>;

export const smsStatusSchema = z.enum(["queued", "sending", "delivered"]);
export type SmsStatus = z.infer<typeof smsStatusSchema>;

export const smsMessageSchema = baseEntitySchema.extend({
  tenantId: z.string().min(1),
  recipientName: z.string().min(1).max(120),
  phone: z.string().min(1).max(30),
  context: smsContextSchema,
  relatedId: z.string().nullable().optional(),
  body: z.string().min(1).max(500),
  status: smsStatusSchema,
  deliveredAt: z.string().datetime().nullable().optional(),
});

export const smsMessageCreateSchema = smsMessageSchema.omit(baseCreateOmit);
export const smsMessageUpdateSchema = smsMessageCreateSchema.partial();

export type SmsMessage = z.infer<typeof smsMessageSchema>;
export type SmsMessageCreate = z.infer<typeof smsMessageCreateSchema>;
export type SmsMessageUpdate = z.infer<typeof smsMessageUpdateSchema>;
