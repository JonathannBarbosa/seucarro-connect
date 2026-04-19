"use client";

import { Bell, Car, Droplets, FileText, Fuel, Plus, TrendingUp, Wrench } from "lucide-react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { useProfile, getFirstName } from "@/hooks/useProfile";
import { usePrimaryVehicle } from "@/hooks/useVehicles";

export default function DashboardPage() {
  const router = useRouter();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: vehicle, isLoading: vehicleLoading } = usePrimaryVehicle();

  const firstName = getFirstName(profile?.full_name);
  const formattedMileage = vehicle
    ? new Intl.NumberFormat("pt-BR").format(vehicle.current_mileage)
    : "";

  return (
    <AppShell>
      <div className="px-5 pt-14 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-muted-foreground">
              {profileLoading ? "Carregando..." : `Olá, ${firstName || "visitante"} 👋`}
            </p>
            <h1 className="text-xl font-bold text-foreground tracking-tight">Meu Veículo</h1>
          </div>
          <button className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center card-shadow active:scale-95 transition-transform">
            <Bell className="w-4.5 h-4.5 text-muted-foreground" />
          </button>
        </div>

        {vehicleLoading ? (
          <div className="bg-card rounded-2xl p-5 card-shadow-lg mb-4 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-secondary rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-secondary rounded" />
                <div className="h-3 w-24 bg-secondary rounded" />
              </div>
            </div>
          </div>
        ) : vehicle ? (
          <div className="bg-card rounded-2xl p-5 card-shadow-lg mb-4 animate-fade-in-up">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center">
                  <Car className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {vehicle.brand} {vehicle.model}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {vehicle.year} · {formattedMileage} km
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 bg-success/10 text-success px-3 py-1 rounded-full text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-soft" />
                Em dia
              </span>
            </div>
          </div>
        ) : (
          <button
            onClick={() => router.push("/vehicles/new")}
            className="w-full bg-card border-2 border-dashed border-border rounded-2xl p-6 flex flex-col items-center gap-3 card-shadow active:scale-[0.98] transition-transform mb-4 animate-fade-in-up"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Plus className="w-6 h-6 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">Cadastre seu primeiro veículo</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Comece a gerenciar manutenções e gastos
              </p>
            </div>
          </button>
        )}

        {vehicle && (
          <>
            <div className="bg-warning/10 border border-warning/20 rounded-2xl p-4 mb-4 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-warning/20 rounded-xl flex items-center justify-center">
                  <Droplets className="w-5 h-5 text-warning" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">Troca de óleo</p>
                  <p className="text-xs text-muted-foreground">Em 1.200 km ou 15 dias</p>
                </div>
                <span className="text-xs font-semibold text-warning bg-warning/20 px-2.5 py-1 rounded-full">Atenção</span>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-5 card-shadow mb-4 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-muted-foreground">Gastos este mês</p>
                <TrendingUp className="w-4 h-4 text-success" />
              </div>
              <p className="text-2xl font-bold text-foreground">R$ 450,00</p>
              <p className="text-xs text-success font-medium mt-1">↓ 12% vs. mês anterior</p>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-secondary rounded-xl p-3 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
                    <Wrench className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Manutenção</p>
                    <p className="text-sm font-bold text-foreground">R$ 280</p>
                  </div>
                </div>
                <div className="bg-secondary rounded-xl p-3 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-warning/15 flex items-center justify-center">
                    <Fuel className="w-4 h-4 text-warning" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Combustível</p>
                    <p className="text-sm font-bold text-foreground">R$ 170</p>
                  </div>
                </div>
              </div>

              <div className="flex items-end gap-1.5 mt-4 h-12">
                {[40, 65, 30, 80, 55, 70, 45].map((h, i) => (
                  <div key={i} className="flex-1 rounded-md bg-primary/15 transition-all hover:bg-primary/30" style={{ height: `${h}%` }} />
                ))}
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-[9px] text-muted-foreground">Jan</span>
                <span className="text-[9px] text-muted-foreground">Jul</span>
              </div>
            </div>

            <div className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <button
                onClick={() => router.push("/alerts")}
                className="w-full bg-card border border-border rounded-2xl p-4 flex items-center gap-3 card-shadow active:scale-[0.97] transition-transform"
              >
                <Bell className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Alertas</span>
              </button>
            </div>

            <button
              onClick={() => router.push("/report")}
              className="w-full mt-3 bg-accent/10 border border-accent/20 rounded-2xl p-4 flex items-center gap-3 active:scale-[0.97] transition-transform animate-fade-in-up"
              style={{ animationDelay: "0.25s" }}
            >
              <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-foreground">Relatório para Venda</p>
                <p className="text-xs text-muted-foreground">Exporte o histórico verificado do seu veículo</p>
              </div>
            </button>
          </>
        )}
      </div>
    </AppShell>
  );
}
