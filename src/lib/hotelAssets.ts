/** Path interno no storage (ex.: hotel-assets/mare/terms.pdf) → URL pública para o totem. */
export function resolveHotelAssetUrl(path: string | undefined): string | null {
  const trimmed = path?.trim()
  if (!trimmed) return null
  if (/^https?:\/\//i.test(trimmed)) return trimmed

  const assetsBase = (import.meta.env.VITE_ASSETS_BASE_URL as string | undefined)?.trim()
  if (assetsBase) {
    return `${assetsBase.replace(/\/$/, '')}/${trimmed.replace(/^\//, '')}`
  }

  const apiBase = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim()
  if (apiBase) {
    try {
      const origin = new URL(apiBase).origin
      return `${origin}/${trimmed.replace(/^\//, '')}`
    } catch {
      /* fall through */
    }
  }

  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
}

const TERMS_PATH = /^[\w./-]+$/

export function isValidTermsPath(path: string): boolean {
  const trimmed = path.trim()
  if (!trimmed) return true
  if (trimmed.includes('..')) return false
  return TERMS_PATH.test(trimmed)
}
