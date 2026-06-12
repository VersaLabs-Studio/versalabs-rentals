"use client";

import { MoreHorizontal, Pencil, Trash2, CheckCircle2, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate } from "@/lib/format";
import type { PaymentWithRelations } from "@/types";
import { STATUS_BADGE } from "@/config/entities";
import { COPY } from "@/config/copy";

interface Props {
  data: PaymentWithRelations[];
  isLoading: boolean;
  onEdit: (p: PaymentWithRelations) => void;
  onDelete: (id: string) => void;
  onMarkPaid: (p: PaymentWithRelations) => void;
}

export function PaymentTable({ data, isLoading, onEdit, onDelete, onMarkPaid }: Props) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tenant</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Due date</TableHead>
              <TableHead>Method</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12">{COPY.common.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 8 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-8 w-8" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tenant</TableHead>
            <TableHead>Period</TableHead>
            <TableHead>Due date</TableHead>
            <TableHead>Method</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-12 text-right">{COPY.common.actions}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((p) => (
            <TableRow key={p.id} className="group">
              <TableCell>
                <div>
                  <p className="font-medium text-sm">{p.tenant.fullName}</p>
                  {p.tenant.company && (
                    <p className="text-xs text-muted-foreground">{p.tenant.company}</p>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-sm tabular-nums">{p.periodMonth}</TableCell>
              <TableCell className="text-sm">{formatDate(p.dueDate)}</TableCell>
              <TableCell>
                <Badge variant="muted" className="capitalize">{p.method}</Badge>
              </TableCell>
              <TableCell className="text-right tabular-nums text-sm font-semibold">
                {formatCurrency(p.amount)}
              </TableCell>
              <TableCell>
                <Badge variant={STATUS_BADGE.payment[p.status]}>{p.status}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm" className="opacity-60 group-hover:opacity-100">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {p.status !== "paid" && (
                      <DropdownMenuItem onClick={() => onMarkPaid(p)}>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        {COPY.payments.markPaid}
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => onEdit(p)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      {COPY.common.edit}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(p.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {COPY.common.delete}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
