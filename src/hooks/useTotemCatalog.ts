import { useEffect, useState } from 'react'
import * as catalogApi from '../modules/catalog/api.ts'
import type { CatalogCategory, CatalogItem, Service } from '../modules/catalog/model.ts'

export function useTotemCatalog(hotelId: string | undefined) {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<CatalogCategory[]>([])
  const [items, setItems] = useState<CatalogItem[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!hotelId) {
      setCategories([])
      setItems([])
      setServices([])
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    void (async () => {
      try {
        const [cats, its, svcs] = await Promise.all([
          catalogApi.listCategories(hotelId),
          catalogApi.listItems(hotelId),
          catalogApi.listServices(hotelId),
        ])
        if (cancelled) return
        setCategories(cats)
        setItems(its)
        setServices(svcs)
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

  return { loading, error, categories, items, services }
}
