import type { IdBox } from '../../api/ids.ts'
import { unwrapId, unwrapIdList } from '../../api/ids.ts'
import type { ApiReservation } from '../reservations/mappers.ts'
import { mapReservation } from '../reservations/mappers.ts'
import type { CheckoutCharge, CheckoutChargeType } from '../stays/model.ts'
import type { CheckoutStatement } from './model.ts'

export type ApiCheckoutCharge = {
  type: string
  label: string
  amount: number
  orderId?: IdBox | string | null
}

export type ApiCheckoutStatement = {
  reservation: ApiReservation
  charges: ApiCheckoutCharge[]
  total: number
  openOrders?: (IdBox | string)[] | null
  stayId?: IdBox | string | null
}

/** Resposta de validate/complete do check-in no totem. */
export type ApiCheckinActionResponse = {
  blockReason?: string | null
  reservation: ApiReservation
}

export function normalizeChargeType(raw: string): CheckoutChargeType {
  return raw === 'order' ? 'order' : 'room'
}

export function mapCheckoutStatement(raw: ApiCheckoutStatement): CheckoutStatement {
  const charges: CheckoutCharge[] = (raw.charges ?? []).map((charge) => ({
    type: normalizeChargeType(charge.type),
    label: charge.label,
    amount: Number(charge.amount) || 0,
    orderId: charge.orderId ? unwrapId(charge.orderId) || undefined : undefined,
  }))
  return {
    reservation: mapReservation(raw.reservation),
    charges,
    total: Number(raw.total) || charges.reduce((sum, item) => sum + item.amount, 0),
    openOrderIds: unwrapIdList(raw.openOrders ?? undefined),
    stayId: raw.stayId ? unwrapId(raw.stayId) || undefined : undefined,
  }
}
