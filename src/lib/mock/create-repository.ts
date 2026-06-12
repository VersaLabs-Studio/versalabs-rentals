import { simulateLatency } from "./simulate-latency";
import type { BaseEntity } from "@/schemas";

/**
 * SSR safety — localStorage is window-only.
 * In server context, return empty / no-op.
 */
function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readKey<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeKey<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota exceeded etc — silent
  }
}

function removeKey(key: string): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(key);
}

/**
 * createRepository<T> — generic CRUD factory backed by localStorage.
 * Signatures are shaped to be a drop-in replacement for a real backend
 * (e.g. Supabase) — swap storage + delay implementations later.
 */
export interface Repository<T extends BaseEntity> {
  storageKey: string;
  list(filters?: ListFilters<T>): Promise<T[]>;
  getById(id: string): Promise<T | null>;
  create(input: Omit<T, "id" | "createdAt" | "updatedAt">): Promise<T>;
  update(id: string, patch: Partial<Omit<T, "id" | "createdAt" | "updatedAt">>): Promise<T>;
  remove(id: string): Promise<void>;
  count(filters?: ListFilters<T>): Promise<number>;
  /** Advanced: replace the entire collection (used by seed reset). */
  replaceAll(items: T[]): Promise<void>;
  /** Returns true if the key is empty. */
  isEmpty(): Promise<boolean>;
}

export interface ListFilters<T extends BaseEntity = BaseEntity> {
  search?: string;
  searchFields?: (keyof T)[];
  status?: string;
  statusField?: keyof T;
  sortBy?: keyof T;
  sortDir?: "asc" | "desc";
  where?: Partial<Record<keyof T, unknown>>;
  limit?: number;
  offset?: number;
}

function newId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `id-${Math.random().toString(36).slice(2)}-${Date.now()}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

function applyFilters<T extends BaseEntity>(items: T[], filters?: ListFilters<T>): T[] {
  if (!filters) return items;
  let out = items;

  if (filters.where) {
    for (const [k, v] of Object.entries(filters.where)) {
      if (v === undefined) continue;
      out = out.filter((it) => (it as Record<string, unknown>)[k] === v);
    }
  }

  if (filters.status && filters.statusField) {
    out = out.filter(
      (it) => (it as Record<string, unknown>)[filters.statusField as string] === filters.status
    );
  }

  if (filters.search && filters.searchFields && filters.searchFields.length > 0) {
    const q = filters.search.toLowerCase();
    out = out.filter((it) =>
      filters.searchFields!.some((f) => {
        const v = it[f];
        return typeof v === "string" && v.toLowerCase().includes(q);
      })
    );
  }

  if (filters.sortBy) {
    const dir = filters.sortDir === "asc" ? 1 : -1;
    out = [...out].sort((a, b) => {
      const av = a[filters.sortBy as keyof T];
      const bv = b[filters.sortBy as keyof T];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
  }

  if (filters.offset != null && filters.offset > 0) {
    out = out.slice(filters.offset);
  }
  if (filters.limit != null && filters.limit > 0) {
    out = out.slice(0, filters.limit);
  }

  return out;
}

export function createRepository<T extends BaseEntity>(
  storageKey: string,
  seed: T[] = []
): Repository<T> {
  // Initialize the key from seed on first construction.
  // We check for emptiness rather than presence so an explicit clear survives.
  if (isBrowser() && readKey<T[] | null>(storageKey, null) === null) {
    writeKey(storageKey, seed);
  }

  function readAll(): T[] {
    return readKey<T[]>(storageKey, []);
  }

  function writeAll(items: T[]): void {
    writeKey(storageKey, items);
  }

  return {
    storageKey,
    async list(filters) {
      await simulateLatency();
      return applyFilters(readAll(), filters);
    },
    async getById(id) {
      await simulateLatency();
      return readAll().find((it) => it.id === id) ?? null;
    },
    async create(input) {
      await simulateLatency();
      const now = nowIso();
      const item = {
        ...input,
        id: newId(),
        createdAt: now,
        updatedAt: now,
      } as T;
      const all = readAll();
      all.push(item);
      writeAll(all);
      return item;
    },
    async update(id, patch) {
      await simulateLatency();
      const all = readAll();
      const idx = all.findIndex((it) => it.id === id);
      if (idx === -1) throw new Error(`Item ${id} not found`);
      const existing = all[idx]!;
      const updated = {
        ...existing,
        ...patch,
        id: existing.id,
        createdAt: existing.createdAt,
        updatedAt: nowIso(),
      } as T;
      all[idx] = updated;
      writeAll(all);
      return updated;
    },
    async remove(id) {
      await simulateLatency();
      const all = readAll();
      const next = all.filter((it) => it.id !== id);
      writeAll(next);
    },
    async count(filters) {
      await simulateLatency(80, 200);
      return applyFilters(readAll(), filters).length;
    },
    async replaceAll(items) {
      writeAll(items);
    },
    async isEmpty() {
      return readAll().length === 0;
    },
  };
}

/** Utility: clear all rentflow keys. Used by settings reset. */
export function clearAllRentFlowData(): void {
  if (!isBrowser()) return;
  for (let i = window.localStorage.length - 1; i >= 0; i--) {
    const k = window.localStorage.key(i);
    if (k && k.startsWith("rentflow:")) removeKey(k);
  }
}

export { isBrowser, readKey, writeKey, removeKey };
