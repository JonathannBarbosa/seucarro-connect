"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import type { Maintenance, MaintenancePart, MaintenanceSource, ServiceType } from "@/types/database";

interface UseMaintenancesOptions {
  vehicleId?: string;
}

export function useMaintenances({ vehicleId }: UseMaintenancesOptions = {}) {
  const { user } = useAuth();

  return useQuery<Maintenance[]>({
    queryKey: ["maintenances", user?.id, vehicleId ?? "all"],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from("maintenances")
        .select("*")
        .eq("user_id", user.id)
        .order("service_date", { ascending: false })
        .order("created_at", { ascending: false });

      if (vehicleId) query = query.eq("vehicle_id", vehicleId);

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as Maintenance[];
    },
  });
}

export interface CreateMaintenanceInput {
  vehicle_id: string;
  service_type: ServiceType;
  description?: string | null;
  cost: number;
  mileage?: number | null;
  service_date: string;
  workshop?: string | null;
  parts?: MaintenancePart[];
  os_image_url?: string | null;
  source?: MaintenanceSource;
}

export function useCreateMaintenance() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateMaintenanceInput) => {
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("maintenances")
        .insert({
          ...input,
          user_id: user.id,
          parts: input.parts ?? [],
          source: input.source ?? "manual",
        })
        .select()
        .single();

      if (error) throw error;
      return data as Maintenance;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenances", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["alerts", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["expenses", user?.id] });
    },
  });
}
