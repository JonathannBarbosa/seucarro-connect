"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import type { Alert } from "@/types/database";

interface UseAlertsOptions {
  includeResolved?: boolean;
}

export function useAlerts({ includeResolved = false }: UseAlertsOptions = {}) {
  const { user } = useAuth();

  return useQuery<Alert[]>({
    queryKey: ["alerts", user?.id, includeResolved ? "all" : "pending"],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from("alerts")
        .select("*")
        .eq("user_id", user.id)
        .order("priority", { ascending: false })
        .order("due_mileage", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false });

      if (!includeResolved) query = query.eq("is_resolved", false);

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as Alert[];
    },
  });
}

export function useResolveAlert() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alertId: string) => {
      const { data, error } = await supabase
        .from("alerts")
        .update({ is_resolved: true, resolved_at: new Date().toISOString() })
        .eq("id", alertId)
        .select()
        .single();

      if (error) throw error;
      return data as Alert;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts", user?.id] });
    },
  });
}
