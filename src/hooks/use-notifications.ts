"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { NotificationKeys, EntityKeys } from "@/lib/query-keys";
import { notificationRepo, getNotifications, getUnreadCount } from "@/lib/mock/repositories/notifications";
import {
  notificationCreateSchema,
  type Notification,
  type NotificationUpdate,
} from "@/schemas";
import { simulateLatency } from "@/lib/mock/simulate-latency";
import { writeKey } from "@/lib/mock/create-repository";

export function useNotifications(filters?: { unreadOnly?: boolean; search?: string }) {
  return useQuery<Notification[]>({
    queryKey: NotificationKeys.list(filters),
    queryFn: async () => {
      await simulateLatency();
      return getNotifications(filters);
    },
  });
}

export function useUnreadNotifications() {
  return useQuery<number>({
    queryKey: NotificationKeys.unread(),
    queryFn: async () => {
      await simulateLatency(80, 200);
      return getUnreadCount();
    },
    refetchInterval: 30_000,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, read }: { id: string; read: boolean }) =>
      notificationRepo.update(id, { read }),
    onSuccess: () => qc.invalidateQueries({ queryKey: EntityKeys.Notification.all() }),
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await simulateLatency(150, 300);
      // Bulk update via repo list+update is fine for ~30 items
      const all = getNotifications();
      const updated = all.map((n) => (n.read ? n : { ...n, read: true }));
      // Direct write — bypasses per-item latency
      writeKey("rentflow:notifications", updated);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: EntityKeys.Notification.all() }),
  });
}

export function useDeleteNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => notificationRepo.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: EntityKeys.Notification.all() }),
  });
}

export function useCreateNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<Notification, "id" | "createdAt" | "updatedAt">) =>
      notificationRepo.create(notificationCreateSchema.parse(input)),
    onSuccess: () => qc.invalidateQueries({ queryKey: EntityKeys.Notification.all() }),
  });
}

export type { Notification, NotificationUpdate };
