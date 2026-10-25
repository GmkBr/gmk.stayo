import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from './AuthContext.tsx'
import { useApp } from '../app/useApp.ts'
import { isTotemAccount } from './account.ts'

export function RequireTotem({ children }: { children: ReactNode }) {
  const { ready, accessToken, user } = useAuth()
  const { profile, bootstrapping } = useApp()

  const totemSession = isTotemAccount(user) || isTotemAccount(profile)

  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-canvas text-[14px] text-muted">
        Carregando totem…
      </div>
    )
  }

  if (!accessToken) {
    return <Navigate to="/login" replace />
  }

  if (!totemSession) {
    return <Navigate to="/hoteis" replace />
  }

  if (bootstrapping) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-canvas text-[14px] text-muted">
        Carregando totem…
      </div>
    )
  }

  const totem = profile?.totem ?? user?.totem
  if (!totem) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-canvas px-6 text-center">
        <p className="text-lg font-semibold text-ink">Totem não configurado</p>
        <p className="max-w-sm text-[14px] text-muted">
          A conta não trouxe os dados do dispositivo. Peça à equipe para recadastrar o totem no console.
        </p>
      </div>
    )
  }

  if (!totem.active) {
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
