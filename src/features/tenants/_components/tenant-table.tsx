"use client";

import Link from "next/link";
import { MoreHorizontal, Pencil, Trash2, Eye, Phone, Mail, Building2 } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
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
import { TenantStatusBadge } from "./tenant-status-badge";
import { formatCurrency, formatDate } from "@/lib/format";
import type { TenantWithLeases } from "@/types";
import { COPY } from "@/config/copy";

interface TenantTableProps {
  data: TenantWithLeases[];
  isLoading: boolean;
  onEdit: (tenant: TenantWithLeases) => void;
  onDelete: (id: string) => void;
}

export function TenantTable({ data, isLoading, onEdit, onDelete }: TenantTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{COPY.tenants.fields.fullName}</TableHead>
              <TableHead>{COPY.tenants.fields.company}</TableHead>
              <TableHead>{COPY.tenants.fields.phone}</TableHead>
              <TableHead>Active lease</TableHead>
              <TableHead>Monthly rent</TableHead>
              <TableHead>{COPY.tenants.fields.status}</TableHead>
              <TableHead className="w-12">{COPY.common.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 6 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><div className="flex items-center gap-3"><Skeleton className="h-9 w-9 rounded-full" /><Skeleton className="h-4 w-32" /></div></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                <TableCell><Skeleton className="h-4 w-28" /></TableCell>
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
            <TableHead>{COPY.tenants.fields.fullName}</TableHead>
            <TableHead>{COPY.tenants.fields.company}</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Active lease</TableHead>
            <TableHead className="text-right">Monthly rent</TableHead>
            <TableHead>{COPY.tenants.fields.status}</TableHead>
            <TableHead className="w-12 text-right">{COPY.common.actions}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((t) => (
            <TableRow key={t.id} className="group">
              <TableCell>
                <Link
                  href={`/tenants/${t.id}`}
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                  <Avatar name={t.fullName} seed={t.avatarSeed} size="default" />
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">{t.fullName}</p>
                    <p className="text-xs text-muted-foreground truncate">{t.email}</p>
                  </div>
                </Link>
              </TableCell>
              <TableCell className="text-sm">
                {t.company ? (
                  <span className="text-foreground">{t.company}</span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" /> {t.phone}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" /> {t.email}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                {t.activeLease ? (
                  <Link
                    href={`/leases/${t.activeLease.id}`}
                    className="flex items-center gap-1.5 text-sm hover:text-primary transition-colors"
                  >
                    <Building2 className="h-3.5 w-3.5" />
                    <span>{t.activeLease.office.building.name}</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground">{t.activeLease.office.number}</span>
                  </Link>
                ) : (
                  <span className="text-xs text-muted-foreground">No active lease</span>
                )}
              </TableCell>
              <TableCell className="text-right tabular-nums text-sm">
                {t.activeLease ? (
                  <span className="font-medium">{formatCurrency(t.activeLease.monthlyRent)}</span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell>
                <TenantStatusBadge status={t.status} />
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
                      <Link href={`/tenants/${t.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(t)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      {COPY.common.edit}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(t.id)}
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
