"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TenantKeys, EntityKeys } from "@/lib/query-keys";
import { tenantRepo, getTenantsWithLeases, getTenantWithLeases } from "@/lib/mock/repositories/tenants";
import { tenantCreateSchema, type Tenant, type TenantCreate, type TenantUpdate } from "@/schemas";
import type { TenantWithLeases } from "@/types";
import { simulateLatency } from "@/lib/mock/simulate-latency";

/* ============================================================
   useTenants — THE GOLDEN TEMPLATE.
   Every other entity follows this exact hook shape.
   ============================================================ */

export interface UseTenantsFilters {
  search?: string;
  status?: "active" | "inactive";
}

/** List tenants (raw repo, used internally and by /api-equivalent). */
export function useTenants(filters?: UseTenantsFilters) {
  return useQuery<Tenant[]>({
    queryKey: TenantKeys.list(filters),
    queryFn: async () => {
      // Validate inputs at the boundary (Zod in every API route)
      const parsed = tenantCreateSchema.partial().safeParse(filters ?? {});
      if (!parsed.success) throw new Error("Invalid filter");
      return tenantRepo.list({
        search: filters?.search,
        searchFields: ["fullName", "company", "email", "phone"] as (keyof Tenant)[],
        sortBy: "createdAt",
        sortDir: "desc",
      });
    },
  });
}

/** List tenants with their leases (UI list page). */
export function useTenantsWithLeases(filters?: UseTenantsFilters) {
  return useQuery<TenantWithLeases[]>({
    queryKey: [...TenantKeys.list(filters), "withLeases"] as const,
    queryFn: async () => {
      await simulateLatency();
      return getTenantsWithLeases({
        search: filters?.search,
        status: filters?.status,
      });
    },
  });
}

/** Single tenant document. */
export function useTenant(id: string | null | undefined) {
  return useQuery<Tenant | null>({
    queryKey: id ? TenantKeys.detail(id) : TenantKeys.detail("none"),
    queryFn: async () => {
      if (!id) return null;
      return tenantRepo.getById(id);
    },
    enabled: !!id,
  });
}

/** Tenant + their leases (for detail page). */
export function useTenantWithLeases(id: string | null | undefined) {
  return useQuery<TenantWithLeases | null>({
    queryKey: id ? TenantKeys.withLeases(id) : TenantKeys.withLeases("none"),
    queryFn: async () => {
      if (!id) return null;
      await simulateLatency();
      return getTenantWithLeases(id);
    },
    enabled: !!id,
  });
}

/** Create mutation. */
export function useCreateTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: TenantCreate) => {
      const parsed = tenantCreateSchema.parse(input);
      return tenantRepo.create(parsed);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: EntityKeys.Tenant.all() });
    },
  });
}

/** Update mutation. */
export function useUpdateTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TenantUpdate }) => {
      const parsed = tenantCreateSchema.partial().parse(data);
      return tenantRepo.update(id, parsed);
    },
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: EntityKeys.Tenant.all() });
      qc.invalidateQueries({ queryKey: TenantKeys.detail(id) });
      qc.invalidateQueries({ queryKey: TenantKeys.withLeases(id) });
    },
  });
}

/** Delete mutation. */
export function useDeleteTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return tenantRepo.remove(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: EntityKeys.Tenant.all() });
      // Also invalidate leases + payments since they reference the tenant
      qc.invalidateQueries({ queryKey: EntityKeys.Lease.all() });
      qc.invalidateQueries({ queryKey: EntityKeys.Payment.all() });
    },
  });
}

export type { Tenant, TenantCreate, TenantUpdate, TenantWithLeases };
