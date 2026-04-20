import type { Maintenance, Vehicle } from "@/types/database";

export interface VehicleScore {
  total: number;
  oilChangeRegularity: number;
  reviewFrequency: number;
  maintenanceCoverage: number;
  label: "Excelente" | "Muito bom" | "Bom" | "Regular" | "Baixo";
}

export function calculateVehicleScore(
  vehicle: Vehicle | null | undefined,
  maintenances: Maintenance[],
): VehicleScore {
  if (!vehicle || maintenances.length === 0) {
    return {
      total: 0,
      oilChangeRegularity: 0,
      reviewFrequency: 0,
      maintenanceCoverage: 0,
      label: "Baixo",
    };
  }

  const now = new Date();
  const recent = maintenances.filter((m) => {
    const d = new Date(m.service_date);
    const monthsAgo = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24 * 30);
    return monthsAgo <= 12;
  });

  const oilChanges = recent.filter((m) => m.service_type === "troca_oleo");
  const reviews = recent.filter((m) => m.service_type === "revisao");

  const oilChangeRegularity = Math.min(100, oilChanges.length * 40);
  const reviewFrequency = Math.min(100, reviews.length * 50);
  const maintenanceCoverage = Math.min(100, recent.length * 10);

  const total = Math.round(
    oilChangeRegularity * 0.4 + reviewFrequency * 0.3 + maintenanceCoverage * 0.3,
  );

  const label: VehicleScore["label"] =
    total >= 85 ? "Excelente" : total >= 70 ? "Muito bom" : total >= 50 ? "Bom" : total >= 30 ? "Regular" : "Baixo";

  return { total, oilChangeRegularity, reviewFrequency, maintenanceCoverage, label };
}
