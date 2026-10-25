export type FeatureStatus = 'live' | 'partial' | 'next'

export type DocFeature = {
  title: string
  path?: string
  status: FeatureStatus
  summary: string
  capabilities: string[]
  limitations?: string[]
}

export type DocFlow = {
  title: string
  actor: string
  status: 'live' | 'next'
  steps: string[]
}

export type DocUpcoming = {
  title: string
  detail: string
}

export const DOC_UPDATED = '12 set 2026'

export const PRODUCT_SUMMARY = {
  title: 'STAYO',
  lead: 'Camada de autoatendimento hoteleiro. Totens para o hóspede, console para a equipe.',
  description:
    'O hóspede faz check-in e check-out no totem de recepção e pede serviços nos totens de quarto e área. A equipe acompanha tudo pelo console — filas, reservas, espaços, totens e cardápio — sem substituir o PMS do hotel.',
  notPms: 'STAYO não gerencia ocupação, governança, manutenção, receita nem cadastro interno. É a ponte entre o hóspede e a operação.',
  users: [
    { role: 'Hóspede', uses: 'Totens de recepção, quarto e área' },
    { role: 'Recepção / equipe', uses: 'Console — filas, reservas, espaços, totens e cardápio' },
    { role: 'Administrador', uses: 'Console — criar/editar hotel, troca de contexto e gestão operacional' },
  ],
}

