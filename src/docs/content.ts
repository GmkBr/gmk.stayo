export type SurfaceStatus = 'live' | 'partial' | 'next'
export type StepStatus = 'done' | 'now' | 'later'

export type DocSurface = {
  title: string
  path: string
  role: string
  status: SurfaceStatus
}

export type DocRedirect = { from: string; to: string }

export type DocStep = {
  title: string
  detail: string
  status: StepStatus
}

export type DocFile = { path: string; role: string }

export const DOC_UPDATED = '14 ago 2026'

export const SURFACES: DocSurface[] = [
  { title: 'Hub', path: '/', role: 'Escolher console ou totem', status: 'live' },
  { title: 'Console — filas', path: '/filas', role: 'Check-ins do totem e pedidos', status: 'live' },
  { title: 'Console — reservas', path: '/reservas', role: 'Lista que o totem consulta', status: 'live' },
  { title: 'Totem de recepção', path: '/totem/recepcao', role: 'Check-in de autoatendimento', status: 'partial' },
  { title: 'Totem de quarto', path: '/totem/quarto', role: 'Pedidos e solicitações no quarto', status: 'next' },
  { title: 'Totem de área', path: '/totem/area', role: 'Pedidos no restaurante, spa e lobby', status: 'next' },
]

export const REDIRECTS: DocRedirect[] = [
  { from: '/dashboard', to: '/filas' },
  { from: '/reservations', to: '/reservas' },
  { from: '/self-service', to: '/totem/recepcao' },
  { from: '/guest', to: '/totem/quarto' },
]

export const MVP_STEPS: DocStep[] = [
  {
    title: 'Separar superfícies',
    detail: 'Hub, console enxuto e totens fora do painel. Gestão interna fora do caminho.',
    status: 'done',
  },
  {
    title: 'Check-in ligado às reservas',
    detail: 'O totem busca a reserva mock, confirma e marca checked_in. A fila atualiza na hora.',
    status: 'now',
  },
  {
    title: 'Totem de quarto',
    detail: 'Catálogo e pedido saindo do quarto para a fila do console.',
    status: 'later',
  },
  {
    title: 'Totem de área',
    detail: 'Mesma lógica de pedido, com o contexto da área em vez do quarto.',
    status: 'later',
  },
]

export const WORKS: string[] = [
  'Hub com as quatro superfícies',
  'Console com filas e lista de reservas',
  'Totem de recepção com o fluxo visual em etapas',
  'Totens de quarto e área como placeholder da marca do hotel',
  'Troca de hotel no console (muda marca e mocks)',
  'Sair do totem e o logo STAYO voltam ao hub',
]

export const INCOMPLETE: string[] = [
  'Check-in da recepção não consulta a lista. João e quarto 203 estão fixos',
  'Pedidos da fila vêm de mockOrders. Nenhum totem cria pedido',
  'Check-in pelo console foi removido de propósito',
  'Sem backend. Estado vive no AppContext e nos mocks',
]

export const CODE_FILES: DocFile[] = [
  { path: 'src/routes/index.tsx', role: 'Rotas oficiais' },
  { path: 'src/docs/content.ts', role: 'Conteúdo desta documentação' },
  { path: 'src/context/AppContext.tsx', role: 'Hotel atual, reservas, status' },
  { path: 'src/data/mock/', role: 'Reservas, pedidos, hotéis' },
  { path: 'src/pages/docs/', role: 'Interface da documentação' },
  { path: 'src/pages/hub/', role: 'Escolha de superfície' },
  { path: 'src/pages/queues/', role: 'Filas do console' },
  { path: 'src/pages/reservations/', role: 'Lista de reservas' },
  { path: 'src/pages/self-service/', role: 'Totem de recepção' },
  { path: 'src/pages/totem/', role: 'Quarto e área' },
  { path: 'src/components/layout/', role: 'Sidebar e topbar do console' },
  { path: 'src/types/index.ts', role: 'Reservation, Order, Hotel' },
]

export const LEGACY: DocFile[] = [
  { path: 'pages/dashboard', role: 'Ocupação, receita, mosaico de quartos' },
  { path: 'pages/guests', role: 'CRM de hóspedes' },
  { path: 'pages/rooms', role: 'Mapa operacional' },
  { path: 'pages/housekeeping', role: 'Governança' },
  { path: 'pages/maintenance', role: 'Chamados' },
  { path: 'pages/services', role: 'Catálogo admin — não é o cardápio do totem' },
  { path: 'pages/reports', role: 'Relatórios' },
  { path: 'pages/settings', role: 'Configurações de hotel' },
  { path: 'pages/guest-portal', role: 'App no celular. No MVP isso é totem de quarto' },
  { path: 'components/checkin/CheckInModal', role: 'Check-in interno do painel' },
]

export const RULES: string[] = [
  'Totem não volta ao dashboard. Sai para o hub.',
  'Console não lista totens no menu. Troca de superfície é pelo hub.',
  'Check-in só no totem de recepção. Pedido só no totem de quarto ou área.',
  'Guest Portal não é superfície. Não recrie /guest.',
  'Dados mockados podem mudar no cliente. Não invente API ainda.',
  'Tipografia Plus Jakarta Sans. Accent do console #2563EB. Sem roxo.',
]

export const SECTIONS = [
  { id: 'produto', label: 'Produto' },
  { id: 'superficies', label: 'Superfícies' },
  { id: 'mvp', label: 'MVP' },
  { id: 'estado', label: 'Estado' },
  { id: 'codigo', label: 'Código' },
  { id: 'legado', label: 'Legado' },
  { id: 'regras', label: 'Regras' },
] as const

export type SectionId = (typeof SECTIONS)[number]['id']
