"use client";

import { useQuery } from "@tanstack/react-query";
import { getDashboardMetrics, getOccupancyByBuilding, getOccupancyByFloor } from "@/lib/mock/aggregations";
import type { DashboardMetrics, OccupancyByBuilding, OccupancyByFloor } from "@/types";
import { simulateLatency } from "@/lib/mock/simulate-latency";

export function useDashboardMetrics() {
  return useQuery<DashboardMetrics>({
    queryKey: ["Dashboard", "metrics"],
    queryFn: async () => {
      await simulateLatency();
      return getDashboardMetrics();
    },
    refetchInterval: 60_000,
  });
}

export function useOccupancyByBuilding() {
  return useQuery<OccupancyByBuilding[]>({
    queryKey: ["Dashboard", "occupancy-by-building"],
    queryFn: async () => {
      await simulateLatency();
      return getOccupancyByBuilding();
    },
  });
}

export function useOccupancyByFloor() {
  return useQuery<OccupancyByFloor[]>({
    queryKey: ["Dashboard", "occupancy-by-floor"],
    queryFn: async () => {
      await simulateLatency();
      return getOccupancyByFloor();
    },
  });
}
