"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LeaseKeys, EntityKeys } from "@/lib/query-keys";
import { leaseRepo, getLeasesWithRelations } from "@/lib/mock/repositories/leases";
import {
  leaseCreateSchema,
  type Lease,
  type LeaseCreate,
  type LeaseUpdate,
  type LeaseStatus,
} from "@/schemas";
import type { LeaseWithRelations } from "@/types";
import { simulateLatency } from "@/lib/mock/simulate-latency";

export function useLeases(filters?: {
  search?: string;
  status?: LeaseStatus;
  tenantId?: string;
  officeId?: string;
}) {
  return useQuery<LeaseWithRelations[]>({
    queryKey: LeaseKeys.list(filters),
    queryFn: async () => {
      await simulateLatency();
      return getLeasesWithRelations(filters);
    },
  });
}

export function useLease(id: string | null | undefined) {
  return useQuery<LeaseWithRelations | null>({
    queryKey: id ? LeaseKeys.detail(id) : LeaseKeys.detail("none"),
    queryFn: async () => {
      if (!id) return null;
      await simulateLatency();
      const all = getLeasesWithRelations();
      return all.find((l) => l.id === id) ?? null;
    },
    enabled: !!id,
  });
}

export function useLeasesByTenant(tenantId: string | null | undefined) {
  return useQuery<Lease[]>({
    queryKey: tenantId ? LeaseKeys.byTenant(tenantId) : LeaseKeys.byTenant("none"),
    queryFn: async () => {
      if (!tenantId) return [];
      return leaseRepo.list({ where: { tenantId } });
    },
    enabled: !!tenantId,
  });
}

export function useExpiringLeases(withinDays = 60) {
  return useQuery<LeaseWithRelations[]>({
    queryKey: [...LeaseKeys.expiring(), withinDays] as const,
    queryFn: async () => {
      await simulateLatency();
      const all = getLeasesWithRelations();
      return all.filter((l) => l.status === "expiring");
    },
  });
}

export function useCreateLease() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: LeaseCreate) => leaseRepo.create(leaseCreateSchema.parse(input)),
    onSuccess: () => qc.invalidateQueries({ queryKey: EntityKeys.Lease.all() }),
  });
}

export function useUpdateLease() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: LeaseUpdate }) =>
      leaseRepo.update(id, leaseCreateSchema.partial().parse(data)),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: EntityKeys.Lease.all() });
      qc.invalidateQueries({ queryKey: LeaseKeys.detail(id) });
    },
  });
}

export function useDeleteLease() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => leaseRepo.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: EntityKeys.Lease.all() }),
  });
}

export type { Lease, LeaseCreate, LeaseUpdate, LeaseWithRelations };
