/**
 * Deterministic PRNG (mulberry32) and helper utilities.
 * Using a fixed seed means the demo data is the same on every fresh boot
 * (only changes after the user explicitly edits something).
 */

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const SEED = 0xC0FFEE; // constant — keep demo data stable

export function pick<T>(rand: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rand() * arr.length)]!;
}

export function pickN<T>(rand: () => number, arr: readonly T[], n: number): T[] {
  const copy = [...arr];
  const out: T[] = [];
  for (let i = 0; i < n && copy.length; i++) {
    const idx = Math.floor(rand() * copy.length);
    out.push(copy.splice(idx, 1)[0]!);
  }
  return out;
}

export function intBetween(rand: () => number, min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}

export function floatBetween(rand: () => number, min: number, max: number): number {
  return rand() * (max - min) + min;
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function uuid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `id-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
}

export function isoFromDate(d: Date): string {
  return d.toISOString();
}

export function dateMinusDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() - days);
  return d;
}

export function dateMinusMonths(base: Date, months: number): Date {
  const d = new Date(base);
  d.setMonth(d.getMonth() - months);
  return d;
}

export function datePlusDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

export function datePlusMonths(base: Date, months: number): Date {
  const d = new Date(base);
  d.setMonth(d.getMonth() + months);
  return d;
}

export function ymKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

/**
 * Convert YYYY-MM → Date(1st of that month).
 */
export function ymToDate(ym: string): Date {
  const [y, m] = ym.split("-").map(Number);
  return new Date(y!, m! - 1, 1);
}

/**
 * Convert YYYY-MM + day → Date (capped at 28 to avoid month-end overflow).
 */
export function ymToDateWithDay(ym: string, day: number): Date {
  const [y, m] = ym.split("-").map(Number);
  return new Date(y!, m! - 1, Math.min(day, 28));
}
