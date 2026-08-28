---
target: hub de seleção de hotel
total_score: 26
max_score: 40
na_heuristics: 
p0_count: 2
p1_count: 2
timestamp: 2026-08-27T23-59-34Z
slug: src-pages-hotels-hotelselectpage-tsx
---
Method: dual-agent (A: design review · B: detector + manual a11y)

## Design Health Score

| # | Heurística | Score | Problema-chave |
|---|-----------|-------|----------------|
| 1 | Visibilidade do status | 3 | Loading ok; bootstrap error sem retry |
| 2 | Correspondência ao mundo real | 3 | Copy de hotel forte; passo 2 fala em paths de arquivo |
| 3 | Controle e liberdade | 3 | Voltar/cancelar ok; pós-criação salta para /filas sem confirmação |
| 4 | Consistência e padrões | 3 | Tipografia alinhada; shell com gradientes diverge do /hub |
| 5 | Prevenção de erros | 2 | Hex de cor sem validação; rascunho do wizard se perde ao sair |
| 6 | Reconhecimento vs. recall | 3 | Cards ricos; stepper sem rótulo no mobile |
| 7 | Flexibilidade e eficiência | 2 | Sem busca, atalhos ou skip de passos opcionais |
| 8 | Design estético e minimalista | 3 | Limpo; hover revela CTA + chevron redundante |
| 9 | Recuperação de erros | 2 | Banner vermelho; erros não amarrados ao campo |
| 10 | Ajuda e documentação | 2 | Hints pontuais; /docs ausente no shell autenticado |
| **Total** | | **26/40** | **Good — base sólida, bloqueios operacionais pontuais** |

## Design Specificity Verdict

**LLM:** 6,5/10 — acima de SaaS genérico, ainda não totalmente hotel-native. Pontos fortes: “Qual hotel hoje?”, cards com cor da marca, preview do totem. Pontos fracos: grid CRUD padrão, stepper com ícones Lucide, badge Sparkles genérico, passo “Operação” com vocabulário de dev (`termsPath`, storage).

**Detector:** 0 findings no CLI (`detect.mjs` exit 0, JSON `[]`). O scan automatizado não capturou hover-only, stepper sem ARIA nem jargão de copy — lacunas típicas de regras estáticas.

**Browser:** Automação indisponível nesta sessão; sem overlay visual. Evidência veio de revisão manual de código (Assessment B).

## Overall Impression

O hub já comunica propósito operacional e o preview de marca no wizard é o momento mais memorável do fluxo. O maior gap não é estética — é confiança na primeira operação: CTAs ocultas em touch, passo de termos que parece campo de infra, e erros sem caminho de recuperação.

## What's Working

1. **HotelBrandPreview** — traduz “cores da marca” em consequência real (totem de check-in).
2. **Copy de contexto** — “Filas, reservas e totens seguem o hotel selecionado” explica o porquê da escolha.
3. **Cards com identidade** — faixa gradiente + ícone colorido aceleram reconhecimento multi-property.

## Priority Issues

### [P0] CTA primária invisível em touch/teclado
- **O quê:** “Entrar no console” e chevron só aparecem no hover (`opacity-0 group-hover:opacity-100`).
- **Por quê:** Tablet na recepção e navegação por teclado não veem a ação principal.
- **Fix:** CTA sempre visível; hover intensifica, não revela. Card = entrar; engrenagem = editar, com hierarquia explícita.
- **Comando:** `/impeccable clarify`

### [P0] Passo 2 fala linguagem de desenvolvedor
- **O quê:** Label “Caminho dos termos”, placeholder `hotel-assets/mare/terms.pdf`, menção a storage.
- **Por quê:** Gerente/recepcionista não pensa em paths; aumenta abandono no onboarding.
- **Fix:** “Termos de hospedagem (PDF)” + “Configurar depois”; remover placeholder técnico.
- **Comando:** `/impeccable clarify`

### [P1] Stepper cego no mobile e sem semântica ARIA
- **O quê:** Labels dos passos `hidden sm:block`; sem `aria-current="step"`.
- **Por quê:** Jordan adivinha ícones; Sam perde contexto no leitor de tela.
- **Fix:** “Passo 2 de 3 — Operação” sempre visível; `aria-current` no passo ativo.
- **Comando:** `/impeccable harden`

### [P1] Erro de bootstrap sem recuperação
- **O quê:** `bootstrapError` é banner vermelho sem ação.
- **Por quê:** Dead end após falha de API/rede.
- **Fix:** Botão “Tentar novamente” + copy humana.
- **Comando:** `/impeccable harden`

### [P2] Sem eficiência para multi-property
- **O quê:** Lista flat sem busca ou ordenação.
- **Por quê:** Com 8+ hotéis, scan visual degrada (Alex).
- **Fix:** Busca por nome/cidade; ordenação alfabética.
- **Comando:** `/impeccable optimize`

## Persona Red Flags

**Jordan:** placeholder de path assusta; engrenagem vs. card confunde; stepper só com ícones no mobile.

**Alex:** sem busca; wizard obrigatório em 3 passos; redirect fixo para `/filas`.

**Sam:** CTA hover-only; link voltar sem `aria-label` no mobile; stepper sem live region; badge “Último usado” possivelmente baixo contraste.

## Minor Observations

- `welcomeHotel` no navigate state não é consumido — toast de boas-vindas perdido.
- Chevron + CTA hover + coluna settings = três sinais competindo.
- Loading é texto estático; skeleton cards dariam continuidade.
- Shell autenticado não linka `/docs` como o HubPage público.

## Questions to Consider

- Este hub é gate temporário ou home permanente — auto-entrar no último hotel?
- O passo “Operação” deveria existir no onboarding ou ir para configurações avançadas?
- Marca antes de ver a primeira fila, ou delight depois do primeiro dado operacional?
