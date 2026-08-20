---
target: totem de quarto
total_score: 16
max_score: 32
na_heuristics: 7,10
p0_count: 2
p1_count: 1
timestamp: 2026-08-19T17-31-00Z
slug: src-pages-totem-roomtotempage-tsx
---
Method: dual-agent (A: 93318eaa · B: 74b701c3)

## Design Health Score

| # | Heurística | Score | Problema-chave |
|---|-----------|-------|----------------|
| 1 | Visibilidade do status | 2 | Sem feedback ao adicionar item; sucesso sem ETA |
| 2 | Correspondência ao mundo real | 1 | "Trocar totem", "Sair", copy de kiosk público |
| 3 | Controle e liberdade | 3 | Voltar e carrinho ok; idle de 60s apaga progresso |
| 4 | Consistência | 3 | Coerente com área; diverge da recepção (referência) |
| 5 | Prevenção de erros | 2 | Tap adiciona sem confirmação; timeout agressivo no leito |
| 6 | Reconhecimento vs. memória | 2 | Lista textual sem ícones/fotos; serviços escondidos |
| 7 | Flexibilidade e eficiência | n/a | Fluxo único para hóspede ocasional |
| 8 | Estética e minimalismo | 2 | Limpo, porém genérico — cards brancos repetidos |
| 9 | Recuperação de erros | 1 | Quase sem estados de erro no catálogo |
| 10 | Ajuda e documentação | n/a | Copy substitui help, mas está confusa |
| **Total** | | **16/32** | **Acceptable (50%)** |

## Design Specificity Verdict

**Interchangeable.** O totem de quarto é o mesmo `CatalogFlow` + `TotemShell` do totem de área, com copy diferente. A recepção (`SelfServicePage`) já prova identidade de marca: hero centrado, barra de progresso, animação `totem-success-mark`, número gigante no fim. O quarto perde tudo isso.

**Scan determinístico:** 0 findings em 4 arquivos (`RoomTotemPage`, `CatalogFlow`, `TotemShell`, `TotemSetup`). Cobertura limitada — estilos inline e tokens runtime não são capturados. Browser scan pulado (puppeteer ausente).

## Overall Impression

Funciona como MVP de pedido, mas não transmite "tablet bonitinho no quarto". Parece formulário administrativo reutilizado: header de operador, home alinhada à esquerda, catálogo de cards genéricos, sucesso sem celebração. A queixa do usuário bate certo.

## What's Working

1. **Personalização** — `Olá, João` + `Quarto 203` conectam à estadia.
2. **Tokens de marca** — `--hotel-primary` e cores Aurora aplicadas no shell.
3. **Touch targets** — botões h-14 e steppers 40px adequados para tablet.

## Priority Issues

### [P0] Chrome de operador no dispositivo do hóspede
Header com "Trocar totem" e "Sair → /" quebra imersão. Fix: modo guest-only — esconder ou mover para gesto de equipe. Comando: `/impeccable harden`

### [P0] Identidade visual = totem de área
`CatalogFlow` compartilhado 1:1. Fix: variante `room` com home centrada, hero com `coverTone`, atalhos (Comida / Toalhas / Ajuda). Comando: `/impeccable distill` + `/impeccable delight`

### [P1] Sucesso sem celebração
Done é texto + countdown; recepção usa animação e número gigante. Fix: confirmação acolhedora com ETA mock. Comando: `/impeccable animate`

### [P2] Catálogo sem reconhecimento visual
Nome + preço em card branco. Fix: ícones por categoria, badges (~20 min). Comando: `/impeccable layout` + `/impeccable colorize`

### [P2] Copy de pagamento errada
Default cita "totem de recepção"; quarto não override. Fix: "Cobrança na conta do quarto". Comando: `/impeccable clarify`

## Persona Red Flags

**Jordan:** "Trocar totem" incompreensível; "Room service" em inglês; "Sair" parece sair do hotel.

**Casey:** Sem badge de carrinho na home; idle 60s perde progresso; tap sem feedback.

**Renata (hóspede 52a, 21h30):** Sem atalho "Travesseiro extra"; copy de pagamento gera dúvida; sucesso sem ETA.

## Minor Observations

- `coverTone` e `accentColor` existem no brand mas não aparecem no quarto.
- Home left-aligned vs. recepção centered.
- `KIOSK_BTN` revela mental model de kiosk público, não quarto privado.

## Questions to Consider

- Menu de conforto (6 atalhos) ou catálogo completo?
- Por que recepção tem momentos memoráveis e quarto não?
- "Sair" existe para dev ou para hóspede?
