"use client";

import Link from "next/link";
import { MoreHorizontal, Pencil, Trash2, Building2, FileSignature } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import type { LeaseWithRelations } from "@/types";
import { STATUS_BADGE } from "@/config/entities";
import { COPY } from "@/config/copy";

interface Props {
  data: LeaseWithRelations[];
  isLoading: boolean;
  onEdit: (l: LeaseWithRelations) => void;
  onDelete: (id: string) => void;
}

export function LeaseTable({ data, isLoading, onEdit, onDelete }: Props) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tenant</TableHead>
              <TableHead>Office</TableHead>
              <TableHead>Period</TableHead>
              <TableHead className="text-right">Rent</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12">{COPY.common.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 8 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><div className="flex items-center gap-3"><Skeleton className="h-8 w-8 rounded-full" /><Skeleton className="h-4 w-32" /></div></TableCell>
                <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
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
            <TableHead>Office</TableHead>
            <TableHead>Period</TableHead>
            <TableHead className="text-right">Rent</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-12 text-right">{COPY.common.actions}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((l) => (
            <TableRow key={l.id} className="group">
              <TableCell>
                <Link href={`/tenants/${l.tenant.id}`} className="flex items-center gap-3 hover:opacity-80">
                  <Avatar name={l.tenant.fullName} seed={l.tenant.avatarSeed} size="sm" />
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{l.tenant.fullName}</p>
                    {l.tenant.company && (
                      <p className="text-xs text-muted-foreground truncate">{l.tenant.company}</p>
                    )}
                  </div>
                </Link>
              </TableCell>
              <TableCell>
                <Link
                  href={`/buildings`}
                  className="flex items-center gap-1.5 text-sm hover:text-primary"
                >
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                  {l.office.building.name} · {l.office.number}
                </Link>
              </TableCell>
              <TableCell>
                <Link href={`/leases/${l.id}`} className="flex flex-col text-xs hover:text-primary">
                  <span>{formatDate(l.startDate)}</span>
                  <span className="text-muted-foreground">to {formatDate(l.endDate)}</span>
                </Link>
              </TableCell>
              <TableCell className="text-right tabular-nums text-sm font-semibold">
                {formatCurrency(l.monthlyRent)}
              </TableCell>
              <TableCell>
                <Badge variant={STATUS_BADGE.lease[l.status]}>{l.status}</Badge>
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
                      <Link href={`/leases/${l.id}`}>
                        <FileSignature className="h-4 w-4 mr-2" />
                        View
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(l)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      {COPY.common.edit}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(l.id)}
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
