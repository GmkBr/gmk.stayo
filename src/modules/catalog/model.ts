

export type Service = {
  id: string
  hotelId: string
  name: string
  description: string
  price: number
  active: boolean
  tone: string
  icon: 'tray' | 'spa' | 'clock' | 'car' | 'map' | 'wine' | 'bike' | 'key'
}

export type HotelArea = {
  id: string
  hotelId: string
  name: string
  active: boolean
}

export type CatalogContext = 'room' | 'area' | 'both'

export type CatalogCategory = {
  id: string
  hotelId: string
  name: string
  context: CatalogContext
  areaIds?: string[]
  sortOrder: number
}

export type CatalogItem = {
  id: string
  hotelId: string
  categoryId: string
  name: string
  description: string
  price: number
  available: boolean
  imagePath?: string
}
