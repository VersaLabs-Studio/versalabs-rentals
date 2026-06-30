"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Gauge, Search, Trash2, Droplets, Zap } from "lucide-react";
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
import { useUtilityBills, useDeleteUtilityBill } from "@/hooks/use-utility-bills";
import { toast } from "@/components/ui/toast";
import { containerVariants, itemVariants } from "@/lib/motion";
import { COPY } from "@/config/copy";
import { STATUS_BADGE } from "@/config/entities";
import { formatCurrency, formatDate } from "@/lib/format";
import type { UtilityBill } from "@/types";

export function UtilitiesListPage() {
  const [search, setSearch] = React.useState("");
  const [type, setType] = React.useState<string>("all");
  const [status, setStatus] = React.useState<string>("all");

  const { data: bills = [], isLoading } = useUtilityBills({
    search: search || undefined,
    type: type === "all" ? undefined : type,
    status: status === "all" ? undefined : status,
  });
  const { mutate: deleteBill } = useDeleteUtilityBill();

  const handleDelete = (id: string) => {
    if (!confirm("Delete this utility bill?")) return;
    deleteBill(id, {
      onSuccess: () => toast.success("Utility bill deleted"),
      onError: (e) => toast.error(e.message),
    });
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={itemVariants}>
        <PageHeader
          title={COPY.utilities.title}
          description={COPY.utilities.description}
          breadcrumbs={[{ label: COPY.app.name, href: "/dashboard" }, { label: COPY.utilities.title }]}
        />
      </motion.div>

      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by period, ID…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="water">Water</SelectItem>
              <SelectItem value="electricity">Electricity</SelectItem>
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="requested">Requested</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        {isLoading || bills.length > 0 ? (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Meter</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Due date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12">{COPY.common.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                      </TableRow>
                    ))
                  : bills.map((bill: UtilityBill) => (
                      <TableRow key={bill.id} className="group">
                        <TableCell>
                          <Badge variant={STATUS_BADGE.utilityType[bill.type]} size="sm">
                            <span className="flex items-center gap-1">
                              {bill.type === "water" ? (
                                <Droplets className="h-3 w-3" />
                              ) : (
                                <Zap className="h-3 w-3" />
                              )}
                              {COPY.utilities.type[bill.type]}
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{bill.periodMonth}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {bill.meterPrev != null ? bill.meterPrev : "—"} → {bill.meterCurr != null ? bill.meterCurr : "—"}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-sm font-semibold">
                          {formatCurrency(bill.amount)}
                        </TableCell>
                        <TableCell className="text-sm">{formatDate(bill.dueDate)}</TableCell>
                        <TableCell>
                          <Badge variant={STATUS_BADGE.utility[bill.status]}>
                            {COPY.utilities.status[bill.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleDelete(bill.id)}
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
            icon={<Gauge className="h-6 w-6" />}
            title={COPY.utilities.empty.title}
            description={COPY.utilities.empty.description}
          />
        )}
      </motion.div>
    </motion.div>
  );
}
