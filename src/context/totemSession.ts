const STORAGE_KEY = 'stayo.totem.v1'

export type TotemBinding = {
  totemId: string
  hotelId: string
}

export function readTotemBinding(): TotemBinding | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as TotemBinding
    if (!parsed?.totemId || !parsed?.hotelId) return null
    return parsed
  } catch {
    return null
  }
}

export function writeTotemBinding(binding: TotemBinding) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(binding))
}

export function clearTotemBinding() {
  localStorage.removeItem(STORAGE_KEY)
}
