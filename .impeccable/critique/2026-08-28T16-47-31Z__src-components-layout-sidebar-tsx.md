---
target: sidebar do console
total_score: 24
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 2
timestamp: 2026-08-28T16-47-31Z
slug: src-components-layout-sidebar-tsx
---
Method: dual-agent (A: ccc50d46-3b7b-4bf2-ab2f-a126a2ca5d27 · B: 9a24ff7f-5400-4ebd-8df2-c9988132ffad)

## Design Health Score

| # | Heurística | Score | Problema principal |
|---|-----------|-------|-------------------|
| 1 | Visibilidade do status | 2 | Sidebar não mostra fila ativa, hotel ou sync; contexto só no Topbar |
| 2 | Correspondência com o mundo real | 3 | Labels PT bons; "Console" e ícones genéricos abstraem operação hoteleira |
| 3 | Controle e liberdade | 3 | Colapsar/expandir + drawer mobile; 3 pontos de "expandir" quando colapsado |
| 4 | Consistência e padrões | 2 | Identidade duplicada sidebar×Topbar; estado ativo fraco; docs assimétrico |
| 5 | Prevenção de erros | 2 | "Trocar superfície" aponta para `/` → redirect `/login` |
| 6 | Reconhecimento vs. recordação | 3 | Expandido ok; colapsado depende de tooltip hover-only |
| 7 | Flexibilidade e eficiência | 2 | Colapso persistente ajuda; sem atalhos de nav nem badge em Filas |
| 8 | Design estético e minimalista | 3 | Limpo e arejado; plano demais para urgência operacional |
| 9 | Recuperação de erros | 2 | Nav não comunica indisponibilidade; erros ficam no `main` |
| 10 | Ajuda e documentação | 2 | `/docs` no rodapé; sem ajuda contextual por seção |
| **Total** | | **24/40** | **Acceptable** |

## Design Specificity Verdict

**LLM assessment:** ~60% category-generic. A IA da sidebar está correta para o MVP STAYO (Filas → Reservas → Espaços → Totens → Cardápio), mas a expressão visual é admin SaaS neutro: Plus Jakarta, Lucide padrão, cinza/branco, sem sinal operacional nem identidade do hotel ativo. Totens já usam `.totem-shell` com cor da propriedade; o console não herda nada disso.

**Deterministic scan:** `detect.mjs` em `Sidebar.tsx` e `src/components/layout/` — exit 0, **0 findings**. O detector estático não captura problemas de UX semântica, contraste perceptível do active state, ou gaps ARIA no modo colapsado.

**Visual overlays:** Não disponíveis — scan foi em arquivos TSX (regex estático), sem injeção browser nesta sessão.

## Overall Impression

Sidebar competente e enxuta: cinco rotas certas, colapso bem pensado, drawer mobile funcional. O maior gap não é estrutura — é **presença operacional**: Filas deveria gritar urgência (há `queueSummary` no contexto e não aparece na nav), o estado ativo quase some, e o footer repete identidade que o Topbar já resolve. Parece template admin, não central de operação hoteleira.

## What's Working

1. **IA enxuta e correta** — 5 itens mapeiam 1:1 às rotas do MVP, sem ruído de PMS legado.
2. **Colapso bem executado** — 72px, tooltips, persistência em `localStorage`, ícones consistentes a 18px.
3. **Mobile overlay sensato** — drawer full-height, fecha ao navegar e no backdrop; labels completas no mobile.

## Priority Issues

### [P0] Nav colapsado inacessível
- **Por quê:** `NavLink` colapsado mostra só ícone; `Tooltip` usa `role="tooltip"` sem `aria-describedby`; leitor de tela não anuncia destino.
- **Fix:** `aria-label={item.label}` + `aria-current="page"` quando ativo; conectar tooltip via `id`/`aria-describedby`.
- **Comando:** `/impeccable harden Sidebar`

### [P1] Filas invisível como centro operacional
- **Por quê:** Produto define console como hub de filas; sidebar trata Filas como peer igual. `queueSummary` existe no `AppContext` mas não aparece na nav.
- **Fix:** Badge/contador em Filas (ex. pedidos abertos); destaque tipográfico ou cor só em Filas.
- **Comando:** `/impeccable adapt Sidebar`

### [P1] "Trocar superfície" aponta para rota errada
- **Por quê:** Logo e footer linkam `to="/"` → redirect `/login`. Staff logado espera `/hub`.
- **Fix:** Alterar destino para `/hub`; alinhar `aria-label` com destino real.
- **Comando:** `/impeccable clarify Sidebar`

### [P2] Identidade duplicada sidebar × Topbar
- **Por quê:** Footer repete avatar/nome/role já no Topbar com logout, hotel e busca.
- **Fix:** Remover bloco de usuário do footer; reservar para docs + colapsar, ou mostrar só hotel ativo.
- **Comando:** `/impeccable distill Sidebar`

### [P2] Estado ativo fraco
- **Por quê:** `isActive ? 'bg-canvas text-ink'` sobre `bg-surface` — contraste estrutural ~3%.
- **Fix:** Barra lateral accent 3px, `bg-accent-soft`, ou `font-semibold` no item ativo.
- **Comando:** `/impeccable polish Sidebar`

### [P3] Três botões "Expandir menu"
- **Por quê:** Colapsado: footer do sidebar + botão flutuante no `main` (`AdminLayout`), ambos `PanelLeft` idêntico.
- **Fix:** Um único ponto de expandir; remover flutuante no `main`.
- **Comando:** `/impeccable quieter AdminLayout+Sidebar`

## Persona Red Flags

**Alex (power user):** Sem atalho de teclado para Filas/Reservas; sem badge em Filas; tooltip hover atrasa scan no modo 72px; três expand buttons fragmentam muscle memory.

**Sam (accessibility):** `NavLink` colapsado sem nome acessível programático; tooltip não persiste em touch; active state insuficiente para baixa visão; drawer mobile sem evidência de focus trap.

**Jordan (first-timer):** "Console" no header é jargão; `MapPin` + "Espaços" não evoca quartos; logo clicável com `aria-label="Trocar superfície"` sem texto visível quando colapsado; docs em 12px no rodapé.

## Minor Observations

- `gap-5` no `<nav>` gera espaço vazio para só 5 itens.
- Documentação: ícone só no colapsado; texto no expandido — assimetria.
- `PanelLeft` igual para recolher e expandir — falta affordance de estado.
- Topbar `LABELS` omite `espacos` — breadcrumb cai em slug cru.
- Tokens `--color-accent` existem mas sidebar não os usa.

## Questions to Consider

1. Se Filas é o coração do console, por que os cinco módulos são peers planos?
2. O footer de identidade existe porque o Topbar falha no mobile — ou é resquício de template?
3. Totens recebem identidade do hotel; o console deveria ficar neutro ou "tingir" com a propriedade ativa?
