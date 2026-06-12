import type { Tenant, Lease, Office } from "@/schemas";
import {
  mulberry32,
  SEED,
  pick,
  intBetween,
  round2,
  uuid,
  isoFromDate,
  dateMinusDays,
  dateMinusMonths,
  datePlusMonths,
  datePlusDays,
  ymKey,
} from "./random";
import { COMPANIES, FIRST_NAMES, LAST_NAMES } from "./data-pools";

/**
 * Generate tenants + leases.
 * 40 tenants. ~40 leases (some tenants have one lease, some historic).
 * Lease statuses are derived from end date: active / expiring (≤60d) / expired / terminated.
 */
export function generateTenantsAndLeases(offices: Office[]) {
  const rand = mulberry32(SEED + 1);
  const now = new Date();

  const occupiedOffices = offices.filter((o) => o.status === "occupied");
  // Pick 40 offices to lease (some offices double-lease over time → historic leases)
  const targetLeaseCount = 40;
  const tenants: Tenant[] = [];
  const leases: Lease[] = [];

  for (let i = 0; i < targetLeaseCount; i++) {
    const office = occupiedOffices[i % occupiedOffices.length]!;
    const firstName = pick(rand, FIRST_NAMES);
    const lastName = pick(rand, LAST_NAMES);
    const fullName = `${firstName} ${lastName}`;
    const hasCompany = rand() < 0.65;
    const company = hasCompany ? pick(rand, COMPANIES) : "";
    const phone = `+251 9${intBetween(rand, 10, 99)} ${intBetween(rand, 100, 999)} ${intBetween(rand, 1000, 9999)}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${(company || "personal").toLowerCase().replace(/[^a-z]/g, "")}.et`;
    const moveInDays = intBetween(rand, 60, 1200);

    const tenant: Tenant = {
      id: uuid(),
      fullName,
      company,
      phone,
      email,
      avatarSeed: fullName,
      status: rand() < 0.92 ? "active" : "inactive",
      moveInDate: isoFromDate(dateMinusDays(now, moveInDays)),
      notes: i % 7 === 0 ? "Reliable payer. Prefer 12-month renewals." : "",
      createdAt: isoFromDate(dateMinusDays(now, moveInDays - 5)),
      updatedAt: isoFromDate(dateMinusDays(now, intBetween(rand, 0, 60))),
    };
    tenants.push(tenant);

    // Lease: 6, 12, or 24 month term. Most end dates are 60-540 days in future/past.
    const termMonths = pick(rand, [6, 12, 12, 12, 24, 24, 36] as const);
    const startOffset = moveInDays;
    const startDate = dateMinusDays(now, startOffset);
    const endDate = datePlusMonths(startDate, termMonths);

    // Derive status
    const daysToEnd = Math.round((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    let status: Lease["status"];
    if (daysToEnd < 0) {
      status = "expired";
    } else if (daysToEnd <= 60) {
      status = "expiring";
    } else {
      status = "active";
    }
    // ~10% terminated manually
    if (rand() < 0.08 && status !== "expired") {
      status = "terminated";
    }

    const monthlyRent = office.monthlyRate;
    const deposit = monthlyRent * pick(rand, [2, 2, 3, 3, 4] as const);

    const lease: Lease = {
      id: uuid(),
      tenantId: tenant.id,
      officeId: office.id,
      startDate: isoFromDate(startDate),
      endDate: isoFromDate(endDate),
      monthlyRent,
      depositAmount: round2(deposit),
      status,
      notes: i % 5 === 0 ? "Tenant requested option to renew early." : "",
      createdAt: isoFromDate(startDate),
      updatedAt: isoFromDate(dateMinusDays(now, intBetween(rand, 0, 30))),
    };
    leases.push(lease);

    // A handful of tenants have a SECOND (historic) lease → total leases > tenants.
    if (i % 5 === 0 && occupiedOffices.length > i + 1) {
      const historicOffice = occupiedOffices[(i + 7) % occupiedOffices.length]!;
      const histStart = dateMinusMonths(now, intBetween(rand, 18, 36));
      const histEnd = datePlusMonths(histStart, 12);
      leases.push({
        id: uuid(),
        tenantId: tenant.id,
        officeId: historicOffice.id,
        startDate: isoFromDate(histStart),
        endDate: isoFromDate(histEnd),
        monthlyRent: historicOffice.monthlyRate,
        depositAmount: round2(historicOffice.monthlyRate * 2),
        status: "expired",
        notes: "Previous lease",
        createdAt: isoFromDate(histStart),
        updatedAt: isoFromDate(histEnd),
      });
    }
  }

  return { tenants, leases };
}

/**
 * Yields a YYYY-MM string for N months back through "now" inclusive.
 */
export function last12Months(): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push(ymKey(d));
  }
  return out;
}

export { datePlusDays, datePlusMonths, dateMinusMonths, dateMinusDays, intBetween };
