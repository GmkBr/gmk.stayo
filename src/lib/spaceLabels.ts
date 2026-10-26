import type { Space, SpaceType } from '../modules/spaces/model.ts'
import type { Totem } from '../modules/devices/model.ts'

export const SPACE_TYPE_LABELS: Record<SpaceType, string> = {
  room: 'Quarto',
  area: 'Área',
  reception: 'Recepção',
  operation: 'Operação',
}

/** Tipos expostos na tela de gestão por enquanto. */
export const MANAGED_SPACE_TYPES: SpaceType[] = ['room', 'area']

export function spaceDisplayTitle(space: Space): string {
  if (space.type === 'room') {
    const label = space.name.trim() && space.name !== space.number ? space.name : null
    return label ? `${space.number} — ${label}` : (space.number || space.name)
  }
  return space.name
}

export function spaceDisplayMeta(space: Space): string | null {
  if (space.type === 'room' && space.floor?.trim()) return `Andar ${space.floor}`
  return null
}

/** Totem vinculado ao space (spaceId no BE; fallback legado por número de quarto). */
export function totemForSpace(space: Space, totems: Totem[]): Totem | undefined {
  const byId = totems.find((t) => t.spaceId === space.id)
  if (byId) return byId
  if (space.type === 'room' && space.number) {
    return totems.find((t) => t.kind === 'room' && t.roomNumber === space.number)
  }
  return undefined
}
