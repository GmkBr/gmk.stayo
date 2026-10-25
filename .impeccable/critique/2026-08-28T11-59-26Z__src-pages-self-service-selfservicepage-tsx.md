---
target: tela inicial do totem de recepcao
total_score: 23
max_score: 32
na_heuristics: 7,10
p0_count: 1
p1_count: 3
timestamp: 2026-08-28T11-59-26Z
slug: src-pages-self-service-selfservicepage-tsx
---
Method: dual-agent (A: ddd3ae6f-f956-4be4-8a47-8a12174da487 · B: 741d5932-e251-4b31-bcbf-167012fa1e0f)

# Critique — Tela inicial do totem de recepção (`SelfServicePage` · screen `início`)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Tela estática; não comunica “pronto para uso” nem duração do fluxo |
| 2 | Match System / Real World | 3 | Copy de lobby funciona; “check-in” pode não ressoar com todos |
| 3 | User Control and Freedom | 3 | Uma ação clara; escape humano (“recepção ao lado”) bem colocado |
| 4 | Consistency and Standards | 2 | “Toque para começar” vs CTA só no rodapé; doc diz “Fazer check-in”, UI diz “Iniciar” |
| 5 | Error Prevention | 4 | Uma decisão, um botão — difícil errar nesta tela |
| 6 | Recognition Rather Than Recall | 4 | Tudo visível; nada a memorizar |
| 7 | Flexibility and Efficiency | n/a | Welcome de first-timer; atalhos não se aplicam |
| 8 | Aesthetic and Minimalist Design | 3 | Limpo, mas visualmente vazio e genérico a 1–2 m |
| 9 | Error Recovery | 2 | `notice` pós-sessão sem `role="alert"` nem hierarquia visual |
| 10 | Help and Documentation | n/a | Fallback humano substitui ajuda inline nesta tela |
| **Total** | | **23/32** | **Good** |

## Design Specificity Verdict

**LLM assessment:** A tela cumpre o contrato técnico (fundo branco, marca só em header e CTA), mas não se sente *deste hotel*. É welcome de quiosque genérico: `h1` “Bem-vindo ao {hotel}”, subtítulo muted, botão primário. Sem logo, foto, pattern ou uso visível de `accentColor`/`secondaryColor`. O nome da marca aparece duas vezes em tipografia — header `13px` uppercase e `h1` — sem âncora visual para quem se aproxima de longe.

**Deterministic scan:** `detect.mjs --json` em `SelfServicePage.tsx` retornou `[]` (0 achados, exit 0). O scanner regex não cobre conflito Tailwind `h-9` + `h-14` no `Button`, nem contraste de `brand.primaryColor` arbitrária. Inspeção estática: `text-muted` no `.totem-shell` ≈ 5,02:1 sobre branco (OK para 17px); risco de altura efetiva do CTA &lt; 44px por `cn` sem `tailwind-merge` (`Button` default `h-9` + `KIOSK_BTN` `h-14`).

**Visual overlays:** Browser não executado nesta sessão — sem overlay injetado. Validação de altura tocável e foco renderizado pendente.

## Overall Impression

A tela inicial é **clara e enxuta** para quem já está na frente do totem: uma decisão, CTA grande, copy de escape para a recepção. O problema é **antes** do toque — de longe parece tela em branco, a marca não confirma “estou no hotel certo”, e o texto promete toque na área central quando só o rodapé responde. A maior oportunidade é transformar o welcome em **convite físico de quiosque**: marca legível à distância, affordance alinhada ao copy, e sinal de “totem ativo”.

## What's Working

- **Carga cognitiva mínima** — uma ação, layout centrado, ideal para hóspede cansado após viagem.
- **CTA kiosk-intencional** — `KIOSK_BTN` com `min-h-14` e largura total; cor da marca via `.totem-shell` no botão primário.
- **Rede de segurança no copy** — “A recepção está ao lado, se preferir” reduz ansiedade sem competir com o CTA.

## Priority Issues

### [P0] Totem parado parece desligado
- **Why it matters:** Em `início`, `bumpIdle` não roda; sem loop de atração, pulso no CTA ou copy rotativo. Hóspede a 2 m não sabe que pode interagir.
- **Fix:** Modo idle na welcome (animação sutil no CTA, “Toque aqui”, ou tela cheia tocável).
- **Suggested command:** `/impeccable animate` ou `/impeccable delight`

### [P1] Identidade visual fraca à distância
- **Why it matters:** Header `13px` uppercase; sem logo/imagem. Jordan não confirma o hotel certo sem ler de perto.
- **Fix:** Logo ou monograma grande, `accentColor` em detalhe decorativo, ou foto sutil do lobby dentro do branco.
- **Suggested command:** `/impeccable bolder` ou `/impeccable colorize`

### [P1] Copy promete toque; só o botão responde
- **Why it matters:** “Toque para começar” sugere área central tocável; toque no `main` não faz nada — frustração imediata (Casey).
- **Fix:** Tornar o bloco central clicável **ou** mudar copy para “Toque o botão abaixo”.
- **Suggested command:** `/impeccable clarify` + `/impeccable layout`

### [P1] `notice` sem tratamento de alerta
- **Why it matters:** Mensagens pós-reset (ex. termos recusados) renderizam como `<p>` neutro — fácil ignorar.
- **Fix:** `role="alert"`, cor/ícone semântico, posição próxima ao CTA.
- **Suggested command:** `/impeccable harden`

### [P2] Sem prévia do fluxo
- **Why it matters:** Hóspede não sabe que virão busca, documento e termos — abandono depois.
- **Fix:** “4 passos · ~3 min” ou ícones discretos na welcome.
- **Suggested command:** `/impeccable onboard`

### [P2] Conflito de altura no `Button`
- **Why it matters:** `h-9` (default) + `h-14` (KIOSK_BTN) coexistem; altura efetiva pode ficar &lt; 44px.
- **Fix:** `size="lg"` dedicado kiosk, `tailwind-merge`, ou `Button` variant `kiosk`.
- **Suggested command:** `/impeccable adapt` + `/impeccable audit`

## Persona Red Flags

**Jordan (primeira vez):** Header pequeno sem logo; “check-in” pode não mapear para “retirar chave”. Tela branca sem movimento parece carregando ou desligada.

**Casey (kiosk / interrupção):** Mismatch “toque para começar” × zona tocável só no rodapé. Em telas altas, olhar desce muito do título até o CTA.

**Sam (acessibilidade):** `notice` importante sem `role="alert"`. Contraste do header depende de `primaryColor` da marca (pode falhar WCAG). Outline de foco também depende da cor da marca.

## Minor Observations

- `text-balance` no `h1` ajuda nomes longos de hotel.
- `safe-area-inset` no header/footer — bom para tablets.
- Barra de progresso corretamente oculta em `início`.
- `SelfServicePage` duplica estrutura do `TotemShell` em vez de reutilizar.

## Questions to Consider

- A tela inteira deveria ser tocável, como ATM/aeroporto?
- Onde entra calor visual (logo, foto, pattern) sem violar fundo branco?
- Vale mostrar “4 passos · ~3 min” já na welcome?
