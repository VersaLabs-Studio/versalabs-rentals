"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SmsMessageKeys, EntityKeys } from "@/lib/query-keys";
import { smsMessageRepo, sendSms, getSmsByTenant } from "@/lib/mock/repositories/sms-messages";
import {
  smsMessageCreateSchema,
  type SmsMessage,
  type SmsMessageCreate,
  type SmsMessageUpdate,
} from "@/schemas";
import { simulateLatency } from "@/lib/mock/simulate-latency";

export function useSmsMessages(filters?: {
  search?: string;
  context?: string;
  status?: string;
}) {
  return useQuery<SmsMessage[]>({
    queryKey: SmsMessageKeys.list(filters),
    queryFn: async () => {
      await simulateLatency();
      return smsMessageRepo.list({
        search: filters?.search,
        searchFields: ["recipientName", "phone", "body"] as any,
        where: {
          ...(filters?.context ? { context: filters.context } : {}),
          ...(filters?.status ? { status: filters.status } : {}),
        } as any,
        sortBy: "createdAt" as any,
        sortDir: "desc",
      });
    },
  });
}

export function useSmsMessage(id: string | null | undefined) {
  return useQuery<SmsMessage | null>({
    queryKey: id ? SmsMessageKeys.detail(id) : SmsMessageKeys.detail("none"),
    queryFn: async () => {
      if (!id) return null;
      await simulateLatency();
      return smsMessageRepo.getById(id);
    },
    enabled: !!id,
  });
}

export function useSmsByTenant(tenantId: string | null | undefined) {
  return useQuery<SmsMessage[]>({
    queryKey: [...SmsMessageKeys.lists(), "byTenant", tenantId] as const,
    queryFn: async () => {
      if (!tenantId) return [];
      await simulateLatency(50, 150);
      return getSmsByTenant(tenantId);
    },
    enabled: !!tenantId,
  });
}

export function useSendSms() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<SmsMessageCreate, "status" | "deliveredAt">) => {
      return sendSms(input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: EntityKeys.SmsMessage.all() });
    },
  });
}

export function useCreateSms() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: SmsMessageCreate) =>
      smsMessageRepo.create(smsMessageCreateSchema.parse(input)),
    onSuccess: () => qc.invalidateQueries({ queryKey: EntityKeys.SmsMessage.all() }),
  });
}

export function useUpdateSms() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: SmsMessageUpdate }) =>
      smsMessageRepo.update(id, smsMessageCreateSchema.partial().parse(data)),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: EntityKeys.SmsMessage.all() });
      qc.invalidateQueries({ queryKey: SmsMessageKeys.detail(id) });
    },
  });
}

export function useDeleteSms() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => smsMessageRepo.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: EntityKeys.SmsMessage.all() }),
  });
}

export type { SmsMessage, SmsMessageCreate, SmsMessageUpdate };
