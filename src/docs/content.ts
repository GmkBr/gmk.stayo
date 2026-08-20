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

export const DOC_UPDATED = '19 ago 2026'

export const PRODUCT_SUMMARY = {
  title: 'STAYO',
  lead: 'Camada de autoatendimento hoteleiro. Totens para o hóspede, console para a equipe.',
  description:
    'O hóspede faz check-in no totem de recepção e, no futuro, pede serviços nos totens de quarto e área. A equipe acompanha tudo pelo console — filas e reservas — sem substituir o PMS do hotel.',
  notPms: 'STAYO não gerencia ocupação, governança, manutenção, receita nem cadastro interno. É a ponte entre o hóspede e a operação.',
  users: [
    { role: 'Hóspede', uses: 'Totens de recepção, quarto e área' },
    { role: 'Recepção / equipe', uses: 'Console — filas e reservas' },
    { role: 'Administrador', uses: 'Console — troca de hotel e gestão de reservas' },
  ],
}

export const FEATURES: DocFeature[] = [
  {
    title: 'Hub',
    path: '/',
    status: 'live',
    summary: 'Ponto de entrada. Escolhe entre console ou totem.',
    capabilities: [
      'Lista as quatro superfícies do produto',
      'Indica quais totens ainda estão em construção',
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
    title: 'Totem de recepção',
    path: '/totem/recepcao',
    status: 'live',
    summary: 'Check-in de autoatendimento. O hóspede resolve sozinho na chegada.',
    capabilities: [
      'Busca reserva por nome ou código',
      'Valida status: bloqueia canceladas, pendentes, já feitas ou fora da data',
      'Mostra dados da reserva e quarto atribuído',
      'Simula leitura de documento',
      'Apresenta termos do hotel e exige aceite',
      'Confirma check-in e orienta caminho até o quarto',
      'Modo operador para a recepção intervir',
      'Reinicia sozinho após inatividade',
    ],
    limitations: ['Leitura de documento é simulada — sem integração com hardware'],
  },
  {
    title: 'Totem de quarto',
    path: '/totem/quarto',
    status: 'live',
    summary: 'Pedidos e solicitações dentro do quarto. Tablet na parede ou mesa.',
    capabilities: [
      'Ativação única por código cadastrado no console',
      'Identificação fixa por quarto após ativação',
      'Home com atalhos (Alimentos, Meus pedidos, Spa, Cardápio) e destaques',
      'Catálogo visual: ícones, badges de tempo, feedback ao adicionar',
      'Carrinho, observações e envio para a fila do console',
      'Confirmação com previsão de entrega; cobrança na conta do quarto',
      'Reinício após inatividade (3 min no catálogo)',
    ],
  },
  {
    title: 'Totem de área',
    path: '/totem/area',
    status: 'live',
    summary: 'Pedidos em restaurante, spa, lobby. Pode ser totem grande ou tablet.',
    capabilities: [
      'Ativação única por código cadastrado no console',
      'Vinculado à área definida no cadastro (restaurante, spa…)',
      'Cardápio filtrado por área',
      'Carrinho e envio para a fila do console',
      'Cobrança orientada para o checkout na recepção',
    ],
  },
  {
    title: 'Console — Totens',
    path: '/totens',
    status: 'live',
    summary: 'Cadastro de tablets de quarto e de área com código de ativação.',
    capabilities: [
      'Listar totens de quarto e de área do hotel',
      'Criar e editar: nome, código, quarto ou área, status ativo',
      'Copiar código para configurar o dispositivo',
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
      'Equipe cadastra o totem no console e copia o código',
      'No tablet, informa o código uma única vez (fica fixo por quarto)',
      'Hóspede abre o totem e vê saudação com o nome',
      'Navega pelo catálogo, monta o pedido e confirma',
      'Pedido aparece na fila do console em tempo real',
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
      'Tablet ativado com código único',
      'Hóspede consulta cardápio da área',
      'Faz o pedido com observações (ex.: número do quarto)',
      'Pedido entra na fila do console',
      'Pagamento na recepção, no checkout',
    ],
  },
]

export const UPCOMING: DocUpcoming[] = [
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
  'Protótipo frontend — sem servidor. Dados resetam ao recarregar a página.',
  'Ativação do totem persiste no navegador (localStorage); pedidos e cadastros resetam ao recarregar.',
  'Pagamento ainda não existe no totem de recepção — pedidos só acumulam valor estimado.',
  'Leitura de documento no check-in é simulada.',
  'Edição de reserva no console é simulada — não persiste entre sessões.',
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
