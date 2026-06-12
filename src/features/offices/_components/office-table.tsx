"use client";

import Link from "next/link";
import { MoreHorizontal, Pencil, Trash2, Building2, User, Briefcase } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency } from "@/lib/format";
import type { OfficeWithRelations } from "@/types";
import { STATUS_BADGE } from "@/config/entities";
import { COPY } from "@/config/copy";

interface Props {
  data: OfficeWithRelations[];
  isLoading: boolean;
  onEdit: (o: OfficeWithRelations) => void;
  onDelete: (id: string) => void;
}

export function OfficeTable({ data, isLoading, onEdit, onDelete }: Props) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Office</TableHead>
              <TableHead>Building</TableHead>
              <TableHead>Floor</TableHead>
              <TableHead>Tenant</TableHead>
              <TableHead className="text-right">Rate</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12">{COPY.common.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 8 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
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
            <TableHead>Office</TableHead>
            <TableHead>Building</TableHead>
            <TableHead>Floor</TableHead>
            <TableHead>Tenant</TableHead>
            <TableHead className="text-right">Rate</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-12 text-right">{COPY.common.actions}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((o) => (
            <TableRow key={o.id} className="group">
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                    <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{o.number}</p>
                    <p className="text-xs text-muted-foreground">{o.area} m²</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Link
                  href={`/buildings/${o.building.id}`}
                  className="flex items-center gap-1.5 text-sm hover:text-primary transition-colors"
                >
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                  {o.building.name}
                </Link>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {o.floor?.label ?? "—"}
              </TableCell>
              <TableCell>
                {o.tenant ? (
                  <Link
                    href={`/tenants/${o.tenant.id}`}
                    className="flex items-center gap-1.5 text-sm hover:text-primary transition-colors"
                  >
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="truncate max-w-[180px]">{o.tenant.fullName}</span>
                  </Link>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell className="text-right tabular-nums text-sm font-semibold">
                {formatCurrency(o.monthlyRate)}
              </TableCell>
              <TableCell>
                <Badge variant={STATUS_BADGE.office[o.status]}>{o.status}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm" className="opacity-60 group-hover:opacity-100">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(o)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      {COPY.common.edit}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(o.id)}
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
