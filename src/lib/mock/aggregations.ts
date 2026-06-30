/**
 * Aggregations: dashboard metrics + occupancy by building.
 */
import { readKey } from "./create-repository";
import type { Building, Office, Lease, Payment, Tenant, Floor } from "@/schemas";
import type { DashboardMetrics, OccupancyByBuilding, OccupancyByFloor } from "@/types";
import { parseISO, isValid, differenceInDays, startOfMonth, endOfMonth } from "date-fns";
import { ymKey } from "./seed/random";

export function getDashboardMetrics(): DashboardMetrics {
  const buildings = readKey<Building[]>("rentflow:buildings", []);
  const offices = readKey<Office[]>("rentflow:offices", []);
  const leases = readKey<Lease[]>("rentflow:leases", []);
  const tenants = readKey<Tenant[]>("rentflow:tenants", []);
  const payments = readKey<Payment[]>("rentflow:payments", []);

  const now = new Date();
  const totalOffices = offices.length;
  const occupiedOffices = offices.filter((o) => o.status === "occupied").length;
  const vacantOffices = offices.filter((o) => o.status === "vacant").length;
  const maintenanceOffices = offices.filter((o) => o.status === "maintenance").length;
  const occupancyRate = totalOffices === 0 ? 0 : occupiedOffices / totalOffices;
  const activeTenants = tenants.filter((t) => t.status === "active").length;

  // Recompute lease status from dates (in case seed dates drift with system clock)
  const activeLeases = leases.filter((l) => {
    const end = parseISO(l.endDate);
    if (!isValid(end)) return false;
    if (l.status === "terminated") return false;
    const days = differenceInDays(end, now);
    if (days < 0) return false;
    return true;
  });
  const expiringLeases = activeLeases.filter((l) => {
    const end = parseISO(l.endDate);
    return isValid(end) && differenceInDays(end, now) <= 60;
  });

  const overduePayments = payments.filter((p) => p.status === "overdue").length;

  const last30Start = new Date(now);
  last30Start.setDate(last30Start.getDate() - 30);
  const totalRevenueLast30 = payments
    .filter((p) => p.status === "paid" && p.paidDate && parseISO(p.paidDate) >= last30Start)
    .reduce((sum, p) => sum + p.amount, 0);

  // Last 12 months revenue
  const twelveMoStart = new Date(now.getFullYear(), now.getMonth() - 11, 1);
  const totalRevenueLast12mo = payments
    .filter((p) => p.status === "paid" && p.paidDate && parseISO(p.paidDate) >= twelveMoStart)
    .reduce((sum, p) => sum + p.amount, 0);

  // This month
  const thisMonth = ymKey(now);
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const monthPayments = payments.filter((p) => p.periodMonth === thisMonth);
  const collectedThisMonth = monthPayments
    .filter((p) => p.status === "paid" && p.paidDate)
    .reduce((sum, p) => sum + p.amount, 0);
  const expectedThisMonth = monthPayments.reduce((sum, p) => sum + p.amount, 0);
  const collectionRate = expectedThisMonth === 0 ? 0 : collectedThisMonth / expectedThisMonth;

  return {
    totalBuildings: buildings.length,
    totalOffices,
    occupiedOffices,
    vacantOffices,
    maintenanceOffices,
    occupancyRate,
    activeTenants,
    activeLeases: activeLeases.length,
    expiringLeases: expiringLeases.length,
    overduePayments,
    totalRevenueLast30,
    totalRevenueLast12mo,
    collectedThisMonth,
    expectedThisMonth,
    collectionRate,
  };
}

export function getOccupancyByBuilding(): OccupancyByBuilding[] {
  const buildings = readKey<Building[]>("rentflow:buildings", []);
  const offices = readKey<Office[]>("rentflow:offices", []);
  return buildings.map((b) => {
    const own = offices.filter((o) => o.buildingId === b.id);
    const occupied = own.filter((o) => o.status === "occupied").length;
    const vacant = own.filter((o) => o.status === "vacant").length;
    return {
      buildingId: b.id,
      buildingName: b.name,
      total: own.length,
      occupied,
      vacant,
      rate: own.length === 0 ? 0 : occupied / own.length,
    };
  });
}

/** Occupancy by floor (for the single-building dashboard). */
export function getOccupancyByFloor(): OccupancyByFloor[] {
  const floors = readKey<Floor[]>("rentflow:floors", []);
  const offices = readKey<Office[]>("rentflow:offices", []);
  return floors.map((f) => {
    const own = offices.filter((o) => o.floorId === f.id);
    const occupied = own.filter((o) => o.status === "occupied").length;
    const vacant = own.filter((o) => o.status === "vacant").length;
    return {
      floorId: f.id,
      floorLabel: f.label,
      total: own.length,
      occupied,
      vacant,
      rate: own.length === 0 ? 0 : occupied / own.length,
    };
  });
}
