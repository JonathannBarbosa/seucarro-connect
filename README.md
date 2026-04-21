<div align="center">

# 🚗 SeuCarro Connect

**A manutenção do seu carro, no bolso.**

Registre serviços, receba alertas preventivos e entenda seus gastos — sem planilha, sem papel, direto do celular.

<br>

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%7C%20DB%20%7C%20Edge-3ECF8E?style=flat-square&logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-deployed-000?style=flat-square&logo=vercel&logoColor=white)

<sub>Feito com foco mobile-first, pensado para virar app nativo iOS/Android.</sub>

</div>

---

## ✨ O que ele faz

- **📋 Histórico completo** — cada troca de óleo, freio, pneu, fica registrada com custo e km
- **🔔 Alertas automáticos** — a cada serviço cadastrado, o próximo já entra no radar (óleo a cada 10 mil km, freios a cada 20 mil, etc.)
- **📸 Leitura por IA** — tira foto da nota da oficina e o Claude extrai os dados pra você
- **📊 Analytics pessoais** — gasto do mês, comparativo, tendências
- **📄 Relatório em PDF** — histórico completo do veículo, pronto para exportar na hora da venda

## 🧰 Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 16 (App Router) + TypeScript strict |
| UI | Tailwind CSS 3 + shadcn/ui + Radix |
| Estado servidor | TanStack React Query 5 |
| Backend | Supabase (Auth, Postgres com RLS, Storage, Edge Functions) |
| IA | Claude Haiku 4.5 via Anthropic SDK |
| Deploy | Vercel (web) + Supabase (infra) |

## 🚀 Rodando local

```bash
npm install
npm run dev          # http://localhost:3000
```

Pré-requisito: `.env.local` com as chaves do Supabase (veja `.env.example`).

```bash
npm run build              # build de produção
npm run security:all       # secretlint + auditoria do bundle
npm run security:rls       # testes de isolamento (requer .env.test)
```

## 🗺️ Roadmap

- [x] Gestão de manutenções + alertas automáticos
- [x] OCR de notas por IA
- [x] Analytics de gastos
- [x] Relatório PDF
- [ ] Integração CRLV-e e CNH
- [ ] Notificações push via WhatsApp
- [ ] **Migração para React Native** (publicar na App Store e Play Store)

## 🔒 Segurança

Projeto tratado com prioridade máxima em privacidade — futuramente armazenará CNH e CRLV-e. Camadas ativas:

- Pre-commit hook (secretlint + auditoria de bundle)
- CI no GitHub Actions (secretlint + gitleaks + typecheck estrito)
- RLS em todas as tabelas e storage buckets
- Testes automatizados de isolamento entre usuários

Detalhes em [SECURITY.md](./SECURITY.md).

## 📝 Licença

Código proprietário. Todos os direitos reservados a [@JonathannBarbosa](https://github.com/JonathannBarbosa).

<div align="center">
<sub>🛠️ Construído por desenvolvedores que também esqueciam de trocar o óleo.</sub>
</div>
