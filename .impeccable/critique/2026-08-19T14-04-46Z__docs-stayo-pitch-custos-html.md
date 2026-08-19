---
target: docs/stayo-pitch-custos.html
total_score: 22
max_score: 36
na_heuristics: 9
p0_count: 1
p1_count: 3
timestamp: 2026-08-19T14-04-46Z
slug: docs-stayo-pitch-custos-html
---
## Method: dual-agent (A: c1095021-b217-4537-a3c0-485af85dafd8 · B: ea91c6b1-2039-4d9d-a0e5-013ec222c942)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Pill ativa + contador X/14 comunicam posição; sem barra de progresso linear |
| 2 | Match System / Real World | 3 | Linguagem não-técnica calibrada; slide 7 ainda parece output de planilha |
| 3 | User Control and Freedom | 2 | Pills permitem salto livre; sem impressão, sem link para Resumo, teclado invisível |
| 4 | Consistency and Standards | 3 | Sistema interno coeso; ícone de callout neutro (○) quebra paridade com ⚠/✓ |
| 5 | Error Prevention | 2 | Placeholders "Substitua pelas cotações reais" visíveis ao investidor |
| 6 | Recognition Rather Than Recall | 3 | Index de pills legível; labels curtos demais sem contexto prévio |
| 7 | Flexibility and Efficiency | 2 | Teclado não documentado; sem atalho para Resumo; sem modo de impressão |
| 8 | Aesthetic and Minimalist Design | 2 | Densidade homogênea em todos os slides; sem número hero que domine |
| 9 | Help Users Recover from Errors | n/a | Superfície de leitura — sem entrada do usuário |
| 10 | Help and Documentation | 2 | Sem instrução de uso; Resumo não linkado; slide "Fora da conta" precisa de framing |
| **Total** | | **22/36** | **Acceptable (61%)** |

## Design Specificity Verdict

**LLM assessment:** O deck é competente, mas genérico. É um shell de dark-dashboard SaaS — accent azul #3b7eff, surface #161719, eyebrow com barra, callouts coloridos — que poderia empacotar qualquer produto B2B sem alterar uma linha. Não há nenhum elemento que evoque hospitalidade: sem textura, sem calor, sem referência a espaço físico. A capa não tem ambição. Para um sócio de vendas e gestão, a experiência sensorial contradiz o pitch — o produto se diz diferenciador para hotéis, mas a apresentação parece painel de DevOps.

**Deterministic scan:** 1 finding (advisory), modo degradado. "Em-dash overuse" — 19 em-dashes em texto visível do body, confirmado pela contagem manual (21 totais no arquivo; 19 em texto renderizável). Não é falso positivo. Todos os outros checks saíram limpos.

**Browser visualization:** não disponível (arquivo local, sem servidor).

## Overall Impression

