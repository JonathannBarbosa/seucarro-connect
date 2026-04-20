"use client";

import { useMemo } from "react";
import { useMaintenances } from "@/hooks/useMaintenances";
import { SERVICE_TYPE_LABELS } from "@/types/database";

export interface MonthlyExpense {
  monthKey: string;
  monthLabel: string;
  total: number;
  count: number;
}

export interface CategoryExpense {
  serviceType: string;
  label: string;
  total: number;
  count: number;
}

interface UseMonthlyExpensesOptions {
  vehicleId?: string;
  months?: number;
}

export function useMonthlyExpenses({ vehicleId, months = 7 }: UseMonthlyExpensesOptions = {}) {
  const { data: maintenances, isLoading } = useMaintenances({ vehicleId });

  const data = useMemo<MonthlyExpense[]>(() => {
    const now = new Date();
    const buckets: MonthlyExpense[] = [];

    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const monthLabel = d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");

      buckets.push({
        monthKey,
        monthLabel: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1),
        total: 0,
        count: 0,
      });
    }

    for (const m of maintenances ?? []) {
      const d = new Date(m.service_date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const bucket = buckets.find((b) => b.monthKey === key);
      if (bucket) {
        bucket.total += Number(m.cost);
        bucket.count += 1;
      }
    }

    return buckets;
  }, [maintenances, months]);

  return { data, isLoading };
}

export function useExpensesByCategory(vehicleId?: string) {
  const { data: maintenances, isLoading } = useMaintenances({ vehicleId });

  const data = useMemo<CategoryExpense[]>(() => {
    const map = new Map<string, CategoryExpense>();

    for (const m of maintenances ?? []) {
      const key = m.service_type;
      const existing = map.get(key);
      if (existing) {
        existing.total += Number(m.cost);
        existing.count += 1;
      } else {
        map.set(key, {
          serviceType: key,
          label: SERVICE_TYPE_LABELS[m.service_type] ?? key,
          total: Number(m.cost),
          count: 1,
        });
      }
    }

    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [maintenances]);

  return { data, isLoading };
}

export function useTotalExpenses(vehicleId?: string) {
  const { data: maintenances, isLoading } = useMaintenances({ vehicleId });

  const data = useMemo(() => {
    const list = maintenances ?? [];
    const total = list.reduce((acc, m) => acc + Number(m.cost), 0);
    const count = list.length;
    return { total, count };
  }, [maintenances]);

  return { data, isLoading };
}
