import { readKey, writeKey } from "../create-repository";
import { simulateLatency } from "../simulate-latency";
import type { OrgSettings } from "@/schemas";

/**
 * OrgSettings is a singleton record, so the generic Repository pattern
 * doesn't apply. We expose a small singleton-shaped API instead.
 */
export const orgSettingsRepo = {
  async getSingleton(): Promise<OrgSettings> {
    await simulateLatency(80, 200);
    const all = readKey<OrgSettings[]>("rentflow:orgSettings", []);
    if (all.length > 0) return all[0]!;
    // First-boot fallback (seed-client should have populated this)
    const fallback: OrgSettings = {
      id: "singleton",
      orgName: "RentFlow",
      logoSeed: "rentflow",
      currency: "ETB",
      vatRate: 0.15,
      adminName: "Admin",
      adminEmail: "admin@rentflow.et",
      address: "",
      phone: "",
      updatedAt: new Date().toISOString(),
    };
    writeKey("rentflow:orgSettings", [fallback]);
    return fallback;
  },
  async updateSingleton(patch: Partial<Omit<OrgSettings, "id" | "updatedAt">>): Promise<OrgSettings> {
    await simulateLatency();
    const all = readKey<OrgSettings[]>("rentflow:orgSettings", []);
    const current = all[0] ?? (await this.getSingleton());
    const updated: OrgSettings = {
      ...current,
      ...patch,
      id: "singleton",
      currency: "ETB",
      updatedAt: new Date().toISOString(),
    };
    writeKey("rentflow:orgSettings", [updated]);
    return updated;
  },
};
