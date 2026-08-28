---
target: cadastro de hotel
total_score: 26
max_score: 40
na_heuristics: 
p0_count: 2
p1_count: 2
timestamp: 2026-08-28T00-11-44Z
slug: src-pages-hotels-hotelcreatepage-tsx
---
Method: dual-agent (A: design review · B: detector + manual a11y)

## Design Health Score

| # | Heurística | Score | Problema-chave |
|---|-----------|-------|----------------|
| 1 | Visibilidade do status | 3 | Stepper + aria-live ok; coverTone não reflete no preview |
| 2 | Correspondência ao mundo real | 2 | Passos 1 e 3 ok; passo 2 ainda fala servidor/API/path |
| 3 | Controle e liberdade | 3 | Voltar/cancelar ok; sem skip de passos opcionais |
| 4 | Consistência e padrões | 3 | Input/Select/Button coerentes; erro UF desassociado |
| 5 | Prevenção de erros | 2 | Hex e termsPath sem validação de formato |
| 6 | Reconhecimento vs. recall | 3 | Preview carrega passo 1; coverTone invisível |
| 7 | Flexibilidade e eficiência | 2 | 3 cliques obrigatórios; sem atalho “usar padrões” |
| 8 | Design estético e minimalista | 3 | Card limpo; passo 3 denso (6 decisões) |
| 9 | Recuperação de erros | 2 | UF com erro solto; API em banner genérico |
| 10 | Ajuda e documentação | 2 | Hints pontuais; coverTone sem explicação de efeito |
| **Total** | | **26/40** | **Good — pico no preview, vale no passo 2** |

## Design Specificity Verdict

**LLM:** 7/10 — preview do totem é hotel-native; stepper Lucide e color pickers ainda genéricos. Desalinhamento: step “Operação” vs. heading “Termos no check-in”.

**Detector:** 0 findings (`detect.mjs` → `[]`). Não capturou coverTone fantasma, erro UF desassociado, keys duplicadas no preview.

**Browser:** indisponível; sem overlay visual.

## Overall Impression

O wizard termina bem (banner em `/filas` funciona). O preview de marca no passo 3 é o diferencial. Os dois bloqueios reais: **coverTone que não muda nada** (quebra confiança) e **passo 2 ainda assusta não-técnicos** mesmo com copy melhorada.

## What's Working

1. **HotelBrandPreview** — materializa investimento em totem real.
2. **Progresso acessível** — “Passo X de 3”, aria-current, labels no mobile (melhoria recente).
3. **Integração pós-criação** — welcome banner em QueuesPage confirma sucesso.

## Priority Issues

### [P0] coverTone é control fantasma
Select altera draft mas preview ignora. Usuário muda algo e nada acontece.
**Fix:** aplicar cool/warm/neutral no gradiente do preview ou remover até existir efeito.
**Comando:** `/impeccable polish`

### [P0] Passo 2 ainda parece infra
Campo técnico mantido, mas label/hint/placeholder ainda evocam servidor e API.
**Fix:** reframe + botão “Configurar depois” que avança sem foco no input.
**Comando:** `/impeccable clarify`

### [P1] Erro de UF inconsistente
Select sem error/aria-invalid; mensagem flutuando no grid.
**Fix:** estender Select com prop error como Input.
**Comando:** `/impeccable harden`

### [P1] Passo 3 denso sem atalho
5+ controles; só “Restaurar cores” não pula o passo.
**Fix:** “Usar identidade padrão e criar” ou “Pular — configurar depois”.
**Comando:** `/impeccable optimize`

### [P2] Hex sem validação
Valor inválido quebra gradiente sem feedback.
**Fix:** validar #RRGGBB on blur; fallback para default.
**Comando:** `/impeccable harden`

## Persona Red Flags

**Jordan:** placeholder path assusta; “Tom da capa” sem feedback visual; hex intimidam.

**Alex:** três Continuar obrigatórios; coverTone morto; redirect fixo /filas.

**Sam:** erro UF desassociado; dois inputs ColorField com mesmo aria-labelledby; keys React duplicadas se cores iguais.

## Minor Observations

- UF default SC pode induzir erro fora de SC.
- Banner erro usa red-* hardcoded vs token danger.
- Preview sem aria-live (decorativo, ok).
- Step label “Operação” ≠ heading “Termos no check-in”.

## Questions to Consider

- Passo 2 no wizard ou pendência pós-criação no console?
- Preview desde o passo 1 (construção progressiva)?
- coverTone é produto ou resíduo de schema?
