# STAYO — Documentação

Interface no app: `/docs`. O conteúdo da tela vive em `src/docs/content.ts`. Este arquivo é o espelho em markdown.

Fonte de verdade do produto e do código. Atualize `src/docs/content.ts` e este arquivo sempre que mudar rota, superfície, escopo do MVP ou comportamento mockado.

Última atualização: 14 ago 2026

---

## O que é

STAYO é um protótipo frontend (Vite + React, sem backend) da comunicação entre totens de autoatendimento e as reservas do hotel.

O hóspede faz check-in no totem de recepção. Depois pede coisas no totem do quarto ou das áreas comuns. O console só acompanha o que esses totens fizeram.

Não é um PMS. Não gerimos ocupação, governança, manutenção, receita nem cadastro interno de hotel.

---

## Como rodar

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`. A primeira tela é o hub (`/`).

---

## Superfícies

Quatro telas. Totens não usam sidebar nem topbar do console.

| Superfície | Rota | Papel |
|---|---|---|
| Hub | `/` | Escolher console ou totem |
| Documentação | `/docs` | Produto, rotas, MVP e legado |
| Console — filas | `/filas` | Check-ins do totem + pedidos |
| Console — reservas | `/reservas` | Lista que o totem consulta |
| Totem de recepção | `/totem/recepcao` | Check-in de autoatendimento |
| Totem de quarto | `/totem/quarto` | Pedidos do quarto (placeholder) |
| Totem de área | `/totem/area` | Pedidos em restaurante, spa, lobby (placeholder) |

Redirecionamentos velhos, só para não quebrar link:

- `/dashboard` → `/filas`
- `/reservations` → `/reservas`
- `/self-service` → `/totem/recepcao`
- `/guest` → `/totem/quarto`

Qualquer outra rota cai no hub.

---

## MVP — ordem de trabalho

1. **Agora (feito):** separar superfícies, limpar o console, tirar gestão interna do caminho.
2. **Seguinte:** totem de recepção busca reserva de verdade (mock em `mockReservations`), confirma, muda status para `checked_in`. A fila em `/filas` atualiza na hora.
3. **Depois:** totem de quarto com catálogo e pedido indo para a fila.
4. **Por último:** totem de área, mesma lógica de pedido, contexto da área em vez do quarto.

Serviços / cardápio só entram no passo 3.

---

## Estado atual do código

### Funciona na demo

- Hub com as quatro superfícies.
- Console com filas (check-in derivado das reservas + pedidos mock) e lista de reservas.
- Totem de recepção: fluxo visual em etapas (início → busca → dados → docs → termos → fim).
- Totens de quarto e área: tela de marca do hotel, botão desligado, texto de “próximo passo”.
- Troca de hotel no topbar do console (muda marca e dados mock).
- “Sair do totem” e logo STAYO voltam ao hub.

### Ainda é falso / incompleto

- Check-in da recepção **não consulta** a lista de reservas. Nome e quarto 203 estão fixos na tela.
- Pedidos em `/filas` vêm de `src/data/mock/mockOrders.ts`. Nenhum totem cria pedido.
- Check-in pelo console foi removido de propósito. Só o totem de recepção faz check-in.
- Sem backend. Estado vive em `AppContext` + mocks.

---

## Pastas que importam

```
src/
  routes/index.tsx          rotas oficiais
  context/AppContext.tsx    hotel atual, reservas, status
  data/mock/                reservas, pedidos, hotéis
  pages/hub/                escolha de superfície
  pages/queues/             filas do console
  pages/reservations/       lista de reservas
  pages/self-service/       totem de recepção
  pages/totem/              quarto e área
  components/layout/        só o console (sidebar, topbar)
  components/ui/            botões, tabela, drawer…
  types/index.ts            Reservation, Order, Hotel…
```

Totem usa a marca do hotel (`hotel.brand`: cor, nome). Console usa a identidade STAYO (canvas, ink, accent azul `#2563EB`). Tipografia: Plus Jakarta Sans. Não usar roxo.

---

## Fora do produto (não religar)

Estas páginas existem no disco, **sem rota**. São resto do protótipo antigo de gestão. Não coloque de volta no sidebar nem nas rotas do MVP:

- `pages/dashboard` — ocupação, receita, mosaico de quartos
- `pages/guests` — CRM de hóspedes
- `pages/rooms` — mapa operacional
- `pages/housekeeping` — governança
- `pages/maintenance` — chamados
- `pages/services` — catálogo admin (o cardápio do totem é outra coisa)
- `pages/reports`
- `pages/settings`
- `pages/guest-portal` — app no celular. No MVP isso vira totem de quarto, não portal móvel
- `components/checkin/CheckInModal` — check-in interno do painel

Se precisar de um componente visual, copie a peça. Não restaure a tela inteira.

---

## Regras de produto

- Totem não tem “voltar ao dashboard”. Sai para o hub.
- Console não lista totens no menu. Troca de superfície é pelo hub (logo ou “Trocar superfície”).
- Check-in = totem de recepção. Pedido = totem de quarto ou área.
- Guest Portal não é uma superfície. Não recrie `/guest`.
- Dados mockados podem mudar no cliente. Não invente API ainda.

---

## Histórico curto

O projeto começou como painel operacional completo (recepção, governança, manutenção, relatórios, guest portal). Em 14 ago 2026 o recorte mudou: STAYO não é sistema de gestão. O MVP é totem de recepção + reservas, depois totens de quarto e área para pedidos. O console ficou só com filas e reservas.
