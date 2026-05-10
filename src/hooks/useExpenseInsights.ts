"use client";

import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface ExpenseInsightsResult {
  summary: string;
  recommendations: string[];
  anomaly: string | null;
}

export function useExpenseInsights() {
  return useMutation<ExpenseInsightsResult, Error, { vehicleId: string }>({
    mutationFn: async ({ vehicleId }) => {
      const { data, error } = await supabase.functions.invoke("expense-insights", {
        body: { vehicleId },
      });

      if (error) throw new Error(error.message || "Erro ao gerar insights");
      if (data?.error) throw new Error(data.error);

      return data as ExpenseInsightsResult;
    },
  });
}
