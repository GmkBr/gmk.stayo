# STAYO — Documentação

Interface no app: `/docs`. O conteúdo da tela vive em `src/docs/content.ts`. Este arquivo é o espelho em markdown.

Documentação de **funcionalidades do produto** — o que cada tela faz, fluxos de uso e limitações.

Última atualização: 27 ago 2026

---

## Produto

STAYO é a camada de autoatendimento hoteleiro. Totens para o hóspede, console para a equipe.

O hóspede faz check-in no totem de recepção, pede serviços nos totens de quarto e área, e paga no checkout da recepção. A equipe acompanha tudo pelo console — filas, reservas, totens e cardápio — sem substituir o PMS do hotel.

**Não é PMS.** STAYO não gerencia ocupação, governança, manutenção, receita nem cadastro interno.

| Quem | Usa |
|---|---|
| Hóspede | Totens de recepção, quarto e área |
| Recepção / equipe | Console — filas, reservas, totens, cardápio |
| Administrador | Console — criar/editar/excluir hotel, troca de hotel e gestão operacional |

---

## Backend e auth

- API: `VITE_API_BASE_URL` (ex.: `http://192.168.18.140:8080/api/v1`)
- Entrada em `/login` — `POST /auth/login` (human e totem). Cadastro de operador: `POST /auth/register`. Guia: `docs/AUTH.md`
- Sessão no FE: `localStorage` (`stayo.auth`); sem client Supabase no login
- `GET /me` retorna `accountType`: `human` | `totem`; totem inclui objeto `totem` com `kind`, `hotelId`, `loginId`…
- Após login: **human** → `/hoteis`; **totem** → `/totem` (interface pelo `kind`)
- Sem JWT → redirect para `/login`; 401 → logout
- Totens são usuários Supabase: `loginSuffix` → `loginId` → `{loginId}@totem.stayo.app`
- `loginId` único globalmente; sem prefixo de hotel no FE
- Login aceita identificador curto ou e-mail completo
- `accountType` + `totem` vêm no login e no `GET /me`
- Removido: código de ativação e `POST /totems/activate`

---

## Funcionalidades

### Login (`/login`)

Login único para console e totem. Cadastro de conta (`/auth/register`) é só para operadores. Redirect automático conforme `accountType` no `/me`.

### Hub (`/hub`)

Atalhos para login (console ou totem). Público.

### Console — Hotéis (`/hoteis`, …)

Seleção e wizard de hotel. Só `accountType: human`.

### Console — Filas, Reservas, Totens, Cardápio

Operação do hotel. Só human.

### Console — Totens (`/totens`)

Cadastro de totens: tipo, `loginSuffix` (ex.: `recepcao-01`), senha, quarto/área conforme tipo. E-mail no Supabase: `{loginId}@totem.stayo.app`. Desativar (PATCH `active: false`) bane o user.

### Totem (`/totem`)

Protegido; só `accountType: totem`. Interface automática:

| kind | Interface |
|---|---|
| `reception` | Check-in |
| `room` | Catálogo do quarto |
| `area` | Catálogo da área |
| `operation` | Placeholder (fila em breve) |

Rotas antigas `/totem/recepcao`, `/totem/quarto`, `/totem/area` redirecionam para `/totem`.

---

## Próximos passos

1. **Backend** — `accountType` + `totem` no `/me`; CRUD totem com criação de user Supabase
2. **Totem operação** — fila de pedidos no dispositivo
3. **Refresh de token** — `POST /auth/refresh` automático
4. **Checkout na recepção** — fechar conta e pagamento

---

## Limitações

- Backend deve expor `accountType` e `totem` no `GET /me` e novos campos no CRUD de totens
- Totem operação: cadastro + login prontos; UI de cozinha pendente
- Leitura de documento no check-in é simulada
- Pagamento ainda não existe no totem de recepção
- Não substitui PMS
