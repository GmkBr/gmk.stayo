import { useCallback, useEffect, useRef, useState } from 'react'
import * as staysApi from '../modules/stays/api.ts'
import { ApiError } from '../api/client.ts'
import type { Order } from '../modules/orders/model.ts'
import type { StayAccount } from '../modules/stays/model.ts'

export function useActiveStay(hotelId: string | undefined, spaceId: string | undefined) {
  const [account, setAccount] = useState<StayAccount | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const loadVersion = useRef(0)

  const reload = useCallback(async () => {
    const version = ++loadVersion.current
    setAccount(null)
    setOrders([])
    if (!hotelId || !spaceId) {
      setAccount(null)
      setOrders([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const nextAccount = await staysApi.getActiveStayBySpace(hotelId, spaceId)
      if (version !== loadVersion.current) return
      const nextOrders = await staysApi.listStayOrders(hotelId, nextAccount.stay.id)
      if (version !== loadVersion.current) return
      setAccount(nextAccount)
      setOrders(nextOrders)
    } catch (err) {
      if (version !== loadVersion.current) return
      if (err instanceof ApiError && err.status === 404) {
        setAccount(null)
        setOrders([])
        setError(null)
      } else {
        setAccount(null)
        setOrders([])
        setError(err instanceof Error ? err.message : 'Não foi possível carregar a estadia')
      }
    } finally {
      if (version === loadVersion.current) setLoading(false)
    }
  }, [hotelId, spaceId])

  useEffect(() => {
    void reload()
    return () => { loadVersion.current += 1 }
  }, [reload])

  return { account, orders, loading, error, reload }
}
