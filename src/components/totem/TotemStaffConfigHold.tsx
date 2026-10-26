import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Modal } from '../ui/Modal.tsx'
import { Button } from '../ui/Button.tsx'
import { cn } from '../../utils/cn.ts'

export type TotemStaffAction = {
  label: string
  onClick: () => void
  variant?: 'default' | 'danger'
}

type Props = {
  actions: TotemStaffAction[]
  holdMs?: number
  className?: string
  children: ReactNode
}

const DEFAULT_HOLD_MS = 5000

/** Long-press silencioso — sem feedback visual; envolve o nome do hotel no header. */
export function TotemStaffConfigHold({ actions, holdMs = DEFAULT_HOLD_MS, className, children }: Props) {
  const [open, setOpen] = useState(false)
  const holdTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const cancelHold = useCallback(() => {
    if (holdTimer.current !== undefined) {
      clearTimeout(holdTimer.current)
      holdTimer.current = undefined
    }
  }, [])

  const startHold = useCallback(() => {
    cancelHold()
    holdTimer.current = setTimeout(() => {
      holdTimer.current = undefined
      setOpen(true)
    }, holdMs)
  }, [cancelHold, holdMs])

  useEffect(() => () => cancelHold(), [cancelHold])

  function runAction(action: TotemStaffAction) {
    setOpen(false)
    action.onClick()
  }

  return (
    <>
      <span
        className={cn('inline-block select-none touch-none', className)}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId)
          startHold()
        }}
        onPointerUp={(event) => {
          event.currentTarget.releasePointerCapture(event.pointerId)
          cancelHold()
        }}
        onPointerLeave={cancelHold}
        onPointerCancel={(event) => {
          event.currentTarget.releasePointerCapture(event.pointerId)
          cancelHold()
        }}
        onContextMenu={(event) => event.preventDefault()}
      >
        {children}
      </span>

      <Modal open={open} onClose={() => setOpen(false)} title="Configurações" size="md">
        <p className="mb-4 text-[14px] text-muted">Opções para a equipe do hotel.</p>
        <div className="flex flex-col gap-3">
          {actions.map((action) => (
            <Button
              key={action.label}
              size="kiosk"
              variant={action.variant === 'danger' ? 'outline' : 'primary'}
              className={action.variant === 'danger' ? 'text-red-600' : undefined}
              onClick={() => runAction(action)}
            >
              {action.label}
            </Button>
          ))}
          <Button size="kiosk" variant="secondary" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
        </div>
      </Modal>
    </>
  )
}
