# STAYO — Documentação

Interface no app: `/docs`. O conteúdo da tela vive em `src/docs/content.ts`. Este arquivo é o espelho em markdown.

Documentação de **funcionalidades do produto** — o que cada tela faz, fluxos de uso e limitações.

Última atualização: 12 set 2026

---

## Produto

STAYO é a camada de autoatendimento hoteleiro. Totens para o hóspede, console para a equipe.

O hóspede faz check-in e check-out no totem de recepção, pede serviços nos totens de quarto e área. A equipe acompanha tudo pelo console — filas, reservas, espaços, totens e cardápio — sem substituir o PMS do hotel.

**Não é PMS.** STAYO não gerencia ocupação, governança, manutenção, receita nem cadastro interno.

| Quem | Usa |
|---|---|
| Hóspede | Totens de recepção, quarto e área |
| Recepção / equipe | Console — filas, reservas, espaços, totens, cardápio |
| Administrador | Console — criar/editar/excluir hotel, troca de hotel e gestão operacional |

---

## Backend e auth

- API: `VITE_API_BASE_URL` (ex.: `http://192.168.18.140:8080/api/v1`)
- **Modo demonstração:** padrão no desenvolvimento; builds de produção usam API real por padrão. `npm run build:demo` gera uma demonstração explícita. Dados em memória e `sessionStorage` (`src/demo`, chave `stayo.demo.v1`). Senha `demo123`. Contas na tela de login: console `ana@stayo.app`, totens `recepcao-01`, `quarto-01`, `area-restaurante`, `cozinha-01`. Para API real no desenvolvimento: `VITE_DEMO_MODE=false` e restart do Vite. Guia de build: `docs/PRODUCAO.md`.
- Entrada em `/login` — `POST /auth/login` (human e totem). Cadastro de operador: `POST /auth/register`. Guia: `docs/AUTH.md`
- Sessão no FE: `localStorage` (`stayo.auth`); no modo demonstração o estado operacional fica no browser
- `GET /me` retorna `accountType`: `human` | `totem`; totem inclui objeto `totem` com `kind`, `hotelId`, `loginId`…
- Após login: **human** → `/hoteis`; **totem** → `/totem` (interface pelo `kind`)
- 401 tenta `POST /auth/refresh`; se falhar → logout

---

## Reservas, check-in, check-out e estadia (API)

Persistência no backend (migrations V7–V11): `reservations`, `reservation_history`, `stays`, `orders`, `order_items`, `catalog_*`.

### Modelo

- **Reserva** — contrato comercial (datas, hóspede, tarifa, quarto planejado).
- **Estadia (`stays`)** — ocupação real: criada no check-in, encerrada no checkout; liga reserva + quarto + pedidos de quarto.
- Pedido de quarto exige **estadia ativa** no `spaceId` (não só reserva `checked_in`).

| Método | Rota | Quem |
|---|---|---|
| GET | `/hotels/{id}/reservations` | staff / totem recepção |
| POST | `/hotels/{id}/reservations` | staff |
| GET | `/hotels/{id}/reservations/{resId}` | staff / totem recepção |
| POST | `/hotels/{id}/reservations/{resId}/confirm` | staff |
| POST | `/hotels/{id}/reservations/{resId}/cancel` | staff |
| GET | `/hotels/{id}/queues/summary` | staff / totem |
| POST | `/hotels/{id}/checkin/search` | totem reception |
| POST | `/hotels/{id}/checkin/{resId}/validate` | totem reception |
| POST | `/hotels/{id}/checkin/{resId}/complete` | totem reception |
| POST | `/hotels/{id}/checkout/search` | totem reception |
| POST | `/hotels/{id}/checkout/{resId}/validate` | totem reception |
| POST | `/hotels/{id}/checkout/{resId}/complete` | totem reception |
| GET | `/hotels/{id}/stays/active?spaceId=` | staff / totem quarto |
| GET | `/hotels/{id}/stays/{stayId}/account` | staff / totem quarto |
| GET | `/hotels/{id}/stays/{stayId}/orders` | staff / totem quarto |

**Listagem (GET reservations / orders):** o backend responde com **array JSON**; o FE normaliza para `{ items, total, page, size }`.

**Regras:** promoção lazy `confirmed → arriving_today` (America/Sao_Paulo); check-in complete cria `stay` ativa; checkout consolida diárias + pedidos `delivered` da estadia, marca como `billed` e encerra a stay. Pedidos `open`/`preparing` aparecem em `openOrders` do extrato mas não entram no total pago.

**Exemplo:** reserva Y (01/09–03/09, quarto 401) → check-in cria estadia → pedido de produto A no totem 401 entra na estadia → no checkout, diárias + produto A (se `delivered`) são pagos juntos.

---

## Pedidos (API)

| Método | Rota | Quem |
|---|---|---|
| GET | `/hotels/{id}/orders` | staff / totem operação |
| POST | `/hotels/{id}/orders` | totem quarto / área |
| PATCH | `/hotels/{id}/orders/{orderId}/status` | staff / totem operação |
| POST | `/hotels/{id}/orders/{orderId}/cancel` | staff / totem operação |

**Status:** `open → preparing → delivered` (ou `cancelled`). Checkout fatura apenas `delivered`.

**Regras:** pedido de quarto exige **estadia ativa** no `spaceId` (criada no check-in); grava `stay_id` + `reservation_id`. Pedido de área não vincula estadia.

---

## Cardápio (API)

| Método | Rota | Notas |
|---|---|---|
| GET/POST/PUT | `/hotels/{id}/catalog/categories` | context: room, area, both |
| GET/POST/PUT | `/hotels/{id}/catalog/items` | itens por categoria |
| GET/POST/PUT | `/hotels/{id}/catalog/services` | serviços extras |
| GET/POST/PUT | `/hotels/{id}/catalog/areas` | **fachada** sobre `spaces` (type=area) |

Categorias de área usam `areaIds` com os mesmos IDs de espaço que o totem vincula no setup.

---

## Atividades

| Método | Rota | Estado |
|---|---|---|
| GET | `/hotels/{id}/activities` | retorna `[]` (stub); `addActivity` no FE é local |

---

## Funcionalidades

### Totem de recepção (`/totem`, kind=reception)

- Tela inicial: **Check-in** ou **Check-out**
- Busca por nome, código ou CPF
- Check-in: validate → dados → documento (simulado) → termos → complete
- Check-out: validate → extrato → pagamento → complete

### Console — Filas, Reservas, Espaços, Totens, Cardápio

Operação do hotel. Só `accountType: human`. Dados carregados sob demanda via API.

### Totem quarto / área / operação

- Quarto: catálogo + pedidos via API; exige estadia ativa (check-in na recepção); mostra conta do quarto e meus pedidos
- Área: catálogo + pedidos via API (sem estadia)
- Operação: fila de pedidos + edição de cardápio

---

## Próximos passos

1. **Auto-refresh** no totem de operação
2. **Atividades persistidas** — feed operacional na API
3. **Integração PMS** — reservas externas
4. **TEF / gateway** — pagamento real no checkout

---

## Limitações

- Leitura de documento no check-in é simulada
- Checkout registra método e valor — sem TEF/gateway
- Checkout manual pelo console não chama a API (use o totem)
- Não substitui PMS