export const FEATURES: DocFeature[] = [
  {
    title: 'Login / cadastro',
    path: '/login',
    status: 'live',
    summary: 'Entrada do app. Login e cadastro via API (user + tokens). Sem JWT, rotas do console redirecionam para cá.',
    capabilities: [
      'Modo demonstração: padrão no desenvolvimento. Produção usa API real; build:demo gera uma demonstração explícita. Senha demo123. Atalhos na tela de login.',
      'POST /auth/login → user + accessToken + refreshToken',
      'POST /auth/register → mesmo formato (Auth + perfil + tokens) — só operadores',
      'GET /me com accountType: human | totem',
      'Human → /hoteis; totem → /totem (interface pelo kind)',
      'Sessão em localStorage (stayo.auth)',
      '401 compartilha POST /auth/refresh entre chamadas e repete a requisição uma vez; falha de renovação encerra a sessão',
      'Sair limpa sessão e hotel selecionado',
    ],
    limitations: ['Hub (/hub) permanece público; totem exige login'],
  },
  {
    title: 'Hub',
    path: '/hub',
    status: 'live',
    summary: 'Atalhos para login do console ou do totem. Público.',
    capabilities: [
      'Dois atalhos: Console (equipe) e Totem (dispositivo)',
      'Ambos levam a /login — o sistema detecta o tipo de conta',
      'Link para esta documentação',
    ],
  },
  {
    title: 'Console — Filas',
    path: '/filas',
    status: 'live',
    summary: 'Painel operacional do dia. O que chegou pelos totens.',
    capabilities: [
      'Contadores: aguardando check-in, check-ins feitos, pedidos abertos',
      'Fila de check-in: reservas aguardando o totem e as já concluídas',
      'Fila de pedidos: itens abertos, em preparo, entregues ou cancelados',
      'Avançar status do pedido (aberto → preparo → entregue) ou cancelar',
      'GET/POST/PATCH /hotels/{id}/orders — API Spring com status preparing',
      'Clique em uma reserva leva para a lista completa',
    ],
  },
  {
    title: 'Console — Reservas',
    path: '/reservas',
    status: 'live',
    summary: 'Lista de reservas que o totem de recepção consulta no check-in e check-out.',
    capabilities: [
      'Busca por nome, quarto ou CPF',
      'Filtro por status (confirmada, hospedado, cancelada…)',
      'Filtro por período (chegada hoje, próximas, em casa)',
      'Ver detalhes: CPF, contato, datas, valor, pagamento, histórico',
      'Confirmar reserva pendente ou cancelar',
      'Criar nova reserva manualmente',
      'GET /reservations e GET /orders: BE responde array JSON; FE normaliza para PageResult',
    ],
    limitations: ['Checkout manual pelo console ainda não chama a API — use o totem de recepção'],
  },
  {
    title: 'Console — Hotéis',
    path: '/hoteis',
    status: 'live',
    summary: 'Hub de seleção após login. Escolhe o hotel do console ou cadastra um novo em fluxo guiado.',
    capabilities: [
      'Bootstrap leve no hub: só GET /me e GET /hotels (sem reservas/pedidos/totens até entrar no console)',
      'Empty state + botão para /hoteis/novo',
      'Wizard de cadastro e edição: identidade, termos (texto e/ou PDF), marca com preview',
      'Termos: termsText (inline) e termsPath (PDF no storage) — totem exibe texto, PDF ou defaults',
      'PUT envia "" para limpar termos vazios; omitir campo mantém valor no backend',
      'Criar hotel (POST /hotels) — usuário vira dono + ADMIN',
      'Editar/excluir no wizard /hoteis/:id/editar (PUT / DELETE) — soft delete no passo 1',
      'Topbar do console volta a /hoteis para trocar de hotel',
    ],
    limitations: ['Permissão de editar/excluir é validada no backend (dono ou ADMIN)'],
  },
  {
    title: 'Totem (entrada)',
    path: '/totem',
    status: 'live',
    summary: 'Rota protegida após login de conta totem. Renderiza a interface conforme o kind (recepção, quarto, área, operação).',
    capabilities: [
      'RequireTotem: só accountType totem',
      'Bootstrap monta hotel local com totem.brand (login /me / refresh) — sem GET /hotels/{id}',
      'kind reception → check-in; room → catálogo quarto; area → catálogo área',
      'kind operation → fila de pedidos + cardápio no tablet',
    ],
    limitations: [],
  },
  {
    title: 'Totem de recepção',
    path: '/totem',
    status: 'live',
    summary: 'Check-in e check-out de autoatendimento. Conta totem kind=reception após login.',
    capabilities: [
      'Tela inicial: Iniciar check-in ou Fazer check-out',
      'Busca por nome, código da reserva ou CPF (POST checkin/search ou checkout/search)',
      'Validação no backend antes de avançar (validate → `{ blockReason, reservation }`); erros 409 exibidos ao hóspede',
      'Check-in: dados, documento simulado, termos e confirmação com quarto',
      'Check-out: extrato (diárias + pedidos entregues), aviso de pedidos em preparo, forma de pagamento e complete',
      'Reinicia sozinho após inatividade',
      'Config da equipe: long-press 5 s no nome do hotel no topo (voltar ao início / sair)',
    ],
    limitations: ['Leitura de documento é simulada — sem integração com hardware', 'Pagamento no checkout registra método e valor — sem TEF/gateway'],
  },
  {
    title: 'Totem de quarto',
    path: '/totem',
    status: 'live',
    summary: 'Pedidos e solicitações dentro do quarto. Conta totem kind=room.',
    capabilities: [
      'Login com usuário totem compartilhado (kind=room, spaceId null no backend)',
      'Setup no tablet: escolhe quarto via GET /spaces e salva spaceId no localStorage',
      'Config da equipe: long-press 5 s no nome do hotel no topo (sem feedback visual; instruções em /totens)',
      'Exige estadia ativa (check-in na recepção) para pedir — GET /stays/active?spaceId=',
      'Home com atalhos (Alimentos, Meus pedidos, Spa, Cardápio), card Conta do quarto e destaques',
      'Catálogo visual: ícones, badges de tempo, feedback ao adicionar',
      'Carrinho, observações e envio para a fila do console (body com spaceId; BE grava stay_id)',
      'Meus pedidos: GET /stays/{stayId}/orders com status real',
      'Confirmação com previsão de entrega; cobrança na conta da estadia (paga no checkout da recepção)',
      'Reinício após inatividade (3 min no catálogo)',
    ],
  },
  {
    title: 'Totem de área',
    path: '/totem',
    status: 'live',
    summary: 'Pedidos em restaurante, spa, lobby. Conta totem kind=area.',
    capabilities: [
      'Login com totem compartilhado (kind=area, spaceId null no backend)',
      'Setup no tablet: escolhe área via GET /spaces e salva spaceId no localStorage',
      'Opção Trocar área no header',
      'Cardápio filtrado por spaceId da área selecionada',
      'Carrinho e envio para a fila do console (body com spaceId)',
      'Cobrança orientada para o checkout na recepção',
    ],
  },
  {
    title: 'Totem de operação',
    path: '/totem',
    status: 'live',
    summary: 'Cozinha e preparo: fila de pedidos + gestão de cardápio no tablet.',
    capabilities: [
      'Login kind=operation — um totem compartilhado por hotel (sem setup de espaço)',
      'Aba Pedidos: fila aberta, avançar status (aberto → preparo → entregue), cancelar',
      'Aba Cardápio: categorias, itens e ativar/desativar serviços',
      'Atualizar lista de pedidos manualmente',
      'Sair: long-press 5 s no nome do hotel no topo',
    ],
    limitations: ['Áreas comuns continuam no console (/espacos); check-in continua na recepção'],
  },
  {
    title: 'Console — Espaços',
    path: '/espacos',
    status: 'live',
    summary: 'Cadastro de quartos e áreas comuns do hotel (entidade Space no backend).',
    capabilities: [
      'Tipos na UI: quarto (number obrigatório, floor/name opcionais) e área (name obrigatório)',
      'GET/POST/PATCH/DELETE /hotels/{id}/spaces',
      'Detalhe do espaço mostra totem vinculado (spaceId ou legado roomNumber)',
      'Listagem para qualquer membro; mutações validadas no backend (OWNER/ADMIN)',
      'Não remove space em uso por totem',
    ],
    limitations: ['Recepção e operação ainda não aparecem nesta tela'],
  },
  {
    title: 'Console — Totens',
    path: '/totens',
    status: 'live',
    summary: 'Cadastro de totens como usuários Supabase do hotel (login + senha).',
    capabilities: [
      'Tipos: recepção, quarto, área, operação',
      'loginSuffix livre (ex.: recepcao-01) — único globalmente; e-mail: {loginId}@totem.stayo.app',
      'Criar com senha; redefinir senha na edição; login imutável',
      'Quarto/área: totem compartilhado sem spaceId — tablet escolhe o espaço no setup',
      'Aviso na tela: totem de quarto — long-press 5 s no nome do hotel no topo (trocar quarto / sair)',
      'POST /hotels/{id}/totems — backend cria user + registro totem (space_id null por padrão)',
    ],
  },
  {
    title: 'Console — Cardápio',
    path: '/cardapio',
    status: 'live',
    summary: 'Itens e serviços que os totens de quarto e área podem oferecer.',
    capabilities: [
      'Categorias e itens do cardápio (quarto, área ou ambos)',
      'Ativar ou desativar serviços extras no quarto',
      'Áreas comuns via GET/POST/PUT /catalog/areas — fachada sobre spaces (type=area)',
      'Categorias de área vinculam spaceId (mesmo ID usado no totem)',
      'GET/POST/PUT /catalog/categories, /items, /services',
    ],
  },
  {
    title: 'Multi-hotel',
    status: 'live',
    summary: 'Cada hotel com identidade própria nos totens.',
    capabilities: [
      'Seletor de hotel no topbar do console',
      'Troca reservas, filas e pedidos do hotel selecionado',
      'Totens exibem cor, nome e termos do hotel',
    ],
  },
]

