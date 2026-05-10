"use client";

import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface ReliabilityScoreResult {
  explanation: string;
  suggestions: string[];
}

export function useReliabilityScore() {
  return useMutation<ReliabilityScoreResult, Error, { vehicleId: string; currentScore: number }>({
    mutationFn: async ({ vehicleId, currentScore }) => {
      const { data, error } = await supabase.functions.invoke("reliability-score", {
        body: { vehicleId, currentScore },
      });

      if (error) throw new Error(error.message || "Erro ao gerar explicação do score");
      if (data?.error) throw new Error(data.error);

      return data as ReliabilityScoreResult;
    },
  });
}
