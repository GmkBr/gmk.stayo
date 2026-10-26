import type { IdBox } from '../../api/ids.ts'
import { unwrapId, unwrapIdList } from '../../api/ids.ts'
import type { Stay, StayAccount } from './model.ts'

export type ApiStay = {
  id: IdBox
  hotelId: IdBox
  reservationId: IdBox
  spaceId: IdBox
  roomNumber?: string | null
  guestName: string
  status: Stay['status']
  checkedInAt?: string | null
  checkedOutAt?: string | null
}

export type ApiStayAccount = {
  stay: {
    id: IdBox
    hotelId: IdBox
    reservationId: IdBox
    spaceId: IdBox
    roomNumber?: string | null
    guestName: string
    status: Stay['status']
    checkedInAt?: string | null
    checkedOutAt?: string | null
  }
  roomTotal: number
  deliveredOrdersTotal: number
  pendingOrdersTotal: number
  billableTotal: number
  pendingOrderIds?: (IdBox | string)[] | null
}

export function mapStay(raw: ApiStay): Stay {
  return {
    id: unwrapId(raw.id),
    hotelId: unwrapId(raw.hotelId),
    reservationId: unwrapId(raw.reservationId),
    spaceId: unwrapId(raw.spaceId),
    roomNumber: raw.roomNumber ?? undefined,
    guestName: raw.guestName,
    status: raw.status,
    checkedInAt: raw.checkedInAt ?? undefined,
    checkedOutAt: raw.checkedOutAt ?? undefined,
  }
}

export function mapStayAccount(raw: ApiStayAccount): StayAccount {
  return {
    stay: mapStay(raw.stay),
    roomTotal: Number(raw.roomTotal) || 0,
    deliveredOrdersTotal: Number(raw.deliveredOrdersTotal) || 0,
    pendingOrdersTotal: Number(raw.pendingOrdersTotal) || 0,
    billableTotal: Number(raw.billableTotal) || 0,
    pendingOrderIds: unwrapIdList(raw.pendingOrderIds ?? undefined),
  }
}
