import type { Metadata } from "next";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "SeuCarro - Seu carro na palma da mão",
  description: "Gerencie manutenções do seu veículo, receba alertas e nunca mais esqueça revisões.",
  openGraph: {
    title: "SeuCarro - Gestão inteligente de veículos",
    description: "Gerencie manutenções, receba alertas e nunca mais esqueça revisões.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-background text-foreground font-sans antialiased">
        <QueryProvider>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
