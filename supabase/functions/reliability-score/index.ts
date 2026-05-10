/// <reference lib="deno.ns" />
// Supabase Edge Function — Score de confiabilidade com explicação IA
// Deploy: npx supabase functions deploy reliability-score
// Secret: npx supabase secrets set ANTHROPIC_API_KEY=sk-ant-...

import { createClient } from "npm:@supabase/supabase-js@2";
import Anthropic from "npm:@anthropic-ai/sdk@0.30.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export interface ReliabilityScoreResult {
  explanation: string;
  suggestions: string[];
}

const SERVICE_LABELS: Record<string, string> = {
  troca_oleo: "Troca de Óleo",
  freios: "Freios",
  pneus: "Pneus",
  filtros: "Filtros",
  bateria: "Bateria",
  suspensao: "Suspensão",
  alinhamento: "Alinhamento",
  revisao: "Revisão Geral",
  outro: "Outro",
};

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
    const currentScore = body?.currentScore as number | undefined;
    if (!vehicleId) return json({ error: "vehicleId obrigatório" }, 400);

    const serviceClient = createClient(supabaseUrl, supabaseServiceRole);

    const { data: vehicle } = await serviceClient
      .from("vehicles")
      .select("brand, model, year, current_mileage, fuel_type")
      .eq("id", vehicleId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!vehicle) return json({ error: "Veículo não encontrado" }, 404);

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const { data: maintenances } = await serviceClient
      .from("maintenances")
      .select("service_type, service_date, mileage, cost, description")
      .eq("vehicle_id", vehicleId)
      .eq("user_id", user.id)
      .gte("service_date", oneYearAgo.toISOString().split("T")[0])
      .order("service_date", { ascending: false });

    const list = maintenances ?? [];

    const byType: Record<string, { dates: string[]; lastKm: number | null }> = {};
    for (const m of list) {
      if (!byType[m.service_type]) byType[m.service_type] = { dates: [], lastKm: null };
      byType[m.service_type].dates.push(m.service_date);
      if (m.mileage != null && byType[m.service_type].lastKm == null) {
        byType[m.service_type].lastKm = m.mileage;
      }
    }

    const historySummary = Object.entries(byType)
      .map(([type, data]) => {
        const label = SERVICE_LABELS[type] ?? type;
        const count = data.dates.length;
        const last = data.dates[0];
        return `- ${label}: ${count}x (última: ${last}${data.lastKm ? `, ${data.lastKm.toLocaleString("pt-BR")} km` : ""})`;
      })
      .join("\n");

    const contextText = `
Veículo: ${vehicle.brand} ${vehicle.model} ${vehicle.year}
KM atual: ${vehicle.current_mileage?.toLocaleString("pt-BR")} km
Score de confiabilidade calculado: ${currentScore ?? "não informado"}/100

Manutenções realizadas nos últimos 12 meses:
${historySummary || "Nenhuma manutenção registrada no período"}

Total de registros no período: ${list.length}
`.trim();

    const anthropic = new Anthropic({ apiKey: anthropicKey });

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      system:
        "Você é um especialista em manutenção veicular no Brasil. " +
        "Analise o histórico de manutenções e explique o score de confiabilidade em linguagem simples para o dono do veículo. " +
        "Seja direto e positivo quando possível. Use português pt-BR. " +
        "Não invente informações. Baseie-se apenas nos dados fornecidos.",
      tools: [
        {
          name: "gerar_explicacao_score",
          description: "Gera explicação e sugestões para o score de confiabilidade",
          input_schema: {
            type: "object",
            properties: {
              explanation: {
                type: "string",
                description: "Explicação de 2-3 frases sobre por que o veículo tem esse score e o que significa para uma eventual venda",
              },
              suggestions: {
                type: "array",
                items: { type: "string" },
                description: "1 a 3 ações específicas que o dono pode fazer para melhorar ou manter o score",
                minItems: 1,
                maxItems: 3,
              },
            },
            required: ["explanation", "suggestions"],
          },
        },
      ],
      tool_choice: { type: "tool", name: "gerar_explicacao_score" },
      messages: [
        {
          role: "user",
          content: `Analise este veículo e gere a explicação do score:\n\n${contextText}`,
        },
      ],
    });

    const toolUse = response.content.find((c): c is Anthropic.ToolUseBlock => c.type === "tool_use");
    if (!toolUse) return json({ error: "Não foi possível gerar explicação" }, 502);

    return json(toolUse.input as ReliabilityScoreResult);
  } catch (err) {
    console.error("reliability-score error:", err);
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
