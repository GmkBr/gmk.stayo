import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { setAccessTokenProvider, setUnauthorizedHandler } from '../api/client.ts'
import * as api from '../api/index.ts'

const HOTEL_STORAGE_KEY = 'stayo.hotel'
const AUTH_STORAGE_KEY = 'stayo.auth'

type StoredAuth = {
  accessToken: string
  refreshToken: string
  expiresAt: number
  user: api.AuthUser
}

type AuthContextValue = {
  ready: boolean
  user: api.AuthUser | null
  accessToken: string | null
  refreshToken: string | null
  usingDevToken: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (input: api.RegisterInput) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readDevToken() {
  const token = (import.meta.env.VITE_DEV_ACCESS_TOKEN as string | undefined)?.trim()
  return token || null
}

function clearHotelStorage() {
  try {
    localStorage.removeItem(HOTEL_STORAGE_KEY)
  } catch {
    /* ignore */
  }
}

function readStoredAuth(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredAuth
    if (!parsed?.accessToken || !parsed?.user?.id) return null
    return parsed
  } catch {
    return null
  }
}

function writeStoredAuth(session: StoredAuth) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
}

function clearStoredAuth() {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY)
  } catch {
    /* ignore */
  }
}

function sessionFromResponse(res: api.AuthSessionResponse): StoredAuth {
  const user = api.mapAuthUser(res.user)
  return {
    accessToken: res.accessToken,
    refreshToken: res.refreshToken,
    expiresAt: Date.now() + Math.max(0, (res.expiresIn ?? 3600) * 1000),
    user,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [stored, setStored] = useState<StoredAuth | null>(null)
  const devToken = readDevToken()
  const signingOutRef = useRef(false)

  useEffect(() => {
    setStored(readStoredAuth())
    setReady(true)
  }, [])

  const accessToken = stored?.accessToken ?? (!stored ? devToken : null)
  const usingDevToken = !stored && Boolean(devToken)

  // Síncrono: bootstrap do AppContext não pode rodar com provider ainda em null.
  setAccessTokenProvider(() => accessToken)

  const applySession = useCallback((session: StoredAuth) => {
    writeStoredAuth(session)
    setAccessTokenProvider(() => session.accessToken)
    setStored(session)
  }, [])

  const signOut = useCallback(async () => {
    if (signingOutRef.current) return
    signingOutRef.current = true
    try {
      clearHotelStorage()
      clearStoredAuth()
      setAccessTokenProvider(() => null)
      setStored(null)
    } finally {
      signingOutRef.current = false
    }
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(() => {
      void signOut()
    })
    return () => setUnauthorizedHandler(null)
  }, [signOut])

  const signIn = useCallback(
    async (email: string, password: string) => {
      const res = await api.login({ email, password })
      applySession(sessionFromResponse(res))
    },
    [applySession],
  )

  const signUp = useCallback(
    async (input: api.RegisterInput) => {
      const res = await api.register(input)
      applySession(sessionFromResponse(res))
    },
    [applySession],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      ready,
      user: stored?.user ?? null,
      accessToken,
      refreshToken: stored?.refreshToken ?? null,
      usingDevToken,
      signIn,
      signUp,
      signOut,
    }),
    [ready, stored, accessToken, usingDevToken, signIn, signUp, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
