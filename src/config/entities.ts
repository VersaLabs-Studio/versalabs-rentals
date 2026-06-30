import type { LucideIcon } from "lucide-react";
import {
  Building2,
  Briefcase,
  Users,
  FileSignature,
  CreditCard,
  Receipt,
  Wrench,
  Bell,
  Gauge,
  MessageSquare,
} from "lucide-react";
import type { BadgeProps } from "@/components/ui/badge";
import { COPY } from "./copy";

/**
 * Centralized entity config — drives generic table/form rendering and
 * provides the icons, colors, and status→badge maps the UI needs.
 */

export type EntitySlug =
  | "buildings"
  | "offices"
  | "tenants"
  | "leases"
  | "payments"
  | "invoices"
  | "maintenance"
  | "notifications"
  | "smsMessages"
  | "utilityBills";

export interface EntityMeta {
  slug: EntitySlug;
  label: string;
  labelPlural: string;
  icon: LucideIcon;
  href: string;
  storageKey: string; // localStorage key
}

export const ENTITY_META: Record<EntitySlug, EntityMeta> = {
  buildings: {
    slug: "buildings",
    label: "Building",
    labelPlural: "Buildings",
    icon: Building2,
    href: "/buildings",
    storageKey: "rentflow:buildings",
  },
  offices: {
    slug: "offices",
    label: "Office",
    labelPlural: "Offices",
    icon: Briefcase,
    href: "/offices",
    storageKey: "rentflow:offices",
  },
  tenants: {
    slug: "tenants",
    label: "Tenant",
    labelPlural: "Tenants",
    icon: Users,
    href: "/tenants",
    storageKey: "rentflow:tenants",
  },
  leases: {
    slug: "leases",
    label: "Lease",
    labelPlural: "Leases",
    icon: FileSignature,
    href: "/leases",
    storageKey: "rentflow:leases",
  },
  payments: {
    slug: "payments",
    label: "Payment",
    labelPlural: "Payments",
    icon: CreditCard,
    href: "/payments",
    storageKey: "rentflow:payments",
  },
  invoices: {
    slug: "invoices",
    label: "Invoice",
    labelPlural: "Invoices",
    icon: Receipt,
    href: "/invoices",
    storageKey: "rentflow:invoices",
  },
  maintenance: {
    slug: "maintenance",
    label: "Maintenance request",
    labelPlural: "Maintenance",
    icon: Wrench,
    href: "/maintenance",
    storageKey: "rentflow:maintenance",
  },
  notifications: {
    slug: "notifications",
    label: "Notification",
    labelPlural: "Notifications",
    icon: Bell,
    href: "/notifications",
    storageKey: "rentflow:notifications",
  },
  smsMessages: {
    slug: "smsMessages",
    label: "SMS",
    labelPlural: "SMS Messages",
    icon: MessageSquare,
    href: "/sms",
    storageKey: "rentflow:smsMessages",
  },
  utilityBills: {
    slug: "utilityBills",
    label: "Utility Bill",
    labelPlural: "Utility Bills",
    icon: Gauge,
    href: "/utilities",
    storageKey: "rentflow:utilityBills",
  },
};

/* Status → badge variant maps per entity */
export const STATUS_BADGE: {
  office: Record<string, BadgeProps["variant"]>;
  tenant: Record<string, BadgeProps["variant"]>;
  lease: Record<string, BadgeProps["variant"]>;
  payment: Record<string, BadgeProps["variant"]>;
  invoice: Record<string, BadgeProps["variant"]>;
  maintenance: Record<string, BadgeProps["variant"]>;
  notification: Record<string, BadgeProps["variant"]>;
  sms: Record<string, BadgeProps["variant"]>;
  smsContext: Record<string, BadgeProps["variant"]>;
  utility: Record<string, BadgeProps["variant"]>;
  utilityType: Record<string, BadgeProps["variant"]>;
} = {
  office: {
    vacant: "info",
    occupied: "success",
    maintenance: "warning",
  },
  tenant: {
    active: "success",
    inactive: "muted",
  },
  lease: {
    active: "success",
    expiring: "warning",
    expired: "danger",
    terminated: "muted",
  },
  payment: {
    paid: "success",
    pending: "warning",
    overdue: "danger",
  },
  invoice: {
    paid: "success",
    unpaid: "warning",
  },
  maintenance: {
    open: "warning",
    in_progress: "info",
    resolved: "success",
  },
  notification: {
    lease_expiring: "warning",
    payment_overdue: "danger",
    system: "info",
  },
  sms: {
    queued: "muted",
    sending: "info",
    delivered: "success",
  },
  smsContext: {
    lease_expiry: "warning",
    invoice_due: "info",
    utility_bill: "info",
    manual: "muted",
  },
  utility: {
    requested: "warning",
    paid: "success",
    overdue: "danger",
  },
  utilityType: {
    water: "info",
    electricity: "warning",
  },
};

/** Human-readable status labels per entity */
export const STATUS_LABEL: typeof STATUS_BADGE = STATUS_BADGE;

/** District labels for buildings */
export const DISTRICTS = [
  "Bole",
  "Kirkos",
  "Yeka",
  "Addis Ketema",
  "Arada",
  "Lideta",
  "Gullele",
  "Kolfe Keranio",
  "Nifas Silk-Lafto",
  "Akaki Kality",
] as const;
