import { createRepository, type Repository, readKey } from "../create-repository";
import type { Building, Floor, Office } from "@/schemas";
import type { BuildingWithStats } from "@/types";

export const buildingRepo: Repository<Building> = createRepository<Building>(
  "rentflow:buildings",
  []
);

/* floors live with buildings (navigated via Floor.byBuilding) */
export const floorRepo: Repository<Floor> = createRepository<Floor>("rentflow:floors", []);

/** Get all floors for a building. */
export function getFloorsForBuilding(buildingId: string): Floor[] {
  return readKey<Floor[]>("rentflow:floors", []).filter((f: Floor) => f.buildingId === buildingId);
}

/** Get all offices for a building. */
export function getOfficesForBuilding(buildingId: string): Office[] {
  return readKey<Office[]>("rentflow:offices", []).filter((o: Office) => o.buildingId === buildingId);
}

/** Aggregate stats per building. */
export function getBuildingsWithStats(): BuildingWithStats[] {
  const buildings = readKey<Building[]>("rentflow:buildings", []);
  const offices = readKey<Office[]>("rentflow:offices", []);
  return buildings.map((b: Building) => {
    const own = offices.filter((o: Office) => o.buildingId === b.id);
    const occupied = own.filter((o: Office) => o.status === "occupied").length;
    const total = own.length;
    const revenue = own
      .filter((o: Office) => o.status === "occupied")
      .reduce((sum: number, o: Office) => sum + o.monthlyRate, 0);
    return {
      ...b,
      officeCount: total,
      occupiedCount: occupied,
      occupancyRate: total === 0 ? 0 : occupied / total,
      monthlyRevenue: revenue,
    };
  });
}
