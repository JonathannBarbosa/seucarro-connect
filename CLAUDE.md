# CLAUDE.md - SeuCarro Connect

## Sobre o Projeto

SeuCarro Connect e um app mobile-first de gestao de manutencao veicular, em portugues (pt-BR). Permite rastrear manutencoes, receber alertas, visualizar analytics de gastos e gerar relatorios PDF do veiculo. Modelo de assinatura: Free, Pro e Familia.

## Tech Stack

- **Framework:** React 18 + TypeScript 5.8
- **Build:** Vite 5 com SWC (plugin react-swc)
- **Estilo:** Tailwind CSS 3 (utility-first, dark mode via class)
- **Componentes UI:** shadcn/ui (Radix UI primitives) em `src/components/ui/`
- **Roteamento:** React Router DOM 6
- **Estado servidor:** TanStack React Query 5
- **Formularios:** React Hook Form + Zod
- **Icones:** Lucide React (importar apenas icones necessarios)
- **Notificacoes:** Sonner (toast)
- **Graficos:** Recharts
- **PDF:** jsPDF + html2canvas-pro
- **Testes:** Vitest (unit) + Playwright (e2e) + Testing Library

## Comandos

```bash
npm run dev          # Dev server na porta 8080
npm run build        # Build de producao
npm run lint         # ESLint
npm run test         # Testes unitarios (single run)
npm run test:watch   # Testes em watch mode
npm run preview      # Preview do build
```

## Estrutura do Projeto

```
src/
  App.tsx              # Router config + providers (QueryClient, Toaster)
  main.tsx             # Entry point (ReactDOM.createRoot)
  index.css            # Tailwind directives + variaveis CSS HSL de cores
  components/
    ui/                # shadcn/ui (50+ componentes) - NAO editar manualmente
    AppShell.tsx       # Layout wrapper mobile (max-w-md, padding, bg)
    BottomNav.tsx      # Navegacao fixa inferior (5 tabs + FAB)
    NavLink.tsx        # Wrapper do React Router NavLink
  pages/               # Uma pagina por arquivo, PascalCase
    Index.tsx          # Redirect inicial
    Onboarding.tsx     # Fluxo de boas-vindas
    Dashboard.tsx      # Home com info do veiculo
    AddMaintenance.tsx # Form multi-step (choose → manual → preview)
    Timeline.tsx       # Historico de servicos
    Alerts.tsx         # Alertas de manutencao
    Analytics.tsx      # Graficos de gastos (Recharts)
    Profile.tsx        # Perfil e configuracoes
    VehicleReport.tsx  # Geracao/exportacao de relatorio
    Plans.tsx          # Planos de assinatura
    NotFound.tsx       # 404
  hooks/               # Hooks customizados
    use-mobile.tsx     # Deteccao de breakpoint mobile (768px)
    use-toast.ts       # Hook de toast notifications
  lib/
    utils.ts           # cn() - clsx + tailwind-merge
  test/                # Setup de testes
```

## Convencoes de Codigo

### Geral
- **Idioma da UI:** Portugues (pt-BR) - labels, placeholders, mensagens
- **Idioma do codigo:** Ingles - nomes de componentes, variaveis, funcoes
- **Componentes:** Sempre funcionais, sem class components
- **Imports:** Usar alias `@/` para caminhos (ex: `@/components/ui/button`)
- **TypeScript:** Config leniente (noImplicitAny: false, strictNullChecks: false)

### Componentes e Paginas
- Paginas exportam **default export** ou **named export** (verificar App.tsx)
- Toda pagina deve ser envolvida com `<AppShell>` para layout consistente
- Padding padrao dentro de AppShell: `px-5 pt-14 pb-24`
- Props interfaces seguem padrao `ComponentNameProps`
- forwardRef components devem ter `displayName`

### Estilo (Tailwind)
- **Mobile-first:** Container com `max-w-md` (384px)
- **Cores:** Usar variaveis CSS HSL (primary, secondary, success, warning, danger, muted)
- **Sombras customizadas:** `card-shadow`, `card-shadow-lg`
- **Animacoes:** `animate-fade-in`, `animate-fade-in-up`, `animate-scale-in`, `animate-slide-up`
- **Stagger delay:** `style={{ animationDelay: '0.1s' }}`
- **Interacoes touch:** `active:scale-95` ou `active:scale-[0.97]`
- **Transicoes:** `transition-all`, `transition-colors`, `transition-transform`

### Icones (Lucide)
- Tamanhos: `w-4 h-4` (sm), `w-5 h-5` (md), `w-6 h-6` (lg)
- Cor via Tailwind: `text-primary`, `text-muted-foreground`, etc.

### Navegacao
- Programatica: `useNavigate()` hook
- Links: Usar `<NavLink>` do componente customizado
- Rotas definidas em `App.tsx` via `<Routes>`

### Formularios
- Usar React Hook Form + Zod para validacao
- Componentes de form do shadcn/ui (`FormField`, `FormItem`, etc.)
- Estados multi-step com union types: `useState<"step1" | "step2" | "step3">`

### Botoes (CVA)
- Variants: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`
- Sizes: `default`, `sm`, `lg`, `icon`

## Regras Importantes

1. **NAO editar componentes em `src/components/ui/`** - sao do shadcn/ui, usar `npx shadcn-ui@latest add <component>` para adicionar novos
2. **Sempre testar em viewport mobile** - o app e mobile-first com max-w-md
3. **Manter consistencia visual** - usar tokens de cor existentes, nao hex hardcoded
4. **Animacoes de entrada** - novas paginas devem usar `animate-fade-in` no container principal
5. **Bottom padding** - conteudo deve ter `pb-24` para nao ficar atras da BottomNav
6. **Novos icones** - importar apenas o necessario do lucide-react (tree-shaking)
7. **Novas rotas** - registrar em `App.tsx` e adicionar na `BottomNav.tsx` se for tab principal
8. **Commits** - mensagens em portugues ou ingles, descritivas do que foi feito
