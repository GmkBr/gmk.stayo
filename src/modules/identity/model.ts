

export type AccountType = 'human' | 'totem'

export type CurrentUser = {
  name: string
  role: string
  initials: string
  email?: string
}
