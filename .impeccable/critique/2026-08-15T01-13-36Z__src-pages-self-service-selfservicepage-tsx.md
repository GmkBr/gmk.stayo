---
target: totem de recepcao
total_score: 19
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 3
timestamp: 2026-08-15T01-13-36Z
slug: src-pages-self-service-selfservicepage-tsx
---
Method: dual-agent (A: 561812bb-705b-4ded-ae0b-66cd27d4312f · B: 03eb80f2-da36-416c-8c9f-5edeec520d64)

# Critique — Totem de recepção (`src/pages/self-service/SelfServicePage.tsx` · `/totem/recepcao`)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | `STEPS` existe no código e não aparece; busca sem loading/resultado; docs mente o status |
| 2 | Match System / Real World | 3 | Copy de lobby funciona; vazam “simulado”, “pré-chegada”, “Sair do totem”, azul STAYO |
| 3 | User Control and Freedom | 2 | Voltar só no meio; recusar termos = Voltar; Sair cai no hub, não no idle |
| 4 | Consistency and Standards | 2 | Chrome de totem ok; CTA/input são peças do console admin |
| 5 | Error Prevention | 1 | Busca ignora o input; João Silva/203 hardcoded; sem timeout de sessão |
| 6 | Recognition Rather Than Recall | 2 | Sem “2 de 6”; confirmação não ecoa o que foi digitado |
| 7 | Flexibility and Efficiency | 1 | Um caminho só; sem QR, código, idioma ou pular docs |
| 8 | Aesthetic and Minimalist Design | 3 | Coluna limpa, tipo 34/28/15; canvas de totem desperdiçado e CTA fora da paleta |
| 9 | Error Recovery | 1 | Zero estados de erro; só “← Voltar” |
| 10 | Help and Documentation | 2 | “A recepção está ao lado” some depois do início |
| **Total** | | **19/40** | **Poor** |

## Design Specificity Verdict

**LLM assessment:** Misto. O welcome e as regras físicas são de hotel (nome da propriedade no h1, fundo creme da marca, recepção ao lado, bandeja à direita, silêncio 22h, animais nos chalés). O restante é wizard genérico de kiosk: coluna `max-w-xl`, `Button`/`Input` do console, CTA azul STAYO `#2563EB`. `--hotel-primary` e o ouro `accentColor` nunca entram. Troca o nome do hotel e os termos e vira check-in de clínica ou aeroporto.

**Deterministic scan:** `detect.mjs --json` em `SelfServicePage.tsx` e em `src/pages/self-service` saiu limpo (exit 0, `[]`). O detector não pegou busca falsa, `STEPS` morto, contraste do “Sair do totem”, nem a paleta errada — regras de craft de kiosk não estão no scanner. Sem falsos positivos.

**Visual overlays:** Overlay não visível. Browser pulado: nenhum MCP de automação e nenhum Playwright/Puppeteer no projeto. Live server não iniciado; `detect.js` não injetado.

## Overall Impression

A estrutura do fluxo está certa: uma decisão por tela, copy de lobby, família visual com os totens de quarto e área. O produto, porém, ainda é teatro. “Buscar” não busca. A documentação já nasce “reconhecida (simulado)”. O pico que deveria ser a chave na bandeja vira um botão secondary “Novo check-in”. A maior oportunidade é fazer o totem completar a tarefa de verdade, com a cara do hotel, não do console STAYO.

## What's Working

- Welcome situado no espaço real: “Toque para começar o check-in. A recepção está ao lado, se preferir.”
- Wizard de uma decisão por tela; as quatro rows (Hóspede / Quarto / Entrada / Saída) são escaneáveis; o fim reitera quarto e caminho físico.
- Família de totens: mesmo header (`brand.hotelName` na `primaryColor`, wash `secondaryColor`, “Sair do totem”).

## Priority Issues

### [P0] Busca falsa: sempre João Silva / quarto 203
- **Why it matters:** Check-in de outra pessoa, ou check-in fantasma. A tarefa primária é teatro.
- **Fix:** Lookup real em `hotelReservations`, estados vazio/múltiplos/erro, “isto não sou eu”, persistir `checked_in`.
- **Suggested command:** `/impeccable harden`

