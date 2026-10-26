import { resolveDemoMode } from '../config/environment.ts'

/** Mock por padrão no desenvolvimento; produção usa API real por padrão. */
export function isDemoMode() {
  return resolveDemoMode(import.meta.env)
}

export const DEMO_PASSWORD = 'demo123'

export type DemoLogin = {
  label: string
  hint: string
  login: string
}

export const DEMO_LOGINS: DemoLogin[] = [
  { label: 'Console', hint: 'Filas, reservas, cardápio', login: 'ana@stayo.app' },
  { label: 'Recepção', hint: 'Check-in e check-out', login: 'recepcao-01' },
  { label: 'Quarto', hint: 'Pedido no quarto 305', login: 'quarto-01' },
  { label: 'Área', hint: 'Restaurante', login: 'area-restaurante' },
  { label: 'Operação', hint: 'Fila da cozinha', login: 'cozinha-01' },
]

export const DEMO_CHEAT = [
  { label: 'Check-in', value: 'Clara Mendes · RES-1842 · 390.221.880-15 · quarto 401' },
  { label: 'Check-out', value: 'Helena Duarte · RES-1790 · 987.654.321-00 · quarto 305' },
  { label: 'Quarto com hóspede', value: '305 — Helena já está hospedada' },
]
