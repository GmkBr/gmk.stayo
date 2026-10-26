import { useCallback, useMemo, useState } from 'react'
import * as spacesApi from './api.ts'
import type { HotelArea } from '../catalog/model.ts'
import type { Space } from './model.ts'

export function useSpacesModule(hotelId: string) {
  const [spaces, setSpaces] = useState<Space[]>([])

  const addSpaceFn = useCallback(
    async (input: spacesApi.CreateSpaceInput) => {
      const next = await spacesApi.createSpace(hotelId, input)
      setSpaces((prev) => [...prev, next])
      return next
    },
    [hotelId],
  )

  const updateSpaceFn = useCallback(
    async (id: string, patch: spacesApi.UpdateSpaceInput) => {
      const next = await spacesApi.updateSpace(hotelId, id, patch)
      setSpaces((prev) => prev.map((item) => (item.id === id ? next : item)))
      return next
    },
    [hotelId],
  )

  const deleteSpaceFn = useCallback(
    async (id: string) => {
      await spacesApi.deleteSpace(hotelId, id)
      setSpaces((prev) => prev.filter((item) => item.id !== id))
    },
    [hotelId],
  )

  const hotelSpaces = useMemo(
    () => spaces.filter((s) => s.type === 'room' || s.type === 'area'),
    [spaces],
  )

  const addAreaSpace = useCallback((area: HotelArea) => {
    setSpaces(prev => [...prev, {id: area.id, hotelId: area.hotelId, type: 'area', name: area.name}])
  }, [])

  const updateAreaSpace = useCallback((area: HotelArea) => {
    setSpaces(prev => prev.map(space => space.id === area.id ? {...space, name: area.name} : space))
  }, [])

  return {
    spaces,
    setSpaces,
    addSpaceFn,
    updateSpaceFn,
    deleteSpaceFn,
    hotelSpaces,
    addAreaSpace,
    updateAreaSpace,
  }
}
