"use client";

import { ReactNode } from "react";
import BottomNav from "./BottomNav";

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background max-w-md mx-auto relative">
      <div className="pb-24">{children}</div>
      <BottomNav />
    </div>
  );
}
