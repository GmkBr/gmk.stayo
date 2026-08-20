import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import type { HotelBrand } from '../../types/index.ts'

type Props = {
  brand: HotelBrand
  contextLabel?: string
  guestMode?: boolean
  onUnbind?: () => void
  children: ReactNode
  footer?: ReactNode
}

export function TotemShell({ brand, contextLabel, guestMode, onUnbind, children, footer }: Props) {
  return (
    <div
      className="totem-shell flex min-h-svh flex-col"
      style={{
        background: brand.secondaryColor,
        ['--hotel-primary' as string]: brand.primaryColor,
        ['--hotel-accent' as string]: brand.accentColor,
        ['--hotel-secondary' as string]: brand.secondaryColor,
      }}
    >
      <header className="flex items-center justify-between px-6 pt-[max(1rem,env(safe-area-inset-top))] pb-3">
        <div>
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em]" style={{ color: brand.primaryColor }}>
            {brand.hotelName}
          </p>
          {contextLabel && <p className="mt-0.5 text-[12px] text-muted">{contextLabel}</p>}
        </div>
        <div className="flex items-center gap-4">
          {!guestMode && onUnbind && (
            <button type="button" onClick={onUnbind} className="text-[12px] text-muted hover:text-ink">
              Trocar totem
            </button>
          )}
          {!guestMode && (
            <Link to="/" className="text-[12px] text-muted hover:text-ink">
              Sair
            </Link>
          )}
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col px-6 pb-6" aria-live="polite">
        {children}
      </main>

      {footer && (
        <footer className="sticky bottom-0 border-t border-line/60 bg-white/90 px-6 py-4 backdrop-blur-sm pb-[max(1rem,env(safe-area-inset-bottom))]">
          {footer}
        </footer>
      )}
    </div>
  )
}
