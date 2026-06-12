"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { InvoiceKeys, EntityKeys } from "@/lib/query-keys";
import {
  invoiceRepo,
  getInvoicesWithRelations,
  nextInvoiceNumber,
} from "@/lib/mock/repositories/invoices";
import {
  invoiceCreateSchema,
  type Invoice,
  type InvoiceCreate,
  type InvoiceUpdate,
} from "@/schemas";
import type { InvoiceWithRelations } from "@/types";
import { simulateLatency } from "@/lib/mock/simulate-latency";

export function useInvoices(filters?: {
  search?: string;
  status?: "paid" | "unpaid";
  tenantId?: string;
}) {
  return useQuery<InvoiceWithRelations[]>({
    queryKey: InvoiceKeys.list(filters),
    queryFn: async () => {
      await simulateLatency();
      return getInvoicesWithRelations(filters);
    },
  });
}

export function useInvoice(id: string | null | undefined) {
  return useQuery<InvoiceWithRelations | null>({
    queryKey: id ? InvoiceKeys.detail(id) : InvoiceKeys.detail("none"),
    queryFn: async () => {
      if (!id) return null;
      await simulateLatency();
      const all = getInvoicesWithRelations();
      return all.find((i) => i.id === id) ?? null;
    },
    enabled: !!id,
  });
}

export function useCreateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<InvoiceCreate, "invoiceNumber"> & { invoiceNumber?: string }) => {
      const invoiceNumber = input.invoiceNumber ?? nextInvoiceNumber();
      return invoiceRepo.create({ ...input, invoiceNumber });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: EntityKeys.Invoice.all() }),
  });
}

export function useUpdateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: InvoiceUpdate }) =>
      invoiceRepo.update(id, invoiceCreateSchema.partial().parse(data)),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: EntityKeys.Invoice.all() });
      qc.invalidateQueries({ queryKey: InvoiceKeys.detail(id) });
    },
  });
}

export function useDeleteInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => invoiceRepo.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: EntityKeys.Invoice.all() }),
  });
}

export type { Invoice, InvoiceCreate, InvoiceUpdate, InvoiceWithRelations };
