import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import type { HotelBrand } from '../../modules/hotels/model.ts'
import { totemBrandTitle, totemShellStyle } from '../../lib/totemBrand.ts'
import { TotemStaffConfigHold, type TotemStaffAction } from './TotemStaffConfigHold.tsx'

type Props = {
  brand: HotelBrand
  /** Nome exibido no topo quando brand.hotelName vier vazio. */
  title?: string
  contextLabel?: string
  guestMode?: boolean
  onUnbind?: () => void
  onChangeSpace?: () => void
  changeSpaceLabel?: string
  /** Ações de equipe atrás de long-press no nome do hotel (ex.: totem de quarto). */
  staffConfig?: {
    actions: TotemStaffAction[]
    holdMs?: number
  }
  children: ReactNode
  footer?: ReactNode
}

export function TotemShell({
  brand,
  title,
  contextLabel,
  guestMode,
  onUnbind,
  onChangeSpace,
  changeSpaceLabel,
  staffConfig,
  children,
  footer,
}: Props) {
  const displayName = totemBrandTitle(brand, title)

  const titleNode = (
    <p className="text-[13px] font-semibold uppercase tracking-[0.14em]" style={{ color: brand.primaryColor }}>
      {displayName}
    </p>
  )

  return (
    <div className="totem-shell flex min-h-svh flex-col" style={totemShellStyle(brand)}>
      <header className="flex items-center justify-between px-6 pt-[max(1rem,env(safe-area-inset-top))] pb-3">
        <div>
          {staffConfig ? (
            <TotemStaffConfigHold actions={staffConfig.actions} holdMs={staffConfig.holdMs}>
              {titleNode}
            </TotemStaffConfigHold>
          ) : (
            titleNode
          )}
          {contextLabel && <p className="mt-0.5 text-[12px] text-muted">{contextLabel}</p>}
        </div>
        {!staffConfig && (
          <div className="flex items-center gap-4">
            {onChangeSpace && (
              <button type="button" onClick={onChangeSpace} className="text-[12px] text-muted hover:text-ink">
                {changeSpaceLabel ?? 'Trocar local'}
              </button>
            )}
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
        )}
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
