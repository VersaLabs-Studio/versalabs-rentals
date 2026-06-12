import type {
  Tenant,
  Lease,
  Office,
  Building,
  Floor,
  Payment,
  Invoice,
  MaintenanceRequest,
  Notification,
} from "@/schemas";

/**
 * Derived / joined view types.
 * These are constructed at the repository layer; the UI consumes them.
 */

export type OfficeWithBuilding = Office & {
  building: Pick<Building, "id" | "name" | "district">;
  floor?: Pick<Floor, "id" | "level" | "label">;
};

export type OfficeWithRelations = OfficeWithBuilding & {
  activeLease?: Lease | null;
  tenant?: Pick<Tenant, "id" | "fullName" | "company" | "phone" | "email"> | null;
};

export type LeaseWithRelations = Lease & {
  tenant: Pick<Tenant, "id" | "fullName" | "company" | "phone" | "email" | "avatarSeed">;
  office: Pick<Office, "id" | "number"> & {
    building: Pick<Building, "id" | "name">;
  };
};

export type PaymentWithRelations = Payment & {
  tenant: Pick<Tenant, "id" | "fullName" | "company">;
};

export type TenantWithLeases = Tenant & {
  leases: LeaseWithRelations[];
  activeLease?: LeaseWithRelations | null;
};

export type InvoiceWithRelations = Invoice & {
  tenant: Pick<Tenant, "id" | "fullName" | "company" | "phone" | "email">;
};

export type MaintenanceWithRelations = MaintenanceRequest & {
  office?: Pick<Office, "id" | "number"> & {
    building: Pick<Building, "id" | "name">;
  };
  tenant?: Pick<Tenant, "id" | "fullName">;
};

export type BuildingWithStats = Building & {
  officeCount: number;
  occupiedCount: number;
  occupancyRate: number;
  monthlyRevenue: number;
};

/**
 * Dashboard aggregate metrics — all live-computed from the repos.
 */
export interface DashboardMetrics {
  totalBuildings: number;
  totalOffices: number;
  occupiedOffices: number;
  vacantOffices: number;
  maintenanceOffices: number;
  occupancyRate: number;
  activeTenants: number;
  activeLeases: number;
  expiringLeases: number;
  overduePayments: number;
  totalRevenueLast30: number;
  totalRevenueLast12mo: number;
  collectedThisMonth: number;
  expectedThisMonth: number;
  collectionRate: number;
}

export type RevenuePoint = {
  month: string; // YYYY-MM
  monthLabel: string; // "Jun 2026"
  revenue: number;
  expected: number;
  overdue: number;
};

export type OccupancyByBuilding = {
  buildingId: string;
  buildingName: string;
  total: number;
  occupied: number;
  vacant: number;
  rate: number; // 0..1
};
