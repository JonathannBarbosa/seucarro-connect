"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import type { Subscription } from "@/types/database";

export function useSubscription() {
  const { user } = useAuth();

  return useQuery<Subscription | null>({
    queryKey: ["subscription", user?.id],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data as Subscription | null;
    },
  });
}

export function useUpdateWhatsappNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (enabled: boolean) => {
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("subscriptions")
        .update({ whatsapp_notifications_enabled: enabled })
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data as Subscription;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription", user?.id] });
    },
  });
}
