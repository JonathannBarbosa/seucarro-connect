import { Bell, Car, Droplets, FileText, Plus, TrendingUp } from "lucide-react";
import AppShell from "@/components/AppShell";

const Dashboard = () => {
  return (
    <AppShell>
      <div className="px-5 pt-14 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-muted-foreground">Olá, João 👋</p>
            <h1 className="text-xl font-bold text-foreground tracking-tight">Meu Veículo</h1>
          </div>
          <button className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center card-shadow active:scale-95 transition-transform">
            <Bell className="w-4.5 h-4.5 text-muted-foreground" />
          </button>
        </div>

        {/* Vehicle Card */}
        <div className="bg-card rounded-2xl p-5 card-shadow-lg mb-4 animate-fade-in-up">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center">
                <Car className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Honda Civic</h3>
                <p className="text-sm text-muted-foreground">2021 · 45.230 km</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 bg-success/10 text-success px-3 py-1 rounded-full text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-soft" />
              Em dia
            </span>
          </div>
        </div>

        {/* Next Maintenance Alert */}
        <div className="bg-warning/10 border border-warning/20 rounded-2xl p-4 mb-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
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

        {/* Monthly Spending */}
        <div className="bg-card rounded-2xl p-5 card-shadow mb-4 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-muted-foreground">Gastos este mês</p>
            <TrendingUp className="w-4 h-4 text-success" />
          </div>
          <p className="text-2xl font-bold text-foreground">R$ 450,00</p>
          <p className="text-xs text-success font-medium mt-1">↓ 12% vs. mês anterior</p>

          {/* Mini bar chart */}
          <div className="flex items-end gap-1.5 mt-4 h-12">
            {[40, 65, 30, 80, 55, 70, 45].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-md bg-primary/15 transition-all hover:bg-primary/30"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[9px] text-muted-foreground">Jan</span>
            <span className="text-[9px] text-muted-foreground">Jul</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <button
            onClick={() => window.location.href = '/add'}
            className="bg-primary text-primary-foreground rounded-2xl p-4 flex items-center gap-3 card-shadow-lg active:scale-[0.97] transition-transform"
          >
            <Plus className="w-5 h-5" />
            <span className="text-sm font-semibold">Adicionar manutenção</span>
          </button>
          <button
            onClick={() => window.location.href = '/alerts'}
            className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3 card-shadow active:scale-[0.97] transition-transform"
          >
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Alertas</span>
          </button>
        </div>
      </div>
    </AppShell>
  );
};

export default Dashboard;
