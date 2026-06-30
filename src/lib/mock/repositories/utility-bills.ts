/**
 * UtilityBill repository — CRUD + lease-scoped queries.
 */
import {
  createRepository,
  type Repository,
  readKey,
} from "../create-repository";
import type { UtilityBill } from "@/schemas";

export const utilityBillRepo: Repository<UtilityBill> = createRepository<UtilityBill>(
  "rentflow:utilityBills",
  []
);

/** Get all utility bills for a specific lease. */
export function listByLease(leaseId: string): UtilityBill[] {
  const all = readKey<UtilityBill[]>("rentflow:utilityBills", []);
  return all.filter((b) => b.leaseId === leaseId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
