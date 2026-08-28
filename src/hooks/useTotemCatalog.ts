import { useEffect, useState } from 'react'
import * as api from '../api/index.ts'
import type { CatalogCategory, CatalogItem, HotelArea, Reservation, Service } from '../types/index.ts'

export function useTotemCatalog(hotelId: string | undefined) {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<CatalogCategory[]>([])
  const [items, setItems] = useState<CatalogItem[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [areas, setAreas] = useState<HotelArea[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!hotelId) {
      setCategories([])
      setItems([])
      setServices([])
      setAreas([])
      setReservations([])
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    void (async () => {
      try {
        const [cats, its, svcs, ars, res] = await Promise.all([
          api.listCategories(hotelId),
          api.listItems(hotelId),
          api.listServices(hotelId),
          api.listAreas(hotelId),
          api.searchReservations(hotelId, { size: 100 }),
        ])
        if (cancelled) return
        setCategories(cats)
        setItems(its)
        setServices(svcs)
        setAreas(ars)
        setReservations(res.items)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Falha ao carregar cardápio')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [hotelId])

  return { loading, error, categories, items, services, areas, reservations }
}
