import { useState } from "react";
import { ArrowLeft, MessageCircle, Bell } from "lucide-react";
import AppShell from "@/components/AppShell";
import { useNavigate } from "react-router-dom";

const Alerts = () => {
  const navigate = useNavigate();
  const [whatsappOn, setWhatsappOn] = useState(true);

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
          <h1 className="text-xl font-bold text-foreground tracking-tight">Alertas WhatsApp</h1>
        </div>

        {/* WhatsApp simulation */}
        <div className="bg-card rounded-2xl p-5 card-shadow-lg mb-6 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-success rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-success-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">SeuCarro</p>
              <p className="text-xs text-muted-foreground">via WhatsApp</p>
            </div>
          </div>

          {/* Chat bubble */}
          <div className="bg-success/10 rounded-2xl rounded-tl-md p-4 ml-2">
            <p className="text-sm text-foreground leading-relaxed">
              🚗 <strong>SeuCarro</strong>: Está na hora de trocar o óleo do seu Honda Civic! Última troca há 8.000 km. Agende já e evite problemas.
            </p>
            <p className="text-[10px] text-muted-foreground text-right mt-2">10:30</p>
          </div>
        </div>

        {/* Toggle */}
        <div className="bg-card rounded-2xl p-5 card-shadow border border-border mb-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-semibold text-foreground">Alertas WhatsApp</p>
                <p className="text-xs text-muted-foreground">Receba lembretes no seu celular</p>
              </div>
            </div>
            <button
              onClick={() => setWhatsappOn(!whatsappOn)}
              className={`w-12 h-7 rounded-full transition-colors relative ${
                whatsappOn ? "bg-success" : "bg-muted"
              }`}
            >
              <div
                className={`w-5 h-5 bg-card rounded-full absolute top-1 transition-all card-shadow ${
                  whatsappOn ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground px-6 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          💡 Alertas que você realmente vai ver. Sem spam, só lembretes importantes sobre seu veículo.
        </p>
      </div>
    </AppShell>
  );
};

export default Alerts;
