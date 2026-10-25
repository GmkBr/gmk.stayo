import type { CSSProperties } from 'react'
import type { HotelBrand } from '../modules/hotels/model.ts'

/** Fundo fixo de todas as telas de totem. */
export const TOTEM_BACKGROUND = '#ffffff'

export function normalizeTotemBrand(brand: HotelBrand, fallbackName?: string): HotelBrand {
  const hotelName = brand.hotelName?.trim() || fallbackName?.trim() || ''
  return hotelName === brand.hotelName ? brand : { ...brand, hotelName }
}

export function totemBrandTitle(brand: HotelBrand, fallback?: string): string {
  return brand.hotelName?.trim() || fallback?.trim() || 'STAYO'
}

/** Iniciais do hotel para monograma no totem (máx. 2 letras). */
export function hotelMonogram(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'S'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
}

/** Variáveis CSS do totem — fundo branco; cores da marca em botões e destaques. */
export function totemShellStyle(brand: HotelBrand): CSSProperties {
  return {
    background: TOTEM_BACKGROUND,
    ['--hotel-primary' as string]: brand.primaryColor,
    ['--hotel-accent' as string]: brand.accentColor,
    ['--hotel-secondary' as string]: brand.secondaryColor,
  }
}
