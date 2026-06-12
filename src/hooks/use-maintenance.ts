"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MaintenanceKeys, EntityKeys } from "@/lib/query-keys";
import {
  maintenanceRepo,
  getMaintenanceWithRelations,
} from "@/lib/mock/repositories/maintenance";
import {
  maintenanceRequestCreateSchema,
  type MaintenanceRequest,
  type MaintenanceRequestCreate,
  type MaintenanceRequestUpdate,
} from "@/schemas";
import type { MaintenanceWithRelations } from "@/types";
import { simulateLatency } from "@/lib/mock/simulate-latency";

export function useMaintenanceRequests(filters?: {
  search?: string;
  status?: "open" | "in_progress" | "resolved";
  priority?: "low" | "medium" | "high";
}) {
  return useQuery<MaintenanceWithRelations[]>({
    queryKey: MaintenanceKeys.list(filters),
    queryFn: async () => {
      await simulateLatency();
      return getMaintenanceWithRelations(filters);
    },
  });
}

export function useMaintenanceRequest(id: string | null | undefined) {
  return useQuery<MaintenanceRequest | null>({
    queryKey: id ? MaintenanceKeys.detail(id) : MaintenanceKeys.detail("none"),
    queryFn: () => (id ? maintenanceRepo.getById(id) : Promise.resolve(null)),
    enabled: !!id,
  });
}

export function useOpenMaintenanceCount() {
  return useQuery<number>({
    queryKey: [...MaintenanceKeys.open(), "count"] as const,
    queryFn: async () => {
      await simulateLatency(80, 200);
      const all = getMaintenanceWithRelations();
      return all.filter((m) => m.status === "open" || m.status === "in_progress").length;
    },
  });
}

export function useCreateMaintenanceRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: MaintenanceRequestCreate) =>
      maintenanceRepo.create(maintenanceRequestCreateSchema.parse(input)),
    onSuccess: () => qc.invalidateQueries({ queryKey: EntityKeys.MaintenanceRequest.all() }),
  });
}

export function useUpdateMaintenanceRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: MaintenanceRequestUpdate }) =>
      maintenanceRepo.update(id, maintenanceRequestCreateSchema.partial().parse(data)),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: EntityKeys.MaintenanceRequest.all() });
      qc.invalidateQueries({ queryKey: MaintenanceKeys.detail(id) });
    },
  });
}

export function useDeleteMaintenanceRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => maintenanceRepo.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: EntityKeys.MaintenanceRequest.all() }),
  });
}

export type {
  MaintenanceRequest,
  MaintenanceRequestCreate,
  MaintenanceRequestUpdate,
  MaintenanceWithRelations,
};
