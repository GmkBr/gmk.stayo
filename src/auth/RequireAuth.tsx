import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../auth/AuthContext.tsx'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { ready, accessToken } = useAuth()
  const location = useLocation()

  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-canvas text-[14px] text-muted">
        Carregando sessão…
      </div>
    )
  }

  if (!accessToken) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}
