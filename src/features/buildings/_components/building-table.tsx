"use client";

import Link from "next/link";
import { MoreHorizontal, Pencil, Trash2, Eye, Building2, Layers, TrendingUp } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatNumber } from "@/lib/format";
import type { BuildingWithStats } from "@/types";
import { COPY } from "@/config/copy";

interface BuildingTableProps {
  data: BuildingWithStats[];
  isLoading: boolean;
  onEdit: (b: BuildingWithStats) => void;
  onDelete: (id: string) => void;
}

export function BuildingTable({ data, isLoading, onEdit, onDelete }: BuildingTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{COPY.buildings.fields.name}</TableHead>
              <TableHead>{COPY.buildings.fields.district}</TableHead>
              <TableHead>Floors</TableHead>
              <TableHead>Offices</TableHead>
              <TableHead>Occupancy</TableHead>
              <TableHead className="text-right">Monthly revenue</TableHead>
              <TableHead className="w-12">{COPY.common.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 6 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
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
            <TableHead>{COPY.buildings.fields.name}</TableHead>
            <TableHead>{COPY.buildings.fields.district}</TableHead>
            <TableHead>Floors</TableHead>
            <TableHead>Offices</TableHead>
            <TableHead>Occupancy</TableHead>
            <TableHead className="text-right">Monthly revenue</TableHead>
            <TableHead className="w-12 text-right">{COPY.common.actions}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((b) => (
            <TableRow key={b.id} className="group">
              <TableCell>
                <Link href={`/buildings/${b.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{b.name}</p>
                    <p className="text-xs text-muted-foreground">{b.address}</p>
                  </div>
                </Link>
              </TableCell>
              <TableCell>
                <Badge variant="muted">{b.district}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5 text-sm">
                  <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                  {b.totalFloors}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5 text-sm tabular-nums">
                  <span className="text-success font-medium">{b.occupiedCount}</span>
                  <span className="text-muted-foreground">/ {b.officeCount}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 w-40">
                  <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                      style={{ width: `${Math.round(b.occupancyRate * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium tabular-nums text-muted-foreground">
                    {Math.round(b.occupancyRate * 100)}%
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1.5 tabular-nums text-sm font-semibold">
                  <TrendingUp className="h-3.5 w-3.5 text-success" />
                  {formatCurrency(b.monthlyRevenue)}
                </div>
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
                      <Link href={`/buildings/${b.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(b)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      {COPY.common.edit}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(b.id)}
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
