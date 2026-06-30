/**
 * Re-exports of raw schema types for app code.
 * Components / hooks should import from here, not from /schemas directly.
 */
export type {
  Building,
  BuildingCreate,
  BuildingUpdate,
  District,
} from "@/schemas";

export type {
  Floor,
  FloorCreate,
  FloorUpdate,
} from "@/schemas";

export type {
  Office,
  OfficeCreate,
  OfficeUpdate,
  OfficeStatus,
} from "@/schemas";

export type {
  Tenant,
  TenantCreate,
  TenantUpdate,
  TenantStatus,
} from "@/schemas";

export type {
  Lease,
  LeaseCreate,
  LeaseUpdate,
  LeaseStatus,
} from "@/schemas";

export type {
  Payment,
  PaymentCreate,
  PaymentUpdate,
  PaymentStatus,
  PaymentMethod,
} from "@/schemas";

export type {
  Invoice,
  InvoiceCreate,
  InvoiceUpdate,
  InvoiceStatus,
  InvoiceLineItem,
} from "@/schemas";

export type {
  MaintenanceRequest,
  MaintenanceRequestCreate,
  MaintenanceRequestUpdate,
  MaintenancePriority,
  MaintenanceStatus,
} from "@/schemas";

export type {
  Notification,
  NotificationCreate,
  NotificationUpdate,
  NotificationType,
} from "@/schemas";

export type {
  OrgSettings,
  OrgSettingsUpdate,
} from "@/schemas";

export type {
  SmsMessage,
  SmsMessageCreate,
  SmsMessageUpdate,
  SmsContext,
  SmsStatus,
} from "@/schemas";

export type {
  UtilityBill,
  UtilityBillCreate,
  UtilityBillUpdate,
  UtilityType,
  UtilityStatus,
} from "@/schemas";

export * from "./views";
