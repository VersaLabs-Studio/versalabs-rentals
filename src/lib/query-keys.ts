/**
 * Query key factory — every entity follows the same shape.
 * Mutating any entity should invalidate via EntityKeys.all() to be safe.
 */

export const BuildingKeys = {
  all: () => ["Building"] as const,
  lists: () => ["Building", "list"] as const,
  list: (filters?: object) => ["Building", "list", filters] as const,
  details: () => ["Building", "doc"] as const,
  detail: (id: string) => ["Building", "doc", id] as const,
};

export const FloorKeys = {
  all: () => ["Floor"] as const,
  lists: () => ["Floor", "list"] as const,
  list: (filters?: object) => ["Floor", "list", filters] as const,
  details: () => ["Floor", "doc"] as const,
  detail: (id: string) => ["Floor", "doc", id] as const,
  byBuilding: (buildingId: string) => ["Floor", "byBuilding", buildingId] as const,
};

export const OfficeKeys = {
  all: () => ["Office"] as const,
  lists: () => ["Office", "list"] as const,
  list: (filters?: object) => ["Office", "list", filters] as const,
  details: () => ["Office", "doc"] as const,
  detail: (id: string) => ["Office", "doc", id] as const,
  byBuilding: (buildingId: string) => ["Office", "byBuilding", buildingId] as const,
};

export const TenantKeys = {
  all: () => ["Tenant"] as const,
  lists: () => ["Tenant", "list"] as const,
  list: (filters?: object) => ["Tenant", "list", filters] as const,
  details: () => ["Tenant", "doc"] as const,
  detail: (id: string) => ["Tenant", "doc", id] as const,
  withLeases: (id: string) => ["Tenant", "withLeases", id] as const,
};

export const LeaseKeys = {
  all: () => ["Lease"] as const,
  lists: () => ["Lease", "list"] as const,
  list: (filters?: object) => ["Lease", "list", filters] as const,
  details: () => ["Lease", "doc"] as const,
  detail: (id: string) => ["Lease", "doc", id] as const,
  byTenant: (tenantId: string) => ["Lease", "byTenant", tenantId] as const,
  byOffice: (officeId: string) => ["Lease", "byOffice", officeId] as const,
  expiring: () => ["Lease", "expiring"] as const,
};

export const PaymentKeys = {
  all: () => ["Payment"] as const,
  lists: () => ["Payment", "list"] as const,
  list: (filters?: object) => ["Payment", "list", filters] as const,
  details: () => ["Payment", "doc"] as const,
  detail: (id: string) => ["Payment", "doc", id] as const,
  byLease: (leaseId: string) => ["Payment", "byLease", leaseId] as const,
  byTenant: (tenantId: string) => ["Payment", "byTenant", tenantId] as const,
  overdue: () => ["Payment", "overdue"] as const,
  revenueByMonth: () => ["Payment", "revenueByMonth"] as const,
};

export const InvoiceKeys = {
  all: () => ["Invoice"] as const,
  lists: () => ["Invoice", "list"] as const,
  list: (filters?: object) => ["Invoice", "list", filters] as const,
  details: () => ["Invoice", "doc"] as const,
  detail: (id: string) => ["Invoice", "doc", id] as const,
  byTenant: (tenantId: string) => ["Invoice", "byTenant", tenantId] as const,
};

export const MaintenanceKeys = {
  all: () => ["MaintenanceRequest"] as const,
  lists: () => ["MaintenanceRequest", "list"] as const,
  list: (filters?: object) => ["MaintenanceRequest", "list", filters] as const,
  details: () => ["MaintenanceRequest", "doc"] as const,
  detail: (id: string) => ["MaintenanceRequest", "doc", id] as const,
  open: () => ["MaintenanceRequest", "open"] as const,
};

export const NotificationKeys = {
  all: () => ["Notification"] as const,
  lists: () => ["Notification", "list"] as const,
  list: (filters?: object) => ["Notification", "list", filters] as const,
  unread: () => ["Notification", "unread"] as const,
  detail: (id: string) => ["Notification", "doc", id] as const,
};

export const OrgSettingsKeys = {
  all: () => ["OrgSettings"] as const,
  detail: () => ["OrgSettings", "doc", "singleton"] as const,
};

export const SmsMessageKeys = {
  all: () => ["SmsMessage"] as const,
  lists: () => ["SmsMessage", "list"] as const,
  list: (filters?: object) => ["SmsMessage", "list", filters] as const,
  details: () => ["SmsMessage", "doc"] as const,
  detail: (id: string) => ["SmsMessage", "doc", id] as const,
};

export const UtilityBillKeys = {
  all: () => ["UtilityBill"] as const,
  lists: () => ["UtilityBill", "list"] as const,
  list: (filters?: object) => ["UtilityBill", "list", filters] as const,
  details: () => ["UtilityBill", "doc"] as const,
  detail: (id: string) => ["UtilityBill", "doc", id] as const,
  byLease: (leaseId: string) => ["UtilityBill", "byLease", leaseId] as const,
};

/**
 * Invalidate every query for a given entity.
 * Use this on create/update/delete to keep caches in sync.
 */
export const EntityKeys = {
  Building: BuildingKeys,
  Floor: FloorKeys,
  Office: OfficeKeys,
  Tenant: TenantKeys,
  Lease: LeaseKeys,
  Payment: PaymentKeys,
  Invoice: InvoiceKeys,
  MaintenanceRequest: MaintenanceKeys,
  Notification: NotificationKeys,
  OrgSettings: OrgSettingsKeys,
  SmsMessage: SmsMessageKeys,
  UtilityBill: UtilityBillKeys,
} as const;
