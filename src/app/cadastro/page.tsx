"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Car, Eye, EyeOff, UserPlus, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";

export default function CadastroPage() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      setLoading(false);
      return;
    }

    const { error } = await signUp(email, password, fullName);

    if (error) {
      setError(error);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background max-w-md mx-auto flex flex-col items-center justify-center px-6">
        <div className="text-center animate-fade-in-up">
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-success" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Conta criada!</h2>
          <p className="text-muted-foreground mb-8">
            Enviamos um e-mail de confirmação para <strong>{email}</strong>.
            Verifique sua caixa de entrada para ativar a conta.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="w-full bg-primary text-primary-foreground font-semibold py-4 rounded-2xl text-base card-shadow-lg active:scale-[0.98] transition-transform"
          >
            Ir para o login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto flex flex-col px-6 pt-20 pb-10">
      <div className="animate-fade-in flex items-center gap-2 mb-auto">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
          <Car className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="text-lg font-bold text-foreground tracking-tight">SeuCarro</span>
      </div>

      <div className="flex-1 flex flex-col justify-center animate-fade-in-up">
        <h1 className="text-3xl font-extrabold text-foreground leading-tight tracking-tight mb-2">
          Criar conta
        </h1>
        <p className="text-base text-muted-foreground mb-8">
          Cadastre-se para começar a gerenciar seu veículo
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Nome completo</label>
            <Input type="text" placeholder="João Silva" value={fullName} onChange={(e) => setFullName(e.target.value)} required autoComplete="name" />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">E-mail</label>
            <Input type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Senha</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl px-4 py-3 animate-fade-in">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground font-semibold py-4 rounded-2xl text-base flex items-center justify-center gap-2 card-shadow-lg active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><UserPlus className="w-5 h-5" />Criar conta</>}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Já tem conta?{" "}
          <button onClick={() => router.push("/login")} className="text-primary font-semibold hover:underline">Entrar</button>
        </p>
      </div>
    </div>
  );
}
