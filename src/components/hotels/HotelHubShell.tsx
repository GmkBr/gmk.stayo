import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, LogOut } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext.tsx'
import { useApp } from '../../app/useApp.ts'
import { StayoLogo } from '../brand/StayoLogo.tsx'
import { Button } from '../ui/Button.tsx'

type Props = {
  readonly children: ReactNode
  readonly backTo?: string
  readonly backLabel?: string
}

export function HotelHubShell({ children, backTo, backLabel = 'Voltar' }: Props) {
  const { user } = useApp()
  const { signOut, usingDevToken } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="relative flex min-h-svh flex-col bg-canvas">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,color-mix(in_srgb,var(--color-accent)_8%,transparent),transparent)]"
      />

      <header className="relative z-10 flex h-14 items-center justify-between border-b border-line bg-surface px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          {backTo ? (
            <Link
              to={backTo}
              aria-label={backLabel}
              className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-[13px] font-medium text-muted transition-colors hover:bg-canvas hover:text-ink sm:min-w-0 sm:justify-start"
            >
              <ArrowLeft size={15} aria-hidden />
              <span className="hidden sm:inline">{backLabel}</span>
            </Link>
          ) : (
            <StayoLogo />
          )}
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/docs"
            className="hidden rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-muted transition-colors hover:bg-canvas hover:text-ink sm:inline"
          >
            Documentação
          </Link>
          <span
            className="hidden max-w-[200px] truncate text-[13px] text-muted md:inline"
            title={usingDevToken ? 'Token local' : user.email}
          >
            {user.name}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              void signOut().then(() => navigate('/login'))
            }}
          >
            <LogOut size={14} />
            Sair
          </Button>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-8 sm:px-6 sm:py-12">
        {children}
      </main>
    </div>
  )
}