export const FLOWS: DocFlow[] = [
  {
    title: 'Entrar no app',
    actor: 'Equipe ou totem',
    status: 'live',
    steps: [
      'Abre /login (ou /hub → Console ou Totem)',
      'Informa e-mail/login e senha (POST /auth/login)',
      'GET /me define accountType: human ou totem',
      'Human → /hoteis; totem → /totem com interface do kind',
      'Falha na renovação após 401 limpa a sessão e volta ao login',
    ],
  },
  {
    title: 'Cadastrar espaço e totem',
    actor: 'Administrador no console',
    status: 'live',
    steps: [
      'Console → Espaços → cadastra quartos e áreas (POST /spaces)',
      'Console → Totens → cria totem room/area compartilhado (sem spaceId)',
      'No tablet: login → setup escolhe quarto/área → localStorage',
      'Pedidos enviam spaceId no body; BE valida hotel + tipo',
    ],
  },
  {
    title: 'Cadastrar totem',
    actor: 'Administrador no console',
    status: 'live',
    steps: [
      'Console → Totens → Novo totem',
      'Escolhe tipo (recepção, quarto, área, operação)',
      'Define nome, loginSuffix (ex.: recepcao-01) e senha',
      'Backend cria usuário Supabase ({loginId}@totem.stayo.app) + registro totem',
      'No tablet, login com as credenciais → interface do tipo',
    ],
  },
  {
    title: 'Seleção de hotel e console',
    actor: 'Equipe / administrador',
    status: 'live',
    steps: [
      'Após autenticar, abre /hoteis',
      'Escolhe o hotel ou vai em /hoteis/novo para cadastrar (wizard em 3 passos)',
      'Entra em Filas / Reservas / Espaços / Totens / Cardápio',
    ],
  },
  {
    title: 'Check-in pelo hóspede',
    actor: 'Hóspede no totem de recepção',
    status: 'live',
    steps: [
      'Hóspede escolhe check-in na tela inicial',
      'Digita nome, código ou CPF',
      'Backend busca e valida a reserva',
      'Confere dados (incl. CPF) e quarto',
      'Passa pela leitura simulada do documento e aceita termos',
      'Check-in concluído — orientação até o quarto',
    ],
  },
  {
    title: 'Check-out pelo hóspede',
    actor: 'Hóspede no totem de recepção',
    status: 'live',
    steps: [
      'Hóspede escolhe check-out na tela inicial',
      'Busca por nome, código ou CPF',
      'Backend retorna extrato: diárias + pedidos entregues da estadia ativa',
      'Pedidos ainda em preparo aparecem como aviso (não entram no total)',
      'Escolhe forma de pagamento e confirma',
      'Conta encerrada; estadia fechada; pedidos marcados como faturados',
    ],
  },
  {
    title: 'Equipe acompanha chegadas',
    actor: 'Recepção no console',
    status: 'live',
    steps: [
      'Abre Filas no console',
      'Vê quantos hóspedes aguardam check-in e quantos já concluíram',
      'Lista mostra nome, quarto e status de cada reserva',
      'Clica em uma linha para abrir os detalhes em Reservas',
    ],
  },
  {
    title: 'Equipe gerencia reservas',
    actor: 'Recepção no console',
    status: 'live',
    steps: [
      'Abre Reservas no console',
      'Busca ou filtra a reserva desejada',
      'Abre o painel lateral com contato, datas e histórico',
      'Confirma reserva pendente, cancela ou cria uma nova',
    ],
  },
  {
    title: 'Pedido pelo quarto',
    actor: 'Hóspede no totem de quarto',
    status: 'live',
    steps: [
      'Equipe cadastra totem no console (login + senha, tipo quarto)',
      'Hóspede faz check-in na recepção — backend cria estadia ativa no quarto',
      'No tablet do quarto, faz login com a conta do totem',
      'Hóspede vê saudação, conta do quarto e atalhos do cardápio',
      'Navega pelo catálogo, monta o pedido e confirma (vinculado à estadia)',
      'Pedido aparece na fila do console e em Meus pedidos no quarto',
      'Equipe prepara, atualiza status ou cancela',
      'Pagamento fica para o checkout na recepção (diárias + pedidos entregues)',
    ],
  },
  {
    title: 'Pedido na área comum',
    actor: 'Hóspede no totem de área',
    status: 'live',
    steps: [
      'Equipe cadastra totem de área no console (restaurante, spa…)',
      'Tablet entra com login do totem',
      'Hóspede consulta cardápio da área',
      'Faz o pedido com observações (ex.: número do quarto)',
      'Pedido entra na fila do console',
      'Pagamento na recepção, no checkout',
    ],
  },
]

