/**
 * Seed client — populates all rentflow:* localStorage keys on first boot.
 * Subsequent boots skip seeding (the factory checks for null).
 */
import { readKey, writeKey } from "./create-repository";
import { buildSeed, type SeedPayload } from "./seed/seed-builder";

const SEED_VERSION_KEY = "rentflow:seed-version";
const CURRENT_SEED_VERSION = 2; // v2 — single-building + SMS + utilities

export function ensureSeeded(): void {
  if (typeof window === "undefined") return;
  const current = readKey<number | null>(SEED_VERSION_KEY, null);
  if (current === CURRENT_SEED_VERSION) return;

  const seed = buildSeed();
  writeKey("rentflow:orgSettings", [seed.orgSettings]);
  writeKey("rentflow:buildings", seed.buildings);
  writeKey("rentflow:floors", seed.floors);
  writeKey("rentflow:offices", seed.offices);
  writeKey("rentflow:tenants", seed.tenants);
  writeKey("rentflow:leases", seed.leases);
  writeKey("rentflow:payments", seed.payments);
  writeKey("rentflow:invoices", seed.invoices);
  writeKey("rentflow:maintenance", seed.maintenance);
  writeKey("rentflow:notifications", seed.notifications);
  writeKey("rentflow:smsMessages", seed.smsMessages);
  writeKey("rentflow:utilityBills", seed.utilityBills);
  writeKey(SEED_VERSION_KEY, CURRENT_SEED_VERSION);

  // Notify any listening queries to refetch
  window.dispatchEvent(new CustomEvent("rentflow:seed-updated"));
}

export function reseed(): void {
  if (typeof window === "undefined") return;
  // Wipe and rebuild
  for (let i = window.localStorage.length - 1; i >= 0; i--) {
    const k = window.localStorage.key(i);
    if (k && k.startsWith("rentflow:")) window.localStorage.removeItem(k);
  }
  ensureSeeded();
  window.location.reload();
}

export type { SeedPayload };
