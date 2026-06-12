import type {
  Invoice,
  MaintenanceRequest,
  Notification,
  Office,
  Payment,
  Lease,
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
} from "./random";

/**
 * Generate 30 invoices, 20 maintenance requests, 30 notifications.
 */
export function generateInvoices(
  tenants: { id: string; fullName: string; company: string }[],
  leases: Lease[]
): Invoice[] {
  const rand = mulberry32(SEED + 3);
  const now = new Date();
  const invoices: Invoice[] = [];

  const activeLeases = leases.filter((l) => l.status === "active" || l.status === "expiring");

  for (let i = 0; i < 30; i++) {
    const lease = activeLeases[i % activeLeases.length]!;
    const tenant = tenants.find((t) => t.id === lease.tenantId)!;
    const issueDays = intBetween(rand, 0, 240);
    const issueDate = dateMinusDays(now, issueDays);
    const dueDate = datePlusDays(issueDate, 14);

    const lineItems: Invoice["lineItems"] = [
      { description: `Office rent — ${new Date(issueDate).toLocaleString("en-US", { month: "long", year: "numeric" })}`, amount: lease.monthlyRent },
    ];
    if (rand() < 0.4) {
      lineItems.push({ description: "Service charge", amount: round2(lease.monthlyRent * 0.1) });
    }
    if (rand() < 0.25) {
      lineItems.push({ description: "Parking (1 slot)", amount: 1500 });
    }
    const subtotal = round2(lineItems.reduce((s, l) => s + l.amount, 0));
    const vat = round2(subtotal * 0.15);
    const total = round2(subtotal + vat);

    const status: Invoice["status"] = dueDate.getTime() < now.getTime() && rand() < 0.6 ? "paid" : rand() < 0.7 ? "unpaid" : "paid";

    const year = issueDate.getFullYear();
    const number = `INV-${year}-${String(i + 1).padStart(4, "0")}`;

    invoices.push({
      id: uuid(),
      invoiceNumber: number,
      tenantId: lease.tenantId,
      leaseId: lease.id,
      issueDate: isoFromDate(issueDate),
      dueDate: isoFromDate(dueDate),
      lineItems,
      subtotal,
      vat,
      total,
      status,
      notes: i % 6 === 0 ? "Please reference the invoice number on your transfer." : "",
      createdAt: isoFromDate(issueDate),
      updatedAt: isoFromDate(issueDate),
    });
  }

  return invoices;
}

const MAINTENANCE_TITLES = [
  "Air conditioning not cooling",
  "Water leak in restroom",
  "Elevator making unusual noise",
  "Door lock replacement",
  "Network cabling issue",
  "Light fixture flickering",
  "Window seal damaged",
  "Carpet stain cleaning",
  "Paint touch-up in reception",
  "Pest control needed",
  "Fire alarm test",
  "Generator fuel refill",
  "Intercom not working",
  "Heating system check",
  "Broken window blind",
  "Conference room projector",
  "Roof leak after rain",
  "Power outlet not working",
  "CCTV camera offline",
  "Bathroom faucet dripping",
];

const MAINTENANCE_DESCRIPTIONS = [
  "Tenant reported the issue this morning. Please prioritize.",
  "Affects daily operations. Need a quote before proceeding.",
  "Happens intermittently. Hard to reproduce on site.",
  "Has been an issue for a few days. Quick fix preferred.",
  "Replacement part needs to be ordered.",
  "First-time report. No prior history.",
  "Escalated from building manager.",
  "Tenant is on a monthly lease. Must resolve quickly.",
];

export function generateMaintenanceRequests(
  offices: Office[],
  tenants: { id: string; fullName: string }[]
): MaintenanceRequest[] {
  const rand = mulberry32(SEED + 4);
  const now = new Date();
  const requests: MaintenanceRequest[] = [];

  for (let i = 0; i < 20; i++) {
    const office = pick(rand, offices);
    const tenant = tenants[i % tenants.length]!;
    const daysAgo = intBetween(rand, 0, 90);
    const created = dateMinusDays(now, daysAgo);
    const r = rand();
    const status: MaintenanceRequest["status"] = r < 0.35 ? "open" : r < 0.7 ? "in_progress" : "resolved";

    requests.push({
      id: uuid(),
      officeId: office.id,
      tenantId: tenant.id,
      title: pick(rand, MAINTENANCE_TITLES),
      description: pick(rand, MAINTENANCE_DESCRIPTIONS),
      priority: pick(rand, ["low", "medium", "medium", "medium", "high", "high"] as const),
      status,
      createdAt: isoFromDate(created),
      updatedAt: isoFromDate(created),
    });
  }
  return requests;
}

export function generateNotifications(
  leases: Lease[],
  payments: Payment[]
): Notification[] {
  const rand = mulberry32(SEED + 5);
  const now = new Date();
  const items: Notification[] = [];

  // Expiring leases
  for (const lease of leases) {
    if (lease.status === "expiring") {
      const days = intBetween(rand, 1, 30);
      items.push({
        id: uuid(),
        type: "lease_expiring",
        title: "Lease expiring soon",
        message: `Lease ending on ${new Date(lease.endDate).toDateString()} — consider sending a renewal offer.`,
        date: isoFromDate(dateMinusDays(now, days)),
        read: rand() < 0.3,
        link: `/leases/${lease.id}`,
        createdAt: isoFromDate(dateMinusDays(now, days)),
        updatedAt: isoFromDate(dateMinusDays(now, days)),
      });
      if (items.length >= 20) break;
    }
  }

  // Overdue payments
  for (const payment of payments) {
    if (payment.status === "overdue" && items.length < 30) {
      const tenantId = payment.tenantId;
      items.push({
        id: uuid(),
        type: "payment_overdue",
        title: "Overdue payment",
        message: `Payment of ETB ${payment.amount.toLocaleString()} for ${payment.periodMonth} is past due.`,
        date: isoFromDate(dateMinusDays(now, intBetween(rand, 0, 20))),
        read: rand() < 0.4,
        link: `/payments`,
        createdAt: isoFromDate(dateMinusDays(now, intBetween(rand, 0, 20))),
        updatedAt: isoFromDate(dateMinusDays(now, intBetween(rand, 0, 20))),
      });
    }
  }

  // System
  const systemMessages = [
    { title: "Welcome to RentFlow", message: "Your demo workspace is ready. All data is stored locally." },
    { title: "Monthly close", message: "Reminder: review overdue payments and expiring leases." },
    { title: "Tip", message: "Use the Reports page to see revenue trends and occupancy by building." },
  ];
  for (const s of systemMessages) {
    items.push({
      id: uuid(),
      type: "system",
      title: s.title,
      message: s.message,
      date: isoFromDate(dateMinusDays(now, intBetween(rand, 0, 14))),
      read: rand() < 0.5,
      link: "",
      createdAt: isoFromDate(dateMinusDays(now, intBetween(rand, 0, 14))),
      updatedAt: isoFromDate(dateMinusDays(now, intBetween(rand, 0, 14))),
    });
  }

  return items;
}
