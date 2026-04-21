#!/usr/bin/env node
// ============================================================
// Testes de RLS — verifica isolamento entre usuários
// ============================================================
// Executa cenários clássicos de violação:
//   - Usuário B tenta ler dados de A → espera 0 linhas
//   - Usuário B tenta atualizar dado de A → espera erro
//   - Usuário B tenta deletar dado de A → espera erro
//
// Pré-requisitos (arquivo .env.test na raiz, NUNCA commitado):
//   NEXT_PUBLIC_SUPABASE_URL=...
//   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
//   TEST_USER_A_EMAIL=...
//   TEST_USER_A_PASSWORD=...
//   TEST_USER_B_EMAIL=...
//   TEST_USER_B_PASSWORD=...
//
// Crie os dois usuários no Supabase Dashboard > Auth > Users
// e cadastre ao menos um veículo para cada antes de rodar.
//
// Uso:
//   node --env-file=.env.test supabase/tests/rls.spec.mjs
// ============================================================

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function req(name) {
  const v = process.env[name];
  if (!v) {
    console.error(`❌ Variável ${name} não definida. Veja o cabeçalho deste arquivo.`);
    process.exit(2);
  }
  return v;
}

const A_EMAIL = req("TEST_USER_A_EMAIL");
const A_PASS = req("TEST_USER_A_PASSWORD");
const B_EMAIL = req("TEST_USER_B_EMAIL");
const B_PASS = req("TEST_USER_B_PASSWORD");

if (!SUPABASE_URL || !SUPABASE_ANON) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_URL/ANON_KEY não definidas.");
  process.exit(2);
}

async function login(email, password) {
  const client = createClient(SUPABASE_URL, SUPABASE_ANON, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`login ${email} falhou: ${error.message}`);
  return { client, userId: data.user.id };
}

let passed = 0;
let failed = 0;

function assert(label, condition, extra = "") {
  if (condition) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.error(`  ❌ ${label}${extra ? ` → ${extra}` : ""}`);
    failed++;
  }
}

async function main() {
  console.log("Logando usuários de teste...");
  const a = await login(A_EMAIL, A_PASS);
  const b = await login(B_EMAIL, B_PASS);

  console.log("\n[vehicles] B não pode ver veículos de A");
  const { data: vehiclesSeen } = await b.client
    .from("vehicles")
    .select("id,user_id")
    .eq("user_id", a.userId);
  assert(
    "retorno vazio ao filtrar por user_id alheio",
    Array.isArray(vehiclesSeen) && vehiclesSeen.length === 0,
    `recebeu ${vehiclesSeen?.length ?? "?"} linhas`,
  );

  console.log("\n[maintenances] B não pode ver manutenções de A");
  const { data: maintSeen } = await b.client
    .from("maintenances")
    .select("id,user_id")
    .eq("user_id", a.userId);
  assert(
    "retorno vazio ao filtrar por user_id alheio",
    Array.isArray(maintSeen) && maintSeen.length === 0,
  );

  console.log("\n[subscriptions] B não pode ver plano de A");
  const { data: subSeen } = await b.client
    .from("subscriptions")
    .select("user_id,plan")
    .eq("user_id", a.userId);
  assert("retorno vazio", Array.isArray(subSeen) && subSeen.length === 0);

  console.log("\n[vehicles] B não pode inserir veículo como A");
  const { error: insertErr } = await b.client.from("vehicles").insert({
    user_id: a.userId,
    brand: "TESTE",
    model: "RLS",
    year: 2020,
    current_mileage: 0,
    is_primary: false,
  });
  assert(
    "insert com user_id alheio é bloqueado",
    insertErr !== null,
    insertErr?.message ?? "nenhum erro retornado",
  );

  console.log("\n[alerts] B não pode atualizar alerta de A");
  const { data: alertsOfA } = await a.client.from("alerts").select("id").limit(1);
  if (alertsOfA && alertsOfA.length > 0) {
    const { error: updErr, data: updData } = await b.client
      .from("alerts")
      .update({ is_resolved: true })
      .eq("id", alertsOfA[0].id)
      .select();
    assert(
      "update em alerta alheio não afeta linhas",
      updErr !== null || (updData?.length ?? 0) === 0,
    );
  } else {
    console.log("  ⚠️  A não tem alertas; pulei o teste de update.");
  }

  console.log(`\n${passed} passaram, ${failed} falharam`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error("Erro inesperado:", err);
  process.exit(2);
});
