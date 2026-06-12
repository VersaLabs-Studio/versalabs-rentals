"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Bell,
  CheckCheck,
  AlertCircle,
  Calendar,
  Info,
  BellOff,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/hooks/use-notifications";
import { formatDateTime } from "@/lib/format";
import { containerVariants, itemVariants } from "@/lib/motion";
import { COPY } from "@/config/copy";
import { toast } from "@/components/ui/toast";

const ICONS = {
  lease_expiring: Calendar,
  payment_overdue: AlertCircle,
  system: Info,
};

const VARIANTS = {
  lease_expiring: "warning" as const,
  payment_overdue: "danger" as const,
  system: "info" as const,
};

export function NotificationsListPage() {
  const { data: items = [], isLoading } = useNotifications();
  const { mutate: markRead } = useMarkNotificationRead();
  const { mutate: markAll } = useMarkAllNotificationsRead();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={itemVariants}>
        <PageHeader
          title={COPY.notifications.title}
          description={COPY.notifications.description}
          breadcrumbs={[{ label: COPY.app.name, href: "/dashboard" }, { label: COPY.notifications.title }]}
          action={
            <Button
              variant="outline"
              onClick={() => {
                markAll(undefined, {
                  onSuccess: () => toast.success("All marked as read"),
                });
              }}
            >
              <CheckCheck className="h-4 w-4" />
              {COPY.notifications.markAllRead}
            </Button>
          }
        />
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-2">
        {items.length === 0 ? (
          <EmptyState
            icon={<BellOff className="h-6 w-6" />}
            title={COPY.notifications.empty.title}
            description={COPY.notifications.empty.description}
          />
        ) : (
          items.map((n) => {
            const Icon = ICONS[n.type];
            const variant = VARIANTS[n.type];
            return (
              <Card
                key={n.id}
                className={cn(
                  "transition-all hover:shadow-sm cursor-pointer",
                  !n.read && "border-primary/30 bg-primary/[0.02]"
                )}
                onClick={() => {
                  if (!n.read) markRead({ id: n.id, read: true });
                  if (n.link) window.location.href = n.link;
                }}
              >
                <CardContent className="p-4 flex items-start gap-4">
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                      variant === "warning" && "bg-warning/10 text-warning-foreground",
                      variant === "danger" && "bg-destructive/10 text-destructive",
                      variant === "info" && "bg-info/10 text-info"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn("text-sm font-semibold", !n.read && "text-foreground")}>
                        {n.title}
                      </p>
                      {!n.read && <span className="h-2 w-2 rounded-full bg-primary mt-1.5" />}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
                      {n.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1.5">
                      {formatDateTime(n.date)}
                    </p>
                  </div>
                  {n.link && (
                    <Link
                      href={n.link}
                      className="text-xs text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View →
                    </Link>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </motion.div>
    </motion.div>
  );
}
