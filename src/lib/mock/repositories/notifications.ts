import { createRepository, type Repository, readKey } from "../create-repository";
import type { Notification } from "@/schemas";

export const notificationRepo: Repository<Notification> = createRepository<Notification>(
  "rentflow:notifications",
  []
);

export function getNotifications(filters?: {
  unreadOnly?: boolean;
  search?: string;
}): Notification[] {
  const items = readKey<Notification[]>("rentflow:notifications", []);
  let result = [...items].sort((a, b) => (a.date < b.date ? 1 : -1));
  if (filters?.unreadOnly) {
    result = result.filter((n) => !n.read);
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (n) => n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q)
    );
  }
  return result;
}

export function getUnreadCount(): number {
  return readKey<Notification[]>("rentflow:notifications", []).filter((n) => !n.read).length;
}
