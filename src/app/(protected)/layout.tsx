"use client";

import PrivateRoute from "@/components/PrivateRoute";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return <PrivateRoute>{children}</PrivateRoute>;
}
