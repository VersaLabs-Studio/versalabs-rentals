"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Building2,
  Briefcase,
  Users,
  FileSignature,
  CreditCard,
  Receipt,
  Wrench,
  Gauge,
  MessageSquare,
  Bell,
  Settings,
  BarChart3,
  ChevronLeft,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUnreadNotifications } from "@/hooks/use-notifications";
import { COPY } from "@/config/copy";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: "unread";
  matchPrefix?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: COPY.nav.dashboard, href: "/dashboard", icon: LayoutDashboard },
  // DEFERRED: multi-building — re-enable for portfolio tier
  // { label: COPY.nav.buildings, href: "/buildings", icon: Building2 },
  { label: COPY.nav.offices, href: "/offices", icon: Briefcase },
  { label: COPY.nav.tenants, href: "/tenants", icon: Users },
  { label: COPY.nav.leases, href: "/leases", icon: FileSignature },
  { label: COPY.nav.payments, href: "/payments", icon: CreditCard },
  { label: COPY.nav.invoices, href: "/invoices", icon: Receipt },
  { label: COPY.nav.utilities, href: "/utilities", icon: Gauge },
  { label: COPY.nav.maintenance, href: "/maintenance", icon: Wrench },
  { label: COPY.nav.sms, href: "/sms", icon: MessageSquare },
  { label: COPY.nav.notifications, href: "/notifications", icon: Bell, badge: "unread" },
  { label: COPY.nav.reports, href: "/reports", icon: BarChart3 },
  { label: COPY.nav.settings, href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { data: unreadCount = 0 } = useUnreadNotifications();

  return (
    <>
      {/* Mobile trigger */}
      <div className="lg:hidden fixed top-3 left-3 z-50">
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="glass"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-40 h-screen border-r border-border bg-card/80 backdrop-blur-xl",
          "flex flex-col transition-[width] duration-300",
          collapsed ? "w-[68px]" : "w-64",
          "max-lg:transform max-lg:transition-transform",
          mobileOpen ? "max-lg:translate-x-0" : "max-lg:-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-border h-16 shrink-0">
          {!collapsed && <Logo size="default" />}
          {collapsed && <Logo size="sm" withText={false} />}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => {
              setCollapsed((c) => !c);
              setMobileOpen(false);
            }}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden lg:inline-flex"
          >
            <ChevronLeft
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                collapsed && "rotate-180"
              )}
            />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.matchPrefix && pathname.startsWith(item.matchPrefix)) ||
              pathname.startsWith(`${item.href}/`);
            const showBadge = item.badge === "unread" && unreadCount > 0;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                title={collapsed ? item.label : undefined}
              >
                {isActive && (
                  <motion.span
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-primary"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                {!collapsed && showBadge && (
                  <Badge variant="danger-solid" size="sm" className="ml-auto">
                    {unreadCount}
                  </Badge>
                )}
                {collapsed && showBadge && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-card" />
                )}
              </Link>
            );
          })}
        </nav>

        {!collapsed && (
          <div className="p-3 border-t border-border">
            <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
              <p className="font-medium text-foreground mb-0.5">{COPY.sidebar.demoTag}</p>
              <p className="leading-relaxed">{COPY.sidebar.demoHint}</p>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
