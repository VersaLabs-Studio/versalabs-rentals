"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { OfficeKeys, EntityKeys } from "@/lib/query-keys";
import { officeRepo, getOfficesWithRelations } from "@/lib/mock/repositories/offices";
import {
  officeCreateSchema,
  type Office,
  type OfficeCreate,
  type OfficeUpdate,
  type OfficeStatus,
} from "@/schemas";
import type { OfficeWithRelations } from "@/types";
import { simulateLatency } from "@/lib/mock/simulate-latency";

export function useOffices(filters?: {
  search?: string;
  status?: OfficeStatus;
  buildingId?: string;
}) {
  return useQuery<OfficeWithRelations[]>({
    queryKey: OfficeKeys.list(filters),
    queryFn: async () => {
      await simulateLatency();
      return getOfficesWithRelations(filters);
    },
  });
}

export function useOffice(id: string | null | undefined) {
  return useQuery<OfficeWithRelations | null>({
    queryKey: id ? OfficeKeys.detail(id) : OfficeKeys.detail("none"),
    queryFn: async () => {
      if (!id) return null;
      await simulateLatency();
      const all = getOfficesWithRelations();
      return all.find((o) => o.id === id) ?? null;
    },
    enabled: !!id,
  });
}

export function useCreateOffice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: OfficeCreate) => officeRepo.create(officeCreateSchema.parse(input)),
    onSuccess: () => qc.invalidateQueries({ queryKey: EntityKeys.Office.all() }),
  });
}

export function useUpdateOffice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: OfficeUpdate }) =>
      officeRepo.update(id, officeCreateSchema.partial().parse(data)),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: EntityKeys.Office.all() });
      qc.invalidateQueries({ queryKey: OfficeKeys.detail(id) });
    },
  });
}

export function useDeleteOffice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => officeRepo.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: EntityKeys.Office.all() }),
  });
}

export type { Office, OfficeCreate, OfficeUpdate, OfficeWithRelations };
