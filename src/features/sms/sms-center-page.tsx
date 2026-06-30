"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { MessageSquare, Search, Phone, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useSmsMessages, useDeleteSms } from "@/hooks/use-sms-messages";
import { toast } from "@/components/ui/toast";
import { containerVariants, itemVariants } from "@/lib/motion";
import { COPY } from "@/config/copy";
import { STATUS_BADGE } from "@/config/entities";
import { formatDateTime } from "@/lib/format";
import type { SmsMessage } from "@/types";

export function SmsCenterPage() {
  const [search, setSearch] = React.useState("");
  const [context, setContext] = React.useState<string>("all");
  const [status, setStatus] = React.useState<string>("all");

  const { data: messages = [], isLoading } = useSmsMessages({
    search: search || undefined,
    context: context === "all" ? undefined : context,
    status: status === "all" ? undefined : status,
  });
  const { mutate: deleteSms } = useDeleteSms();

  const handleDelete = (id: string) => {
    if (!confirm("Delete this SMS record?")) return;
    deleteSms(id, {
      onSuccess: () => toast.success("SMS deleted"),
      onError: (e) => toast.error(e.message),
    });
  };

  // Listen for live status updates
  const [, forceUpdate] = React.useState(0);
  React.useEffect(() => {
    const handler = () => forceUpdate((n) => n + 1);
    window.addEventListener("rentflow:sms-status-changed", handler);
    return () => window.removeEventListener("rentflow:sms-status-changed", handler);
  }, []);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={itemVariants}>
        <PageHeader
          title={COPY.sms.title}
          description={COPY.sms.description}
          breadcrumbs={[{ label: COPY.app.name, href: "/dashboard" }, { label: COPY.sms.title }]}
        />
      </motion.div>

      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by recipient, phone, body…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={context} onValueChange={setContext}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All contexts</SelectItem>
              <SelectItem value="lease_expiry">Lease expiry</SelectItem>
              <SelectItem value="invoice_due">Invoice due</SelectItem>
              <SelectItem value="utility_bill">Utility bill</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="queued">Queued</SelectItem>
              <SelectItem value="sending">Sending</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        {isLoading || messages.length > 0 ? (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Context</TableHead>
                  <TableHead className="max-w-xs">Message</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead className="w-12">{COPY.common.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                      </TableRow>
                    ))
                  : messages.map((msg: SmsMessage) => (
                      <TableRow key={msg.id} className="group">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <div>
                              <p className="text-sm font-medium">{msg.recipientName}</p>
                              <p className="text-xs text-muted-foreground font-mono">{msg.phone}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={STATUS_BADGE.smsContext[msg.context]} size="sm">
                            {msg.context.replace(/_/g, " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-muted-foreground truncate max-w-xs">{msg.body}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant={STATUS_BADGE.sms[msg.status]} size="sm">
                            {msg.status === "sending" ? (
                              <span className="flex items-center gap-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                                {COPY.sms.status[msg.status]}
                              </span>
                            ) : (
                              COPY.sms.status[msg.status]
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDateTime(msg.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleDelete(msg.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <EmptyState
            icon={<MessageSquare className="h-6 w-6" />}
            title={COPY.sms.empty.title}
            description={COPY.sms.empty.description}
          />
        )}
      </motion.div>
    </motion.div>
  );
}
