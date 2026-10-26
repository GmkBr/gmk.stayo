import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from './AuthContext.tsx'
import { useApp } from '../app/useApp.ts'
import { isTotemAccount } from './account.ts'

export function RequireConsole({ children }: { children: ReactNode }) {
  const { ready, accessToken, user } = useAuth()
  const { profile, bootstrapping } = useApp()
  const location = useLocation()

  if (!ready || (accessToken && bootstrapping && !user)) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-canvas text-[14px] text-muted">
        Carregando sessão…
      </div>
    )
  }

  if (!accessToken) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (isTotemAccount(user) || isTotemAccount(profile)) {
    return <Navigate to="/totem" replace />
  }

  return children
}
