import { format, parseISO, isValid } from "date-fns";

/**
 * Format a number as Ethiopian Birr: "ETB 12,500".
 * Single source of truth — used everywhere instead of ad-hoc formatters.
 */
export function formatCurrency(value: number, currency: string = "ETB"): string {
  const formatted = new Intl.NumberFormat("en-ET", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(value);
  return `${currency} ${formatted}`;
}

/**
 * Format a number as currency without the symbol (for forms).
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-ET", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(value);
}

/**
 * Format a date as "12 Jun 2026" per project standard.
 * Accepts ISO string or Date.
 */
export function formatDate(value: string | Date): string {
  const d = typeof value === "string" ? parseISO(value) : value;
  if (!isValid(d)) return "—";
  return format(d, "dd MMM yyyy");
}

/**
 * Format a date with time: "12 Jun 2026, 14:30"
 */
export function formatDateTime(value: string | Date): string {
  const d = typeof value === "string" ? parseISO(value) : value;
  if (!isValid(d)) return "—";
  return format(d, "dd MMM yyyy, HH:mm");
}

/**
 * Format month label: "Jun 2026"
 */
export function formatMonth(value: string | Date): string {
  const d = typeof value === "string" ? parseISO(value) : value;
  if (!isValid(d)) return "—";
  return format(d, "MMM yyyy");
}

/**
 * Difference in days between two dates (b - a).
 */
export function daysBetween(a: Date | string, b: Date | string): number {
  const da = typeof a === "string" ? parseISO(a) : a;
  const db = typeof b === "string" ? parseISO(b) : b;
  return Math.round((db.getTime() - da.getTime()) / (1000 * 60 * 60 * 24));
}
