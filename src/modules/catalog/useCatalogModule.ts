import { useCallback, useState } from 'react'
import * as catalogApi from './api.ts'
import type { CatalogCategory, CatalogItem, HotelArea, Service } from './model.ts'

export function useCatalogModule(hotelId: string, onAreaCreated: (area: HotelArea) => void, onAreaUpdated: (area: HotelArea) => void) {
  const [areas, setAreas] = useState<HotelArea[]>([])

  const [catalogCategories, setCatalogCategories] = useState<CatalogCategory[]>([])

  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([])

  const [services, setServices] = useState<Service[]>([])

  const addArea = useCallback(
    async (area: Omit<HotelArea, 'id'>) => {
      const next = await catalogApi.createArea(hotelId, { name: area.name, active: area.active })
      setAreas((prev) => [...prev, next])
      onAreaCreated(next)
      return next
    },
    [hotelId, onAreaCreated],
  )

  const updateAreaFn = useCallback(
    async (id: string, patch: Partial<Omit<HotelArea, 'id' | 'hotelId'>>) => {
      const current = areas.find((a) => a.id === id)
      if (!current) return
      const next = await catalogApi.updateArea(hotelId, id, {
        name: patch.name ?? current.name,
        active: patch.active ?? current.active,
      })
      setAreas((prev) => prev.map((item) => (item.id === id ? next : item)))
      onAreaUpdated(next)
    },
    [areas, hotelId, onAreaUpdated],
  )

  const addCatalogCategory = useCallback(
    async (category: Omit<CatalogCategory, 'id'>) => {
      const next = await catalogApi.createCategory(hotelId, {
        name: category.name,
        context: category.context,
        areaIds: category.areaIds,
        sortOrder: category.sortOrder,
      })
      setCatalogCategories((prev) => [...prev, next])
      return next
    },
    [hotelId],
  )

  const updateCatalogCategory = useCallback(
    async (id: string, patch: Partial<Omit<CatalogCategory, 'id' | 'hotelId'>>) => {
      const current = catalogCategories.find((c) => c.id === id)
      if (!current) return
      const next = await catalogApi.updateCategory(hotelId, id, {
        name: patch.name ?? current.name,
        context: patch.context ?? current.context,
        areaIds: patch.areaIds ?? current.areaIds,
        sortOrder: patch.sortOrder ?? current.sortOrder,
      })
      setCatalogCategories((prev) => prev.map((item) => (item.id === id ? next : item)))
    },
    [catalogCategories, hotelId],
  )

  const addCatalogItem = useCallback(
    async (item: Omit<CatalogItem, 'id'>) => {
      const next = await catalogApi.createItem(hotelId, {
        categoryId: item.categoryId,
        name: item.name,
        description: item.description,
        price: item.price,
        available: item.available,
        imagePath: item.imagePath,
      })
      setCatalogItems((prev) => [...prev, next])
      return next
    },
    [hotelId],
  )

  const updateCatalogItem = useCallback(
    async (id: string, patch: Partial<Omit<CatalogItem, 'id' | 'hotelId'>>) => {
      const current = catalogItems.find((i) => i.id === id)
      if (!current) return
      const next = await catalogApi.updateItem(hotelId, id, {
        categoryId: patch.categoryId ?? current.categoryId,
        name: patch.name ?? current.name,
        description: patch.description ?? current.description,
        price: patch.price ?? current.price,
        available: patch.available ?? current.available,
        imagePath: patch.imagePath ?? current.imagePath,
      })
      setCatalogItems((prev) => prev.map((item) => (item.id === id ? next : item)))
    },
    [catalogItems, hotelId],
  )

  const updateServiceFn = useCallback(
    async (id: string, patch: Partial<Pick<Service, 'name' | 'description' | 'price' | 'active'>>) => {
      const current = services.find((s) => s.id === id)
      if (!current) return
      const next = await catalogApi.updateService(hotelId, id, {
        name: patch.name ?? current.name,
        description: patch.description ?? current.description,
        price: patch.price ?? current.price,
        active: patch.active ?? current.active,
        icon: current.icon,
        tone: current.tone,
      })
      setServices((prev) => prev.map((item) => (item.id === id ? next : item)))
    },
    [hotelId, services],
  )

  const toggleService = useCallback(
    async (id: string) => {
      const current = services.find((s) => s.id === id)
      if (!current) return
      await updateServiceFn(id, { active: !current.active })
    },
    [services, updateServiceFn],
  )

  return {
    areas,
    setAreas,
    catalogCategories,
    setCatalogCategories,
    catalogItems,
    setCatalogItems,
    services,
    setServices,
    addArea,
    updateAreaFn,
    addCatalogCategory,
    updateCatalogCategory,
    addCatalogItem,
    updateCatalogItem,
    updateServiceFn,
    toggleService,
  }
}
