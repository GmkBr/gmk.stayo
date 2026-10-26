import type { AuthUser, MeProfile } from '../modules/identity/api.ts'
import type { AccountType } from '../modules/identity/model.ts'
import { isTotemEmail } from '../lib/totemLogin.ts'

type AccountHolder = {
  accountType?: AccountType
  email?: string
  totem?: MeProfile['totem']
}

export function isTotemAccount(
  holder: AccountHolder | null | undefined,
): holder is AccountHolder & { accountType: 'totem' } {
  if (!holder) return false
  if (holder.accountType === 'totem') return true
  if (isTotemEmail(holder.email)) return true
  return false
}

export function isTotemProfile(profile: MeProfile | null | undefined): profile is MeProfile & {
  totem: NonNullable<MeProfile['totem']>
} {
  return isTotemAccount(profile) && Boolean(profile?.totem)
}

/** Une /me com dados do login quando o backend atrasa totem no perfil. */
export function mergeTotemSession(me: MeProfile, authUser: AuthUser | null): MeProfile {
  if (!isTotemAccount(me) && !isTotemAccount(authUser)) return me
  return {
    ...me,
    accountType: 'totem',
    totem: me.totem ?? authUser?.totem,
  }
}

export function postLoginPath(holder: AccountHolder | MeProfile | AuthUser): string {
  return isTotemAccount(holder) ? '/totem' : '/hoteis'
}
