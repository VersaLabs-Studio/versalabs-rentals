"use client";

// DEFERRED: multi-building — re-enable for portfolio tier

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BuildingKeys, FloorKeys, OfficeKeys, EntityKeys } from "@/lib/query-keys";
import {
  buildingRepo,
  floorRepo,
  getFloorsForBuilding,
  getOfficesForBuilding,
  getBuildingsWithStats,
} from "@/lib/mock/repositories/buildings";
import { buildingCreateSchema, type Building, type BuildingCreate, type BuildingUpdate } from "@/schemas";
import type { BuildingWithStats, Floor, Office } from "@/types";
import { ACTIVE_BUILDING_ID } from "@/config/app";

/** Get the single active building (single-building SaaS model). */
export function useActiveBuilding() {
  return useQuery<BuildingWithStats | null>({
    queryKey: [...BuildingKeys.all(), "active"] as const,
    queryFn: async () => {
      const { simulateLatency } = await import("@/lib/mock/simulate-latency");
      await simulateLatency();
      const all = getBuildingsWithStats();
      return all.find((b) => b.id === ACTIVE_BUILDING_ID) ?? all[0] ?? null;
    },
  });
}

export function useBuildings(filters?: { search?: string; district?: string }) {
  return useQuery<Building[]>({
    queryKey: BuildingKeys.list(filters),
    queryFn: async () =>
      buildingRepo.list({
        search: filters?.search,
        searchFields: ["name", "address", "district"] as (keyof Building)[],
        sortBy: "name",
        sortDir: "asc",
      }),
  });
}

export function useBuildingsWithStats() {
  return useQuery<BuildingWithStats[]>({
    queryKey: [...BuildingKeys.all(), "withStats"] as const,
    queryFn: async () => {
      const { simulateLatency } = await import("@/lib/mock/simulate-latency");
      await simulateLatency();
      return getBuildingsWithStats();
    },
  });
}

export function useBuilding(id: string | null | undefined) {
  return useQuery<Building | null>({
    queryKey: id ? BuildingKeys.detail(id) : BuildingKeys.detail("none"),
    queryFn: () => (id ? buildingRepo.getById(id) : Promise.resolve(null)),
    enabled: !!id,
  });
}

export function useBuildingWithStats(id: string | null | undefined) {
  return useQuery<BuildingWithStats | null>({
    queryKey: id ? [...BuildingKeys.detail(id), "stats"] as const : BuildingKeys.detail("none"),
    queryFn: async () => {
      if (!id) return null;
      const { simulateLatency } = await import("@/lib/mock/simulate-latency");
      await simulateLatency();
      const all = getBuildingsWithStats();
      return all.find((b) => b.id === id) ?? null;
    },
    enabled: !!id,
  });
}

export function useFloorsForBuilding(buildingId: string | null | undefined) {
  return useQuery<Floor[]>({
    queryKey: buildingId ? FloorKeys.byBuilding(buildingId) : FloorKeys.byBuilding("none"),
    queryFn: async () => {
      if (!buildingId) return [];
      const { simulateLatency } = await import("@/lib/mock/simulate-latency");
      await simulateLatency();
      return getFloorsForBuilding(buildingId);
    },
    enabled: !!buildingId,
  });
}

export function useOfficesForBuilding(buildingId: string | null | undefined) {
  return useQuery<Office[]>({
    queryKey: buildingId ? OfficeKeys.byBuilding(buildingId) : OfficeKeys.byBuilding("none"),
    queryFn: async () => {
      if (!buildingId) return [];
      const { simulateLatency } = await import("@/lib/mock/simulate-latency");
      await simulateLatency();
      return getOfficesForBuilding(buildingId);
    },
    enabled: !!buildingId,
  });
}

export function useCreateBuilding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: BuildingCreate) => buildingRepo.create(buildingCreateSchema.parse(input)),
    onSuccess: () => qc.invalidateQueries({ queryKey: EntityKeys.Building.all() }),
  });
}

export function useUpdateBuilding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: BuildingUpdate }) =>
      buildingRepo.update(id, buildingCreateSchema.partial().parse(data)),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: EntityKeys.Building.all() });
      qc.invalidateQueries({ queryKey: BuildingKeys.detail(id) });
    },
  });
}

export function useDeleteBuilding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => buildingRepo.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: EntityKeys.Building.all() });
      qc.invalidateQueries({ queryKey: EntityKeys.Floor.all() });
      qc.invalidateQueries({ queryKey: EntityKeys.Office.all() });
    },
  });
}

export function useCreateFloor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<Floor, "id" | "createdAt" | "updatedAt">) =>
      floorRepo.create(input as Floor),
    onSuccess: () => qc.invalidateQueries({ queryKey: EntityKeys.Floor.all() }),
  });
}

export type { Building, BuildingCreate, BuildingUpdate, BuildingWithStats, Floor, Office };
