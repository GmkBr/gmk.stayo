/** Monta body de busca check-in/checkout: CPF (11 dígitos) ou texto livre. */
export function buildTotemSearchBody(query: string): { q?: string; cpf?: string } {
  const trimmed = query.trim()
  if (!trimmed) return {}

  const digits = trimmed.replace(/\D/g, '')
  if (digits.length === 11) {
    return { cpf: digits, q: trimmed }
  }
  return { q: trimmed }
}

export function formatCpf(value: string) {
  const digits = value.replace(/\D/g, '')
  if (digits.length !== 11) return value.trim() || '—'
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

export function totemSearchEmptyMessage() {
  return 'Digite o nome, o código da reserva ou o CPF.'
}
