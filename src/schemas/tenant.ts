import { z } from "zod";
import { baseEntitySchema, baseCreateOmit } from "./base";

export const tenantStatusSchema = z.enum(["active", "inactive"]);
export type TenantStatus = z.infer<typeof tenantStatusSchema>;

export const tenantSchema = baseEntitySchema.extend({
  fullName: z.string().min(1, "Full name is required").max(120),
  company: z.string().max(160).optional().default(""),
  phone: z
    .string()
    .min(1, "Phone is required")
    .max(30)
    .regex(/^\+?\d[\d\s-]+$/, "Use a valid phone like +251911223344"),
  email: z.string().email("Valid email required"),
  avatarSeed: z.string().min(1),
  status: tenantStatusSchema,
  moveInDate: z.string().min(1),
  notes: z.string().max(2000).optional().default(""),
});

export const tenantCreateSchema = tenantSchema.omit(baseCreateOmit);
export const tenantUpdateSchema = tenantCreateSchema.partial();

export type Tenant = z.infer<typeof tenantSchema>;
export type TenantCreate = z.infer<typeof tenantCreateSchema>;
export type TenantUpdate = z.infer<typeof tenantUpdateSchema>;
