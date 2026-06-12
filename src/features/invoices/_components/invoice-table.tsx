"use client";

import { MoreHorizontal, Pencil, Trash2, Receipt, Printer } from "lucide-react";
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
import type { InvoiceWithRelations } from "@/types";
import { STATUS_BADGE } from "@/config/entities";
import { COPY } from "@/config/copy";
import Link from "next/link";

interface Props {
  data: InvoiceWithRelations[];
  isLoading: boolean;
  onEdit: (i: InvoiceWithRelations) => void;
  onDelete: (id: string) => void;
}

export function InvoiceTable({ data, isLoading, onEdit, onDelete }: Props) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Tenant</TableHead>
              <TableHead>Issue date</TableHead>
              <TableHead>Due date</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12">{COPY.common.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 8 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
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
            <TableHead>Invoice #</TableHead>
            <TableHead>Tenant</TableHead>
            <TableHead>Issue date</TableHead>
            <TableHead>Due date</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-12 text-right">{COPY.common.actions}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((i) => (
            <TableRow key={i.id} className="group">
              <TableCell>
                <Link
                  href={`/invoices/${i.id}`}
                  className="font-mono text-sm text-primary hover:underline"
                >
                  {i.invoiceNumber}
                </Link>
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium text-sm">{i.tenant.fullName}</p>
                  {i.tenant.company && (
                    <p className="text-xs text-muted-foreground">{i.tenant.company}</p>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-sm">{formatDate(i.issueDate)}</TableCell>
              <TableCell className="text-sm">{formatDate(i.dueDate)}</TableCell>
              <TableCell className="text-right tabular-nums text-sm font-semibold">
                {formatCurrency(i.total)}
              </TableCell>
              <TableCell>
                <Badge variant={STATUS_BADGE.invoice[i.status]}>{i.status}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm" className="opacity-60 group-hover:opacity-100">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/invoices/${i.id}`}>
                        <Receipt className="h-4 w-4 mr-2" />
                        View
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/invoices/${i.id}`}>
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(i)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      {COPY.common.edit}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(i.id)}
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
