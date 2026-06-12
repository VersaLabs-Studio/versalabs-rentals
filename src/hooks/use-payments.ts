"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PaymentKeys, EntityKeys } from "@/lib/query-keys";
import {
  paymentRepo,
  getPaymentsWithRelations,
  getRevenueByMonth,
} from "@/lib/mock/repositories/payments";
import {
  paymentCreateSchema,
  type Payment,
  type PaymentCreate,
  type PaymentUpdate,
  type PaymentStatus,
} from "@/schemas";
import type { PaymentWithRelations, RevenuePoint } from "@/types";
import { simulateLatency } from "@/lib/mock/simulate-latency";

export function usePayments(filters?: {
  search?: string;
  status?: PaymentStatus;
  tenantId?: string;
  leaseId?: string;
  periodMonth?: string;
}) {
  return useQuery<PaymentWithRelations[]>({
    queryKey: PaymentKeys.list(filters),
    queryFn: async () => {
      await simulateLatency();
      return getPaymentsWithRelations(filters);
    },
  });
}

export function usePayment(id: string | null | undefined) {
  return useQuery<Payment | null>({
    queryKey: id ? PaymentKeys.detail(id) : PaymentKeys.detail("none"),
    queryFn: () => (id ? paymentRepo.getById(id) : Promise.resolve(null)),
    enabled: !!id,
  });
}

export function usePaymentsByTenant(tenantId: string | null | undefined) {
  return useQuery<PaymentWithRelations[]>({
    queryKey: tenantId ? PaymentKeys.byTenant(tenantId) : PaymentKeys.byTenant("none"),
    queryFn: async () => {
      if (!tenantId) return [];
      await simulateLatency();
      return getPaymentsWithRelations({ tenantId });
    },
    enabled: !!tenantId,
  });
}

export function usePaymentsByLease(leaseId: string | null | undefined) {
  return useQuery<PaymentWithRelations[]>({
    queryKey: leaseId ? PaymentKeys.byLease(leaseId) : PaymentKeys.byLease("none"),
    queryFn: async () => {
      if (!leaseId) return [];
      await simulateLatency();
      return getPaymentsWithRelations({ leaseId });
    },
    enabled: !!leaseId,
  });
}

export function useOverduePayments() {
  return useQuery<PaymentWithRelations[]>({
    queryKey: PaymentKeys.overdue(),
    queryFn: async () => {
      await simulateLatency();
      return getPaymentsWithRelations({ status: "overdue" });
    },
  });
}

export function useRevenueByMonth(monthsBack = 12) {
  return useQuery<RevenuePoint[]>({
    queryKey: [...PaymentKeys.revenueByMonth(), monthsBack] as const,
    queryFn: async () => {
      await simulateLatency();
      return getRevenueByMonth(monthsBack);
    },
  });
}

export function useCreatePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: PaymentCreate) =>
      paymentRepo.create(paymentCreateSchema.parse(input)),
    onSuccess: () => qc.invalidateQueries({ queryKey: EntityKeys.Payment.all() }),
  });
}

export function useUpdatePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: PaymentUpdate }) =>
      paymentRepo.update(id, paymentCreateSchema.partial().parse(data)),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: EntityKeys.Payment.all() });
      qc.invalidateQueries({ queryKey: PaymentKeys.detail(id) });
    },
  });
}

/** Convenience mutation: mark a payment paid. */
export function useMarkPaymentPaid() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      paidDate,
      method,
      reference,
    }: {
      id: string;
      paidDate: string;
      method: "cash" | "bank" | "telebirr";
      reference?: string;
    }) =>
      paymentRepo.update(id, {
        status: "paid",
        paidDate,
        method,
        reference: reference ?? "",
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: EntityKeys.Payment.all() }),
  });
}

export function useDeletePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => paymentRepo.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: EntityKeys.Payment.all() }),
  });
}

export type { Payment, PaymentCreate, PaymentUpdate, PaymentWithRelations };
