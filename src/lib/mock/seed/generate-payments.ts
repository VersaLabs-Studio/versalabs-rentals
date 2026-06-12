import type { Payment, Lease, PaymentMethod } from "@/schemas";
import {
  mulberry32,
  SEED,
  pick,
  intBetween,
  round2,
  uuid,
  isoFromDate,
  ymToDate,
  ymToDateWithDay,
  ymKey,
} from "./random";
import { last12Months } from "./generate-tenants";

const METHODS: PaymentMethod[] = ["cash", "bank", "telebirr"];

/**
 * Generate ~240 payments across the last 12 months.
 * - Each active lease gets billed monthly.
 * - 75% paid, 18% pending, 7% overdue (realistic-ish).
 * - Older months lean more "paid"; recent months have a realistic mix.
 */
export function generatePayments(leases: Lease[]): Payment[] {
  const rand = mulberry32(SEED + 2);
  const now = new Date();
  const months = last12Months();
  const payments: Payment[] = [];

  const activeLeases = leases.filter((l) => l.status === "active" || l.status === "expiring");

  for (const lease of activeLeases) {
    const leaseStart = new Date(lease.startDate);
    for (const ym of months) {
      const monthDate = ymToDate(ym);
      if (monthDate < new Date(leaseStart.getFullYear(), leaseStart.getMonth(), 1)) continue;
      if (monthDate > now) continue;

      const isCurrent = ym === ymKey(now);
      const isPast = monthDate < new Date(now.getFullYear(), now.getMonth(), 1);

      // Status distribution
      const r = rand();
      let status: Payment["status"];
      if (isCurrent) {
        // Current month: 55% paid, 35% pending, 10% overdue
        status = r < 0.55 ? "paid" : r < 0.9 ? "pending" : "overdue";
      } else if (isPast) {
        // Past months: 82% paid, 12% pending, 6% overdue
        status = r < 0.82 ? "paid" : r < 0.94 ? "pending" : "overdue";
      } else {
        status = "pending";
      }

      const dueDate = ymToDateWithDay(ym, 5);
      let paidDate: string | null = null;
      if (status === "paid") {
        // Paid within 1–15 days of due date
        const paid = new Date(dueDate);
        paid.setDate(paid.getDate() + intBetween(rand, -2, 15));
        paidDate = isoFromDate(paid);
      }

      const method: PaymentMethod = pick(rand, METHODS);
      const ref =
        status === "paid"
          ? method === "cash"
            ? `CSH-${intBetween(rand, 10000, 99999)}`
            : method === "bank"
            ? `TRF-${intBetween(rand, 100000, 999999)}`
            : `TB-${intBetween(rand, 1000000, 9999999)}`
          : "";

      // Occasional slight variation in amount (utilities, adjustments)
      const variance = rand() < 0.15 ? intBetween(rand, -200, 500) : 0;

      payments.push({
        id: uuid(),
        leaseId: lease.id,
        tenantId: lease.tenantId,
        periodMonth: ym,
        amount: round2(lease.monthlyRent + variance),
        dueDate: isoFromDate(dueDate),
        paidDate,
        method,
        status,
        reference: ref,
        createdAt: isoFromDate(dueDate),
        updatedAt: paidDate ?? isoFromDate(dueDate),
      });
    }
  }

  return payments;
}
