"use client";

import { AlertTriangle, ArrowLeft, Bell, CheckCircle2, Loader2, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import AppShell from "@/components/AppShell";
import { useAlerts, useResolveAlert } from "@/hooks/useAlerts";
import { useSubscription, useUpdateWhatsappNotifications } from "@/hooks/useSubscription";
import { formatNumber } from "@/lib/format";
import type { AlertPriority } from "@/types/database";

const priorityStyle: Record<AlertPriority, { bg: string; text: string; label: string }> = {
  high: { bg: "bg-danger/10", text: "text-danger", label: "Urgente" },
  medium: { bg: "bg-warning/10", text: "text-warning", label: "Atenção" },
  low: { bg: "bg-muted/50", text: "text-muted-foreground", label: "Baixa" },
};

export default function AlertsPage() {
  const router = useRouter();
  const { data: alerts, isLoading } = useAlerts();
  const { data: subscription } = useSubscription();
  const resolveAlert = useResolveAlert();
  const updateWhatsapp = useUpdateWhatsappNotifications();

  const whatsappOn = subscription?.whatsapp_notifications_enabled ?? false;

  async function handleToggleWhatsapp() {
    try {
      await updateWhatsapp.mutateAsync(!whatsappOn);
    } catch {
      toast.error("Não foi possível atualizar a preferência");
    }
  }

  async function handleResolve(alertId: string) {
    try {
      await resolveAlert.mutateAsync(alertId);
      toast.success("Alerta marcado como resolvido");
    } catch {
      toast.error("Erro ao resolver alerta");
    }
  }

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
          <h1 className="text-xl font-bold text-foreground tracking-tight">Alertas</h1>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[0, 1].map((i) => (
              <div key={i} className="bg-card rounded-2xl p-4 card-shadow animate-pulse h-20" />
            ))}
          </div>
        ) : alerts && alerts.length > 0 ? (
          <div className="space-y-3 mb-8">
            {alerts.map((a, i) => {
              const style = priorityStyle[a.priority];
              return (
                <div
                  key={a.id}
                  className="bg-card rounded-2xl p-4 card-shadow border border-border animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 ${style.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <AlertTriangle className={`w-5 h-5 ${style.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground text-sm">{a.title}</h3>
                        <span className={`text-[10px] font-semibold ${style.text} ${style.bg} px-1.5 py-0.5 rounded-full`}>
                          {style.label}
                        </span>
                      </div>
                      {a.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">{a.description}</p>
                      )}
                      {a.due_mileage != null && (
                        <p className="text-xs text-muted-foreground mt-1">
                          🏁 Aos {formatNumber(a.due_mileage)} km
                        </p>
                      )}
                      <button
                        onClick={() => handleResolve(a.id)}
                        disabled={resolveAlert.isPending}
                        className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-success bg-success/10 px-3 py-1.5 rounded-full active:scale-95 transition-transform disabled:opacity-50"
                      >
                        {resolveAlert.isPending ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3 h-3" />
                        )}
                        Marcar como resolvido
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-success/10 border border-success/20 rounded-2xl p-6 mb-8 text-center animate-fade-in-up">
            <div className="w-12 h-12 bg-success/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6 text-success" />
            </div>
            <p className="font-semibold text-foreground">Tudo em dia</p>
            <p className="text-sm text-muted-foreground">Nenhum alerta pendente</p>
          </div>
        )}

        <div className="bg-card rounded-2xl p-5 card-shadow-lg mb-4 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-success rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">SeuCarro</p>
              <p className="text-xs text-muted-foreground">via WhatsApp</p>
            </div>
          </div>
          <div className="bg-success/10 rounded-2xl rounded-tl-md p-4 ml-2">
            <p className="text-sm text-foreground leading-relaxed">
              🚗 <strong>SeuCarro</strong>: Está na hora da próxima manutenção! Receba lembretes como esse direto no seu celular.
            </p>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-5 card-shadow border border-border mb-4 animate-fade-in-up" style={{ animationDelay: "0.25s" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-semibold text-foreground">Alertas WhatsApp</p>
                <p className="text-xs text-muted-foreground">Receba lembretes no seu celular</p>
              </div>
            </div>
            <button
              onClick={handleToggleWhatsapp}
              disabled={updateWhatsapp.isPending}
              className={`w-12 h-7 rounded-full transition-colors relative disabled:opacity-50 ${
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

        <p className="text-center text-xs text-muted-foreground px-6 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          💡 Integração real com WhatsApp em breve. Por enquanto, os alertas ficam aqui e no Dashboard.
        </p>
      </div>
    </AppShell>
  );
}
