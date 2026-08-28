import type { TotemKind } from '../types/index.ts'

export const TOTEM_KIND_LABELS: Record<TotemKind, string> = {
  reception: 'Recepção',
  room: 'Quarto',
  area: 'Área',
  operation: 'Operação',
}

export const TOTEM_EMAIL_DOMAIN = 'totem.stayo.app'

export function totemEmail(loginId: string): string {
  return `${loginId}@${TOTEM_EMAIL_DOMAIN}`
}
