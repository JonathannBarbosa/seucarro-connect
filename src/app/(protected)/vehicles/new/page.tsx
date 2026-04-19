"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Car, Check, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import AppShell from "@/components/AppShell";
import { Input } from "@/components/ui/input";
import { useCreateVehicle } from "@/hooks/useVehicles";
import { BRANDS, COMMON_COLORS } from "@/data/brands";
import type { FuelType } from "@/types/database";

type Step = "brand" | "model" | "year" | "mileage" | "fuel" | "optional" | "confirm";

const STEPS: Step[] = ["brand", "model", "year", "mileage", "fuel", "optional", "confirm"];

interface Draft {
  brandId: string;
  brandName: string;
  customBrand: string;
  model: string;
  customModel: string;
  year: number;
  mileage: string;
  fuelType: FuelType | null;
  licensePlate: string;
  color: string;
}

const currentYear = new Date().getFullYear();
const initialDraft: Draft = {
  brandId: "",
  brandName: "",
  customBrand: "",
  model: "",
  customModel: "",
  year: currentYear,
  mileage: "",
  fuelType: "flex",
  licensePlate: "",
  color: "",
};

function haptic() {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(8);
  }
}

export default function NewVehiclePage() {
  const router = useRouter();
  const createVehicle = useCreateVehicle();
  const [step, setStep] = useState<Step>("brand");
  const [draft, setDraft] = useState<Draft>(initialDraft);
  const [submitError, setSubmitError] = useState("");

  const stepIndex = STEPS.indexOf(step);

  function goTo(next: Step) {
    haptic();
    setStep(next);
  }

  function goNext() {
    const next = STEPS[stepIndex + 1];
    if (next) goTo(next);
  }

  function goBack() {
    if (stepIndex === 0) {
      router.back();
      return;
    }
    goTo(STEPS[stepIndex - 1]);
  }

  async function handleSubmit() {
    setSubmitError("");
    const finalBrand = draft.brandId === "outra" ? draft.customBrand.trim() : draft.brandName;
    const finalModel = draft.model === "Outro" ? draft.customModel.trim() : draft.model;

    if (!finalBrand || !finalModel) {
      setSubmitError("Marca e modelo são obrigatórios");
      return;
    }

    try {
      await createVehicle.mutateAsync({
        brand: finalBrand,
        model: finalModel,
        year: draft.year,
        license_plate: draft.licensePlate.trim() || null,
        color: draft.color.trim() || null,
        fuel_type: draft.fuelType,
        current_mileage: Number(draft.mileage) || 0,
        image_url: null,
        is_primary: false,
      });

      toast.success("Veículo cadastrado com sucesso!");
      router.push("/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao cadastrar veículo";
      setSubmitError(message);
    }
  }

  return (
    <AppShell>
      <div className="px-5 pt-14 pb-24">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={goBack}
            className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center card-shadow active:scale-95 transition-transform"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Passo {stepIndex + 1} de {STEPS.length}</p>
            <h1 className="text-lg font-bold text-foreground tracking-tight">Novo Veículo</h1>
          </div>
        </div>

        <ProgressBar total={STEPS.length} current={stepIndex + 1} />

        <div key={step} className="mt-8 animate-fade-in-up">
          {step === "brand" && (
            <BrandStep
              selectedId={draft.brandId}
              onSelect={(b) => {
                setDraft((d) => ({ ...d, brandId: b.id, brandName: b.name, model: "", customModel: "" }));
                haptic();
                setTimeout(() => goTo("model"), 120);
              }}
            />
          )}

          {step === "model" && (
            <ModelStep
              brandId={draft.brandId}
              brandName={draft.brandName}
              customBrand={draft.customBrand}
              selectedModel={draft.model}
              customModel={draft.customModel}
              onCustomBrandChange={(v) => setDraft((d) => ({ ...d, customBrand: v }))}
              onCustomModelChange={(v) => setDraft((d) => ({ ...d, customModel: v }))}
              onSelect={(model) => {
                setDraft((d) => ({ ...d, model }));
                if (model !== "Outro") {
                  haptic();
                  setTimeout(() => goTo("year"), 120);
                }
              }}
              onContinue={goNext}
            />
          )}

          {step === "year" && (
            <YearStep
              value={draft.year}
              onChange={(year) => {
                setDraft((d) => ({ ...d, year }));
                haptic();
                setTimeout(() => goTo("mileage"), 120);
              }}
            />
          )}

          {step === "mileage" && (
            <MileageStep
              value={draft.mileage}
              onChange={(mileage) => setDraft((d) => ({ ...d, mileage }))}
              onContinue={goNext}
            />
          )}

          {step === "fuel" && (
            <FuelStep
              value={draft.fuelType}
              onChange={(fuelType) => {
                setDraft((d) => ({ ...d, fuelType }));
                haptic();
                setTimeout(() => goTo("optional"), 120);
              }}
            />
          )}

          {step === "optional" && (
            <OptionalStep
              licensePlate={draft.licensePlate}
              color={draft.color}
              onLicensePlateChange={(v) => setDraft((d) => ({ ...d, licensePlate: v }))}
              onColorChange={(v) => setDraft((d) => ({ ...d, color: v }))}
              onContinue={goNext}
            />
          )}

          {step === "confirm" && (
            <ConfirmStep
              draft={draft}
              loading={createVehicle.isPending}
              error={submitError}
              onSubmit={handleSubmit}
            />
          )}
        </div>
      </div>
    </AppShell>
  );
}

function ProgressBar({ total, current }: { total: number; current: number }) {
  const pct = (current / total) * 100;
  return (
    <div className="h-1 bg-secondary rounded-full overflow-hidden">
      <div
        className="h-full bg-primary transition-all duration-300 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

interface StepHeaderProps {
  title: string;
  subtitle?: string;
}

function StepHeader({ title, subtitle }: StepHeaderProps) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-foreground tracking-tight">{title}</h2>
      {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
    </div>
  );
}

function BrandStep({
  selectedId,
  onSelect,
}: {
  selectedId: string;
  onSelect: (brand: { id: string; name: string }) => void;
}) {
  return (
    <div>
      <StepHeader title="Qual a marca do seu carro?" subtitle="Toque para selecionar" />
      <div className="grid grid-cols-3 gap-2.5">
        {BRANDS.map((brand) => {
          const active = selectedId === brand.id;
          return (
            <button
              key={brand.id}
              onClick={() => onSelect({ id: brand.id, name: brand.name })}
              className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-2 transition-all active:scale-95 ${
                active
                  ? "bg-primary text-primary-foreground card-shadow-lg"
                  : "bg-card text-foreground border border-border card-shadow hover:border-primary/30"
              }`}
            >
              <Car className={`w-6 h-6 mb-1.5 ${active ? "text-primary-foreground" : "text-primary"}`} />
              <span className="text-xs font-semibold text-center leading-tight">{brand.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ModelStep({
  brandId,
  brandName,
  customBrand,
  selectedModel,
  customModel,
  onCustomBrandChange,
  onCustomModelChange,
  onSelect,
  onContinue,
}: {
  brandId: string;
  brandName: string;
  customBrand: string;
  selectedModel: string;
  customModel: string;
  onCustomBrandChange: (v: string) => void;
  onCustomModelChange: (v: string) => void;
  onSelect: (model: string) => void;
  onContinue: () => void;
}) {
  const brand = BRANDS.find((b) => b.id === brandId);
  const models = brand?.models ?? [];
  const isCustomBrand = brandId === "outra";

  if (isCustomBrand) {
    const canContinue = customBrand.trim().length > 0 && customModel.trim().length > 0;
    return (
      <div>
        <StepHeader title="Qual a marca e o modelo?" subtitle="Informe a marca e o modelo do seu veículo" />
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Marca</label>
            <Input
              type="text"
              placeholder="Ex: Subaru"
              value={customBrand}
              onChange={(e) => onCustomBrandChange(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Modelo</label>
            <Input
              type="text"
              placeholder="Ex: Forester"
              value={customModel}
              onChange={(e) => onCustomModelChange(e.target.value)}
            />
          </div>
          <button
            disabled={!canContinue}
            onClick={() => {
              onSelect("Outro");
              setTimeout(onContinue, 120);
            }}
            className="w-full bg-primary text-primary-foreground font-semibold py-4 rounded-2xl text-base card-shadow-lg active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            Continuar
          </button>
        </div>
      </div>
    );
  }

  const showCustomInput = selectedModel === "Outro";

  return (
    <div>
      <StepHeader title={`Qual modelo da ${brandName}?`} subtitle="Toque para selecionar" />
      <div className="space-y-2 mb-4">
        {models.map((model) => {
          const active = selectedModel === model;
          return (
            <button
              key={model}
              onClick={() => onSelect(model)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all active:scale-[0.98] ${
                active
                  ? "bg-primary text-primary-foreground card-shadow-lg"
                  : "bg-card text-foreground border border-border card-shadow"
              }`}
            >
              <span className="font-semibold">{model}</span>
              {active ? <Check className="w-5 h-5" /> : <ChevronRight className="w-5 h-5 opacity-40" />}
            </button>
          );
        })}
        <button
          onClick={() => onSelect("Outro")}
          className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all active:scale-[0.98] ${
            showCustomInput
              ? "bg-primary text-primary-foreground card-shadow-lg"
              : "bg-card text-foreground border border-dashed border-border"
          }`}
        >
          <span className="font-semibold">Outro modelo</span>
          {showCustomInput ? <Check className="w-5 h-5" /> : <ChevronRight className="w-5 h-5 opacity-40" />}
        </button>
      </div>

      {showCustomInput && (
        <div className="space-y-4 animate-fade-in">
          <Input
            type="text"
            placeholder="Digite o modelo"
            value={customModel}
            onChange={(e) => onCustomModelChange(e.target.value)}
            autoFocus
          />
          <button
            disabled={customModel.trim().length === 0}
            onClick={onContinue}
            className="w-full bg-primary text-primary-foreground font-semibold py-4 rounded-2xl text-base card-shadow-lg active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            Continuar
          </button>
        </div>
      )}
    </div>
  );
}

function YearStep({ value, onChange }: { value: number; onChange: (year: number) => void }) {
  const years = useMemo(() => {
    const list: number[] = [];
    for (let y = currentYear + 1; y >= currentYear - 30; y--) list.push(y);
    return list;
  }, []);

  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLButtonElement>(`[data-year="${value}"]`);
    el?.scrollIntoView({ block: "center", behavior: "auto" });
  }, [value]);

  return (
    <div>
      <StepHeader title="Qual o ano do veículo?" subtitle="Selecione abaixo" />
      <div
        ref={listRef}
        className="max-h-[60vh] overflow-y-auto space-y-2 px-1 snap-y"
      >
        {years.map((y) => {
          const active = value === y;
          return (
            <button
              key={y}
              data-year={y}
              onClick={() => onChange(y)}
              className={`w-full snap-center p-4 rounded-2xl transition-all active:scale-[0.98] ${
                active
                  ? "bg-primary text-primary-foreground card-shadow-lg scale-[1.02]"
                  : "bg-card text-foreground border border-border card-shadow"
              }`}
            >
              <span className={`font-bold ${active ? "text-2xl" : "text-lg"}`}>{y}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MileageStep({
  value,
  onChange,
  onContinue,
}: {
  value: string;
  onChange: (v: string) => void;
  onContinue: () => void;
}) {
  const display = value
    ? new Intl.NumberFormat("pt-BR").format(Number(value.replace(/\D/g, "")))
    : "0";

  return (
    <div>
      <StepHeader title="Quilometragem atual" subtitle="Quantos km o veículo já rodou?" />

      <div className="bg-card rounded-3xl p-8 card-shadow-lg mb-6 text-center">
        <p className="text-5xl font-extrabold text-foreground tracking-tight tabular-nums">
          {display}
          <span className="text-2xl text-muted-foreground font-semibold ml-1.5">km</span>
        </p>
      </div>

      <Input
        type="text"
        inputMode="numeric"
        placeholder="Digite a quilometragem"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
        autoFocus
        className="text-center text-lg h-14 rounded-2xl"
      />

      <button
        disabled={!value || Number(value) <= 0}
        onClick={onContinue}
        className="w-full mt-4 bg-primary text-primary-foreground font-semibold py-4 rounded-2xl text-base card-shadow-lg active:scale-[0.98] transition-transform disabled:opacity-50"
      >
        Continuar
      </button>
    </div>
  );
}

function FuelStep({
  value,
  onChange,
}: {
  value: FuelType | null;
  onChange: (v: FuelType) => void;
}) {
  const options: { value: FuelType; label: string; emoji: string }[] = [
    { value: "flex", label: "Flex", emoji: "⛽" },
    { value: "gasolina", label: "Gasolina", emoji: "🚗" },
    { value: "etanol", label: "Etanol", emoji: "🌾" },
    { value: "diesel", label: "Diesel", emoji: "🚛" },
    { value: "gnv", label: "GNV", emoji: "💨" },
    { value: "eletrico", label: "Elétrico", emoji: "⚡" },
    { value: "hibrido", label: "Híbrido", emoji: "🔋" },
  ];

  return (
    <div>
      <StepHeader title="Qual o combustível?" subtitle="Flex é o mais comum no Brasil" />
      <div className="grid grid-cols-2 gap-2.5">
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={`p-4 rounded-2xl flex flex-col items-center gap-2 transition-all active:scale-95 ${
                active
                  ? "bg-primary text-primary-foreground card-shadow-lg"
                  : "bg-card text-foreground border border-border card-shadow"
              }`}
            >
              <span className="text-2xl">{opt.emoji}</span>
              <span className="text-sm font-semibold">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function OptionalStep({
  licensePlate,
  color,
  onLicensePlateChange,
  onColorChange,
  onContinue,
}: {
  licensePlate: string;
  color: string;
  onLicensePlateChange: (v: string) => void;
  onColorChange: (v: string) => void;
  onContinue: () => void;
}) {
  return (
    <div>
      <StepHeader title="Quase lá!" subtitle="Placa e cor são opcionais" />

      <div className="mb-6">
        <label className="text-sm font-medium text-foreground mb-2 block">Placa</label>
        <Input
          type="text"
          placeholder="ABC1D23"
          value={licensePlate}
          onChange={(e) => onLicensePlateChange(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
          maxLength={7}
          className="text-center text-lg h-14 rounded-2xl tracking-widest font-bold"
        />
      </div>

      <div className="mb-6">
        <label className="text-sm font-medium text-foreground mb-2 block">Cor</label>
        <div className="grid grid-cols-5 gap-2">
          {COMMON_COLORS.map((c) => {
            const active = color === c.name;
            return (
              <button
                key={c.id}
                onClick={() => onColorChange(active ? "" : c.name)}
                className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 p-1 transition-all active:scale-95 ${
                  active
                    ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                    : "border border-border"
                }`}
                aria-label={c.name}
              >
                <span
                  className="w-8 h-8 rounded-full border border-border/60"
                  style={{ backgroundColor: c.hex }}
                />
                <span className="text-[10px] font-medium text-foreground leading-none">{c.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onContinue}
          className="flex-1 bg-secondary text-foreground font-semibold py-4 rounded-2xl text-base active:scale-[0.98] transition-transform"
        >
          Pular
        </button>
        <button
          onClick={onContinue}
          className="flex-1 bg-primary text-primary-foreground font-semibold py-4 rounded-2xl text-base card-shadow-lg active:scale-[0.98] transition-transform"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}

function ConfirmStep({
  draft,
  loading,
  error,
  onSubmit,
}: {
  draft: Draft;
  loading: boolean;
  error: string;
  onSubmit: () => void;
}) {
  const brand = draft.brandId === "outra" ? draft.customBrand : draft.brandName;
  const model = draft.model === "Outro" ? draft.customModel : draft.model;
  const mileage = draft.mileage
    ? `${new Intl.NumberFormat("pt-BR").format(Number(draft.mileage))} km`
    : "—";

  const fuelLabels: Record<FuelType, string> = {
    flex: "Flex",
    gasolina: "Gasolina",
    etanol: "Etanol",
    diesel: "Diesel",
    gnv: "GNV",
    eletrico: "Elétrico",
    hibrido: "Híbrido",
  };

  return (
    <div>
      <StepHeader title="Tudo certo?" subtitle="Confira os dados do seu veículo" />

      <div className="bg-card rounded-3xl p-5 card-shadow-lg mb-6">
        <div className="flex items-center gap-3 mb-5 pb-5 border-b border-border">
          <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center">
            <Car className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">{brand} {model}</h3>
            <p className="text-sm text-muted-foreground">{draft.year} · {mileage}</p>
          </div>
        </div>

        <dl className="space-y-3 text-sm">
          <Row label="Combustível" value={draft.fuelType ? fuelLabels[draft.fuelType] : "—"} />
          <Row label="Placa" value={draft.licensePlate || "—"} />
          <Row label="Cor" value={draft.color || "—"} />
        </dl>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl px-4 py-3 mb-4 animate-fade-in">
          {error}
        </div>
      )}

      <button
        onClick={onSubmit}
        disabled={loading}
        className="w-full bg-primary text-primary-foreground font-semibold py-4 rounded-2xl text-base flex items-center justify-center gap-2 card-shadow-lg active:scale-[0.98] transition-transform disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Cadastrar veículo"}
      </button>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-semibold text-foreground">{value}</dd>
    </div>
  );
}
