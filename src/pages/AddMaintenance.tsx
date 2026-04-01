import { useState } from "react";
import { Camera, PenLine, ArrowLeft, Check, Wrench, Calendar, Gauge, DollarSign, Package, Droplets, Disc, Wind, Zap, CircleDot, Settings } from "lucide-react";
import AppShell from "@/components/AppShell";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";

const quickServices = [
  { icon: Droplets, label: "Troca de óleo", color: "text-amber-500" },
  { icon: Disc, label: "Freios", color: "text-red-500" },
  { icon: CircleDot, label: "Pneus", color: "text-foreground" },
  { icon: Wind, label: "Filtro de ar", color: "text-sky-500" },
  { icon: Zap, label: "Bateria", color: "text-yellow-500" },
  { icon: Settings, label: "Revisão geral", color: "text-primary" },
];

const AddMaintenance = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<"choose" | "manual" | "preview">("choose");
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [value, setValue] = useState("");
  const [km, setKm] = useState("");
  const [notes, setNotes] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const handleConfirmManual = () => {
    // TODO: save to backend
    navigate("/timeline");
  };

  return (
    <AppShell>
      <div className="px-5 pt-14 pb-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => {
              if (step === "manual") setStep("choose");
              else if (step === "preview") setStep("choose");
              else navigate(-1);
            }}
            className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center card-shadow active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-4.5 h-4.5 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground tracking-tight">
            {step === "choose" ? "Nova Manutenção" : step === "manual" ? "Registro Rápido" : "Confirmar Dados"}
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
              onClick={() => setStep("manual")}
              className="w-full bg-card rounded-2xl p-6 card-shadow flex items-center gap-4 active:scale-[0.98] transition-transform border border-border"
            >
              <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center">
                <PenLine className="w-7 h-7 text-muted-foreground" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-foreground">⚡ Registro rápido</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Selecione o serviço e pronto — menos de 30s
                </p>
              </div>
            </button>
          </div>
        ) : step === "manual" ? (
          <div className="animate-fade-in-up space-y-6">
            {/* Quick Service Selector */}
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                O que foi feito?
              </p>
              <div className="grid grid-cols-3 gap-2.5">
                {quickServices.map((svc) => {
                  const isSelected = selectedService === svc.label;
                  return (
                    <button
                      key={svc.label}
                      onClick={() => setSelectedService(isSelected ? null : svc.label)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all active:scale-95 ${
                        isSelected
                          ? "bg-primary/10 border-primary ring-1 ring-primary/30"
                          : "bg-card border-border"
                      }`}
                    >
                      <svc.icon className={`w-6 h-6 ${isSelected ? "text-primary" : svc.color}`} />
                      <span className={`text-xs font-medium text-center leading-tight ${isSelected ? "text-primary" : "text-foreground"}`}>
                        {svc.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Value + KM inline */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Valor (R$)</p>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="number"
                    inputMode="decimal"
                    placeholder="280,00"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="pl-9 h-12 rounded-xl border-border bg-card text-foreground"
                  />
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">KM atual</p>
                <div className="relative">
                  <Gauge className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="number"
                    inputMode="numeric"
                    placeholder="45.230"
                    value={km}
                    onChange={(e) => setKm(e.target.value)}
                    className="pl-9 h-12 rounded-xl border-border bg-card text-foreground"
                  />
                </div>
              </div>
            </div>

            {/* Optional notes */}
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Observação (opcional)</p>
              <Input
                placeholder="Ex: Próxima troca em 10.000 km"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="h-12 rounded-xl border-border bg-card text-foreground"
              />
            </div>

            {/* Date auto-filled */}
            <div className="bg-card rounded-xl p-3.5 border border-border flex items-center gap-3">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Data</p>
                <p className="text-sm font-medium text-foreground">Hoje — {new Date().toLocaleDateString("pt-BR")}</p>
              </div>
              <span className="text-xs text-primary font-medium">Alterar</span>
            </div>

            {/* Confirm */}
            <button
              onClick={handleConfirmManual}
              disabled={!selectedService}
              className={`w-full font-semibold py-4 rounded-2xl text-base flex items-center justify-center gap-2 card-shadow-lg active:scale-[0.98] transition-all ${
                selectedService
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
            >
              <Check className="w-5 h-5" />
              Salvar manutenção
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
