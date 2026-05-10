"use client";

import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export type DiagnosisUrgency = "imediato" | "breve" | "monitorar";

export interface DiagnosisResult {
  likely_causes: string[];
  urgency: DiagnosisUrgency;
  recommended_service_type: string | null;
  explanation: string;
}

export function useDiagnosis() {
  return useMutation<DiagnosisResult, Error, { vehicleId: string; symptom: string }>({
    mutationFn: async ({ vehicleId, symptom }) => {
      const { data, error } = await supabase.functions.invoke("symptom-diagnosis", {
        body: { vehicleId, symptom },
      });

      if (error) throw new Error(error.message || "Erro ao diagnosticar sintoma");
      if (data?.error) throw new Error(data.error);

      return data as DiagnosisResult;
    },
  });
}
