"use client";

import { ArrowLeft, Car, ChevronRight, Crown, LogOut, Plus, Settings, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import AppShell from "@/components/AppShell";
import { useProfile } from "@/hooks/useProfile";
import { useVehicles } from "@/hooks/useVehicles";

export default function ProfilePage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: vehicles, isLoading: vehiclesLoading } = useVehicles();

  const displayName =
    profile?.full_name ||
    (user?.user_metadata?.full_name as string | undefined) ||
    "Usuário";

  const handleSignOut = async () => {
    await signOut();
    router.replace("/login");
  };

  return (
    <AppShell>
      <div className="px-5 pt-14 animate-fade-in">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center card-shadow active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-4.5 h-4.5 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Perfil</h1>
        </div>

        <div className="flex flex-col items-center mb-8 animate-fade-in-up">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-3">
            <User className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-lg font-bold text-foreground">
            {profileLoading ? "Carregando..." : displayName}
          </h2>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>

        <div
          className="bg-primary rounded-2xl p-5 card-shadow-lg mb-6 animate-fade-in-up"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className="w-5 h-5 text-primary-foreground" />
              <div>
                <p className="text-sm font-semibold text-primary-foreground">Plano Gratuito</p>
                <p className="text-xs text-primary-foreground/70">1 veículo · Recursos básicos</p>
              </div>
            </div>
            <button
              onClick={() => router.push("/plans")}
              className="bg-primary-foreground/20 text-primary-foreground text-xs font-semibold px-4 py-2 rounded-xl active:scale-95 transition-transform"
            >
              Upgrade
            </button>
          </div>
        </div>

        <div className="mb-6 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-muted-foreground">Meus Veículos</h3>
            {vehicles && vehicles.length > 0 && (
              <button
                onClick={() => router.push("/vehicles/new")}
                className="flex items-center gap-1 text-xs font-semibold text-primary active:scale-95 transition-transform"
              >
                <Plus className="w-3.5 h-3.5" />
                Adicionar
              </button>
            )}
          </div>

          {vehiclesLoading ? (
            <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3 card-shadow animate-pulse">
              <div className="w-10 h-10 bg-secondary rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-32 bg-secondary rounded" />
                <div className="h-2.5 w-20 bg-secondary rounded" />
              </div>
            </div>
          ) : vehicles && vehicles.length > 0 ? (
            <div className="space-y-2">
              {vehicles.map((v) => {
                const formattedKm = new Intl.NumberFormat("pt-BR").format(v.current_mileage);
                return (
                  <button
                    key={v.id}
                    className="w-full bg-card rounded-xl border border-border p-4 flex items-center gap-3 card-shadow active:scale-[0.98] transition-transform"
                  >
                    <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
                      <Car className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">
                          {v.brand} {v.model} {v.year}
                        </p>
                        {v.is_primary && (
                          <span className="text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                            Principal
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{formattedKm} km</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                );
              })}
            </div>
          ) : (
            <button
              onClick={() => router.push("/vehicles/new")}
              className="w-full bg-card border-2 border-dashed border-border rounded-xl p-5 flex flex-col items-center gap-2 card-shadow active:scale-[0.98] transition-transform"
            >
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Plus className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm font-semibold text-foreground">Cadastrar veículo</p>
              <p className="text-xs text-muted-foreground">Você ainda não tem veículos</p>
            </button>
          )}
        </div>

        <div className="space-y-1 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <button className="w-full flex items-center gap-3 p-4 rounded-xl active:bg-secondary hover:bg-secondary/50 transition-colors">
            <Settings className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Configurações</span>
          </button>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 p-4 rounded-xl active:bg-secondary hover:bg-secondary/50 transition-colors"
          >
            <LogOut className="w-5 h-5 text-danger" />
            <span className="text-sm font-medium text-danger">Sair</span>
          </button>
        </div>
      </div>
    </AppShell>
  );
}
