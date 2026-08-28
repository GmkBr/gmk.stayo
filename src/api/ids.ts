/** Backend serializa VOs como `{ value: uuid }`; path params usam UUID puro. */
export type IdBox = string | { value: string } | null | undefined

export function unwrapId(id: IdBox): string {
  if (id == null) return ''
  if (typeof id === 'string') return id
  return id.value ?? ''
}

export function unwrapIdList(ids: IdBox[] | null | undefined): string[] {
  if (!ids?.length) return []
  return ids.map(unwrapId).filter(Boolean)
}
