/// <reference lib="deno.ns" />
// Supabase Edge Function — Análise de gastos com linguagem natural via Claude
// Deploy: npx supabase functions deploy expense-insights
// Secret: npx supabase secrets set ANTHROPIC_API_KEY=sk-ant-...

import { createClient } from "npm:@supabase/supabase-js@2";
import Anthropic from "npm:@anthropic-ai/sdk@0.30.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export interface ExpenseInsightsResult {
  summary: string;
  recommendations: string[];
  anomaly: string | null;
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
    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");

    if (!anthropicKey) return json({ error: "Servidor não configurado" }, 500);

    const authClient = createClient(supabaseUrl, supabaseAnon, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) return json({ error: "Não autenticado" }, 401);

    const { data: profile } = await authClient
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .maybeSingle();

    const isAdmin = profile?.is_admin === true;

    if (!isAdmin) {
      const { data: subscription } = await authClient
        .from("subscriptions")
        .select("plan, status")
        .eq("user_id", user.id)
        .maybeSingle();

      const plan = subscription?.plan ?? "free";
      const isActive = (subscription?.status ?? "active") === "active";
      if (plan === "free" || !isActive) {
        return json({ error: "Recurso disponível nos planos Pro e Família." }, 402);
      }
    }

    const body = await req.json().catch(() => ({}));
    const vehicleId = body?.vehicleId as string | undefined;
    if (!vehicleId) return json({ error: "vehicleId obrigatório" }, 400);

    const serviceClient = createClient(supabaseUrl, supabaseServiceRole);

    const { data: vehicle } = await serviceClient
      .from("vehicles")
      .select("brand, model, year, current_mileage, fuel_type")
      .eq("id", vehicleId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!vehicle) return json({ error: "Veículo não encontrado" }, 404);

    // Gastos dos últimos 6 meses por mês
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const { data: maintenances } = await serviceClient
      .from("maintenances")
      .select("service_type, cost, service_date")
      .eq("vehicle_id", vehicleId)
      .eq("user_id", user.id)
      .gte("service_date", sixMonthsAgo.toISOString().split("T")[0])
      .order("service_date", { ascending: true });

    const { data: allMaintenances } = await serviceClient
      .from("maintenances")
      .select("cost")
      .eq("vehicle_id", vehicleId)
      .eq("user_id", user.id);

    const totalHistorico = (allMaintenances ?? []).reduce((s, m) => s + Number(m.cost), 0);
    const totalCount = allMaintenances?.length ?? 0;

    // Agrupar por mês
    const byMonth: Record<string, number> = {};
    for (const m of maintenances ?? []) {
      const key = m.service_date.slice(0, 7); // YYYY-MM
      byMonth[key] = (byMonth[key] ?? 0) + Number(m.cost);
    }

    // Agrupar por categoria
    const byCategory: Record<string, number> = {};
    for (const m of maintenances ?? []) {
      byCategory[m.service_type] = (byCategory[m.service_type] ?? 0) + Number(m.cost);
    }

    const totalUltimos6 = Object.values(byMonth).reduce((s, v) => s + v, 0);
    const mediaMensal = totalCount > 0 ? totalHistorico / Math.max(1, totalCount / 2) : 0;

    const contextText = `
Veículo: ${vehicle.brand} ${vehicle.model} ${vehicle.year}
KM atual: ${vehicle.current_mileage?.toLocaleString("pt-BR")} km
Combustível: ${vehicle.fuel_type ?? "não informado"}

Total gasto (histórico completo): R$ ${totalHistorico.toFixed(2)}
Total de manutenções (histórico): ${totalCount}
Total gasto nos últimos 6 meses: R$ ${totalUltimos6.toFixed(2)}

Gastos mensais (últimos 6 meses):
${Object.entries(byMonth).map(([k, v]) => `- ${k}: R$ ${v.toFixed(2)}`).join("\n") || "Sem dados"}

Gastos por categoria (últimos 6 meses):
${Object.entries(byCategory)
  .sort(([, a], [, b]) => b - a)
  .map(([k, v]) => `- ${k}: R$ ${v.toFixed(2)}`)
  .join("\n") || "Sem dados"}
`.trim();

    const anthropic = new Anthropic({ apiKey: anthropicKey });

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      system:
        "Você é um consultor financeiro especializado em manutenção veicular no Brasil. " +
        "Analise os dados de gastos fornecidos e gere insights práticos em português (pt-BR). " +
        "Seja direto, específico e acionável. Não invente dados nem compare com médias externas que você não tem.",
      tools: [
        {
          name: "gerar_insights",
          description: "Gera insights de gastos veiculares",
          input_schema: {
            type: "object",
            properties: {
              summary: {
                type: "string",
                description: "Resumo de 2-3 frases sobre o padrão de gastos do veículo",
              },
              recommendations: {
                type: "array",
                items: { type: "string" },
                description: "2 a 3 recomendações práticas para o dono do veículo",
                minItems: 1,
                maxItems: 3,
              },
              anomaly: {
                type: ["string", "null"],
                description: "Se houver algo fora do padrão (pico de gastos, serviço recorrente, etc.), descreva em 1 frase. Caso contrário, null.",
              },
            },
            required: ["summary", "recommendations", "anomaly"],
          },
        },
      ],
      tool_choice: { type: "tool", name: "gerar_insights" },
      messages: [
        {
          role: "user",
          content: `Analise os gastos de manutenção deste veículo:\n\n${contextText}`,
        },
      ],
    });

    const toolUse = response.content.find((c): c is Anthropic.ToolUseBlock => c.type === "tool_use");
    if (!toolUse) return json({ error: "Não foi possível gerar insights" }, 502);

    return json(toolUse.input as ExpenseInsightsResult);
  } catch (err) {
    console.error("expense-insights error:", err);
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
