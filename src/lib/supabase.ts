import { createClient, type Session, type SupabaseClient, type User } from '@supabase/supabase-js'

const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() ?? ''
const key = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() ?? ''

function decodeJwtPayload(token: string): { role?: string } | null {
  try {
    const part = token.split('.')[1]
    if (!part) return null
    const padded = part.replace(/-/g, '+').replace(/_/g, '/')
    const json = atob(padded.padEnd(padded.length + ((4 - (padded.length % 4)) % 4), '='))
    return JSON.parse(json) as { role?: string }
  } catch {
    return null
  }
}

/** Chave service_role nunca pode ir no frontend. */
export const supabaseKeyIsServiceRole = Boolean(key && decodeJwtPayload(key)?.role === 'service_role')

export const supabaseConfigured = Boolean(
  url && key && !url.includes('YOUR_PROJECT') && !supabaseKeyIsServiceRole,
)

export const supabase: SupabaseClient | null = supabaseConfigured
  ? createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

export type { Session, User }
