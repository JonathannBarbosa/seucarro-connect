import { ArrowLeft, Droplets, Disc, CircleDot, Wrench } from "lucide-react";
import AppShell from "@/components/AppShell";
import { useNavigate } from "react-router-dom";

const timelineData = [
  { icon: Droplets, color: "text-primary", bg: "bg-primary/10", service: "Troca de óleo", date: "28 Mar 2026", cost: "R$ 280", km: "45.230 km" },
  { icon: Disc, color: "text-warning", bg: "bg-warning/10", service: "Pastilha de freio", date: "10 Jan 2026", cost: "R$ 520", km: "43.800 km" },
  { icon: CircleDot, color: "text-danger", bg: "bg-danger/10", service: "Troca de pneus", date: "15 Nov 2025", cost: "R$ 1.800", km: "41.200 km" },
  { icon: Wrench, color: "text-muted-foreground", bg: "bg-secondary", service: "Revisão geral", date: "20 Ago 2025", cost: "R$ 950", km: "38.000 km" },
  { icon: Droplets, color: "text-primary", bg: "bg-primary/10", service: "Troca de óleo", date: "05 Mai 2025", cost: "R$ 250", km: "35.100 km" },
];

const Timeline = () => {
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
          <h1 className="text-xl font-bold text-foreground tracking-tight">Histórico</h1>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-5 top-2 bottom-2 w-px bg-border" />

          <div className="space-y-1">
            {timelineData.map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  className="relative flex gap-4 pl-0 animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  {/* Icon dot */}
                  <div className={`w-10 h-10 ${item.bg} rounded-xl flex items-center justify-center z-10 flex-shrink-0`}>
                    <Icon className={`w-4.5 h-4.5 ${item.color}`} />
                  </div>

                  {/* Card */}
                  <div className="flex-1 bg-card rounded-xl p-4 border border-border mb-3 card-shadow">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-sm text-foreground">{item.service}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.date} · {item.km}</p>
                      </div>
                      <span className="text-sm font-bold text-foreground">{item.cost}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default Timeline;
