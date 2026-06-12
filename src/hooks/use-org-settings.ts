"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { OrgSettingsKeys, EntityKeys } from "@/lib/query-keys";
import { orgSettingsRepo } from "@/lib/mock/repositories/org-settings";
import type { OrgSettings, OrgSettingsUpdate } from "@/schemas";

export function useOrgSettings() {
  return useQuery<OrgSettings>({
    queryKey: OrgSettingsKeys.detail(),
    queryFn: () => orgSettingsRepo.getSingleton(),
    staleTime: Infinity,
  });
}

export function useUpdateOrgSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: OrgSettingsUpdate) => orgSettingsRepo.updateSingleton(patch),
    onSuccess: (data) => {
      qc.setQueryData(OrgSettingsKeys.detail(), data);
      qc.invalidateQueries({ queryKey: EntityKeys.OrgSettings.all() });
    },
  });
}

export type { OrgSettings, OrgSettingsUpdate };
