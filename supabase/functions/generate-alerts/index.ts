/// <reference lib="deno.ns" />
// Supabase Edge Function — Geração inteligente de alertas por km e data
// Deploy: npx supabase functions deploy generate-alerts
// Chamado pelo frontend após criar manutenção + cron diário às 08:00

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ServiceInterval {
  kmInterval: number | null;
  monthInterval: number;
  label: string;
}

const SERVICE_INTERVALS: Record<string, ServiceInterval> = {
  troca_oleo:   { kmInterval: 5000,  monthInterval: 3,  label: "Troca de Óleo" },
  freios:       { kmInterval: 20000, monthInterval: 12, label: "Freios" },
  pneus:        { kmInterval: 40000, monthInterval: 24, label: "Pneus" },
  filtros:      { kmInterval: 15000, monthInterval: 6,  label: "Filtros" },
  revisao:      { kmInterval: 10000, monthInterval: 6,  label: "Revisão Geral" },
  bateria:      { kmInterval: null,  monthInterval: 24, label: "Bateria" },
  suspensao:    { kmInterval: 30000, monthInterval: 24, label: "Suspensão" },
  alinhamento:  { kmInterval: 10000, monthInterval: 12, label: "Alinhamento" },
};

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function computePriority(
  currentKm: number,
  dueKm: number | null,
  today: Date,
  dueDate: Date | null,
): "high" | "medium" | "low" {
  const kmOverdue = dueKm != null && currentKm >= dueKm;
  const dateOverdue = dueDate != null && today >= dueDate;

  if (kmOverdue || dateOverdue) return "high";

  const kmWarning = dueKm != null && currentKm >= dueKm * 0.85;
  const dateWarning = dueDate != null &&
    today >= new Date(dueDate.getTime() - 30 * 24 * 60 * 60 * 1000);

  if (kmWarning || dateWarning) return "medium";

  return "low";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return json(null, 200);
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Não autenticado" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authClient = createClient(supabaseUrl, supabaseAnon, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) return json({ error: "Não autenticado" }, 401);

    const body = await req.json().catch(() => ({}));
    const vehicleIdFilter = body?.vehicleId as string | undefined;

    const serviceClient = createClient(supabaseUrl, supabaseServiceRole);

    // Busca veículos do usuário
    let vehicleQuery = serviceClient
      .from("vehicles")
      .select("id, current_mileage, brand, model")
      .eq("user_id", user.id);

    if (vehicleIdFilter) vehicleQuery = vehicleQuery.eq("id", vehicleIdFilter);

    const { data: vehicles, error: vehiclesError } = await vehicleQuery;
    if (vehiclesError) return json({ error: "Erro ao buscar veículos" }, 500);
    if (!vehicles || vehicles.length === 0) return json({ created: 0, updated: 0 });

    let created = 0;
    let updated = 0;

    for (const vehicle of vehicles) {
      const currentKm: number = vehicle.current_mileage ?? 0;

      // Última manutenção por tipo de serviço
      const { data: maintenances } = await serviceClient
        .from("maintenances")
        .select("service_type, mileage, service_date")
        .eq("vehicle_id", vehicle.id)
        .eq("user_id", user.id)
        .order("service_date", { ascending: false });

      const lastByType: Record<string, { mileage: number | null; service_date: string }> = {};
      for (const m of maintenances ?? []) {
        if (!lastByType[m.service_type]) {
          lastByType[m.service_type] = { mileage: m.mileage, service_date: m.service_date };
        }
      }

      // Alertas auto não resolvidos existentes para este veículo
      const { data: existingAlerts } = await serviceClient
        .from("alerts")
        .select("id, title")
        .eq("vehicle_id", vehicle.id)
        .eq("user_id", user.id)
        .eq("source", "auto")
        .eq("is_resolved", false);

      const existingByTitle: Record<string, string> = {};
      for (const a of existingAlerts ?? []) {
        existingByTitle[a.title] = a.id;
      }

      const today = new Date();

      for (const [serviceType, interval] of Object.entries(SERVICE_INTERVALS)) {
        const last = lastByType[serviceType];
        if (!last) continue; // só cria alerta se já houve manutenção antes

        const lastDate = new Date(last.service_date);
        const lastKm = last.mileage;

        const dueDate = addMonths(lastDate, interval.monthInterval);
        const dueKm = lastKm != null && interval.kmInterval != null
          ? lastKm + interval.kmInterval
          : null;

        const priority = computePriority(currentKm, dueKm, today, dueDate);
        const existingId = existingByTitle[interval.label];

        const alertPayload = {
          vehicle_id: vehicle.id,
          user_id: user.id,
          title: interval.label,
          description: [
            dueKm != null ? `Previsto aos ${dueKm.toLocaleString("pt-BR")} km` : null,
            `Prazo: ${dueDate.toLocaleDateString("pt-BR")}`,
          ].filter(Boolean).join(" · "),
          due_date: dueDate.toISOString().split("T")[0],
          due_mileage: dueKm,
          priority,
          source: "auto",
          is_resolved: false,
        };

        if (existingId) {
          await serviceClient.from("alerts").update(alertPayload).eq("id", existingId);
          updated++;
        } else {
          await serviceClient.from("alerts").insert(alertPayload);
          created++;
        }
      }
    }

    return json({ created, updated });
  } catch (err) {
    console.error("generate-alerts error:", err);
    return json(
      { error: err instanceof Error ? err.message : "Erro desconhecido" },
      500,
    );
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}
