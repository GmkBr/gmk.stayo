import type { TotemKind } from '../modules/devices/model.ts'

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

export function isTotemEmail(email?: string | null): boolean {
  if (!email) return false
  return email.toLowerCase().endsWith(`@${TOTEM_EMAIL_DOMAIN}`)
}
