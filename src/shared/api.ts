import type { PageResult } from './mappers.ts'

export function qs(params: Record<string, string | number | undefined | null>) {
  const sp = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '' || value === 'all') continue
    sp.set(key, String(value))
  }
  const s = sp.toString()
  return s ? `?${s}` : ''
}

/** BE atual devolve array; contrato futuro pode ser `{ items, total, page, size }`. */
export function asPageResult<T>(raw: PageResult<T> | T[]): PageResult<T> {
  if (Array.isArray(raw)) {
    return { items: raw, total: raw.length, page: 0, size: raw.length }
  }
  const items = raw.items ?? []
  return {
    ...raw,
    items,
    total: raw.total ?? items.length,
    page: raw.page ?? 0,
    size: raw.size ?? items.length,
  }
}
