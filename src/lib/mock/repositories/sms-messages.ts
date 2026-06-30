/**
 * SmsMessage repository — CRUD + the mock send flow.
 *
 * sendSms creates a queued message, then transitions it through
 * sending → delivered via setTimeout so the UI can animate the lifecycle.
 */
import {
  createRepository,
  type Repository,
  readKey,
  writeKey,
} from "../create-repository";
import type { SmsMessage, SmsMessageCreate } from "@/schemas";
import { simulateLatency } from "../simulate-latency";

export const smsMessageRepo: Repository<SmsMessage> = createRepository<SmsMessage>(
  "rentflow:smsMessages",
  []
);

/** Generate a new unique ID (mirrors createRepository's internal newId). */
function newId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `id-${Math.random().toString(36).slice(2)}-${Date.now()}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

/**
 * Send an SMS — creates a queued message, then animates through the state machine.
 * Returns the created message immediately (queued).
 * The transitions happen via setTimeout and invalidate via a custom event.
 *
 * @param input The message create payload (status override is ignored).
 * @returns The created SmsMessage (status: "queued").
 */
export async function sendSms(
  input: Omit<SmsMessageCreate, "status" | "deliveredAt">
): Promise<SmsMessage> {
  await simulateLatency(100, 300);

  const now = nowIso();
  const msg: SmsMessage = {
    ...input,
    status: "queued",
    deliveredAt: null,
    relatedId: input.relatedId ?? null,
    id: newId(),
    createdAt: now,
    updatedAt: now,
  };

  // Persist
  const all = readKey<SmsMessage[]>("rentflow:smsMessages", []);
  all.push(msg);
  writeKey("rentflow:smsMessages", all);

  // Async state machine (mock delivery simulation)
  // Uses window events to signal query invalidation
  setTimeout(() => {
    const items = readKey<SmsMessage[]>("rentflow:smsMessages", []);
    const idx = items.findIndex((m) => m.id === msg.id);
    if (idx === -1) return;
    items[idx] = { ...items[idx]!, status: "sending", updatedAt: nowIso() };
    writeKey("rentflow:smsMessages", items);
    window.dispatchEvent(new CustomEvent("rentflow:sms-status-changed"));

    setTimeout(() => {
      const items2 = readKey<SmsMessage[]>("rentflow:smsMessages", []);
      const idx2 = items2.findIndex((m) => m.id === msg.id);
      if (idx2 === -1) return;
      items2[idx2] = {
        ...items2[idx2]!,
        status: "delivered",
        deliveredAt: nowIso(),
        updatedAt: nowIso(),
      };
      writeKey("rentflow:smsMessages", items2);
      window.dispatchEvent(new CustomEvent("rentflow:sms-status-changed"));
    }, 700);
  }, 600);

  return msg;
}

/** Get all SMS messages for a tenant. */
export function getSmsByTenant(tenantId: string): SmsMessage[] {
  const all = readKey<SmsMessage[]>("rentflow:smsMessages", []);
  return all.filter((m) => m.tenantId === tenantId);
}
