"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Battery, Calendar, Camera, Check, CircleDot, Disc, DollarSign,
  Droplets, Gauge, LifeBuoy, Loader2, PenLine, Settings, SlidersHorizontal,
  Sparkles, Stethoscope, Wind, Wrench,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import AppShell from "@/components/AppShell";
import { Input } from "@/components/ui/input";
import { UpgradeButton } from "@/components/PlanGate";
import { usePlanFeatures, FREE_OCR_LIMIT } from "@/hooks/usePlanFeatures";
import { useVehicles, usePrimaryVehicle } from "@/hooks/useVehicles";
import { useCreateMaintenance, useMaintenances } from "@/hooks/useMaintenances";
import { useScanOS, type ScanOSResult } from "@/hooks/useScanOS";
import { todayIso } from "@/lib/format";
import { SERVICE_TYPE_LABELS, type ServiceType } from "@/types/database";

type Step = "choose" | "manual" | "camera" | "uploading";

const quickServices: { id: ServiceType; icon: typeof Droplets; color: string }[] = [
  { id: "troca_oleo", icon: Droplets, color: "text-amber-500" },
  { id: "freios", icon: Disc, color: "text-red-500" },
  { id: "pneus", icon: CircleDot, color: "text-foreground" },
  { id: "filtros", icon: Wind, color: "text-sky-500" },
  { id: "bateria", icon: Battery, color: "text-yellow-500" },
  { id: "revisao", icon: Settings, color: "text-primary" },
  { id: "suspensao", icon: LifeBuoy, color: "text-indigo-500" },
  { id: "alinhamento", icon: SlidersHorizontal, color: "text-fuchsia-500" },
  { id: "outro", icon: Wrench, color: "text-muted-foreground" },
];

const manualSchema = z.object({
  cost: z.number({ error: "Informe o valor" }).min(0, "Valor inválido"),
  mileage: z.number().int().min(0).optional(),
  description: z.string().optional(),
  service_date: z.string().min(1, "Informe a data"),
});

