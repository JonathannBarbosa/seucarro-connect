"use client";

import { ArrowLeft, Battery, CircleDot, Disc, Droplets, LifeBuoy, Plus, Settings, SlidersHorizontal, Wind, Wrench } from "lucide-react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { useMaintenances } from "@/hooks/useMaintenances";
import { formatCurrency, formatDate, formatNumber, groupByMonth } from "@/lib/format";
import { SERVICE_TYPE_LABELS, type ServiceType } from "@/types/database";

const serviceVisuals: Record<ServiceType, { icon: typeof Droplets; color: string; bg: string }> = {
  troca_oleo: { icon: Droplets, color: "text-primary", bg: "bg-primary/10" },
  freios: { icon: Disc, color: "text-warning", bg: "bg-warning/10" },
  pneus: { icon: CircleDot, color: "text-danger", bg: "bg-danger/10" },
  filtros: { icon: Wind, color: "text-sky-500", bg: "bg-sky-500/10" },
  bateria: { icon: Battery, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  suspensao: { icon: LifeBuoy, color: "text-indigo-500", bg: "bg-indigo-500/10" },
  alinhamento: { icon: SlidersHorizontal, color: "text-fuchsia-500", bg: "bg-fuchsia-500/10" },
  revisao: { icon: Settings, color: "text-primary", bg: "bg-primary/10" },
  outro: { icon: Wrench, color: "text-muted-foreground", bg: "bg-secondary" },
};

export default function TimelinePage() {
  const router = useRouter();
  const { data: maintenances, isLoading } = useMaintenances();
  const grouped = maintenances ? groupByMonth(maintenances) : [];

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
          <h1 className="text-xl font-bold text-foreground tracking-tight">Histórico</h1>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="bg-card rounded-xl p-4 card-shadow animate-pulse">
                <div className="h-4 w-32 bg-secondary rounded mb-2" />
                <div className="h-3 w-24 bg-secondary rounded" />
              </div>
            ))}
          </div>
        ) : grouped.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in-up">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
              <Wrench className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Sem manutenções ainda</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-[260px]">
              Registre a primeira manutenção e acompanhe o histórico completo do seu veículo.
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
          <div className="space-y-8">
            {grouped.map((group) => (
              <div key={group.monthKey} className="animate-fade-in-up">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  {group.monthLabel}
                </p>
                <div className="relative">
                  <div className="absolute left-5 top-2 bottom-2 w-px bg-border" />
                  <div className="space-y-1">
                    {group.items.map((m, i) => {
                      const visual = serviceVisuals[m.service_type];
                      const Icon = visual.icon;
                      return (
                        <div
                          key={m.id}
                          className="relative flex gap-4 animate-fade-in-up"
                          style={{ animationDelay: `${i * 0.05}s` }}
                        >
                          <div className={`w-10 h-10 ${visual.bg} rounded-xl flex items-center justify-center z-10 flex-shrink-0`}>
                            <Icon className={`w-4.5 h-4.5 ${visual.color}`} />
                          </div>
                          <div className="flex-1 bg-card rounded-xl p-4 border border-border mb-3 card-shadow">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold text-sm text-foreground truncate">
                                    {SERVICE_TYPE_LABELS[m.service_type]}
                                  </h3>
                                  {m.source === "ocr" && (
                                    <span className="text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full flex-shrink-0">
                                      IA
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {formatDate(m.service_date)}
                                  {m.mileage != null && ` · ${formatNumber(m.mileage)} km`}
                                </p>
                                {m.workshop && (
                                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{m.workshop}</p>
                                )}
                              </div>
                              <span className="text-sm font-bold text-foreground whitespace-nowrap">
                                {formatCurrency(Number(m.cost))}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
