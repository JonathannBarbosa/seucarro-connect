/// <reference lib="deno.ns" />
// Supabase Edge Function — Diagnóstico de sintomas veiculares via Claude Sonnet
// Deploy: npx supabase functions deploy symptom-diagnosis
// Secret: npx supabase secrets set ANTHROPIC_API_KEY=sk-ant-...

import { createClient } from "npm:@supabase/supabase-js@2";
import Anthropic from "npm:@anthropic-ai/sdk@0.30.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export type DiagnosisUrgency = "imediato" | "breve" | "monitorar";

export interface DiagnosisResult {
  likely_causes: string[];
  urgency: DiagnosisUrgency;
  recommended_service_type: string | null;
  explanation: string;
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

const SERVICE_TYPES = Object.keys(SERVICE_LABELS);

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
    const symptom = body?.symptom as string | undefined;

    if (!vehicleId) return json({ error: "vehicleId obrigatório" }, 400);
    if (!symptom || symptom.trim().length < 5) {
      return json({ error: "Descreva o sintoma com mais detalhes" }, 400);
    }

    const serviceClient = createClient(supabaseUrl, supabaseServiceRole);

    const { data: vehicle } = await serviceClient
      .from("vehicles")
      .select("brand, model, year, current_mileage, fuel_type")
      .eq("id", vehicleId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!vehicle) return json({ error: "Veículo não encontrado" }, 404);

    const { data: maintenances } = await serviceClient
      .from("maintenances")
      .select("service_type, service_date, mileage, description")
      .eq("vehicle_id", vehicleId)
      .eq("user_id", user.id)
      .order("service_date", { ascending: false })
      .limit(10);

    const maintenanceHistory = (maintenances ?? [])
      .map((m) => {
        const label = SERVICE_LABELS[m.service_type] ?? m.service_type;
        const km = m.mileage ? ` (${m.mileage.toLocaleString("pt-BR")} km)` : "";
        const desc = m.description ? ` — ${m.description}` : "";
        return `- ${m.service_date}: ${label}${km}${desc}`;
      })
      .join("\n");

    const contextText = `
Veículo: ${vehicle.brand} ${vehicle.model} ${vehicle.year}
KM atual: ${vehicle.current_mileage?.toLocaleString("pt-BR")} km
Combustível: ${vehicle.fuel_type ?? "não informado"}

Histórico de manutenções recentes:
${maintenanceHistory || "Nenhuma manutenção registrada"}

Sintoma relatado pelo dono:
"${symptom.trim()}"
`.trim();

    const anthropic = new Anthropic({ apiKey: anthropicKey });

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 600,
      system:
        "Você é um mecânico experiente no Brasil especializado em diagnóstico veicular. " +
        "Analise o sintoma relatado pelo dono do veículo, considerando o modelo e histórico de manutenções. " +
        "Seja direto e útil. Não faça diagnóstico médico. " +
        "Urgência: 'imediato' = risco à segurança ou dano grave iminente; 'breve' = resolver em até 2 semanas; 'monitorar' = acompanhar por enquanto. " +
        "Use português pt-BR. Não invente informações.",
      tools: [
        {
          name: "diagnosticar_sintoma",
          description: "Realiza diagnóstico preliminar de um sintoma veicular",
          input_schema: {
            type: "object",
            properties: {
              likely_causes: {
                type: "array",
                items: { type: "string" },
                description: "2 a 4 causas prováveis para o sintoma descrito, da mais à menos provável",
                minItems: 1,
                maxItems: 4,
              },
              urgency: {
                type: "string",
                enum: ["imediato", "breve", "monitorar"],
                description: "Nível de urgência para resolver o problema",
              },
              recommended_service_type: {
                type: ["string", "null"],
                enum: [...SERVICE_TYPES, null],
                description: "Tipo de serviço mais indicado para resolver o problema, ou null se não se encaixar",
              },
              explanation: {
                type: "string",
                description: "Explicação de 3-5 frases sobre o diagnóstico, o que pode estar causando o sintoma e o que o dono deve fazer",
              },
            },
            required: ["likely_causes", "urgency", "recommended_service_type", "explanation"],
          },
        },
      ],
      tool_choice: { type: "tool", name: "diagnosticar_sintoma" },
      messages: [
        {
          role: "user",
          content: `Analise este sintoma e forneça um diagnóstico:\n\n${contextText}`,
        },
      ],
    });

    const toolUse = response.content.find((c): c is Anthropic.ToolUseBlock => c.type === "tool_use");
    if (!toolUse) return json({ error: "Não foi possível gerar diagnóstico" }, 502);

    return json(toolUse.input as DiagnosisResult);
  } catch (err) {
    console.error("symptom-diagnosis error:", err);
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