### [P1] Identidade, contrato e chave sem gravidade
- **Why it matters:** A caixa dashed já declara “Documento reconhecido (simulado)”; “Aceitar e finalizar” não tem checkbox nem recusa; o fim compete com “Novo check-in”.
- **Fix:** Viewport de câmera com estados real/falha; aceite explícito; tela final full-bleed do quarto/bandeja com idle automático.
- **Suggested command:** `/impeccable harden` (docs/termos) + `/impeccable delight` (chave)

### [P1] Seis passos invisíveis
- **Why it matters:** `STEPS` existe e não vira UI. Em pé, na recepção, ninguém sabe se está no passo 2 ou 5.
- **Fix:** “Passo 2 de 5” + dots persistentes; omitir capas início/fim da contagem.
- **Suggested command:** `/impeccable layout`

### [P1] Paleta STAYO no totem do hotel
- **Why it matters:** `--hotel-primary` está setado e morto. O CTA é `#2563EB` no creme da fazenda. O ouro da marca não entra.
- **Fix:** CTA/focus/selection na `primaryColor` do hotel; ouro só em êxito/chave.
- **Suggested command:** `/impeccable colorize`

### [P2] Alvos, contraste e privacidade de kiosk
- **Why it matters:** “← Voltar” 13px e “Sair do totem” 12px `#6b7280` no creme (~3.9:1). Sair é o primeiro tab e leva ao hub. Sem timeout, o próximo hóspede vê os dados.
- **Fix:** Alvos ≥48px, Voltar/continuar no rodapé, Sair só para operador ou some no idle, timeout → início, contraste AA.
- **Suggested command:** `/impeccable adapt`

## Persona Red Flags

**Jordan (primeira vez):** O campo já vem com João Silva — a máquina “conhece” ou quebrou? “Documentação” + “pré-chegada” sem mostrar o que fazer com o RG. A caixa já diz “reconhecido (simulado)”. Sem barra de progresso. “Aceitar e finalizar” sem “e se eu não aceitar?”. Em “Check-in concluído” o único botão é “Novo check-in”.

**Sam (acessibilidade):** Tab order abre em “Sair do totem”. Voltar e o link 12px falham contraste AA no `#f4efe6`. Mudança de passo sem `aria-live`. Caixa de documento é `<div>` muda, não status. Focus-visible azul STAYO. Sem `inputMode` para código.

**Casey (totem em pé, fila atrás):** Sem timeout. Voltar/Sair minúsculos no topo; CTAs no centro (layout de celular, não zona de alcance). Obrigado a digitar nome sem QR/código. Um toque em “Buscar” “acerta” o hóspede errado.

## Minor Observations

- `STEPS` e `--hotel-primary` mortos no CSS da página.
- h1 usa `hotel.name`, o header usa `brand.hotelName`.
- Rows `rounded-2xl` vs botões `rounded-lg`.
- `::selection` e outline globais ficam accent-soft/azul mesmo no totem.
- Datas `formatLongDate('2026-08-14')` soltas, não da reserva.
- Sem idioma, sem teclado de totem, sem “não encontrei / chamar recepção” nas etapas tardias.
- Query vazia ou alterada ainda passa; “simulado” está no copy de hóspede; aceitar termos sem scroll.

## Questions to Consider

- Se o produto do totem é a chave na bandeja, por que a última tela é um botão secondary “Novo check-in”?
- Por que o totem da fazenda fala azul `#2563EB` se a marca já tem verde `#3f6b4a` e ouro `#c4a574`?
- “Sair do totem” é affordance de quem monta a demo no hub, ou o hóspede deveria abortar para o idle?

## Cognitive load

Moderada: 3/8 falhas (Single focus, Visual hierarchy, Working memory). Nenhum ponto de decisão com mais de 4 opções. Chunking, grouping, one-thing-at-a-time, minimal choices e progressive disclosure passam.
