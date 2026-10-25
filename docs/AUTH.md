# Auth STAYO (frontend + API)

## Fluxo FE — login unificado

Console e totem usam o **mesmo** `POST /auth/login`. O tipo de conta vem do `GET /me`.

### Cadastro (só operadores)
1. `POST /auth/register` — body: `email`, `password`, `fullName`
2. Resposta **201**: `user` + tokens
3. FE grava em `localStorage` (`stayo.auth`)

### Login (operador ou totem)
1. `POST /auth/login` — body: `email` (e-mail **ou** identificador curto, ex. `recepcao-01`), `password`
2. Backend resolve totem para `{loginId}@totem.stayo.app`
3. Resposta inclui `user.accountType` e `user.totem` quando for totem
4. Redirect FE: **human** → `/hoteis`; **totem** → `/totem`

### GET /me — contrato esperado (totem)

```json
{
  "id": "uuid",
  "email": "aurora-recepcao@totem.stayo.app",
  "fullName": "Recepção principal",
  "status": "ACTIVE",
  "accountType": "totem",
  "totem": {
    "id": "uuid",
    "hotelId": "uuid",
    "loginId": "recepcao-01",
    "name": "Recepção principal",
    "kind": "reception",
    "roomNumber": null,
    "areaId": null,
    "active": true,
    "brand": {
      "primaryColor": "#0B3D5C",
      "secondaryColor": "#1F6F8B",
      "accentColor": "#F4A261",
      "hotelName": "Hotel Aurora",
      "coverTone": "cool"
    }
  }
}
```

Para operadores: `accountType: "human"` (ou omitido → human) e sem `totem`.

### Totens — criação pelo console

`POST /hotels/{hotelId}/totems`

```json
{
  "name": "Recepção principal",
  "kind": "reception",
  "loginSuffix": "recepcao",
  "password": "senha123",
  "active": true
}
```

- Backend gera `loginId` a partir de `loginSuffix` (único globalmente)
- E-mail Supabase: `{loginId}@totem.stayo.app`
- `PATCH` com `active: false` desativa totem e bane user no Supabase
- `POST .../totems/{id}/reset-password` — body `{ "password": "..." }`

**Removido:** `POST /totems/activate`, campo `code`, `deviceToken` separado.

### Depois do login — human
- `/hoteis` → seleção de hotel → console (`/filas`…)
- `RequireConsole` bloqueia totens

### Depois do login — totem
- `/totem` → interface pelo `kind`
- Tema (brand) vem em `user.totem.brand` no login, refresh e `GET /me` — **sem** `GET /hotels/{id}`
- FE monta o contexto do hotel localmente a partir de `totem.brand` + `totem.hotelId`
- **room / area** com `totem.spaceId: null`: setup no tablet (`GET /spaces`), binding em `localStorage` (`stayo.totem.space`); pedidos mandam `spaceId` no body
- **room / area** dedicado (`spaceId` no `/me`): pula setup; contexto fixo no backend

## Frontend — proteção de rotas

| Guard | Rotas | Quem |
|---|---|---|
| (público) | `/login`, `/hub`, `/docs` | todos |
| `RequireConsole` | `/hoteis`, `/filas`, `/reservas`, `/totens`, `/cardapio` | human |
| `RequireTotem` | `/totem` | totem |

- `401` com JWT da sessão → renovação compartilhada entre chamadas concorrentes e uma repetição da requisição. Se a renovação falhar, `signOut` + `/login`. Login público e tokens explícitos não acionam essa recuperação.
- Logout/troca de conta invalidam requests anteriores; um refresh atrasado não restaura a sessão encerrada.
- `signOut` limpa `stayo.auth` e `stayo.hotel`

## Frontend — `.env`

```env
VITE_API_BASE_URL=http://192.168.18.140:8080/api/v1
```

Login/cadastro não usam client Supabase no frontend — a API faz o proxy.

## Hotéis (CRUD)

| Método | Rota | Quem |
|---|---|---|
| `GET` | `/hotels` | Autenticado human |
| `GET` | `/hotels/{hotelId}` | Autenticado com acesso |
| `POST` | `/hotels` | Human autenticado → dono + ADMIN |
| `PUT` | `/hotels/{hotelId}` | Dono ou ADMIN |
| `DELETE` | `/hotels/{hotelId}` | Dono ou ADMIN (soft delete) |

Slug **não** vai no body — o backend gera a partir do ID.

## Totens (CRUD)

| Método | Rota | Quem |
|---|---|---|
| `GET` | `/hotels/{id}/totems` | Human do hotel |
| `POST` | `/hotels/{id}/totems` | Human — cria user Supabase + totem |
| `PATCH` | `/hotels/{id}/totems/{totemId}` | Human |
| `POST` | `/hotels/{id}/totems/{totemId}/reset-password` | Human |

Kinds: `reception`, `room`, `area`, `operation`.
