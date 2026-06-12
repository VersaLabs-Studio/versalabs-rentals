import { z } from "zod";
import { baseEntitySchema, baseCreateOmit } from "./base";

export const officeStatusSchema = z.enum(["vacant", "occupied", "maintenance"]);
export type OfficeStatus = z.infer<typeof officeStatusSchema>;

export const officeSchema = baseEntitySchema.extend({
  buildingId: z.string().min(1),
  floorId: z.string().min(1),
  number: z.string().min(1).max(20),
  area: z.number().positive(),
  monthlyRate: z.number().nonnegative(),
  status: officeStatusSchema,
});

export const officeCreateSchema = officeSchema.omit(baseCreateOmit);
export const officeUpdateSchema = officeCreateSchema.partial();

export type Office = z.infer<typeof officeSchema>;
export type OfficeCreate = z.infer<typeof officeCreateSchema>;
export type OfficeUpdate = z.infer<typeof officeUpdateSchema>;
