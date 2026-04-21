# Segurança — SeuCarro Connect

Este projeto processa dados pessoais de usuários (veículos, manutenções e, futuramente, habilitação/CRLV-e). O modelo de ameaça prioriza **LGPD** e **isolamento entre usuários**.

## Camadas defensivas ativas

### 1. Bloqueio de segredos no commit (local)

Pre-commit hook via **Husky** executa a cada `git commit`:

- **Secretlint** — detecta chaves de API conhecidas (AWS, Stripe, Anthropic, Supabase, GitHub, etc.)
- **Scanner customizado** (`scripts/check-client-secrets.mjs`) — impede que:
  - Variáveis sensíveis (`SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, etc.) sejam referenciadas em arquivos client
  - `process.env.<VAR>` não-`NEXT_PUBLIC_` apareça em componentes `"use client"`
  - `createClient` com `SERVICE_ROLE` seja usado fora de código server-only

> **Bypass emergencial:** `git commit --no-verify` só deve ser usado se o hook der falso positivo, e **nunca** para subir segredos. Documente o motivo no PR.

### 2. Scan no CI (push + PR)

Workflow `.github/workflows/security.yml` roda em cada push e PR:

- `secretlint` (duplica a checagem local em caso de `--no-verify`)
- `gitleaks` (scan mais amplo, inclui histórico do PR)
- scanner customizado de client bundle
- `tsc --noEmit` (estrito)

### 3. RLS em todas as tabelas sensíveis

Todas as tabelas (`vehicles`, `maintenances`, `alerts`, `subscriptions`, `profiles`) têm RLS ativada e policies separadas por operação. O bucket de storage `os-uploads` é privado com acesso restrito à pasta `{user_id}/`.

Verificação automatizada: `supabase/tests/rls.spec.mjs`. Antes de cada release relevante:

```bash
node --env-file=.env.test supabase/tests/rls.spec.mjs
```

Pré-requisito: dois usuários de teste cadastrados no Supabase Auth, com credenciais em `.env.test` (nunca commitado).

## Convenções obrigatórias

- ❌ **Nunca** use `SUPABASE_SERVICE_ROLE_KEY` no frontend, nem em Route Handlers que sirvam resposta ao cliente sem revalidar `auth.uid()`.
- ✅ Lógica privilegiada (que ignora RLS) vive **apenas** em Edge Functions ou Route Handlers com `import "server-only"`.
- ✅ Variáveis públicas do frontend devem começar com `NEXT_PUBLIC_`. Tudo sem esse prefixo é tratado como secret.
- ✅ Ao adicionar nova tabela com dados de usuário: habilitar RLS + policies + teste em `rls.spec.mjs` na mesma PR.

## Gestão de segredos

Segredos ficam em três lugares, cada um com seu dono:

| Segredo | Onde mora | Quem consome |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` / `_ANON_KEY` | Vercel env vars | Bundle do frontend |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase (auto) | Edge Functions |
| `ANTHROPIC_API_KEY` | Supabase secrets | Edge Function `scan-os` |
| Credenciais `.env.test` | Máquina local dev | Testes RLS |

**Nunca** coloque a `SERVICE_ROLE_KEY` ou a `ANTHROPIC_API_KEY` no Vercel — elas não precisam e não devem estar expostas ao runtime do Next.js.

## Próximas camadas — CNH e CRLV-e

Quando o app passar a armazenar documentos sensíveis (habilitação, CRLV-e, CPF, RENAVAM), aplicar **antes** do primeiro deploy dessa funcionalidade:

1. **Criptografia em rest** — usar `pgcrypto` (`pgp_sym_encrypt`) para CPF, número da CNH e RENAVAM. Chave vive no Supabase Vault, nunca em `.env`.
2. **Audit log imutável** — tabela `audit.document_access` populada por trigger em `select`/`update` das tabelas sensíveis, registrando `user_id`, `acessou_user_id`, `documento`, `operação`, `ip`, `timestamp`. Opcionalmente replicar para storage append-only.
3. **Rate limit por usuário** nas Edge Functions que tocam documentos — bloquear acima de N requests/hora via tabela `rate_limits` ou Upstash Redis.
4. **Upload direto via signed URL** — cliente obtém URL assinada e envia arquivo direto para o Storage. A Edge Function recebe somente o path, nunca o binário. Reduz superfície de ataque e custo.

Esses controles são **aditivos** às 3 camadas já existentes e não substituem RLS/secretlint/CI.

## Reporte de vulnerabilidades

Encontrou algo? Abra uma issue privada ou escreva direto ao mantenedor. Não divulgue publicamente antes da correção.
