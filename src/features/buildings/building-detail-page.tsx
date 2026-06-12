"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Pencil,
  Building2,
  Layers,
  TrendingUp,
  Briefcase,
  CheckCircle2,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatCard } from "@/components/ui/stat-card";
import { BuildingFormDialog } from "./_components/building-form-dialog";
import {
  useBuildingWithStats,
  useFloorsForBuilding,
  useOfficesForBuilding,
  useDeleteBuilding,
} from "@/hooks/use-buildings";
import { formatCurrency } from "@/lib/format";
import { containerVariants, itemVariants } from "@/lib/motion";
import { COPY } from "@/config/copy";
import { toast } from "@/components/ui/toast";
import { STATUS_BADGE } from "@/config/entities";

interface BuildingDetailPageProps {
  id: string;
}

export function BuildingDetailPage({ id }: BuildingDetailPageProps) {
  const { data: building, isLoading } = useBuildingWithStats(id);
  const { data: floors = [] } = useFloorsForBuilding(id);
  const { data: offices = [] } = useOfficesForBuilding(id);
  const { mutate: deleteBuilding } = useDeleteBuilding();
  const [editOpen, setEditOpen] = React.useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!building) {
    return (
      <EmptyState
        title="Building not found"
        description="This building may have been deleted."
        action={
          <Button asChild>
            <Link href="/buildings">
              <ArrowLeft className="h-4 w-4" />
              {COPY.buildings.detail.backToBuildings}
            </Link>
          </Button>
        }
      />
    );
  }

  const handleDelete = () => {
    if (!confirm(COPY.buildings.deleteConfirm)) return;
    deleteBuilding(id, {
      onSuccess: () => {
        toast.success("Building deleted");
        window.location.href = "/buildings";
      },
      onError: (e) => toast.error(e.message),
    });
  };

  // Group offices by floor
  const officesByFloor = floors.map((f) => ({
    floor: f,
    offices: offices.filter((o) => o.floorId === f.id),
  }));

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={itemVariants}>
        <PageHeader
          title={building.name}
          description={building.address}
          breadcrumbs={[
            { label: COPY.app.name, href: "/dashboard" },
            { label: COPY.buildings.title, href: "/buildings" },
            { label: building.name },
          ]}
          action={
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditOpen(true)}>
                <Pencil className="h-4 w-4" />
                {COPY.common.edit}
              </Button>
            </div>
          }
        />
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={COPY.buildings.detail.occupancy}
          value={`${Math.round(building.occupancyRate * 100)}%`}
          accent="primary"
          icon={CheckCircle2}
        />
        <StatCard
          label="Offices"
          value={building.officeCount}
          hint={`${building.occupiedCount} occupied`}
          accent="info"
          icon={Briefcase}
        />
        <StatCard
          label="Floors"
          value={building.totalFloors}
          accent="accent"
          icon={Layers}
        />
        <StatCard
          label={COPY.buildings.detail.monthlyRevenue}
          value={building.monthlyRevenue}
          format={(n) => formatCurrency(n).replace("ETB ", "ETB ")}
          accent="success"
          icon={TrendingUp}
        />
      </div>

      <motion.div variants={itemVariants}>
        <Tabs defaultValue="floors">
          <TabsList>
            <TabsTrigger value="floors">Floors & offices</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>
          <TabsContent value="floors" className="mt-4 space-y-3">
            {officesByFloor
              .sort((a, b) => a.floor.level - b.floor.level)
              .map(({ floor, offices: fos }) => (
                <Card key={floor.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Layers className="h-3.5 w-3.5" />
                      {floor.label}
                      <Badge variant="muted" size="sm">
                        {fos.length} {fos.length === 1 ? "office" : "offices"}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {fos.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No offices on this floor.</p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
                        {fos
                          .sort((a, b) => a.number.localeCompare(b.number))
                          .map((o) => (
                            <Link
                              key={o.id}
                              href={`/offices?building=${building.id}`}
                              className="rounded-lg border border-border p-2.5 hover:border-primary/50 transition-colors"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-semibold">{o.number}</span>
                                <Badge variant={STATUS_BADGE.office[o.status]} size="sm" className="text-[9px] px-1.5">
                                  {o.status}
                                </Badge>
                              </div>
                              <p className="text-[10px] text-muted-foreground">{o.area} m²</p>
                              <p className="text-[10px] text-muted-foreground tabular-nums">
                                {formatCurrency(o.monthlyRate)}
                              </p>
                            </Link>
                          ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
          </TabsContent>
          <TabsContent value="about" className="mt-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Address</p>
                  <p className="text-sm">{building.address}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">District</p>
                  <Badge variant="muted">{building.district}</Badge>
                </div>
                {building.notes && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Notes</p>
                    <p className="text-sm leading-relaxed">{building.notes}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Created</p>
                    <p className="text-sm">{new Date(building.createdAt).toDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      <BuildingFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        editId={id}
        initialValues={building}
      />
    </motion.div>
  );
}
