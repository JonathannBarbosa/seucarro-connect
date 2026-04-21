export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export type FuelType =
  | "gasolina"
  | "etanol"
  | "flex"
  | "diesel"
  | "gnv"
  | "eletrico"
  | "hibrido";

export interface Vehicle {
  id: string;
  user_id: string;
  brand: string;
  model: string;
  year: number;
  license_plate: string | null;
  color: string | null;
  fuel_type: FuelType | null;
  current_mileage: number;
  image_url: string | null;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export type ServiceType =
  | "troca_oleo"
  | "freios"
  | "pneus"
  | "filtros"
  | "bateria"
  | "suspensao"
  | "alinhamento"
  | "revisao"
  | "outro";

export type MaintenanceSource = "manual" | "ocr";

export interface MaintenancePart {
  name: string;
  quantity?: number;
  cost?: number;
}

export interface Maintenance {
  id: string;
  vehicle_id: string;
  user_id: string;
  service_type: ServiceType;
  description: string | null;
  cost: number;
  mileage: number | null;
  service_date: string;
  workshop: string | null;
  parts: MaintenancePart[];
  os_image_path: string | null;
  source: MaintenanceSource;
  created_at: string;
  updated_at: string;
}

export type AlertPriority = "low" | "medium" | "high";
export type AlertSource = "auto" | "manual";

export interface Alert {
  id: string;
  vehicle_id: string;
  user_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  due_mileage: number | null;
  priority: AlertPriority;
  source: AlertSource;
  is_resolved: boolean;
  resolved_at: string | null;
  created_at: string;
}

export type SubscriptionPlan = "free" | "pro" | "familia";
export type SubscriptionStatus = "active" | "canceled" | "expired";

export interface Subscription {
  id: string;
  user_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  whatsapp_notifications_enabled: boolean;
  started_at: string;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  troca_oleo: "Troca de óleo",
  freios: "Freios",
  pneus: "Pneus",
  filtros: "Filtros",
  bateria: "Bateria",
  suspensao: "Suspensão",
  alinhamento: "Alinhamento",
  revisao: "Revisão geral",
  outro: "Outro",
};
