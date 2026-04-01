import { useNavigate } from "react-router-dom";
import { Car, ChevronRight } from "lucide-react";

const Onboarding = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto flex flex-col px-6 pt-20 pb-10">
      {/* Logo */}
      <div className="animate-fade-in flex items-center gap-2 mb-auto">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
          <Car className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="text-lg font-bold text-foreground tracking-tight">ManuCar</span>
      </div>

      {/* Hero */}
      <div className="flex-1 flex flex-col justify-center animate-fade-in-up">
        <h1 className="text-4xl font-extrabold text-foreground leading-tight tracking-tight mb-4">
          Seu carro na<br />palma da mão
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed mb-10">
          Gerencie manutenções, receba alertas e nunca mais esqueça revisões.
        </p>

        {/* CTA */}
        <button
          onClick={() => navigate("/dashboard")}
          className="w-full bg-primary text-primary-foreground font-semibold py-4 rounded-2xl text-base flex items-center justify-center gap-2 card-shadow-lg active:scale-[0.98] transition-transform"
        >
          Começar
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">ou entre com</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Social login */}
        <div className="flex gap-3">
          <button className="flex-1 bg-card border border-border rounded-xl py-3.5 text-sm font-medium text-foreground card-shadow active:scale-[0.98] transition-transform">
            Google
          </button>
          <button className="flex-1 bg-card border border-border rounded-xl py-3.5 text-sm font-medium text-foreground card-shadow active:scale-[0.98] transition-transform">
            Apple
          </button>
          <button className="flex-1 bg-card border border-border rounded-xl py-3.5 text-sm font-medium text-foreground card-shadow active:scale-[0.98] transition-transform">
            Email
          </button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center mt-10">
        Ao continuar, você concorda com nossos Termos de Uso.
      </p>
    </div>
  );
};

export default Onboarding;
