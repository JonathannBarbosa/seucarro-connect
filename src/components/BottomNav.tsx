"use client";

import { Home, Clock, PlusCircle, BarChart3, User } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { icon: Home, label: "Início", path: "/dashboard" },
  { icon: Clock, label: "Histórico", path: "/timeline" },
  { icon: PlusCircle, label: "Adicionar", path: "/add", isMain: true },
  { icon: BarChart3, label: "Análises", path: "/analytics" },
  { icon: User, label: "Perfil", path: "/profile" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-t border-border">
      <div className="max-w-md mx-auto flex items-center justify-around px-2 pb-6 pt-2">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-2xl transition-all duration-200 ${
                item.isMain ? "relative -mt-5" : ""
              }`}
            >
              {item.isMain ? (
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center card-shadow-lg active:scale-95 transition-transform">
                  <Icon className="w-6 h-6 text-primary-foreground" />
                </div>
              ) : (
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                />
              )}
              <span
                className={`text-[10px] font-medium transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                } ${item.isMain ? "mt-0.5" : ""}`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
