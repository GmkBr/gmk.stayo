# Módulos do frontend

Separação implementada em 25/10/2026. O aplicativo continua com um build e uma publicação. As telas existentes mantêm suas rotas.

## Organização

- `src/modules/identity`: contratos de autenticação, perfil e tipos de usuário.
- `src/modules/hotels`: hotéis e identidade visual.
- `src/modules/reservations`: modelos, conversão da API, requisições e estado de reservas.
- `src/modules/journeys`: ações e contratos de check-in e checkout.
- `src/modules/stays`: hospedagem ativa e conta da estadia.
- `src/modules/orders`: pedidos, conversão da API e estado de atendimento.
- `src/modules/catalog`: categorias, itens, serviços e áreas do catálogo.
- `src/modules/spaces`: espaços físicos e projeção de quartos.
- `src/modules/devices`: dispositivos/totens e suas configurações.
- `src/modules/activity`: atividades e resumo operacional.
- `src/modules/interface`: estado da navegação lateral e menu móvel.
- `src/shared`: tipos e conversões técnicas que não dependem dos domínios.

Cada módulo tem apenas os arquivos necessários: `api.ts` para requisições, `model.ts` para tipos do negócio, `mappers.ts` para converter respostas externas e `use*Module.ts` para estado e ações React. Os modelos HTTP ficam junto dos mappers ou das requisições correspondentes.

## Composição do aplicativo

- `src/app/AppProvider.tsx` coordena autenticação, seleção de hotel, bootstrap e composição dos módulos.
- `src/app/context.ts` declara o contrato que as telas já consomem.
- `src/app/useApp.ts` fornece os hooks das telas.
- `src/auth` mantém sessão, renovação de token e guards de navegação.
- `src/api/client.ts` e `request.ts` mantêm transporte, tratamento de erro e invalidação de sessão.

O provider ainda expõe uma visão agregada por compatibilidade com as telas. Os módulos de estado recebem o hotel e callbacks explícitos, sem importar o provider. Catálogo comunica alterações de área ao módulo de espaços por callbacks; jornadas comunicam atualizações de reserva e de fila da mesma forma.

Os carregamentos ainda são coordenados no provider, com invalidação de respostas antigas e escopo diferente para console/operação. Esta etapa não implementa cache de consultas por domínio nem muda a paginação atual. Essas evoluções podem ocorrer sem recolocar as ações de negócio no provider.

## Regras para código novo

1. Importar do módulo proprietário, por exemplo `modules/orders/api.ts` ou `modules/reservations/model.ts`.
2. Um módulo não importa `app`, o contexto global ou os antigos agregadores de API/tipos.
3. `shared` não importa módulos de negócio nem composição do aplicativo.
4. Coordenação entre domínios usa contratos e callbacks explícitos. Tipos e respostas de outro módulo não devem ser duplicados.
5. Novos estados ou ações de negócio ficam no módulo, e não no contexto agregado.
6. Perfis e permissões apresentados pelo frontend não substituem a autorização no backend.

`npm run check:modules` verifica as regras de imports. O comando faz parte de `npm run check` e, portanto, da checagem usada pelo CI.

## Compatibilidade e código legado

`src/api/index.ts`, `src/api/mappers.ts`, `src/types/index.ts` e `src/context/AppContext.tsx` agora são fachadas de reexportação. Não contêm mais as implementações originais. Permanecem disponíveis para integrações e testes que ainda usem esses caminhos. Os consumidores de `src` foram migrados para os módulos e a composição correspondente.

Tipos de hóspedes, limpeza, manutenção e relatórios usados somente pelos mocks ficam em `src/types/legacy.ts`. Sua presença não significa que essas funcionalidades estejam implementadas na API de produção.

## Limites desta etapa

A separação é de código, contratos e estado. Ela não entrega jornada persistida, idempotência, pagamento real, integração com PMS ou confirmação de chave. Os próximos trabalhos funcionais devem usar os novos limites dos módulos.

## Validação da entrega

Em 25/10 passaram tipos, limites dos módulos, lint sem erros e os 22 testes existentes. O lint ainda aponta avisos de Fast Refresh. O build de produção passou com `VITE_API_BASE_URL=/api/v1` e `VITE_DEMO_MODE=false` informados ao processo; a configuração local existente de URL HTTP foi rejeitada pela validação de produção.

Uma comparação dos fontes preservou as 158 declarações da API, mappers e modelos anteriores. No navegador, em demonstração, foram conferidos login, seleção de hotel, filas, catálogo e carregamento da estadia/pedidos do quarto. Não houve teste com API real, banco de hotel ou hardware.
