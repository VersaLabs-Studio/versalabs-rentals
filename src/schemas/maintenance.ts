import { z } from "zod";
import { baseEntitySchema, baseCreateOmit } from "./base";

export const maintenancePrioritySchema = z.enum(["low", "medium", "high"]);
export type MaintenancePriority = z.infer<typeof maintenancePrioritySchema>;

export const maintenanceStatusSchema = z.enum(["open", "in_progress", "resolved"]);
export type MaintenanceStatus = z.infer<typeof maintenanceStatusSchema>;

export const maintenanceRequestSchema = baseEntitySchema.extend({
  officeId: z.string().min(1),
  tenantId: z.string().optional().default(""),
  title: z.string().min(1).max(160),
  description: z.string().min(1).max(2000),
  priority: maintenancePrioritySchema,
  status: maintenanceStatusSchema,
});

export const maintenanceRequestCreateSchema = maintenanceRequestSchema.omit(baseCreateOmit);
export const maintenanceRequestUpdateSchema = maintenanceRequestCreateSchema.partial();

export type MaintenanceRequest = z.infer<typeof maintenanceRequestSchema>;
export type MaintenanceRequestCreate = z.infer<typeof maintenanceRequestCreateSchema>;
export type MaintenanceRequestUpdate = z.infer<typeof maintenanceRequestUpdateSchema>;
