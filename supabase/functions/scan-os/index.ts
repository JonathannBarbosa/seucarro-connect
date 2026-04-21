/// <reference lib="deno.ns" />
// Supabase Edge Function — Extração de dados de Ordem de Serviço via IA
// Deploy: npx supabase functions deploy scan-os
// Secret: npx supabase secrets set ANTHROPIC_API_KEY=sk-ant-...

import { createClient } from "npm:@supabase/supabase-js@2";
import Anthropic from "npm:@anthropic-ai/sdk@0.30.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SERVICE_TYPES = [
  "troca_oleo",
  "freios",
  "pneus",
  "filtros",
  "bateria",
  "suspensao",
  "alinhamento",
  "revisao",
  "outro",
] as const;

interface ExtractedOS {
  service_type: (typeof SERVICE_TYPES)[number];
  description: string | null;
  cost: number | null;
  mileage: number | null;
  service_date: string | null;
  workshop: string | null;
  parts: Array<{ name: string; quantity?: number; cost?: number }>;
  confidence: number;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
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

    if (!anthropicKey) {
      return json({ error: "Servidor não configurado" }, 500);
    }

    const authClient = createClient(supabaseUrl, supabaseAnon, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
    } = await authClient.auth.getUser();

    if (!user) return json({ error: "Não autenticado" }, 401);

    const { data: subscription } = await authClient
      .from("subscriptions")
      .select("plan, status")
      .eq("user_id", user.id)
      .maybeSingle();

    const plan = subscription?.plan ?? "free";
    const isActive = (subscription?.status ?? "active") === "active";

    if (plan === "free" || !isActive) {
      const firstOfMonth = new Date();
      firstOfMonth.setUTCDate(1);
      firstOfMonth.setUTCHours(0, 0, 0, 0);

      const { count, error: countError } = await authClient
        .from("maintenances")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("source", "ocr")
        .gte("created_at", firstOfMonth.toISOString());

      if (countError) {
        return json({ error: "Não foi possível validar sua cota" }, 500);
      }

      const FREE_MONTHLY_LIMIT = 3;
      if ((count ?? 0) >= FREE_MONTHLY_LIMIT) {
        return json(
          {
            error: `Você atingiu o limite mensal de ${FREE_MONTHLY_LIMIT} leituras automáticas do plano Free. Faça upgrade para Pro ou registre manualmente.`,
            code: "quota_exceeded",
          },
          402,
        );
      }
    }

    const body = await req.json();
    const storagePath = body?.storagePath as string | undefined;

    if (!storagePath || typeof storagePath !== "string") {
      return json({ error: "storagePath obrigatório" }, 400);
    }

    if (!storagePath.startsWith(`${user.id}/`)) {
      return json({ error: "Acesso negado ao arquivo" }, 403);
    }

    const serviceClient = createClient(supabaseUrl, supabaseServiceRole);

    const { data: file, error: downloadError } = await serviceClient.storage
      .from("os-uploads")
      .download(storagePath);

    if (downloadError || !file) {
      return json({ error: "Arquivo não encontrado" }, 404);
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64 = arrayBufferToBase64(arrayBuffer);
    const mediaType = file.type || guessMediaType(storagePath);

    if (!mediaType.startsWith("image/")) {
      return json(
        { error: "Apenas imagens são suportadas no momento" },
        400,
      );
    }

    const anthropic = new Anthropic({ apiKey: anthropicKey });

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system:
        "Você é especialista em extrair dados de Ordens de Serviço (OS) de oficinas mecânicas brasileiras. " +
        "Retorne APENAS o que está claramente visível na imagem. " +
        "Se um campo não estiver claro ou visível, retorne null em vez de inventar. " +
        "Datas no formato YYYY-MM-DD. Valores em reais como número (ex: 280.50). " +
        "Para service_type, escolha o mais apropriado entre os valores permitidos.",
      tools: [
        {
          name: "extrair_os",
          description: "Extrai dados estruturados de uma Ordem de Serviço",
          input_schema: {
            type: "object",
            properties: {
              service_type: {
                type: "string",
                enum: [...SERVICE_TYPES],
                description: "Tipo principal do serviço realizado",
              },
              description: {
                type: ["string", "null"],
                description: "Resumo curto do que foi feito (ex: 'Óleo Mobil 5W30 + filtro Mann')",
              },
              cost: {
                type: ["number", "null"],
                description: "Valor total da OS em reais",
              },
              mileage: {
                type: ["number", "null"],
                description: "Quilometragem do veículo no momento do serviço",
              },
              service_date: {
                type: ["string", "null"],
                description: "Data do serviço no formato YYYY-MM-DD",
              },
              workshop: {
                type: ["string", "null"],
                description: "Nome da oficina/concessionária",
              },
              parts: {
                type: "array",
                description: "Peças/produtos usados, se discriminados",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    quantity: { type: "number" },
                    cost: { type: "number" },
                  },
                  required: ["name"],
                },
              },
              confidence: {
                type: "number",
                description: "Sua confiança na extração, de 0 a 1",
                minimum: 0,
                maximum: 1,
              },
            },
            required: ["service_type", "confidence", "parts"],
          },
        },
      ],
      tool_choice: { type: "tool", name: "extrair_os" },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType as "image/jpeg" | "image/png" | "image/webp" | "image/gif",
                data: base64,
              },
            },
            {
              type: "text",
              text: "Extraia os dados desta Ordem de Serviço.",
            },
          ],
        },
      ],
    });

    const toolUse = response.content.find(
      (c): c is Anthropic.ToolUseBlock => c.type === "tool_use",
    );

    if (!toolUse) {
      return json({ error: "Não foi possível extrair dados da imagem" }, 502);
    }

    const extracted = toolUse.input as ExtractedOS;

    return json(extracted, 200);
  } catch (err) {
    console.error("scan-os error:", err);
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

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.byteLength; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

function guessMediaType(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    default:
      return "application/octet-stream";
  }
}
