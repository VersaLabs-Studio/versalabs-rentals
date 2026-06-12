import { createRepository, type Repository, readKey } from "../create-repository";
import type { Tenant } from "@/schemas";
import type { Building, Floor, Office, Lease } from "@/schemas";
import type { TenantWithLeases, LeaseWithRelations } from "@/types";

export const tenantRepo: Repository<Tenant> = createRepository<Tenant>(
  "rentflow:tenants",
  []
);

/** Tenants joined with all their leases (and the related office/building). */
export function getTenantsWithLeases(filters?: {
  search?: string;
  status?: "active" | "inactive";
}): TenantWithLeases[] {
  const tenants = readKey<Tenant[]>("rentflow:tenants", []);
  const leases = readKey<Lease[]>("rentflow:leases", []);
  const offices = readKey<Office[]>("rentflow:offices", []);
  const buildings = readKey<Building[]>("rentflow:buildings", []);
  const floors = readKey<Floor[]>("rentflow:floors", []);

  const officeById = new Map(offices.map((o) => [o.id, o]));
  const buildingById = new Map(buildings.map((b) => [b.id, b]));

  let result: TenantWithLeases[] = tenants.map((t) => {
    const tenantLeases: LeaseWithRelations[] = leases
      .filter((l) => l.tenantId === t.id)
      .map((l) => {
        const office = officeById.get(l.officeId);
        const building = office ? buildingById.get(office.buildingId) : undefined;
        return {
          ...l,
          tenant: {
            id: t.id,
            fullName: t.fullName,
            company: t.company,
            phone: t.phone,
            email: t.email,
            avatarSeed: t.avatarSeed,
          },
          office: {
            id: office?.id ?? "",
            number: office?.number ?? "—",
            building: {
              id: building?.id ?? "",
              name: building?.name ?? "Unknown",
            },
          },
        };
      });
    const activeLease =
      tenantLeases.find((l) => l.status === "active" || l.status === "expiring") ?? null;
    return { ...t, leases: tenantLeases, activeLease };
  });

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (t) =>
        t.fullName.toLowerCase().includes(q) ||
        (t.company?.toLowerCase().includes(q) ?? false) ||
        t.email.toLowerCase().includes(q) ||
        t.phone.includes(q)
    );
  }
  if (filters?.status) {
    result = result.filter((t) => t.status === filters.status);
  }
  return result;
}

export function getTenantWithLeases(id: string): TenantWithLeases | null {
  return getTenantsWithLeases().find((t) => t.id === id) ?? null;
}
