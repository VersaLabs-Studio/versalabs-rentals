import { createRepository, type Repository, readKey } from "../create-repository";
import type { Office, OfficeStatus } from "@/schemas";
import type { Building, Floor, Lease, Tenant } from "@/schemas";
import type { OfficeWithRelations } from "@/types";

export const officeRepo: Repository<Office> = createRepository<Office>(
  "rentflow:offices",
  []
);

/** Offices joined with building + floor + active lease + tenant. */
export function getOfficesWithRelations(filters?: {
  search?: string;
  status?: OfficeStatus;
  buildingId?: string;
}): OfficeWithRelations[] {
  const offices = readKey<Office[]>("rentflow:offices", []);
  const buildings = readKey<Building[]>("rentflow:buildings", []);
  const floors = readKey<Floor[]>("rentflow:floors", []);
  const leases = readKey<Lease[]>("rentflow:leases", []);
  const tenants = readKey<Tenant[]>("rentflow:tenants", []);

  const byBuilding = new Map(buildings.map((b) => [b.id, b]));
  const byFloor = new Map(floors.map((f) => [f.id, f]));

  let result: OfficeWithRelations[] = offices.map((o) => {
    const building = byBuilding.get(o.buildingId);
    const floor = byFloor.get(o.floorId);
    const activeLease =
      leases.find(
        (l) => l.officeId === o.id && (l.status === "active" || l.status === "expiring")
      ) ?? null;
    const tenant = activeLease
      ? tenants.find((t) => t.id === activeLease.tenantId) ?? null
      : null;
    return {
      ...o,
      building: building
        ? { id: building.id, name: building.name, district: building.district }
        : { id: "", name: "Unknown", district: "Bole" as const },
      floor: floor ? { id: floor.id, level: floor.level, label: floor.label } : undefined,
      activeLease,
      tenant: tenant
        ? {
            id: tenant.id,
            fullName: tenant.fullName,
            company: tenant.company,
            phone: tenant.phone,
            email: tenant.email,
          }
        : null,
    };
  });

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (o) =>
        o.number.toLowerCase().includes(q) ||
        o.building.name.toLowerCase().includes(q) ||
        (o.tenant?.fullName.toLowerCase().includes(q) ?? false)
    );
  }
  if (filters?.status) {
    result = result.filter((o) => o.status === filters.status);
  }
  if (filters?.buildingId) {
    result = result.filter((o) => o.buildingId === filters.buildingId);
  }

  return result;
}
