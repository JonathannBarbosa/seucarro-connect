import { ArrowLeft, Car, ChevronRight, Crown, LogOut, Settings, User } from "lucide-react";
import AppShell from "@/components/AppShell";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();

  return (
    <AppShell>
      <div className="px-5 pt-14 animate-fade-in">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center card-shadow active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-4.5 h-4.5 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Perfil</h1>
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center mb-8 animate-fade-in-up">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-3">
            <User className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-lg font-bold text-foreground">João Silva</h2>
          <p className="text-sm text-muted-foreground">joao@email.com</p>
        </div>

        {/* Plan */}
        <div className="bg-primary rounded-2xl p-5 card-shadow-lg mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className="w-5 h-5 text-primary-foreground" />
              <div>
                <p className="text-sm font-semibold text-primary-foreground">Plano Gratuito</p>
                <p className="text-xs text-primary-foreground/70">1 veículo · Recursos básicos</p>
              </div>
            </div>
            <button className="bg-primary-foreground/20 text-primary-foreground text-xs font-semibold px-4 py-2 rounded-xl active:scale-95 transition-transform">
              Upgrade
            </button>
          </div>
        </div>

        {/* Vehicles */}
        <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Meus Veículos</h3>
          <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3 card-shadow">
            <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
              <Car className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Honda Civic 2021</p>
              <p className="text-xs text-muted-foreground">45.230 km</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>

        {/* Menu */}
        <div className="space-y-1 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {[
            { icon: Settings, label: "Configurações" },
            { icon: LogOut, label: "Sair", danger: true },
          ].map((item) => (
            <button
              key={item.label}
              className="w-full flex items-center gap-3 p-4 rounded-xl active:bg-secondary transition-colors"
            >
              <item.icon className={`w-5 h-5 ${item.danger ? "text-danger" : "text-muted-foreground"}`} />
              <span className={`text-sm font-medium ${item.danger ? "text-danger" : "text-foreground"}`}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </AppShell>
  );
};

export default Profile;
