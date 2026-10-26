import { useCallback, useEffect, useState } from 'react'
import * as spacesApi from '../modules/spaces/api.ts'
import { useApp } from '../app/useApp.ts'
import {
  bindingFromSpace,
  clearTotemSpaceBinding,
  readTotemSpaceBinding,
  writeTotemSpaceBinding,
  type TotemSpaceBinding,
} from '../lib/totemSpaceBinding.ts'
import type { Space } from '../modules/spaces/model.ts'

export function useTotemSpaceBinding(expectedKind: 'room' | 'area') {
  const { profile, hotel } = useApp()
  const totem = profile?.totem ?? null
  const hotelId = hotel?.id ?? totem?.hotelId

  const [binding, setBinding] = useState<TotemSpaceBinding | null>(null)
  const [resolving, setResolving] = useState(true)

  useEffect(() => {
    if (!totem || !hotelId || totem.kind !== expectedKind) {
      setBinding(null)
      setResolving(false)
      return
    }

    let cancelled = false
    setResolving(true)

    void (async () => {
      if (totem.spaceId) {
        try {
          const spaces = await spacesApi.listSpaces(hotelId, expectedKind)
          const space = spaces.find((item) => item.id === totem.spaceId)
          if (space && !cancelled) {
            setBinding(bindingFromSpace(space))
            setResolving(false)
            return
          }
        } catch {
          /* tenta localStorage */
        }
      }

      const stored = readTotemSpaceBinding(hotelId, totem.id)
      if (!cancelled) {
        setBinding(stored?.type === expectedKind ? stored : null)
        setResolving(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [totem, hotelId, expectedKind])

  const confirmBinding = useCallback(
    (space: Space) => {
      if (!totem || !hotelId) return
      const next = bindingFromSpace(space)
      writeTotemSpaceBinding(hotelId, totem.id, next)
      setBinding(next)
    },
    [totem, hotelId],
  )

  const clearBinding = useCallback(() => {
    if (!totem || !hotelId || totem.spaceId) return
    clearTotemSpaceBinding(hotelId, totem.id)
    setBinding(null)
  }, [totem, hotelId])

  const ready = Boolean(totem?.active && hotelId && totem.kind === expectedKind && !resolving)
  const needsSetup = ready && !binding
  const isDedicated = Boolean(totem?.spaceId)

  return {
    totem,
    hotel,
    binding,
    ready,
    resolving,
    needsSetup,
    isDedicated,
    confirmBinding,
    clearBinding,
  }
}
