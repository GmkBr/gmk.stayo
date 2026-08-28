import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from './AuthContext.tsx'
import { useApp } from '../context/AppContext.tsx'
import { isTotemAccount, isTotemProfile } from './account.ts'

export function RequireTotem({ children }: { children: ReactNode }) {
  const { ready, accessToken, user } = useAuth()
  const { profile, bootstrapping } = useApp()

  if (!ready || (accessToken && bootstrapping && !isTotemAccount(user))) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-canvas text-[14px] text-muted">
        Carregando totem…
      </div>
    )
  }

  if (!accessToken) {
    return <Navigate to="/login" replace />
  }

  if (!profile || !isTotemProfile(profile)) {
    if (isTotemAccount(user)) {
      // Bootstrap ainda carregando totem completo do /me
      return (
        <div className="flex min-h-dvh items-center justify-center bg-canvas text-[14px] text-muted">
          Carregando totem…
        </div>
      )
    }
    return <Navigate to="/hoteis" replace />
  }

  if (!profile.totem.active) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-canvas px-6 text-center">
        <p className="text-lg font-semibold text-ink">Totem desativado</p>
        <p className="max-w-sm text-[14px] text-muted">
          Este dispositivo foi desativado no console. Peça à equipe para reativá-lo.
        </p>
      </div>
    )
  }

  return children
}
