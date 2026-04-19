"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import type { Vehicle } from "@/types/database";

export function useVehicles() {
  const { user } = useAuth();

  return useQuery<Vehicle[]>({
    queryKey: ["vehicles", user?.id],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .eq("user_id", user.id)
        .order("is_primary", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
  });
}

export function usePrimaryVehicle() {
  const query = useVehicles();
  const data = query.data?.find((v) => v.is_primary) ?? query.data?.[0] ?? null;
  return { ...query, data };
}

export type CreateVehicleInput = Omit<
  Vehicle,
  "id" | "user_id" | "created_at" | "updated_at"
>;

export function useCreateVehicle() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateVehicleInput) => {
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("vehicles")
        .insert({ ...input, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data as Vehicle;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles", user?.id] });
    },
  });
}
