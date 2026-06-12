import { createRepository, type Repository, readKey } from "../create-repository";
import type { Payment, PaymentStatus } from "@/schemas";
import type { Tenant } from "@/schemas";
import type { PaymentWithRelations, RevenuePoint } from "@/types";
import { ymKey } from "../seed/random";
import { formatMonth } from "@/lib/format";

export const paymentRepo: Repository<Payment> = createRepository<Payment>(
  "rentflow:payments",
  []
);

export function getPaymentsWithRelations(filters?: {
  search?: string;
  status?: PaymentStatus;
  tenantId?: string;
  leaseId?: string;
  periodMonth?: string;
}): PaymentWithRelations[] {
  const payments = readKey<Payment[]>("rentflow:payments", []);
  const tenants = readKey<Tenant[]>("rentflow:tenants", []);
  const tenantById = new Map(tenants.map((t) => [t.id, t]));

  let result: PaymentWithRelations[] = payments.map((p) => {
    const t = tenantById.get(p.tenantId);
    return {
      ...p,
      tenant: t
        ? { id: t.id, fullName: t.fullName, company: t.company }
        : { id: "", fullName: "Unknown", company: "" },
    };
  });

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (p) =>
        p.tenant.fullName.toLowerCase().includes(q) ||
        (p.tenant.company?.toLowerCase().includes(q) ?? false) ||
        p.reference.toLowerCase().includes(q)
    );
  }
  if (filters?.status) {
    result = result.filter((p) => p.status === filters.status);
  }
  if (filters?.tenantId) {
    result = result.filter((p) => p.tenantId === filters.tenantId);
  }
  if (filters?.leaseId) {
    result = result.filter((p) => p.leaseId === filters.leaseId);
  }
  if (filters?.periodMonth) {
    result = result.filter((p) => p.periodMonth === filters.periodMonth);
  }
  return result;
}

/** Aggregate revenue by month across the last 12 months. */
export function getRevenueByMonth(monthsBack = 12): RevenuePoint[] {
  const payments = readKey<Payment[]>("rentflow:payments", []);
  const now = new Date();
  const buckets: RevenuePoint[] = [];

  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const ym = ymKey(d);
    buckets.push({
      month: ym,
      monthLabel: formatMonth(d),
      revenue: 0,
      expected: 0,
      overdue: 0,
    });
  }

  for (const p of payments) {
    const idx = buckets.findIndex((b) => b.month === p.periodMonth);
    if (idx === -1) continue;
    buckets[idx]!.expected += p.amount;
    if (p.status === "paid" && p.paidDate) {
      buckets[idx]!.revenue += p.amount;
    }
    if (p.status === "overdue") {
      buckets[idx]!.overdue += p.amount;
    }
  }
  return buckets;
}