export const UPCOMING: DocUpcoming[] = [
  {
    title: 'Auto-refresh no totem de operação',
    detail: 'Atualização periódica da fila de pedidos sem tocar em “Atualizar lista”.',
  },
  {
    title: 'Integração com PMS',
    detail: 'Reservas e status vindos do sistema que o hotel já usa, em vez de dados locais.',
  },
  {
    title: 'TEF / gateway de pagamento',
    detail: 'Integração real de cartão e Pix no checkout do totem de recepção.',
  },
]

export const LIMITATIONS: string[] = [
  'No desenvolvimento, demo é o padrão: dados em memória e sessionStorage (src/demo). Use VITE_DEMO_MODE=false e reinicie o Vite para usar a API. Produção usa API real por padrão; npm run build:demo gera a demonstração.',
  'Frontend, fora do modo demonstração, consome a API Spring (/api/v1). Mocks em src/data/mock são legado.',
  'Console (/hoteis, /filas…) exige accountType human. Totem (/totem) exige accountType totem.',
  '401 tenta refresh automático; se falhar, desloga (human ou totem).',
  'GET /hotels/{id}/activities retorna lista vazia — feed local no FE até persistência.',
  'Totem operação: fila + cardápio no tablet; refresh manual (auto-refresh em breve).',
  'Checkout no totem registra pagamento (método + valor) — sem TEF/gateway ainda.',
  'Leitura de documento no check-in é simulada.',
  'Pedidos de quarto exigem reserva checked_in no espaço; pedidos de área não vinculam reserva.',
  'Não substitui o PMS: sem governança, manutenção, relatórios nem gestão interna.',
]

export const SECTIONS = [
  { id: 'produto', label: 'Produto' },
  { id: 'funcionalidades', label: 'Funcionalidades' },
  { id: 'fluxos', label: 'Fluxos' },
  { id: 'proximos', label: 'Próximos passos' },
  { id: 'limitacoes', label: 'Limitações' },
] as const

export type SectionId = (typeof SECTIONS)[number]['id']
