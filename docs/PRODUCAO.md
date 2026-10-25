# Preparação para produção

Este repositório contém o frontend. O backend, as migrações, os dispositivos e o ambiente de hospedagem ainda precisam ser avaliados em conjunto antes de um piloto real. Este documento registra decisões de implementação e os critérios para a próxima entrega.

Atualização de 15/10/2026: o backend foi localizado em `../STAYO/BE`. A primeira etapa conjunta protege pedidos e dados de estadias; detalhes e limitações estão em `../STAYO/BE/docs/PRODUCAO.md`. O frontend agora envia referências de produto/serviço e só confirma envio após a resposta da API. A carga de quarto/área não busca reservas de outros hóspedes; a operação carrega os dados do seu fluxo sem solicitar a lista de reservas.

## Base implementada

- Builds de produção usam API real por padrão. Um valor de demo inválido falha explicitamente.
- `npm run build:demo` gera a demonstração de forma explícita. Um build comum rejeita `VITE_DEMO_MODE=true`.
- Builds rejeitam `VITE_DEV_ACCESS_TOKEN`, API ausente, HTTP e credenciais embutidas na URL.
- A API aceita um caminho na mesma origem, como `/api/v1`, ou uma URL HTTPS.
- Chamadas concorrentes compartilham uma renovação de token. A chamada que recebeu 401 é repetida uma vez com o token renovado.
- Login público e tokens explícitos não acionam a renovação da sessão compartilhada. Falhas de rede e erros de negócio não geram repetição automática.
- Logout e troca de conta invalidam requisições anteriores. Uma renovação atrasada não restaura uma sessão encerrada.
- Trocar de hotel limpa os dados exibidos e invalida cargas anteriores. Somente a carga mais recente pode atualizar o estado.
- CI versionado executa checagem de tipos, lint, testes e build. Sua execução no GitHub depende de enviar estes arquivos ao repositório remoto.

## Ambiente e comandos

Use Node.js 24 e o arquivo `package-lock.json` versionado:

```sh
npm ci
npm run dev
npm run check
```

No desenvolvimento, sem configuração explícita, o modo demo fica ativo. Para testar a API real, use `VITE_DEMO_MODE=false` no ambiente local e reinicie o Vite.

Para preparar um build real, copie `.env.production.example` para `.env.production.local` ou configure as mesmas variáveis no provedor de build:

```env
VITE_API_BASE_URL=/api/v1
VITE_DEMO_MODE=false
```

```sh
npm run build
npm run preview
```

O caminho `/api/v1` pressupõe um proxy reverso configurado na hospedagem. Alternativamente, informe a URL HTTPS da API e configure as origens permitidas no backend. As rotas da SPA, como `/login` e `/totem`, devem servir `index.html` ao serem abertas diretamente; a rota `/api` deve continuar encaminhada ao backend.

Variáveis `VITE_*` ficam disponíveis no navegador. Não coloque chaves administrativas, senhas de integração, credenciais de pagamento ou segredos de assinatura nelas. A configuração é aplicada durante o build; alterar o ambiente do servidor estático depois não reconfigura o bundle.

Para gerar uma demonstração separada:

```sh
npm run build:demo
```

Produção e demonstração usam o diretório `dist`. Publique o artefato correspondente ao comando escolhido. A demonstração usa dados no navegador e não compartilha a operação entre tablets.

## Critérios para um piloto assistido

1. Confirmar autorização no backend por hotel, tipo de conta e dispositivo. Os guards React servem à navegação; a API precisa validar cada operação.
2. Executar com API real: criar reserva, confirmar, realizar check-in, criar pedido vinculado à estadia, entregar, conferir extrato e concluir check-out.
3. Validar troca de hotel e logout durante respostas lentas, token expirado, dispositivo desativado e indisponibilidade do backend.
4. Confirmar que um duplo toque e uma reconexão não criam duas estadias, cobranças ou pedidos. Idempotência e restrições de unicidade precisam existir no backend antes de permitir novas tentativas após resultado desconhecido.
5. Definir origem dos valores, disponibilidade do quarto e saldo no backend. O backend deve rejeitar um 401 antes de qualquer mutação, condição necessária para repetir uma chamada após renovar a sessão.
6. Integrar a confirmação de identidade, o resultado do pagamento e a entrega da chave. Hoje as telas não comprovam esses eventos. Não tratar `paidAmount` enviado pelo navegador como prova de cobrança.
7. Registrar eventos operacionais com identificador de correlação e sem documento, token ou dados de pagamento nos logs. Disponibilizar um caminho de atendimento quando o hóspede não consegue concluir sozinho.
8. Verificar o fluxo no hardware usado pelo hotel: toque, teclado, câmera/leitor, terminal de pagamento, saída de chave, resolução, orientação e retomada após reiniciar.
9. Medir início, conclusão, abandono, duração e necessidade de ajuda por etapa. Usar esses dados para escolher as próximas melhorias.
10. Validar restauração de backup do backend e rollback do frontend antes de publicar no piloto.

## Próxima evolução da arquitetura

Em 25/10/2026, API, modelos, mappers e ações de estado foram separados em `src/modules`. A composição está em `src/app`; `AppContext` virou uma fachada de compatibilidade. O provider ainda expõe a visão agregada às telas e coordena o carregamento de vários recursos ao navegar. A proteção contra respostas atrasadas permanece. Ver [módulos](MODULOS.md).

A próxima evolução deve especializar as consultas e reduzir a visão agregada por tela. Cada consulta deve usar hotel e filtros como parte de sua identificação, carregar apenas o necessário e invalidar os dados afetados por uma ação. A paginação deve ser real; o limite atual de 200 não pode virar uma lista completa por convenção.

O fluxo de recepção deve ter transições explícitas e verificadas: reserva localizada, identidade confirmada, termos registrados, quarto liberado, pagamento confirmado quando aplicável, estadia criada e chave entregue. Uma falha na chave após criar a estadia deve encaminhar para assistência e preservar o resultado já confirmado. Não repetir o check-in para tentar emitir a chave novamente.

Integrações com PMS, identidade, cobrança e fechaduras devem passar por adaptadores no backend, com contratos versionados e estados de falha recuperáveis. O frontend apresenta o estado e envia intenções; o backend decide disponibilidade, preço, autorização e conclusão.

## Verificações e limites atuais

Os testes locais cobrem configuração de ambiente, transporte HTTP e renovação/isolamento de sessão na camada de requisições. Não cobrem o navegador completo, o ciclo de vida dos provedores React, as transações do backend nem os dispositivos.

O lint está limitado a `src` e à configuração do Vite para não examinar scripts de skills locais. Os avisos existentes de exportações para Fast Refresh ainda devem ser tratados na refatoração dos módulos; erros de lint impedem o CI.

A validação final do build e do hardware deve ser registrada em cada entrega, junto com o commit, o ambiente e os cenários executados.

Nesta preparação, em 14/10/2026: `npm run check` passou com 16 testes e avisos existentes de Fast Refresh. O build real, com `VITE_API_BASE_URL=/api/v1` e `VITE_DEMO_MODE=false`, e o build separado de demonstração passaram no Windows fora do sandbox. As falhas anteriores de `spawn EPERM` ocorreram na execução restrita; não foi necessário reinstalar as dependências. Nenhum deploy, teste com backend real ou teste de hardware foi executado.
