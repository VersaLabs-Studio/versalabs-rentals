"use client";

import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Settings as SettingsIcon, Save, RotateCcw, AlertTriangle, Building2, Layers } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrgSettings, useUpdateOrgSettings } from "@/hooks/use-org-settings";
import { useActiveBuilding, useUpdateBuilding } from "@/hooks/use-buildings";
import { orgSettingsUpdateSchema, type OrgSettingsUpdate } from "@/schemas";
import { buildingCreateSchema, type BuildingCreate } from "@/schemas";
import { toast } from "@/components/ui/toast";
import { containerVariants, itemVariants } from "@/lib/motion";
import { COPY } from "@/config/copy";
import { reseed } from "@/lib/mock/seed-client";
import { Avatar } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DISTRICTS } from "@/config/entities";

export function SettingsPage() {
  const { data: org, isLoading } = useOrgSettings();
  const { mutate: update, isPending } = useUpdateOrgSettings();
  const { data: activeBuilding } = useActiveBuilding();
  const { mutate: updateBuilding, isPending: isBuildingPending } = useUpdateBuilding();

  const form = useForm<OrgSettingsUpdate>({
    resolver: zodResolver(orgSettingsUpdateSchema.partial()),
    values: org
      ? {
          orgName: org.orgName,
          adminName: org.adminName,
          adminEmail: org.adminEmail,
          address: org.address,
          phone: org.phone,
          vatRate: org.vatRate,
        }
      : undefined,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const onSubmit = (data: OrgSettingsUpdate) => {
    update(data, {
      onSuccess: () => toast.success("Settings saved"),
      onError: (e) => toast.error(e.message),
    });
  };

  const handleReset = () => {
    if (!confirm(COPY.settings.actions.resetConfirm)) return;
    reseed();
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-3xl"
    >
      <motion.div variants={itemVariants}>
        <PageHeader
          title={COPY.settings.title}
          description={COPY.settings.description}
          breadcrumbs={[{ label: COPY.app.name, href: "/dashboard" }, { label: COPY.settings.title }]}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Avatar name={org?.orgName ?? "?"} seed={org?.logoSeed} size="lg" />
              <div>
                <CardTitle>{org?.orgName}</CardTitle>
                <CardDescription>{COPY.settings.sections.orgProfile}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="orgName">{COPY.settings.fields.orgName}</Label>
                  <Input id="orgName" {...form.register("orgName")} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="adminName">{COPY.settings.fields.adminName}</Label>
                  <Input id="adminName" {...form.register("adminName")} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="adminEmail">{COPY.settings.fields.adminEmail}</Label>
                  <Input id="adminEmail" type="email" {...form.register("adminEmail")} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">{COPY.settings.fields.phone}</Label>
                  <Input id="phone" {...form.register("phone")} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="address">{COPY.settings.fields.address}</Label>
                <Input id="address" {...form.register("address")} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="vatRate">
                    {COPY.settings.fields.vatRate} ({((form.watch("vatRate") ?? 0) * 100).toFixed(0)}%)
                  </Label>
                  <Input
                    id="vatRate"
                    type="number"
                    step="0.01"
                    min={0}
                    max={1}
                    {...form.register("vatRate", { valueAsNumber: true })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="currency">{COPY.settings.fields.currency}</Label>
                  <Input id="currency" value="ETB" disabled />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={isPending}>
                  <Save className="h-4 w-4" />
                  {isPending ? "Saving…" : COPY.settings.actions.save}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Building Profile */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>{COPY.settings.sections.buildingProfile}</CardTitle>
                <CardDescription>Manage your building identity (single-building SaaS)</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {activeBuilding ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const name = formData.get("buildingName") as string;
                  const address = formData.get("buildingAddress") as string;
                  const district = formData.get("buildingDistrict") as string;
                  const totalFloors = parseInt(formData.get("totalFloors") as string, 10) || 1;
                  if (!name || !address) {
                    toast.error("Building name and address are required");
                    return;
                  }
                  updateBuilding(
                    {
                      id: activeBuilding.id,
                      data: {
                        name,
                        address,
                        district: district as any,
                        totalFloors,
                        photoSeed: activeBuilding.photoSeed,
                      },
                    },
                    {
                      onSuccess: () => toast.success("Building profile saved"),
                      onError: (e) => toast.error(e.message),
                    }
                  );
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="buildingName">{COPY.settings.fields.buildingName}</Label>
                    <Input
                      id="buildingName"
                      name="buildingName"
                      defaultValue={activeBuilding.name}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="buildingAddress">{COPY.settings.fields.buildingAddress}</Label>
                    <Input
                      id="buildingAddress"
                      name="buildingAddress"
                      defaultValue={activeBuilding.address}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="buildingDistrict">{COPY.settings.fields.buildingDistrict}</Label>
                    <Select name="buildingDistrict" defaultValue={activeBuilding.district}>
                      <SelectTrigger id="buildingDistrict">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DISTRICTS.map((d) => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="totalFloors">{COPY.settings.fields.totalFloors}</Label>
                    <Input
                      id="totalFloors"
                      name="totalFloors"
                      type="number"
                      min={1}
                      max={60}
                      defaultValue={activeBuilding.totalFloors}
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <Button type="submit" disabled={isBuildingPending}>
                    <Save className="h-4 w-4" />
                    {isBuildingPending ? "Saving…" : COPY.settings.actions.save}
                  </Button>
                </div>
              </form>
            ) : (
              <Skeleton className="h-32 w-full" />
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="border-destructive/30">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-destructive">{COPY.settings.sections.dangerZone}</CardTitle>
                <CardDescription>
                  Reset all local mock data and reseed the demo. Use this if state becomes inconsistent.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={handleReset} className="text-destructive border-destructive/30">
              <RotateCcw className="h-4 w-4" />
              {COPY.settings.actions.resetSeed}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
