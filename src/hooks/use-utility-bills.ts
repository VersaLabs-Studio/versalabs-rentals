"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UtilityBillKeys, EntityKeys } from "@/lib/query-keys";
import { utilityBillRepo, listByLease } from "@/lib/mock/repositories/utility-bills";
import {
  utilityBillCreateSchema,
  type UtilityBill,
  type UtilityBillCreate,
  type UtilityBillUpdate,
} from "@/schemas";
import { simulateLatency } from "@/lib/mock/simulate-latency";

export function useUtilityBills(filters?: {
  search?: string;
  type?: string;
  status?: string;
}) {
  return useQuery<UtilityBill[]>({
    queryKey: UtilityBillKeys.list(filters),
    queryFn: async () => {
      await simulateLatency();
      return utilityBillRepo.list({
        search: filters?.search,
        searchFields: ["id", "periodMonth"] as any,
        where: {
          ...(filters?.type ? { type: filters.type } : {}),
          ...(filters?.status ? { status: filters.status } : {}),
        } as any,
        sortBy: "createdAt" as any,
        sortDir: "desc",
      });
    },
  });
}

export function useUtilityBill(id: string | null | undefined) {
  return useQuery<UtilityBill | null>({
    queryKey: id ? UtilityBillKeys.detail(id) : UtilityBillKeys.detail("none"),
    queryFn: async () => {
      if (!id) return null;
      await simulateLatency();
      return utilityBillRepo.getById(id);
    },
    enabled: !!id,
  });
}

export function useUtilityBillsByLease(leaseId: string | null | undefined) {
  return useQuery<UtilityBill[]>({
    queryKey: leaseId ? UtilityBillKeys.byLease(leaseId) : UtilityBillKeys.byLease("none"),
    queryFn: async () => {
      if (!leaseId) return [];
      await simulateLatency(50, 150);
      return listByLease(leaseId);
    },
    enabled: !!leaseId,
  });
}

export function useCreateUtilityBill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: UtilityBillCreate) =>
      utilityBillRepo.create(utilityBillCreateSchema.parse(input)),
    onSuccess: () => qc.invalidateQueries({ queryKey: EntityKeys.UtilityBill.all() }),
  });
}

export function useUpdateUtilityBill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UtilityBillUpdate }) =>
      utilityBillRepo.update(id, utilityBillCreateSchema.partial().parse(data)),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: EntityKeys.UtilityBill.all() });
      qc.invalidateQueries({ queryKey: UtilityBillKeys.detail(id) });
    },
  });
}

export function useDeleteUtilityBill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => utilityBillRepo.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: EntityKeys.UtilityBill.all() }),
  });
}

export type { UtilityBill, UtilityBillCreate, UtilityBillUpdate };
