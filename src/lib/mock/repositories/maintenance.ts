import { createRepository, type Repository, readKey } from "../create-repository";
import type { MaintenanceRequest } from "@/schemas";
import type { Office, Building, Tenant } from "@/schemas";
import type { MaintenanceWithRelations } from "@/types";

export const maintenanceRepo: Repository<MaintenanceRequest> = createRepository<MaintenanceRequest>(
  "rentflow:maintenance",
  []
);

export function getMaintenanceWithRelations(filters?: {
  search?: string;
  status?: "open" | "in_progress" | "resolved";
  priority?: "low" | "medium" | "high";
}): MaintenanceWithRelations[] {
  const requests = readKey<MaintenanceRequest[]>("rentflow:maintenance", []);
  const offices = readKey<Office[]>("rentflow:offices", []);
  const buildings = readKey<Building[]>("rentflow:buildings", []);
  const tenants = readKey<Tenant[]>("rentflow:tenants", []);

  const officeById = new Map(offices.map((o) => [o.id, o]));
  const buildingById = new Map(buildings.map((b) => [b.id, b]));
  const tenantById = new Map(tenants.map((t) => [t.id, t]));

  let result: MaintenanceWithRelations[] = requests
    .map((r) => {
      const o = officeById.get(r.officeId);
      const b = o ? buildingById.get(o.buildingId) : undefined;
      const t = r.tenantId ? tenantById.get(r.tenantId) : undefined;
      return {
        ...r,
        office: o
          ? {
              id: o.id,
              number: o.number,
              building: { id: b?.id ?? "", name: b?.name ?? "Unknown" },
            }
          : undefined,
        tenant: t ? { id: t.id, fullName: t.fullName } : undefined,
      };
    })
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        (r.office?.number.toLowerCase().includes(q) ?? false) ||
        (r.office?.building.name.toLowerCase().includes(q) ?? false)
    );
  }
  if (filters?.status) {
    result = result.filter((r) => r.status === filters.status);
  }
  if (filters?.priority) {
    result = result.filter((r) => r.priority === filters.priority);
  }
  return result;
}
