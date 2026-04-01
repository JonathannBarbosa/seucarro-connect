import { useState } from "react";
import { Camera, PenLine, ArrowLeft, Check, Wrench, Calendar, Gauge, DollarSign, Package } from "lucide-react";
import AppShell from "@/components/AppShell";
import { useNavigate } from "react-router-dom";

const AddMaintenance = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<"choose" | "preview">("choose");

  return (
    <AppShell>
      <div className="px-5 pt-14 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => step === "preview" ? setStep("choose") : navigate(-1)}
            className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center card-shadow active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-4.5 h-4.5 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground tracking-tight">
            {step === "choose" ? "Nova Manutenção" : "Confirmar Dados"}
          </h1>
        </div>

        {step === "choose" ? (
          <div className="space-y-4 animate-fade-in-up">
            <p className="text-sm text-muted-foreground mb-6">
              Como você quer registrar?
            </p>

            {/* Photo option */}
            <button
              onClick={() => setStep("preview")}
              className="w-full bg-card rounded-2xl p-6 card-shadow flex items-center gap-4 active:scale-[0.98] transition-transform border border-border"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                <Camera className="w-7 h-7 text-primary" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-foreground">📸 Tirar foto da nota</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Nossa IA extrai os dados automaticamente
                </p>
              </div>
            </button>

            {/* Manual option */}
            <button
              onClick={() => setStep("preview")}
              className="w-full bg-card rounded-2xl p-6 card-shadow flex items-center gap-4 active:scale-[0.98] transition-transform border border-border"
            >
              <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center">
                <PenLine className="w-7 h-7 text-muted-foreground" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-foreground">✍️ Inserir manualmente</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Preencha os campos você mesmo
                </p>
              </div>
            </button>
          </div>
        ) : (
          <div className="animate-fade-in-up">
            {/* AI Preview */}
            <div className="bg-success/5 border border-success/20 rounded-2xl p-4 mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-success/20 rounded-lg flex items-center justify-center">
                <Check className="w-4 h-4 text-success" />
              </div>
              <p className="text-sm text-foreground font-medium">Dados extraídos com sucesso via IA</p>
            </div>

            {/* Extracted Fields */}
            <div className="space-y-3">
              {[
                { icon: Wrench, label: "Serviço", value: "Troca de óleo + filtro" },
                { icon: Package, label: "Peças", value: "Óleo Mobil 5W30, Filtro Mann" },
                { icon: DollarSign, label: "Valor", value: "R$ 280,00" },
                { icon: Gauge, label: "Quilometragem", value: "45.230 km" },
                { icon: Calendar, label: "Data", value: "28/03/2026" },
              ].map((field) => (
                <div
                  key={field.label}
                  className="bg-card rounded-xl p-4 border border-border flex items-center gap-3"
                >
                  <field.icon className="w-4.5 h-4.5 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">{field.label}</p>
                    <p className="text-sm font-medium text-foreground">{field.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Confirm Button */}
            <button
              onClick={() => navigate("/timeline")}
              className="w-full mt-8 bg-primary text-primary-foreground font-semibold py-4 rounded-2xl text-base flex items-center justify-center gap-2 card-shadow-lg active:scale-[0.98] transition-transform"
            >
              <Check className="w-5 h-5" />
              Confirmar
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default AddMaintenance;