export default function AddMaintenancePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { can, plan } = usePlanFeatures();
  const canScanOCR = can("ocr_scan");

  const { data: vehicles } = useVehicles();
  const { data: primary } = usePrimaryVehicle();
  const { data: allMaintenances } = useMaintenances();
  const createMaintenance = useCreateMaintenance();
  const scanOS = useScanOS();

  const ocrScansUsed = allMaintenances?.filter((m) => m.source === "ocr").length ?? 0;
  const ocrLimitReached = !canScanOCR && ocrScansUsed >= FREE_OCR_LIMIT;
  const ocrScansLeft = plan === "free" ? Math.max(0, FREE_OCR_LIMIT - ocrScansUsed) : null;

  const [step, setStep] = useState<Step>("choose");
  const [vehicleId, setVehicleId] = useState<string>("");
  const [selectedServices, setSelectedServices] = useState<ServiceType[]>([]);
  const [cost, setCost] = useState("");
  const [mileage, setMileage] = useState("");
  const [notes, setNotes] = useState("");
  const [serviceDate, setServiceDate] = useState(todayIso());
  const [workshop, setWorkshop] = useState("");
  const [osImagePath, setOsImagePath] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanOSResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const activeVehicleId = vehicleId || primary?.id || "";
  const hasMultipleVehicles = (vehicles?.length ?? 0) > 1;
  const fromOCR = !!scanResult;

  function toggleService(id: ServiceType) {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  }

  function resetForm() {
    setSelectedServices([]);
    setCost("");
    setMileage("");
    setNotes("");
    setServiceDate(todayIso());
    setWorkshop("");
    setOsImagePath(null);
    setScanResult(null);
  }

  function goBack() {
    if (step !== "choose") {
      setStep("choose");
      resetForm();
      setError("");
    } else {
      router.back();
    }
  }

  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    processFile(file);
  }

  async function processFile(file: File) {
    setError("");
    setStep("uploading");

    try {
      const result = await scanOS.mutateAsync(file);
      setScanResult(result);
      setSelectedServices([result.service_type]);
      setCost(result.cost != null ? String(result.cost).replace(".", ",") : "");
      setMileage(result.mileage != null ? String(result.mileage) : "");
      setServiceDate(result.service_date ?? todayIso());
      setWorkshop(result.workshop ?? "");
      setNotes(result.description ?? "");
      setOsImagePath(result.os_image_path);
      setStep("manual");
      toast.success("Dados extraídos! Revise antes de salvar.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao processar imagem";
      toast.error(message);
      setStep("choose");
    }
  }

  async function handleSubmit() {
    setError("");

    if (!activeVehicleId) {
      setError("Cadastre um veículo antes de registrar manutenções");
      return;
    }

    if (selectedServices.length === 0) {
      setError("Selecione ao menos um tipo de serviço");
      return;
    }

    const parsed = manualSchema.safeParse({
      cost: cost ? Number(cost.replace(",", ".")) : undefined,
      mileage: mileage ? Number(mileage) : undefined,
      description: notes || undefined,
      service_date: serviceDate,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }

    // Divide o valor total igualmente entre os serviços selecionados
    const costPerService =
      Math.round((parsed.data.cost / selectedServices.length) * 100) / 100;

    setSaving(true);
    try {
      for (const serviceType of selectedServices) {
        await createMaintenance.mutateAsync({
          vehicle_id: activeVehicleId,
          service_type: serviceType,
          cost: costPerService,
          mileage: parsed.data.mileage ?? null,
          description: parsed.data.description ?? null,
          service_date: parsed.data.service_date,
          workshop: workshop || null,
          os_image_path: serviceType === selectedServices[0] ? osImagePath : null,
          parts: serviceType === selectedServices[0] ? (scanResult?.parts ?? []) : [],
          source: fromOCR ? "ocr" : "manual",
        });
      }

      const msg =
        selectedServices.length > 1
          ? `${selectedServices.length} manutenções registradas!`
          : "Manutenção registrada!";
      toast.success(msg);
      router.push("/timeline");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar manutenção");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        onChange={handleFileSelected}
        className="hidden"
      />

      <div className="px-5 pt-14 pb-24 animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={goBack}
            className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center card-shadow active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-4.5 h-4.5 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground tracking-tight">
            {step === "choose"
              ? "Nova Manutenção"
              : step === "manual"
              ? fromOCR ? "Confirmar dados" : "Registro Rápido"
              : step === "camera"
              ? "Foto da Nota"
              : "Processando..."}
          </h1>
        </div>

        {!primary && (
          <div className="bg-warning/10 border border-warning/20 rounded-2xl p-4 mb-4 animate-fade-in-up">
            <p className="text-sm font-semibold text-foreground">Você ainda não tem veículos</p>
            <p className="text-xs text-muted-foreground mb-3">Cadastre um veículo para começar a registrar manutenções.</p>
            <button onClick={() => router.push("/vehicles/new")} className="text-sm font-semibold text-primary">
              Cadastrar veículo →
            </button>
          </div>
        )}

        {step === "choose" && (
          <div className="space-y-4 animate-fade-in-up">
            <p className="text-sm text-muted-foreground mb-6">Como você quer registrar?</p>

            {ocrLimitReached ? (
              <div className="w-full bg-card rounded-2xl p-6 card-shadow border border-border opacity-60">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center">
                    <Camera className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">Foto da nota</h3>
                      <span className="text-[10px] font-semibold text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-full">
                        5/5 usados
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Limite gratuito atingido
                    </p>
                  </div>
                </div>
                <UpgradeButton feature="ocr_scan" label="Desbloquear scans ilimitados" fullWidth />
              </div>
            ) : (
              <button
                onClick={() => {
                  setStep("camera");
                  fileInputRef.current?.click();
                }}
                disabled={!primary}
                className="w-full bg-card rounded-2xl p-6 card-shadow flex items-center gap-4 active:scale-[0.98] transition-transform border border-border disabled:opacity-50"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <Camera className="w-7 h-7 text-primary" />
                </div>
                <div className="text-left flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">Foto da nota</h3>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                      <Sparkles className="w-3 h-3" />
                      IA
                    </span>
                    {ocrScansLeft !== null && ocrScansLeft <= 3 && (
                      <span className="text-[10px] font-semibold text-warning bg-warning/10 px-1.5 py-0.5 rounded-full">
                        {ocrScansLeft} restante{ocrScansLeft !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Nossa IA extrai os dados automaticamente
                  </p>
                </div>
              </button>
            )}

            <button
              onClick={() => setStep("manual")}
              disabled={!primary}
              className="w-full bg-card rounded-2xl p-6 card-shadow flex items-center gap-4 active:scale-[0.98] transition-transform border border-border disabled:opacity-50"
            >
              <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center">
                <PenLine className="w-7 h-7 text-muted-foreground" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-foreground">Registro rápido</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Selecione o serviço e pronto — menos de 30s
                </p>
              </div>
            </button>

            <button
              onClick={() => router.push("/diagnosis")}
              disabled={!primary}
              className="w-full bg-card rounded-2xl p-6 card-shadow flex items-center gap-4 active:scale-[0.98] transition-transform border border-border disabled:opacity-50"
            >
              <div className="w-14 h-14 bg-warning/10 rounded-2xl flex items-center justify-center">
                <Stethoscope className="w-7 h-7 text-warning" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">Descrever sintoma</h3>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-warning bg-warning/10 px-1.5 py-0.5 rounded-full">
                    <Sparkles className="w-3 h-3" />
                    IA
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Descreva um problema e a IA identifica a causa
                </p>
              </div>
            </button>
          </div>
        )}

        {step === "camera" && (
          <div className="animate-fade-in-up text-center py-12">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex flex-col items-center gap-4"
            >
              <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center">
                <Camera className="w-12 h-12 text-primary" />
              </div>
              <p className="text-sm font-semibold text-foreground">Toque para tirar uma foto</p>
              <p className="text-xs text-muted-foreground">ou selecionar da galeria</p>
            </button>
          </div>
        )}

        {step === "uploading" && (
          <div className="animate-fade-in-up text-center py-16">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
            <p className="text-sm font-semibold text-foreground mb-1">
              Lendo sua nota...
            </p>
            <p className="text-xs text-muted-foreground max-w-[260px] mx-auto">
              A IA está extraindo os dados. Isso leva alguns segundos.
            </p>
          </div>
        )}

        {step === "manual" && (
          <div className="animate-fade-in-up space-y-6">
            {fromOCR && (
              <div className="bg-success/10 border border-success/20 rounded-2xl p-4 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">Dados extraídos pela IA</p>
                  <p className="text-xs text-muted-foreground">
                    Revise abaixo antes de confirmar. Você pode editar qualquer campo.
                  </p>
                </div>
              </div>
            )}

            {hasMultipleVehicles && vehicles && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Veículo</p>
                <select
                  value={activeVehicleId}
                  onChange={(e) => setVehicleId(e.target.value)}
                  className="w-full h-12 px-3 rounded-xl border border-border bg-card text-foreground"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>{v.brand} {v.model} {v.year}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  O que foi feito?
                </p>
                {selectedServices.length > 1 && (
                  <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                    {selectedServices.length} selecionados
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {quickServices.map((svc) => {
                  const isSelected = selectedServices.includes(svc.id);
                  const Icon = svc.icon;
                  return (
                    <button
                      key={svc.id}
                      onClick={() => toggleService(svc.id)}
                      className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all active:scale-95 ${
                        isSelected
                          ? "bg-primary/10 border-primary ring-1 ring-primary/30"
                          : "bg-card border-border"
                      }`}
                    >
                      {isSelected && (
                        <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-primary-foreground" />
                        </span>
                      )}
                      <Icon className={`w-6 h-6 ${isSelected ? "text-primary" : svc.color}`} />
                      <span className={`text-xs font-medium text-center leading-tight ${
                        isSelected ? "text-primary" : "text-foreground"
                      }`}>
                        {SERVICE_TYPE_LABELS[svc.id]}
                      </span>
                    </button>
                  );
                })}
              </div>
              {selectedServices.length > 1 && (
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  O valor informado será dividido entre os {selectedServices.length} serviços
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Valor (R$)</p>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    inputMode="decimal"
                    placeholder="280,00"
                    value={cost}
                    onChange={(e) => setCost(e.target.value.replace(/[^\d,.]/g, ""))}
                    className="pl-9 h-12 rounded-xl border-border bg-card text-foreground"
                  />
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">KM atual</p>
                <div className="relative">
                  <Gauge className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="45230"
                    value={mileage}
                    onChange={(e) => setMileage(e.target.value.replace(/\D/g, ""))}
                    className="pl-9 h-12 rounded-xl border-border bg-card text-foreground"
                  />
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Oficina (opcional)</p>
              <Input
                placeholder="Nome da oficina"
                value={workshop}
                onChange={(e) => setWorkshop(e.target.value)}
                className="h-12 rounded-xl border-border bg-card text-foreground"
              />
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Observação (opcional)</p>
              <Input
                placeholder="Ex: Óleo Mobil 5W30, filtro Mann"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="h-12 rounded-xl border-border bg-card text-foreground"
              />
            </div>

            <div className="bg-card rounded-xl p-3.5 border border-border flex items-center gap-3">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Data</p>
                <input
                  type="date"
                  value={serviceDate}
                  onChange={(e) => setServiceDate(e.target.value)}
                  className="text-sm font-medium text-foreground bg-transparent outline-none w-full"
                  max={todayIso()}
                />
              </div>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl px-4 py-3 animate-fade-in">
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={selectedServices.length === 0 || !cost || saving || !primary}
              className={`w-full font-semibold py-4 rounded-2xl text-base flex items-center justify-center gap-2 card-shadow-lg active:scale-[0.98] transition-all ${
                selectedServices.length > 0 && cost && primary
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
            >
              {saving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  {fromOCR
                    ? "Confirmar e salvar"
                    : selectedServices.length > 1
                    ? `Salvar ${selectedServices.length} manutenções`
                    : "Salvar manutenção"}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
