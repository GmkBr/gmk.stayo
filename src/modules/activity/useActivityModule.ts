import { useCallback, useState } from 'react'
import * as activityApi from './api.ts'
import type { Activity } from './model.ts'

export function useActivityModule(hotelId: string) {
  const [activities, setActivities] = useState<Activity[]>([])

  const [queueSummary, setQueueSummary] = useState<activityApi.QueueSummary | null>(null)

  const addActivity = useCallback(
    (activity: Omit<Activity, 'id' | 'hotelId'>) => {
      setActivities((prev) => [
        { ...activity, id: `local-${Date.now()}`, hotelId: hotelId },
        ...prev,
      ])
    },
    [hotelId],
  )

  const refreshQueue = useCallback(async () => {
    const next = await activityApi.getQueueSummary(hotelId)
    setQueueSummary(next)
  }, [hotelId])

  return {
    activities,
    setActivities,
    queueSummary,
    setQueueSummary,
    addActivity,
    refreshQueue,
  }
}
