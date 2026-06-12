import { z } from "zod";

/**
 * BaseEntity — every persisted entity extends this.
 * id/timestamps are optional on create (auto-generated).
 */
export const baseEntitySchema = z.object({
  id: z.string().min(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type BaseEntity = z.infer<typeof baseEntitySchema>;

/** Subset used to omit from Create schemas */
export const baseCreateOmit = {
  id: true,
  createdAt: true,
  updatedAt: true,
} as const;
