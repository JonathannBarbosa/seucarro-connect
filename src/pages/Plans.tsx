import { ArrowLeft, Check, Crown, Star, Users, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const plans = [
  {
    id: "free",
    name: "Grátis",
    price: "R$ 0",
    period: "/mês",
    icon: Zap,
    description: "Para quem está começando",
    features: [
      "1 veículo",
      "Registro manual de manutenções",
      "Histórico básico",
      "Lembretes simples",
    ],
    missing: [
      "Exportar relatório PDF",
      "Selo de verificação",
      "Score de confiabilidade",
      "Sem anúncios",
    ],
    current: true,
    highlight: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "R$ 9,90",
    period: "/mês",
    icon: Star,
    description: "Para quem quer vender melhor",
    features: [
      "Até 3 veículos",
      "Relatório PDF profissional",
      "Selo 'Histórico Verificado'",
      "Score de confiabilidade",
      "Análise de gastos detalhada",
      "Sem anúncios",
      "Suporte prioritário",
    ],
    missing: [],
    current: false,
    highlight: true,
    badge: "Mais popular",
  },
  {
    id: "familia",
    name: "Família",
    price: "R$ 19,90",
    period: "/mês",
    icon: Users,
    description: "Para toda a família",
    features: [
      "Até 8 veículos",
      "Tudo do plano Pro",
      "Perfis compartilhados",
      "Relatórios comparativos",
      "Gestão familiar completa",
    ],
    missing: [],
    current: false,
    highlight: false,
  },
];

const Plans = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-lg border-b border-border px-5 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center card-shadow active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-4.5 h-4.5 text-foreground" />
        </button>
        <h1 className="text-base font-bold text-foreground">Planos</h1>
      </div>

      <div className="px-5 py-6 pb-10 max-w-lg mx-auto space-y-5">
        {/* Headline */}
        <div className="text-center animate-fade-in">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Crown className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Valorize seu veículo</h2>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-xs mx-auto">
            Um histórico completo pode aumentar o valor de venda do seu carro em até 15%
          </p>
        </div>

        {/* Plan Cards */}
        {plans.map((plan, i) => (
          <div
            key={plan.id}
            className={`relative rounded-2xl p-5 border transition-all animate-fade-in-up ${
              plan.highlight
                ? "bg-primary text-primary-foreground border-primary card-shadow-lg scale-[1.02]"
                : "bg-card text-foreground border-border card-shadow"
            }`}
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            {plan.badge && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-xs font-bold px-4 py-1 rounded-full">
                {plan.badge}
              </span>
            )}

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    plan.highlight ? "bg-primary-foreground/20" : "bg-secondary"
                  }`}
                >
                  <plan.icon
                    className={`w-5 h-5 ${plan.highlight ? "text-primary-foreground" : "text-primary"}`}
                  />
                </div>
                <div>
                  <h3 className="font-bold text-base">{plan.name}</h3>
                  <p
                    className={`text-xs ${
                      plan.highlight ? "text-primary-foreground/70" : "text-muted-foreground"
                    }`}
                  >
                    {plan.description}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-extrabold">{plan.price}</span>
                <span
                  className={`text-xs ${
                    plan.highlight ? "text-primary-foreground/70" : "text-muted-foreground"
                  }`}
                >
                  {plan.period}
                </span>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-2.5 mb-4">
              {plan.features.map((f) => (
                <div key={f} className="flex items-center gap-2.5">
                  <Check
                    className={`w-4 h-4 flex-shrink-0 ${
                      plan.highlight ? "text-accent-foreground" : "text-accent"
                    }`}
                  />
                  <span className="text-sm">{f}</span>
                </div>
              ))}
              {plan.missing.map((f) => (
                <div key={f} className="flex items-center gap-2.5 opacity-40">
                  <div className="w-4 h-4 flex-shrink-0 rounded-full border border-current" />
                  <span className="text-sm line-through">{f}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <button
              className={`w-full py-3 rounded-xl text-sm font-semibold active:scale-[0.98] transition-transform ${
                plan.current
                  ? "bg-secondary text-muted-foreground cursor-default"
                  : plan.highlight
                  ? "bg-primary-foreground text-primary"
                  : "bg-primary text-primary-foreground"
              }`}
              disabled={plan.current}
            >
              {plan.current ? "Plano atual" : `Assinar ${plan.name}`}
            </button>
          </div>
        ))}

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground pt-2">
          Cancele a qualquer momento · Sem fidelidade
        </p>
      </div>
    </div>
  );
};

export default Plans;
