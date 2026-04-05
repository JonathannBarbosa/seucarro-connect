"use client";

import { ArrowLeft, TrendingUp, TrendingDown, Wrench, DollarSign } from "lucide-react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";

const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"];
const values = [320, 150, 520, 0, 280, 450];
const maxVal = Math.max(...values);

export default function AnalyticsPage() {
  const router = useRouter();

  return (
    <AppShell>
      <div className="px-5 pt-14 animate-fade-in">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center card-shadow active:scale-95 transition-transform">
            <ArrowLeft className="w-4.5 h-4.5 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Análises</h1>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-card rounded-2xl p-4 card-shadow animate-fade-in-up">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-success" />
              <span className="text-xs text-muted-foreground">Total gasto</span>
            </div>
            <p className="text-xl font-bold text-foreground">R$ 3.800</p>
            <p className="text-xs text-muted-foreground mt-0.5">em 2026</p>
          </div>
          <div className="bg-card rounded-2xl p-4 card-shadow animate-fade-in-up" style={{ animationDelay: "0.05s" }}>
            <div className="flex items-center gap-2 mb-2">
              <Wrench className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Manutenções</span>
            </div>
            <p className="text-xl font-bold text-foreground">5</p>
            <p className="text-xs text-muted-foreground mt-0.5">nos últimos 12 meses</p>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-5 card-shadow-lg mb-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-foreground">Gastos mensais</p>
            <span className="text-xs text-muted-foreground">2026</span>
          </div>
          <div className="flex items-end gap-2 h-36">
            {values.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] font-medium text-muted-foreground">{v > 0 ? `R$${v}` : "—"}</span>
                <div className={`w-full rounded-lg transition-all ${i === values.length - 1 ? "bg-primary" : "bg-primary/15"}`} style={{ height: `${v > 0 ? (v / maxVal) * 100 : 4}%`, minHeight: 4 }} />
                <span className="text-[10px] text-muted-foreground">{months[i]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
          <h2 className="text-sm font-semibold text-foreground">Insights</h2>
          <div className="bg-warning/10 border border-warning/20 rounded-xl p-4 flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
            <p className="text-sm text-foreground">Você está gastando <strong>mais</strong> com manutenção este mês comparado à média.</p>
          </div>
          <div className="bg-success/10 border border-success/20 rounded-xl p-4 flex items-start gap-3">
            <TrendingDown className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
            <p className="text-sm text-foreground">Suas manutenções preventivas economizaram ~<strong>R$ 600</strong> este ano.</p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
