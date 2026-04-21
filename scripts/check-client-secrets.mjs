#!/usr/bin/env node
// ============================================================
// Auditoria estática do código do cliente.
// Objetivo: impedir que segredos ou módulos server-only vazem
// para o bundle entregue ao navegador.
// ============================================================
//
// Bloqueia se encontrar, fora de rotas de servidor:
//   1. Referências a variáveis sensíveis
//      (SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY, etc.)
//   2. Uso de `process.env.<VAR>` com VAR não-`NEXT_PUBLIC_`
//      em arquivos client (`"use client"`)
//   3. Imports de clientes administrativos do Supabase em
//      arquivos client (service_role)
//
// Executa no pre-commit e no CI.
// ============================================================

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SRC = join(ROOT, "src");

const SENSITIVE_VARS = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_SERVICE_KEY",
  "ANTHROPIC_API_KEY",
  "OPENAI_API_KEY",
  "STRIPE_SECRET_KEY",
  "RESEND_API_KEY",
  "DATABASE_URL",
  "POSTGRES_URL",
  "SUPABASE_DB_PASSWORD",
  "SUPABASE_ACCESS_TOKEN",
];

const SERVER_DIR_HINTS = [
  // pastas com código que só roda no servidor
  `${sep}api${sep}`,
  `${sep}server${sep}`,
  `route.ts`,
  `route.tsx`,
  `middleware.ts`,
];

function isServerOnlyFile(relPath, content) {
  if (SERVER_DIR_HINTS.some((h) => relPath.includes(h))) return true;
  if (/^\s*import\s+["']server-only["']/m.test(content)) return true;
  return false;
}

function isClientFile(content) {
  return /^\s*["']use client["']/m.test(content);
}

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (["node_modules", ".next", "dist", "out"].includes(entry)) continue;
      walk(full, out);
    } else if (/\.(tsx?|jsx?|mjs|cjs)$/.test(entry)) {
      out.push(full);
    }
  }
  return out;
}

const violations = [];

for (const file of walk(SRC)) {
  const relPath = relative(ROOT, file);
  const content = readFileSync(file, "utf8");
  const serverOnly = isServerOnlyFile(relPath, content);
  const clientMarked = isClientFile(content);

  for (const variable of SENSITIVE_VARS) {
    const envRegex = new RegExp(`process\\.env\\.${variable}\\b`);
    if (envRegex.test(content) && !serverOnly) {
      violations.push(
        `${relPath}: referência proibida a process.env.${variable} em arquivo que não é server-only`,
      );
    }
    const literalRegex = new RegExp(`\\b${variable}\\b`);
    if (
      literalRegex.test(content) &&
      !serverOnly &&
      !relPath.includes(`scripts${sep}`)
    ) {
      // Apenas emite se aparecer como string literal com formato de chave (heurística fraca)
      // A regra principal é o process.env acima.
    }
  }

  if (clientMarked && !serverOnly) {
    const envMatches = [...content.matchAll(/process\.env\.([A-Z0-9_]+)/g)];
    for (const [, name] of envMatches) {
      if (!name.startsWith("NEXT_PUBLIC_") && name !== "NODE_ENV") {
        violations.push(
          `${relPath}: arquivo client lê process.env.${name} — só variáveis NEXT_PUBLIC_* podem ir para o bundle do navegador`,
        );
      }
    }
  }

  if (
    !serverOnly &&
    /createClient\([^)]*SERVICE_ROLE/i.test(content.replace(/\s+/g, ""))
  ) {
    violations.push(
      `${relPath}: createClient com SERVICE_ROLE em arquivo não server-only`,
    );
  }
}

if (violations.length > 0) {
  console.error("\n❌ Falhas de segurança no client bundle:\n");
  for (const v of violations) console.error(`  - ${v}`);
  console.error(
    "\nCorrija movendo o código para server actions / route handlers / middleware, ou adicione `import 'server-only'` no topo do arquivo.",
  );
  process.exit(1);
}

console.log("✅ Client bundle audit OK");