O deck cumpre a função mínima: organiza os dados, usa linguagem acessível e tem uma estrutura lógica. Mas deixa dinheiro na mesa nos dois extremos — a capa não cria contexto emocional e o encerramento não convence, apenas conclui. O maior problema técnico é o contraste de --text3 (#5c6270) em fundo escuro, que falha WCAG AA em textos de 10–12px usados em eyebrows, headers de tabela e labels de chart.

## What's Working

1. **Linguagem não-técnica consistente** — "Roda o sistema 24h", "Cadeado no navegador" são escolhas editoriais precisas para o público declarado. Calibrado sem ser condescendente.
2. **Slide 13 ("Próximas Decisões")** — o único slide que transforma o espectador em ator. Seis perguntas numeradas, específicas e endereçáveis.
3. **Código de callout semântico** — info/warn/ok/neutro criam sinal legível sem explicação. O sócio entende o aviso do slide 4 sem ler dois parágrafos.

## Priority Issues

**[P0] Placeholders de dados visíveis ao investidor**
- Por que importa: "Substitua pelas cotações reais antes da reunião" e "Preencher com cotações reais" aparecem no corpo dos slides 5 e 8. O investidor vê explicitamente que os números são provisórios, o que mina a credibilidade antes de qualquer conversa.
- Fix: Remover os avisos inline. Se os dados ainda não existirem, substituir por um único callout warn no topo do slide: "Dados preliminares — cotações em andamento."
- Suggested command: /impeccable clarify

**[P1] Contraste insuficiente em --text3 (textos 10–12px)**
- Por que importa: #5c6270 sobre #0e0f11 = ~3.7:1. Falha WCAG AA para textos normais abaixo de 18px. Afeta eyebrow-text, thead th, .text-muted, .val-desc, SVG axis labels — textos de leitura estrutural.
- Fix: Escurecer --text3 para ~#7a808f (ratio ~5.1:1 sobre --bg). Ou usar --text2 (#9ea3ae, 7.1:1) como fallback para os contextos mais críticos.
- Suggested command: /impeccable audit

**[P1] Ausência de hierarquia heroica nos slides financeiros**
- Por que importa: "R$ 270 – R$ 755/mês" usa font-size 22px, igual a outros textos bold. Em decisão de investimento, o número mais importante deveria dominar. Hoje todos os valores competem no mesmo peso visual.
- Fix: Em cada slide financeiro, um número hero em 40–48px, isolado com espaço negativo. O resto da tabela recua para suporte.
- Suggested command: /impeccable layout

**[P1] Capa genérica não ancora identidade de hospitalidade**
- Por que importa: A primeira impressão define o frame emocional do deck. Uma capa que parece SaaS de DevOps comunica o produto errado antes do investidor ler uma palavra.
- Fix: Adicionar elemento visual que evoque hospitalidade — tom quente no acento, tratamento tipográfico próprio para STAYO, ou imagem de ambiente em baixa opacidade como background.
- Suggested command: /impeccable bolder

**[P2] Touch targets abaixo do mínimo em mobile**
- Por que importa: .btn tem height: 30px; .pill tem height: 24px. Ambos abaixo de 44px recomendados. Pills em mobile formam 2–3 linhas comprimidas com texto cortado (ex: "Comprar × Alugar" em 9–11px ilegível).
- Fix: Aumentar .btn para min-height: 44px; .pill para min-height: 36px com padding vertical generoso. Considerar reduzir as pills no mobile para apenas Prev/Next + contador de posição.
- Suggested command: /impeccable adapt

## Persona Red Flags

**Jordan (investidor de primeira viagem):** Abre o link, vê "Custos de infraestrutura e hardware" na capa — não sabe se é para ele ou para o CTO. No slide 5, "Comprar ou alugar?" apresenta as duas opções em colunas simétricas sem sinalizar qual é recomendada (a sugestão está no callout abaixo, em fonte menor). No slide 8, vê "R$ 15k – R$ 45k" e "R$ 270 – R$ 755/mês" sem uma frase que explique a diferença entre investimento único e recorrente. Sai com dúvida do que levou para casa.

**Casey (mobile, distraído):** Pills (14 delas) formam 2–3 linhas em flex-wrap em 375px, algumas com texto cortado. Botões Prev/Next com 30px de altura são alvos de toque difíceis. O slide 7 com grid-2 empilhado gera scroll vertical extenso — Casey perde contexto ao rolar. O estado do slide não persiste se o app for para background e voltar (sem sessionStorage).

**Sam (acessibilidade):** --text3 (#5c6270) falha AA em textos de 10–12px. Ícones de callout (○, ℹ, ⚠, ✓) sem aria-hidden — screen reader anuncia "círculo latino". Pills não têm role="tab" / aria-selected; slides não têm role="tabpanel". Sem aria-live para anunciar troca de slide.

## Minor Observations

- .topbar-sub diz "Apresentação para sócio investidor" — o sócio já sabe. Poderia ser tagline do produto ("Autoatendimento hoteleiro").
- Slide 10 ("Fora da conta") lista 6 custos excluídos sem framing narrativo — pode parecer iceberg de custo.
- Slide 3 ("Produto"): badge "Pronto para demo" sem link ou QR para o protótipo. Oportunidade perdida.
- SVG bar chart: barra do Piloto tem ~3px de altura (R$ 150 mínimo / escala até 6000) — visualmente parece zero.
- Inter não tem @import nem <link> — só usada se instalada localmente. Fallback: Segoe UI.
- Sem <meta og:*> — preview vazio ao compartilhar por WhatsApp/e-mail.
- SVGs sem role="img" — aria-label pode não ser lido em todos os screen readers.
- 4 cores hardcoded inline (#3b7eff e #7eb8ff nos dots de legenda) — impedem troca de tema global.

## Questions to Consider

1. **Se o sócio tivesse 90 segundos, leria o slide 14 e sairia convencido?** O Resumo responde "o que é" e "quanto custa", mas não "por que agora" e "por que vocês". O deck termina onde deveria começar a convencer.
2. **Por que a apresentação parece relatório financeiro e não pitch?** O sócio tem foco em vendas e gestão — pensa em clientes, contratos, diferencial. Existe um hotel que já disse "quero"? Esse dado vale mais emocionalmente do que qualquer tabela de custo.
3. **Quem controla quando os dados reais entram?** O arquivo é uma URL compartilhável, não um PDF fechado. A fronteira entre "preparando" e "material entregue" está invisível.
