import type { CSSProperties } from 'react'
import type { HotelBrand } from '../types/index.ts'

/** Fundo fixo de todas as telas de totem. */
export const TOTEM_BACKGROUND = '#ffffff'

export function normalizeTotemBrand(brand: HotelBrand, fallbackName?: string): HotelBrand {
  const hotelName = brand.hotelName?.trim() || fallbackName?.trim() || ''
  return hotelName === brand.hotelName ? brand : { ...brand, hotelName }
}

export function totemBrandTitle(brand: HotelBrand, fallback?: string): string {
  return brand.hotelName?.trim() || fallback?.trim() || 'STAYO'
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
