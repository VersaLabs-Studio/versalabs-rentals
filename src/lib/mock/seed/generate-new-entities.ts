/**
 * Seed generators for SMS messages and utility bills (RentFlow v2).
 */
import type {
  SmsMessage,
  UtilityBill,
  Lease,
  Tenant,
  Office,
} from "@/schemas";
import {
  mulberry32,
  SEED,
  pick,
  intBetween,
  round2,
  uuid,
  isoFromDate,
  dateMinusDays,
  datePlusDays,
  ymKey,
  ymToDateWithDay,
} from "./random";

/**
 * Generate ~12 SMS messages (mixed contexts, mostly delivered, 1–2 queued).
 */
export function generateSmsMessages(
  tenants: { id: string; fullName: string; phone: string }[],
  leases: Lease[]
): SmsMessage[] {
  const rand = mulberry32(SEED + 6);
  const now = new Date();
  const messages: SmsMessage[] = [];
  const contexts: SmsMessage["context"][] = ["lease_expiry", "invoice_due", "utility_bill", "manual"];

  for (let i = 0; i < 12; i++) {
    const tenant = pick(rand, tenants);
    const lease = leases.find((l) => l.tenantId === tenant.id) ?? pick(rand, leases);
    const context = pick(rand, contexts);
    const daysAgo = intBetween(rand, 0, 30);

    // Status: 1 queued, 1 sending, rest delivered
    let status: SmsMessage["status"];
    let deliveredAt: string | null = null;
    if (i === 0) {
      status = "queued";
    } else if (i === 1) {
      status = "sending";
    } else {
      status = "delivered";
      deliveredAt = isoFromDate(dateMinusDays(now, intBetween(rand, 0, daysAgo)));
    }

    const body = `Mock SMS: ${context.replace(/_/g, " ")} notification for ${tenant.fullName} (seed #${i + 1}).`;

    messages.push({
      id: uuid(),
      tenantId: tenant.id,
      recipientName: tenant.fullName,
      phone: tenant.phone,
      context,
      relatedId: lease?.id ?? null,
      body,
      status,
      deliveredAt,
      createdAt: isoFromDate(dateMinusDays(now, daysAgo)),
      updatedAt: isoFromDate(dateMinusDays(now, intBetween(rand, 0, daysAgo))),
    });
  }

  return messages;
}

/**
 * Generate ~20 utility bills across leases (water + electricity, mixed statuses).
 */
export function generateUtilityBills(
  leases: Lease[],
  tenants: { id: string }[],
  offices: Office[]
): UtilityBill[] {
  const rand = mulberry32(SEED + 7);
  const now = new Date();
  const bills: UtilityBill[] = [];
  const months = last6Months();

  const activeLeases = leases.filter((l) => l.status === "active" || l.status === "expiring");

  for (let i = 0; i < 20; i++) {
    const lease = activeLeases[i % activeLeases.length]!;
    const tenant = tenants.find((t) => t.id === lease.tenantId) ?? tenants[0]!;
    const office = offices.find((o) => o.id === lease.officeId) ?? offices[0]!;
    const type: UtilityBill["type"] = i % 2 === 0 ? "water" : "electricity";
    const period = pick(rand, months);
    const daysAgo = intBetween(rand, 10, 90);

    const meterPrev = type === "water" ? intBetween(rand, 500, 2000) : intBetween(rand, 3000, 8000);
    const meterCurr = meterPrev + intBetween(rand, 20, 300);

    // Status distribution
    const r = rand();
    let status: UtilityBill["status"];
    let paidDate: string | null = null;
    if (r < 0.55) {
      status = "paid";
      paidDate = isoFromDate(dateMinusDays(now, intBetween(rand, 0, daysAgo)));
    } else if (r < 0.8) {
      status = "requested";
    } else {
      status = "overdue";
    }

    const amount = round2(type === "water" ? intBetween(rand, 500, 4000) : intBetween(rand, 1000, 8000));
    const dueDate = ymToDateWithDay(period, 15);

    bills.push({
      id: uuid(),
      leaseId: lease.id,
      tenantId: tenant.id,
      officeId: office.id,
      type,
      periodMonth: period,
      meterPrev,
      meterCurr,
      amount,
      dueDate: isoFromDate(dueDate),
      status,
      requestedAt: isoFromDate(dateMinusDays(now, daysAgo)),
      paidDate,
      createdAt: isoFromDate(dateMinusDays(now, daysAgo)),
      updatedAt: isoFromDate(dateMinusDays(now, intBetween(rand, 0, daysAgo))),
    });
  }

  return bills;
}

function last6Months(): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push(ymKey(d));
  }
  return out;
}
