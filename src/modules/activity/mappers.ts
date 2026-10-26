import type { IdBox } from '../../api/ids.ts'
import { unwrapId } from '../../api/ids.ts'
import { clockFromIso } from '../../shared/mappers.ts'
import type { Activity, ActivityKind } from './model.ts'

export type ApiActivity = {
  id: IdBox
  hotelId: IdBox
  time: string
  title: string
  detail?: string | null
  kind: ActivityKind
}

export function mapActivity(raw: ApiActivity): Activity {
  return {
    id: unwrapId(raw.id),
    hotelId: unwrapId(raw.hotelId),
    time: clockFromIso(raw.time),
    title: raw.title,
    detail: raw.detail ?? undefined,
    kind: raw.kind,
  }
}
