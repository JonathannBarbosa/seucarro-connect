"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity, AlertTriangle, ArrowLeft, CheckCircle2, Clock, Loader2,
  Stethoscope, Wrench,
} from "lucide-react";
import { toast } from "sonner";
import AppShell from "@/components/AppShell";
import { UpgradeButton } from "@/components/PlanGate";
import { usePlanFeatures } from "@/hooks/usePlanFeatures";
import { usePrimaryVehicle } from "@/hooks/useVehicles";
import { useDiagnosis, type DiagnosisResult, type DiagnosisUrgency } from "@/hooks/useDiagnosis";
import { SERVICE_TYPE_LABELS } from "@/types/database";

const urgencyConfig: Record<DiagnosisUrgency, { label: string; bg: string; text: string; icon: typeof AlertTriangle }> = {
  imediato: { label: "Atenção imediata", bg: "bg-danger/10", text: "text-danger", icon: AlertTriangle },
  breve:    { label: "Resolver em breve", bg: "bg-warning/10", text: "text-warning", icon: Clock },
  monitorar:{ label: "Monitorar", bg: "bg-success/10", text: "text-success", icon: CheckCircle2 },
};

export default function DiagnosisPage() {
  const router = useRouter();
  const { can } = usePlanFeatures();
  const canDiagnose = can("symptom_diagnosis");

  const { data: vehicle } = usePrimaryVehicle();
  const diagnose = useDiagnosis();

  const [symptom, setSymptom] = useState("");
  const [result, setResult] = useState<DiagnosisResult | null>(null);

  async function handleSubmit() {
    if (!vehicle) {
      toast.error("Cadastre um veículo primeiro");
      return;
    }
    if (symptom.trim().length < 5) {
      toast.error("Descreva o sintoma com mais detalhes");
      return;
    }

    try {
      const diagnosis = await diagnose.mutateAsync({
        vehicleId: vehicle.id,
        symptom: symptom.trim(),
      });
      setResult(diagnosis);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao diagnosticar");
    }
  }

  function handleReset() {
    setResult(null);
    setSymptom("");
  }

  const urgency = result ? urgencyConfig[result.urgency] : null;
  const UrgencyIcon = urgency?.icon ?? CheckCircle2;

  return (
    <AppShell>
      <div className="px-5 pt-14 pb-24 animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center card-shadow active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-4.5 h-4.5 text-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">Diagnóstico</h1>
            {vehicle && (
              <p className="text-xs text-muted-foreground">
                {vehicle.brand} {vehicle.model} {vehicle.year}
              </p>
            )}
          </div>
        </div>

        {!canDiagnose ? (
          <div className="animate-fade-in-up">
            <div className="bg-card rounded-2xl p-6 card-shadow text-center border-2 border-dashed border-border mb-4">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Stethoscope className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-bold text-foreground mb-2">Diagnóstico por IA</h3>
              <p className="text-sm text-muted-foreground mb-5">
                Descreva um sintoma e nossa IA analisa o histórico do seu veículo para identificar as causas prováveis.
              </p>
              <UpgradeButton feature="symptom_diagnosis" label="Desbloquear diagnóstico IA" fullWidth />
            </div>
          </div>
        ) : !result ? (
          <div className="animate-fade-in-up space-y-5">
            <div className="bg-primary/5 border border-primary/15 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <Activity className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm text-foreground">
                  Descreva o que está acontecendo com seu veículo — barulho, vibração, luz acesa, comportamento estranho.
                  Nossa IA vai analisar com base no histórico de manutenções.
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Descreva o sintoma
              </p>
              <textarea
                value={symptom}
                onChange={(e) => setSymptom(e.target.value)}
                placeholder="Ex: Escuta um chiado ao frear, especialmente em baixa velocidade. Começou há uns 3 dias."
                rows={5}
                className="w-full rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground px-4 py-3 text-sm resize-none outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground text-right mt-1">{symptom.length}/500</p>
            </div>

            <button
              onClick={handleSubmit}
              disabled={diagnose.isPending || symptom.trim().length < 5 || !vehicle}
              className={`w-full font-semibold py-4 rounded-2xl text-base flex items-center justify-center gap-2 card-shadow-lg active:scale-[0.98] transition-all ${
                symptom.trim().length >= 5 && vehicle
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
            >
              {diagnose.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <Stethoscope className="w-5 h-5" />
                  Diagnosticar
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in-up">
            <div className={`rounded-2xl p-4 border ${urgency?.bg} border-${urgency?.text.replace("text-", "")}/20 flex items-center gap-3`}>
              <UrgencyIcon className={`w-6 h-6 ${urgency?.text} flex-shrink-0`} />
              <div>
                <p className={`text-sm font-bold ${urgency?.text}`}>{urgency?.label}</p>
                <p className="text-xs text-muted-foreground">
                  {result.urgency === "imediato"
                    ? "Pare de usar o veículo e consulte um mecânico o quanto antes"
                    : result.urgency === "breve"
                    ? "Agende uma revisão nos próximos dias"
                    : "Fique de olho e agende revisão preventiva"}
                </p>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-5 card-shadow">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Diagnóstico</p>
              <p className="text-sm text-foreground leading-relaxed">{result.explanation}</p>
            </div>

            {result.likely_causes.length > 0 && (
              <div className="bg-card rounded-2xl p-5 card-shadow">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Causas prováveis</p>
                <ul className="space-y-2">
                  {result.likely_causes.map((cause, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-foreground">
                      <span className="w-5 h-5 rounded-full bg-warning/15 text-warning text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      {cause}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.recommended_service_type && (
              <div className="bg-primary/5 border border-primary/15 rounded-2xl p-4 flex items-center gap-3">
                <Wrench className="w-5 h-5 text-primary flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Serviço recomendado</p>
                  <p className="text-sm font-semibold text-foreground">
                    {SERVICE_TYPE_LABELS[result.recommended_service_type as keyof typeof SERVICE_TYPE_LABELS] ?? result.recommended_service_type}
                  </p>
                </div>
                <button
                  onClick={() => router.push("/add")}
                  className="ml-auto text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full active:scale-95 transition-transform"
                >
                  Registrar
                </button>
              </div>
            )}

            <div className="pt-2 space-y-3">
              <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
                Este diagnóstico é uma analise preliminar baseada no historico do veiculo. Consulte sempre um mecanico profissional.
              </p>
              <button
                onClick={handleReset}
                className="w-full py-3 rounded-2xl border border-border text-sm font-semibold text-foreground active:scale-[0.98] transition-transform"
              >
                Novo diagnóstico
              </button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
