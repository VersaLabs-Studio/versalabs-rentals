import { createRepository, type Repository, readKey } from "../create-repository";
import type { Invoice } from "@/schemas";
import type { Tenant } from "@/schemas";
import type { InvoiceWithRelations } from "@/types";

export const invoiceRepo: Repository<Invoice> = createRepository<Invoice>(
  "rentflow:invoices",
  []
);

export function getInvoicesWithRelations(filters?: {
  search?: string;
  status?: "paid" | "unpaid";
  tenantId?: string;
}): InvoiceWithRelations[] {
  const invoices = readKey<Invoice[]>("rentflow:invoices", []);
  const tenants = readKey<Tenant[]>("rentflow:tenants", []);
  const tenantById = new Map(tenants.map((t) => [t.id, t]));

  let result: InvoiceWithRelations[] = invoices.map((inv) => {
    const t = tenantById.get(inv.tenantId);
    return {
      ...inv,
      tenant: t
        ? {
            id: t.id,
            fullName: t.fullName,
            company: t.company,
            phone: t.phone,
            email: t.email,
          }
        : { id: "", fullName: "Unknown", company: "", phone: "", email: "" },
    };
  });

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (i) =>
        i.invoiceNumber.toLowerCase().includes(q) ||
        i.tenant.fullName.toLowerCase().includes(q) ||
        (i.tenant.company?.toLowerCase().includes(q) ?? false)
    );
  }
  if (filters?.status) {
    result = result.filter((i) => i.status === filters.status);
  }
  if (filters?.tenantId) {
    result = result.filter((i) => i.tenantId === filters.tenantId);
  }
  return result;
}

/** Generate next invoice number based on existing list. */
export function nextInvoiceNumber(): string {
  const invoices = readKey<Invoice[]>("rentflow:invoices", []);
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;
  const numbers = invoices
    .map((i) => i.invoiceNumber)
    .filter((n) => n.startsWith(prefix))
    .map((n) => parseInt(n.slice(prefix.length), 10))
    .filter((n) => !Number.isNaN(n));
  const next = (numbers.length ? Math.max(...numbers) : 0) + 1;
  return `${prefix}${String(next).padStart(4, "0")}`;
}
