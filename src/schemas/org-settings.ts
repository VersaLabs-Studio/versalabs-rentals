import { z } from "zod";

/**
 * OrgSettings — singleton record (id = "singleton").
 * No BaseEntity timestamps — but we keep the shape uniform.
 */
export const orgSettingsSchema = z.object({
  id: z.literal("singleton").default("singleton"),
  orgName: z.string().min(1).max(120),
  logoSeed: z.string().min(1),
  currency: z.literal("ETB").default("ETB"),
  vatRate: z.number().min(0).max(1),
  adminName: z.string().min(1).max(120),
  adminEmail: z.string().email(),
  address: z.string().max(255).optional().default(""),
  phone: z.string().max(30).optional().default(""),
  updatedAt: z.string().datetime(),
});

export const orgSettingsUpdateSchema = orgSettingsSchema.partial();

export type OrgSettings = z.infer<typeof orgSettingsSchema>;
export type OrgSettingsUpdate = z.infer<typeof orgSettingsUpdateSchema>;
