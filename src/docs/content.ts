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

export const DOC_UPDATED = '27 ago 2026'

export const PRODUCT_SUMMARY = {
  title: 'STAYO',
  lead: 'Camada de autoatendimento hoteleiro. Totens para o hóspede, console para a equipe.',
  description:
    'O hóspede faz check-in no totem de recepção e, no futuro, pede serviços nos totens de quarto e área. A equipe acompanha tudo pelo console — filas e reservas — sem substituir o PMS do hotel.',
  notPms: 'STAYO não gerencia ocupação, governança, manutenção, receita nem cadastro interno. É a ponte entre o hóspede e a operação.',
  users: [
    { role: 'Hóspede', uses: 'Totens de recepção, quarto e área' },
    { role: 'Recepção / equipe', uses: 'Console — filas e reservas' },
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
      'POST /auth/login → user + accessToken + refreshToken',
      'POST /auth/register → mesmo formato (Auth + perfil + tokens) — só operadores',
      'GET /me com accountType: human | totem',
      'Human → /hoteis; totem → /totem (interface pelo kind)',
      'Sessão em localStorage (stayo.auth)',
      'Sair limpa sessão e hotel selecionado',
      '401 da API desloga e volta ao login',
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
      'Clique em uma reserva leva para a lista completa',
    ],
  },
  {
    title: 'Console — Reservas',
    path: '/reservas',
    status: 'live',
    summary: 'Lista de reservas que o totem de recepção consulta no check-in.',
    capabilities: [
      'Busca por nome ou quarto',
      'Filtro por status (confirmada, hospedado, cancelada…)',
      'Filtro por período (chegada hoje, próximas, em casa)',
      'Ver detalhes: contato, datas, valor, pagamento, histórico',
      'Confirmar reserva pendente ou cancelar',
      'Criar nova reserva manualmente',
    ],
    limitations: ['Edição de campos é simulada — alterações ficam só nesta sessão'],
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
      'kind operation → placeholder (fila de cozinha em breve)',
    ],
    limitations: ['Totem operação ainda sem fila de pedidos no dispositivo'],
  },
  {
    title: 'Totem de recepção',
    path: '/totem',
    status: 'live',
    summary: 'Check-in de autoatendimento. Conta totem kind=reception após login.',
    capabilities: [
      'Busca reserva por nome ou código',
      'Valida status: bloqueia canceladas, pendentes, já feitas ou fora da data',
      'Mostra dados da reserva e quarto atribuído',
      'Simula leitura de documento',
      'Apresenta termos do hotel (texto cadastrado ou padrão STAYO) e exige aceite',
      'Confirma check-in e orienta caminho até o quarto',
      'Modo operador para a recepção intervir',
      'Reinicia sozinho após inatividade',
    ],
    limitations: ['Leitura de documento é simulada — sem integração com hardware'],
  },
  {
    title: 'Totem de quarto',
    path: '/totem',
    status: 'live',
    summary: 'Pedidos e solicitações dentro do quarto. Conta totem kind=room.',
    capabilities: [
      'Login com usuário totem criado no console',
      'Identificação fixa por quarto (roomNumber no cadastro)',
      'Home com atalhos (Alimentos, Meus pedidos, Spa, Cardápio) e destaques',
      'Catálogo visual: ícones, badges de tempo, feedback ao adicionar',
      'Carrinho, observações e envio para a fila do console',
      'Confirmação com previsão de entrega; cobrança na conta do quarto',
      'Reinício após inatividade (3 min no catálogo)',
    ],
  },
  {
    title: 'Totem de área',
    path: '/totem',
    status: 'live',
    summary: 'Pedidos em restaurante, spa, lobby. Conta totem kind=area.',
    capabilities: [
      'Login com usuário totem vinculado à área do cadastro',
      'Cardápio filtrado por área',
      'Carrinho e envio para a fila do console',
      'Cobrança orientada para o checkout na recepção',
    ],
  },
  {
    title: 'Totem de operação',
    path: '/totem',
    status: 'partial',
    summary: 'Cozinha e preparo de pedidos. Cadastro e login prontos; interface em breve.',
    capabilities: ['Cadastro no console com kind=operation', 'Login redireciona para placeholder'],
    limitations: ['Fila de pedidos no dispositivo ainda não implementada'],
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
      'Campos condicionais: quarto ou área conforme o tipo',
      'POST /hotels/{id}/totems — backend cria user + registro totem',
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
      'Cadastrar áreas comuns (restaurante, spa, lobby)',
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
      '401 limpa sessão e volta ao login',
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
      'Entra em Filas / Reservas / Totens / Cardápio',
    ],
  },
  {
    title: 'Check-in pelo hóspede',
    actor: 'Hóspede no totem de recepção',
    status: 'live',
    steps: [
      'Hóspede toca em "Fazer check-in" na tela inicial',
      'Digita nome ou código da reserva',
      'Sistema localiza a reserva e valida se pode fazer check-in',
      'Confere dados pessoais e quarto atribuído',
      'Passa pela leitura simulada do documento',
      'Aceita os termos do hotel',
      'Recebe confirmação com orientação até o quarto',
      'Reserva muda para "Hospedado" e aparece na fila do console',
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
      'No tablet, faz login com a conta do totem',
      'Hóspede vê saudação com o nome',
      'Navega pelo catálogo, monta o pedido e confirma',
      'Pedido aparece na fila do console',
      'Equipe prepara, atualiza status ou cancela',
      'Pagamento fica para o checkout na recepção',
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
    title: 'Refresh de token',
    detail: 'POST /auth/refresh com refreshToken salvo, renovando a sessão sem novo login.',
  },
  {
    title: 'Totem de operação (cozinha)',
    detail: 'Fila de pedidos no dispositivo kind=operation para preparo e entrega.',
  },
  {
    title: 'Checkout na recepção',
    detail: 'Fechar conta e pagamento no totem de recepção com itens dos pedidos de quarto e área.',
  },
  {
    title: 'Integração com PMS',
    detail: 'Reservas e status vindos do sistema que o hotel já usa, em vez de dados locais.',
  },
]

export const LIMITATIONS: string[] = [
  'Frontend consome a API Spring (/api/v1). Login único; GET /me com accountType. Ver docs/AUTH.md.',
  'Console (/hoteis, /filas…) exige accountType human. Totem (/totem) exige accountType totem.',
  'Backend deve implementar criação de usuário totem no POST /hotels/{id}/totems e totem no GET /me.',
  '401 desloga qualquer sessão (human ou totem).',
  'Refresh automático de token ainda não está no FE.',
  'Totem operação: só cadastro + login; fila no dispositivo em breve.',
  'Pagamento ainda não existe no totem de recepção.',
  'Leitura de documento no check-in é simulada.',
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
