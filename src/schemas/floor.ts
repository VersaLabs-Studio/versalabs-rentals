import { z } from "zod";
import { baseEntitySchema, baseCreateOmit } from "./base";

export const floorSchema = baseEntitySchema.extend({
  buildingId: z.string().min(1),
  level: z.number().int().min(-2).max(60),
  label: z.string().min(1).max(60),
});

export const floorCreateSchema = floorSchema.omit(baseCreateOmit);
export const floorUpdateSchema = floorCreateSchema.partial();

export type Floor = z.infer<typeof floorSchema>;
export type FloorCreate = z.infer<typeof floorCreateSchema>;
export type FloorUpdate = z.infer<typeof floorUpdateSchema>;
