"use client";

import * as React from "react";

export interface TenantFilters {
  search: string;
  status: "all" | "active" | "inactive";
}

const DEFAULT: TenantFilters = { search: "", status: "all" };

export function useTenantFilters() {
  const [filters, setFilters] = React.useState<TenantFilters>(DEFAULT);
  return {
    filters,
    setSearch: (search: string) => setFilters((f) => ({ ...f, search })),
    setStatus: (status: TenantFilters["status"]) => setFilters((f) => ({ ...f, status })),
    reset: () => setFilters(DEFAULT),
  };
}
