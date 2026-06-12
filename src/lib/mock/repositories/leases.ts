import { createRepository, type Repository, readKey } from "../create-repository";
import type { Lease, LeaseStatus } from "@/schemas";
import type { Tenant, Office, Building } from "@/schemas";
import type { LeaseWithRelations } from "@/types";

export const leaseRepo: Repository<Lease> = createRepository<Lease>("rentflow:leases", []);

export function getLeasesWithRelations(filters?: {
  search?: string;
  status?: LeaseStatus;
  tenantId?: string;
  officeId?: string;
}): LeaseWithRelations[] {
  const leases = readKey<Lease[]>("rentflow:leases", []);
  const tenants = readKey<Tenant[]>("rentflow:tenants", []);
  const offices = readKey<Office[]>("rentflow:offices", []);
  const buildings = readKey<Building[]>("rentflow:buildings", []);

  const tenantById = new Map(tenants.map((t) => [t.id, t]));
  const officeById = new Map(offices.map((o) => [o.id, o]));
  const buildingById = new Map(buildings.map((b) => [b.id, b]));

  let result: LeaseWithRelations[] = leases.map((l) => {
    const t = tenantById.get(l.tenantId);
    const o = officeById.get(l.officeId);
    const b = o ? buildingById.get(o.buildingId) : undefined;
    return {
      ...l,
      tenant: t
        ? {
            id: t.id,
            fullName: t.fullName,
            company: t.company,
            phone: t.phone,
            email: t.email,
            avatarSeed: t.avatarSeed,
          }
        : {
            id: "",
            fullName: "Unknown",
            company: "",
            phone: "",
            email: "",
            avatarSeed: "unknown",
          },
      office: {
        id: o?.id ?? "",
        number: o?.number ?? "—",
        building: { id: b?.id ?? "", name: b?.name ?? "Unknown" },
      },
    };
  });

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (l) =>
        l.tenant.fullName.toLowerCase().includes(q) ||
        (l.tenant.company?.toLowerCase().includes(q) ?? false) ||
        l.office.number.toLowerCase().includes(q) ||
        l.office.building.name.toLowerCase().includes(q)
    );
  }
  if (filters?.status) {
    result = result.filter((l) => l.status === filters.status);
  }
  if (filters?.tenantId) {
    result = result.filter((l) => l.tenantId === filters.tenantId);
  }
  if (filters?.officeId) {
    result = result.filter((l) => l.officeId === filters.officeId);
  }

  return result;
}
