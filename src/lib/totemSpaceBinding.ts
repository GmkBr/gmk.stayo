import type { Space, SpaceType } from '../modules/spaces/model.ts'

export type TotemSpaceBinding = {
  spaceId: string
  type: 'room' | 'area'
  spaceName: string
  spaceNumber?: string
}

const STORAGE_KEY = 'stayo.totem.space'

type StoredMap = Record<string, TotemSpaceBinding>

function storageKey(hotelId: string, totemId: string) {
  return `${hotelId}:${totemId}`
}

function readMap(): StoredMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as StoredMap
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function writeMap(map: StoredMap) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
}

export function bindingFromSpace(space: Space): TotemSpaceBinding {
  if (space.type === 'room') {
    const number = space.number?.trim() || space.name
    return {
      spaceId: space.id,
      type: 'room',
      spaceName: number,
      spaceNumber: number,
    }
  }
  return {
    spaceId: space.id,
    type: 'area',
    spaceName: space.name.trim() || 'Área',
  }
}

export function readTotemSpaceBinding(hotelId: string, totemId: string): TotemSpaceBinding | null {
  const entry = readMap()[storageKey(hotelId, totemId)]
  if (!entry?.spaceId) return null
  return entry
}

export function writeTotemSpaceBinding(hotelId: string, totemId: string, binding: TotemSpaceBinding) {
  const map = readMap()
  map[storageKey(hotelId, totemId)] = binding
  writeMap(map)
}

export function clearTotemSpaceBinding(hotelId: string, totemId: string) {
  const map = readMap()
  delete map[storageKey(hotelId, totemId)]
  writeMap(map)
}

export function expectedSpaceType(kind: 'room' | 'area'): SpaceType {
  return kind
}
