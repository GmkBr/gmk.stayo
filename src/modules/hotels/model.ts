

export type HotelBrand = {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  hotelName: string
  coverTone: string
}

export type Hotel = {
  id: string
  slug: string
  name: string
  city: string
  state: string
  brand: HotelBrand
  /** Texto exibido no check-in do totem (uma regra por linha). Opcional. */
  termsText?: string
  /** Path do PDF no storage (ex.: hotel-assets/mare/terms.pdf). Opcional. */
  termsPath?: string
}
