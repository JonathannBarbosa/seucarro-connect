# CLAUDE.md - SeuCarro Connect

## Sobre o Projeto

SeuCarro Connect é um app mobile-first de gestão de manutenção veicular, em português (pt-BR). Permite rastrear manutenções, receber alertas, visualizar analytics de gastos e gerar relatórios PDF do veículo. Modelo de assinatura: Free, Pro e Família.

## Tech Stack

- **Framework:** React 18 + TypeScript 5.8 (strict)
- **Build:** Vite 5 com SWC (plugin react-swc)
- **Estilo:** Tailwind CSS 3 (utility-first, dark mode via class)
- **Componentes UI:** shadcn/ui (Radix UI primitives) em `src/components/ui/`
- **Roteamento:** React Router DOM 6
- **Estado servidor:** TanStack React Query 5
- **Ícones:** Lucide React (importar apenas ícones necessários)
- **Notificações:** Sonner (toast)
- **PDF:** jsPDF + html2canvas-pro
- **Testes:** Vitest (unit) + Playwright (e2e) + Testing Library

## Comandos

```bash
npm run dev          # Dev server na porta 8080
npm run build        # Build de produção
npm run lint         # ESLint
npm run test         # Testes unitários (single run)
npm run test:watch   # Testes em watch mode
npm run preview      # Preview do build
```

## Estrutura do Projeto

```
src/
  App.tsx              # Router config + providers (QueryClient, Toaster)
  main.tsx             # Entry point (ReactDOM.createRoot)
  index.css            # Tailwind directives + variáveis CSS HSL de cores
  components/
    ui/                # shadcn/ui — NÃO editar manualmente
    AppShell.tsx       # Layout wrapper mobile (max-w-md, padding, bg)
    BottomNav.tsx      # Navegação fixa inferior (5 tabs + FAB)
    NavLink.tsx        # Wrapper do React Router NavLink
  pages/               # Uma página por arquivo, PascalCase
    Onboarding.tsx     # Fluxo de boas-vindas
    Dashboard.tsx      # Home com info do veículo
    AddMaintenance.tsx # Form multi-step (choose → manual → preview)
    Timeline.tsx       # Histórico de serviços
    Alerts.tsx         # Alertas de manutenção
    Analytics.tsx      # Gráficos de gastos
    Profile.tsx        # Perfil e configurações
    VehicleReport.tsx  # Geração/exportação de relatório
    Plans.tsx          # Planos de assinatura
    NotFound.tsx       # 404
  hooks/               # Hooks customizados
    use-mobile.tsx     # Detecção de breakpoint mobile (768px)
    use-toast.ts       # Hook de toast notifications
  lib/
    utils.ts           # cn() — clsx + tailwind-merge
  test/                # Setup de testes
```

## Convenções de Código

### Geral
- **Idioma da UI:** Português (pt-BR) — labels, placeholders, mensagens
- **Idioma do código:** Inglês — nomes de componentes, variáveis, funções
- **Componentes:** Sempre funcionais, sem class components
- **Imports:** Usar alias `@/` para caminhos (ex: `@/components/ui/button`)
- **TypeScript:** Strict mode ativado (strict, noImplicitAny, strictNullChecks, noUnusedLocals)

### Componentes e Páginas
- Páginas exportam **default export** ou **named export** (verificar App.tsx)
- Toda página deve ser envolvida com `<AppShell>` para layout consistente
- Padding padrão dentro de AppShell: `px-5 pt-14 pb-24`
- Props interfaces seguem padrão `ComponentNameProps`
- forwardRef components devem ter `displayName`

### Estilo (Tailwind)
- **Mobile-first:** Container com `max-w-md` (384px)
- **Cores:** Usar variáveis CSS HSL (primary, secondary, success, warning, danger, muted)
- **Sombras customizadas:** `card-shadow`, `card-shadow-lg`
- **Animações:** `animate-fade-in`, `animate-fade-in-up`, `animate-scale-in`, `animate-slide-up`
- **Stagger delay:** `style={{ animationDelay: '0.1s' }}`
- **Interações touch:** `active:scale-95` ou `active:scale-[0.97]`
- **Transições:** `transition-all`, `transition-colors`, `transition-transform`

### Ícones (Lucide)
- Tamanhos: `w-4 h-4` (sm), `w-5 h-5` (md), `w-6 h-6` (lg)
- Cor via Tailwind: `text-primary`, `text-muted-foreground`, etc.

### Navegação
- Programática: `useNavigate()` hook
- Links: Usar `<NavLink>` do componente customizado
- Rotas definidas em `App.tsx` via `<Routes>`

### Formulários
- Componentes de form do shadcn/ui (`FormField`, `FormItem`, etc.)
- Estados multi-step com union types: `useState<"step1" | "step2" | "step3">`

### Botões (CVA)
- Variants: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`
- Sizes: `default`, `sm`, `lg`, `icon`

## Regras Importantes

1. **NÃO editar componentes em `src/components/ui/`** — são do shadcn/ui, usar `npx shadcn-ui@latest add <component>` para adicionar novos
2. **Sempre testar em viewport mobile** — o app é mobile-first com max-w-md
3. **Manter consistência visual** — usar tokens de cor existentes, não hex hardcoded
4. **Animações de entrada** — novas páginas devem usar `animate-fade-in` no container principal
5. **Bottom padding** — conteúdo deve ter `pb-24` para não ficar atrás da BottomNav
6. **Novos ícones** — importar apenas o necessário do lucide-react (tree-shaking)
7. **Novas rotas** — registrar em `App.tsx` e adicionar na `BottomNav.tsx` se for tab principal
8. **Commits** — mensagens descritivas em português do Brasil
