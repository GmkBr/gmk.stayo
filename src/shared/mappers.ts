

export type PageResult<T> = {
  items: T[]
  total: number
  page: number
  size: number
}

export function clockFromIso(iso?: string | null) {
  if (!iso) return '--:--'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false })
}
