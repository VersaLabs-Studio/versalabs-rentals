"use client";

import { Badge } from "@/components/ui/badge";
import { STATUS_BADGE } from "@/config/entities";
import type { TenantStatus } from "@/schemas";

const LABELS: Record<TenantStatus, string> = {
  active: "Active",
  inactive: "Inactive",
};

export function TenantStatusBadge({ status }: { status: TenantStatus }) {
  return <Badge variant={STATUS_BADGE.tenant[status]}>{LABELS[status]}</Badge>;
}
