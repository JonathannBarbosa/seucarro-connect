"use client";

import { Crown, Lock, Star, Users, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { PlanFeature } from "@/hooks/usePlanFeatures";

interface PaywallConfig {
  title: string;
  description: string;
  benefit: string;
  requiredPlan: "pro" | "familia";
}

const PAYWALL_COPY: Record<PlanFeature, PaywallConfig> = {
  pdf_export: {
    title: "Relatório PDF profissional",
    description: "Compradores confiam mais em históricos documentados. Um relatório PDF pode aumentar o valor de venda do seu carro em até 15%.",
    benefit: "Gere PDFs ilimitados com Selo Verificado",
    requiredPlan: "pro",
  },
  vehicle_score: {
    title: "Score de Confiabilidade",
    description: "Mostre ao comprador que seu carro é bem cuidado com uma pontuação de 0 a 100 baseada no histórico real.",
    benefit: "Desbloqueie o Score com o plano Pro",
    requiredPlan: "pro",
  },
  analytics_advanced: {
    title: "Análise completa de gastos",
    description: "Veja seus gastos por categoria, tendências mensais e insights automáticos para economizar na manutenção.",
    benefit: "Analytics completo disponível no Pro",
    requiredPlan: "pro",
  },
  ocr_scan: {
    title: "Scan ilimitado de notas",
    description: "Você usou seus 5 scans gratuitos. Com o Pro, escaneie notas fiscais ilimitadas com IA e economize tempo.",
    benefit: "Scans ilimitados de notas com IA",
    requiredPlan: "pro",
  },
  multiple_vehicles: {
    title: "Mais de 1 veículo",
    description: "Gerencie todos os carros da família em um só lugar. Carro, moto, caminhonete — tudo organizado.",
    benefit: "Até 3 veículos no Pro, 8 no Família",
    requiredPlan: "pro",
  },
  unlimited_alerts: {
    title: "Alertas ilimitados",
    description: "Não perca nenhuma manutenção importante. Configure alertas por km ou por data sem limite.",
    benefit: "Alertas ilimitados no plano Pro",
    requiredPlan: "pro",
  },
  full_history: {
    title: "Histórico completo",
    description: "Acesse todo o histórico do veículo sem restrição de período. Dados que valorizam seu patrimônio.",
    benefit: "Histórico ilimitado no plano Pro",
    requiredPlan: "pro",
  },
  whatsapp_notifications: {
    title: "Notificações via WhatsApp",
    description: "Receba lembretes de manutenção diretamente no WhatsApp antes de esquecer.",
    benefit: "WhatsApp incluso no plano Pro",
    requiredPlan: "pro",
  },
  family_profiles: {
    title: "Perfis compartilhados",
    description: "Gerencie os veículos do cônjuge e dos filhos com perfis separados e relatórios comparativos.",
    benefit: "Perfis familiares no plano Família",
    requiredPlan: "familia",
  },
  symptom_diagnosis: {
    title: "Diagnóstico por IA",
    description: "Descreva um sintoma e nossa IA analisa o histórico do veículo para identificar causas prováveis e nível de urgência.",
    benefit: "Diagnósticos ilimitados no plano Pro",
    requiredPlan: "pro",
  },
  expense_insights: {
    title: "Insights de gastos por IA",
    description: "Receba análise automática dos seus gastos com recomendações práticas para economizar na manutenção do veículo.",
    benefit: "Insights IA inclusos no plano Pro",
    requiredPlan: "pro",
  },
};

interface PlanGateProps {
  feature: PlanFeature;
  children: React.ReactNode;
  locked: boolean;
  mode?: "blur" | "modal" | "replace";
  replaceFallback?: React.ReactNode;
}

function UpgradeModal({
  feature,
  onClose,
}: {
  feature: PlanFeature;
  onClose: () => void;
}) {
  const router = useRouter();
  const config = PAYWALL_COPY[feature];
  const isPro = config.requiredPlan === "pro";
  const Icon = isPro ? Star : Users;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-card rounded-t-3xl p-6 pb-10 shadow-2xl animate-slide-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-secondary flex items-center justify-center"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
            <Crown className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-lg font-bold text-foreground mb-2">{config.title}</h2>
          <p className="text-sm text-muted-foreground max-w-[280px] leading-relaxed">
            {config.description}
          </p>
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{config.benefit}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isPro ? "A partir de R$ 9,90/mês" : "R$ 19,90/mês"}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            onClose();
            router.push("/plans");
          }}
          className="w-full bg-primary text-primary-foreground rounded-2xl py-4 font-semibold text-sm active:scale-[0.98] transition-transform mb-3"
        >
          Ver planos
        </button>
        <button
          onClick={onClose}
          className="w-full text-sm text-muted-foreground py-2"
        >
          Agora não
        </button>
      </div>
    </div>
  );
}

export function PlanGate({ feature, children, locked, mode = "blur", replaceFallback }: PlanGateProps) {
  const [showModal, setShowModal] = useState(false);

  if (!locked) return <>{children}</>;

  if (mode === "replace" && replaceFallback) {
    return <>{replaceFallback}</>;
  }

  if (mode === "modal") {
    return (
      <>
        <div onClick={() => setShowModal(true)} className="cursor-pointer">
          {children}
        </div>
        {showModal && (
          <UpgradeModal feature={feature} onClose={() => setShowModal(false)} />
        )}
      </>
    );
  }

  return (
    <>
      <div
        className="relative cursor-pointer group"
        onClick={() => setShowModal(true)}
      >
        <div className="pointer-events-none select-none blur-sm opacity-60 group-hover:opacity-40 transition-opacity">
          {children}
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <div className="bg-card border border-border rounded-2xl px-4 py-3 card-shadow flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Disponível no Pro</span>
          </div>
        </div>
      </div>
      {showModal && (
        <UpgradeModal feature={feature} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}

export function UpgradeButton({
  feature,
  label = "Desbloquear",
  fullWidth = false,
}: {
  feature: PlanFeature;
  label?: string;
  fullWidth?: boolean;
}) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`flex items-center justify-center gap-2 bg-primary/10 text-primary border border-primary/20 rounded-xl px-4 py-3.5 text-sm font-semibold active:scale-[0.98] transition-transform ${fullWidth ? "w-full" : ""}`}
      >
        <Crown className="w-4 h-4" />
        {label}
      </button>
      {showModal && (
        <UpgradeModal feature={feature} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
