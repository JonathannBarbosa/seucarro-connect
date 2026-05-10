"use client";

import { useSubscription } from "@/hooks/useSubscription";
import { useProfile } from "@/hooks/useProfile";
import type { SubscriptionPlan } from "@/types/database";

export type PlanFeature =
  | "pdf_export"
  | "vehicle_score"
  | "analytics_advanced"
  | "ocr_scan"
  | "multiple_vehicles"
  | "unlimited_alerts"
  | "full_history"
  | "whatsapp_notifications"
  | "family_profiles"
  | "symptom_diagnosis"
  | "expense_insights";

interface PlanFeatureConfig {
  allowedPlans: SubscriptionPlan[];
  freeLimit?: number;
}

const FEATURE_CONFIG: Record<PlanFeature, PlanFeatureConfig> = {
  pdf_export: { allowedPlans: ["pro", "familia"] },
  vehicle_score: { allowedPlans: ["pro", "familia"] },
  analytics_advanced: { allowedPlans: ["pro", "familia"] },
  ocr_scan: { allowedPlans: ["pro", "familia"], freeLimit: 5 },
  multiple_vehicles: { allowedPlans: ["pro", "familia"] },
  unlimited_alerts: { allowedPlans: ["pro", "familia"] },
  full_history: { allowedPlans: ["pro", "familia"] },
  whatsapp_notifications: { allowedPlans: ["pro", "familia"] },
  family_profiles: { allowedPlans: ["familia"] },
  symptom_diagnosis: { allowedPlans: ["pro", "familia"] },
  expense_insights: { allowedPlans: ["pro", "familia"] },
};

export const VEHICLE_LIMITS: Record<SubscriptionPlan, number> = {
  free: 1,
  pro: 3,
  familia: 8,
};

export const FREE_OCR_LIMIT = 5;

export interface PlanFeatures {
  plan: SubscriptionPlan;
  isActive: boolean;
  can: (feature: PlanFeature) => boolean;
  vehicleLimit: number;
  isLoading: boolean;
}

export function usePlanFeatures(): PlanFeatures {
  const { data: subscription, isLoading: subLoading } = useSubscription();
  const { data: profile, isLoading: profileLoading } = useProfile();

  const isAdmin = profile?.is_admin ?? false;
  const plan: SubscriptionPlan = subscription?.plan ?? "free";
  const isActive = subscription?.status === "active";

  function can(feature: PlanFeature): boolean {
    if (isAdmin) return true;
    const config = FEATURE_CONFIG[feature];
    if (!config.allowedPlans.includes(plan)) return false;
    if (!isActive) return false;
    return true;
  }

  return {
    plan: isAdmin ? "familia" : plan,
    isActive: isAdmin ? true : isActive,
    can,
    vehicleLimit: isAdmin ? 999 : VEHICLE_LIMITS[plan],
    isLoading: subLoading || profileLoading,
  };
}
