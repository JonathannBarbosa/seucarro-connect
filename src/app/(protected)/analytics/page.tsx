"use client";

import { ArrowLeft, DollarSign, Plus, TrendingDown, TrendingUp, Wrench } from "lucide-react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { useExpensesByCategory, useMonthlyExpenses, useTotalExpenses } from "@/hooks/useExpenses";
import { usePrimaryVehicle } from "@/hooks/useVehicles";
import { formatCurrency } from "@/lib/format";

export default function AnalyticsPage() {
  const router = useRouter();
  const { data: vehicle } = usePrimaryVehicle();
  const { data: monthly } = useMonthlyExpenses({ vehicleId: vehicle?.id, months: 6 });
  const { data: byCategory } = useExpensesByCategory(vehicle?.id);
  const { data: totals, isLoading } = useTotalExpenses(vehicle?.id);

  const maxVal = Math.max(...monthly.map((m) => m.total), 1);
  const currentTotal = monthly[monthly.length - 1]?.total ?? 0;
  const avg = monthly.length > 0 ? monthly.reduce((s, m) => s + m.total, 0) / monthly.length : 0;

  const currentYear = new Date().getFullYear();

  return (
    <AppShell>
      <div className="px-5 pt-14 pb-24 animate-fade-in">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center card-shadow active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-4.5 h-4.5 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Análises</h1>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="bg-card rounded-2xl p-4 card-shadow animate-pulse h-24" />
            ))}
          </div>
        ) : totals.count === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in-up">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Sem dados para analisar</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-[260px]">
              Registre suas manutenções e veja as análises aparecerem aqui automaticamente.
            </p>
            <button
              onClick={() => router.push("/add")}
              className="flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-5 py-3 rounded-2xl card-shadow-lg active:scale-[0.98] transition-transform"
            >
              <Plus className="w-5 h-5" />
              Registrar manutenção
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-card rounded-2xl p-4 card-shadow animate-fade-in-up">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-success" />
                  <span className="text-xs text-muted-foreground">Total gasto</span>
                </div>
                <p className="text-xl font-bold text-foreground">{formatCurrency(totals.total)}</p>
                <p className="text-xs text-muted-foreground mt-0.5">histórico completo</p>
              </div>
              <div className="bg-card rounded-2xl p-4 card-shadow animate-fade-in-up" style={{ animationDelay: "0.05s" }}>
                <div className="flex items-center gap-2 mb-2">
                  <Wrench className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground">Manutenções</span>
                </div>
                <p className="text-xl font-bold text-foreground">{totals.count}</p>
                <p className="text-xs text-muted-foreground mt-0.5">total registrado</p>
              </div>
            </div>

            <div
              className="bg-card rounded-2xl p-5 card-shadow-lg mb-6 animate-fade-in-up"
              style={{ animationDelay: "0.1s" }}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-foreground">Gastos mensais</p>
                <span className="text-xs text-muted-foreground">{currentYear}</span>
              </div>
              <div className="flex items-end gap-2 h-36">
                {monthly.map((m, i) => {
                  const isCurrent = i === monthly.length - 1;
                  return (
                    <div key={m.monthKey} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[10px] font-medium text-muted-foreground">
                        {m.total > 0 ? formatCurrency(m.total).replace("R$", "").trim() : "—"}
                      </span>
                      <div
                        className={`w-full rounded-lg transition-all ${
                          isCurrent ? "bg-primary" : "bg-primary/15"
                        }`}
                        style={{
                          height: `${m.total > 0 ? (m.total / maxVal) * 100 : 4}%`,
                          minHeight: 4,
                        }}
                      />
                      <span className="text-[10px] text-muted-foreground">{m.monthLabel}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {byCategory.length > 0 && (
              <div
                className="bg-card rounded-2xl p-5 card-shadow mb-6 animate-fade-in-up"
                style={{ animationDelay: "0.15s" }}
              >
                <p className="text-sm font-semibold text-foreground mb-4">Por categoria</p>
                <div className="space-y-3">
                  {byCategory.slice(0, 5).map((cat) => {
                    const pct = totals.total > 0 ? (cat.total / totals.total) * 100 : 0;
                    return (
                      <div key={cat.serviceType}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-foreground">{cat.label}</span>
                          <span className="text-sm font-semibold text-foreground">
                            {formatCurrency(cat.total)}
                          </span>
                        </div>
                        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="space-y-3 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <h2 className="text-sm font-semibold text-foreground">Insights</h2>
              {currentTotal > avg ? (
                <div className="bg-warning/10 border border-warning/20 rounded-xl p-4 flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-foreground">
                    Você gastou <strong>{formatCurrency(currentTotal)}</strong> este mês, acima da sua média ({formatCurrency(avg)}).
                  </p>
                </div>
              ) : (
                <div className="bg-success/10 border border-success/20 rounded-xl p-4 flex items-start gap-3">
                  <TrendingDown className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-foreground">
                    Você está gastando <strong>menos</strong> este mês comparado à média de {formatCurrency(avg)}.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
