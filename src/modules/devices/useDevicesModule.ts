import { useCallback, useState } from 'react'
import * as devicesApi from './api.ts'
import type { Totem } from './model.ts'

export function useDevicesModule(hotelId: string) {
  const [totems, setTotems] = useState<Totem[]>([])

  const addTotem = useCallback(
    async (input: devicesApi.CreateTotemInput) => {
      const next = await devicesApi.createTotem(hotelId, input)
      setTotems((prev) => [...prev, next])
      return next
    },
    [hotelId],
  )

  const updateTotemFn = useCallback(
    async (id: string, patch: Partial<Omit<Totem, 'id' | 'hotelId' | 'loginId' | 'userId'>>) => {
      const current = totems.find((t) => t.id === id)
      if (!current) return
      const next = await devicesApi.updateTotem(hotelId, id, {
        name: patch.name ?? current.name,
        kind: patch.kind ?? current.kind,
        roomNumber: patch.roomNumber ?? current.roomNumber,
        areaId: patch.areaId ?? current.areaId,
        active: patch.active ?? current.active,
      })
      setTotems((prev) => prev.map((item) => (item.id === id ? next : item)))
    },
    [hotelId, totems],
  )

  const resetTotemPasswordFn = useCallback(
    async (id: string, password: string) => {
      await devicesApi.resetTotemPassword(hotelId, id, password)
    },
    [hotelId],
  )

  return {
    totems,
    setTotems,
    addTotem,
    updateTotemFn,
    resetTotemPasswordFn,
  }
}
