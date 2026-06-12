import type {
  Building,
  Floor,
  Office,
  Tenant,
  Lease,
  Payment,
  Invoice,
  MaintenanceRequest,
  Notification,
  OrgSettings,
} from "@/schemas";
import { generateBase } from "./generate-base";
import { generateTenantsAndLeases } from "./generate-tenants";
import { generatePayments } from "./generate-payments";
import { generateInvoices, generateMaintenanceRequests, generateNotifications } from "./generate-extras";

/**
 * Single entry point that returns every entity's seed payload.
 * Called once by seedClient on first boot.
 */
export interface SeedPayload {
  orgSettings: OrgSettings;
  buildings: Building[];
  floors: Floor[];
  offices: Office[];
  tenants: Tenant[];
  leases: Lease[];
  payments: Payment[];
  invoices: Invoice[];
  maintenance: MaintenanceRequest[];
  notifications: Notification[];
}

export function buildSeed(): SeedPayload {
  const base = generateBase();
  const { tenants, leases } = generateTenantsAndLeases(base.offices);
  const payments = generatePayments(leases);
  const invoices = generateInvoices(tenants, leases);
  const maintenance = generateMaintenanceRequests(base.offices, tenants);
  const notifications = generateNotifications(leases, payments);

  return {
    orgSettings: base.orgSettings,
    buildings: base.buildings,
    floors: base.floors,
    offices: base.offices,
    tenants,
    leases,
    payments,
    invoices,
    maintenance,
    notifications,
  };
}
