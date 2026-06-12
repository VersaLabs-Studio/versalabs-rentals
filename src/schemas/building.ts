import { z } from "zod";
import { baseEntitySchema, baseCreateOmit } from "./base";

export const districtSchema = z.enum([
  "Bole",
  "Kirkos",
  "Yeka",
  "Addis Ketema",
  "Arada",
  "Lideta",
  "Gullele",
  "Kolfe Keranio",
  "Nifas Silk-Lafto",
  "Akaki Kality",
]);
export type District = z.infer<typeof districtSchema>;

export const buildingSchema = baseEntitySchema.extend({
  name: z.string().min(1, "Name is required").max(120),
  address: z.string().min(1, "Address is required").max(255),
  district: districtSchema,
  totalFloors: z.number().int().min(1).max(60),
  photoSeed: z.string().min(1),
  notes: z.string().max(2000).optional().default(""),
});

export const buildingCreateSchema = buildingSchema.omit(baseCreateOmit);
export const buildingUpdateSchema = buildingCreateSchema.partial();

export type Building = z.infer<typeof buildingSchema>;
export type BuildingCreate = z.infer<typeof buildingCreateSchema>;
export type BuildingUpdate = z.infer<typeof buildingUpdateSchema>;
