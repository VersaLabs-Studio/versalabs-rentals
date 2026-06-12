import { z } from "zod";
import { baseEntitySchema, baseCreateOmit } from "./base";

export const notificationTypeSchema = z.enum([
  "lease_expiring",
  "payment_overdue",
  "system",
]);
export type NotificationType = z.infer<typeof notificationTypeSchema>;

export const notificationSchema = baseEntitySchema.extend({
  type: notificationTypeSchema,
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(1000),
  date: z.string().min(1),
  read: z.boolean(),
  link: z.string().optional().default(""),
});

export const notificationCreateSchema = notificationSchema.omit(baseCreateOmit);
export const notificationUpdateSchema = notificationCreateSchema.partial();

export type Notification = z.infer<typeof notificationSchema>;
export type NotificationCreate = z.infer<typeof notificationCreateSchema>;
export type NotificationUpdate = z.infer<typeof notificationUpdateSchema>;
