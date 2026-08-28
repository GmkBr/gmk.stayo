import type { AuthUser, MeProfile } from '../api/index.ts'
import type { AccountType } from '../types/index.ts'

type AccountHolder = {
  accountType: AccountType
  totem?: MeProfile['totem']
}

export function isTotemAccount(
  holder: AccountHolder | null | undefined,
): holder is AccountHolder & { totem: NonNullable<MeProfile['totem']> } {
  return holder?.accountType === 'totem' && Boolean(holder.totem)
}

export function isTotemProfile(profile: MeProfile | null | undefined): profile is MeProfile & {
  totem: NonNullable<MeProfile['totem']>
} {
  return isTotemAccount(profile)
}

export function postLoginPath(holder: AccountHolder | MeProfile | AuthUser): string {
  return holder.accountType === 'totem' ? '/totem' : '/hoteis'
}
