import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useCallback, useId, useRef, useState } from 'react'
import { cn } from '../../utils/cn.ts'

type Props = {
  content: string
  children: ReactNode
  side?: 'right' | 'top'
  className?: string
}

export function Tooltip({ content, children, side = 'right', className }: Props) {
  const id = useId()
  const triggerRef = useRef<HTMLSpanElement>(null)
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null)
  const [visible, setVisible] = useState(false)

  const show = useCallback(() => {
    const el = triggerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    if (side === 'top') {
      setCoords({ top: rect.top - 8, left: rect.left + rect.width / 2 })
    } else {
      setCoords({ top: rect.top + rect.height / 2, left: rect.right + 8 })
    }
    setVisible(true)
  }, [side])

  const hide = useCallback(() => {
    setVisible(false)
  }, [])

  return (
    <>
      <span
        ref={triggerRef}
        className={cn('inline-flex', className)}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        aria-describedby={visible ? id : undefined}
      >
        {children}
      </span>
      {visible &&
        coords &&
        createPortal(
          <span
            id={id}
            role="tooltip"
            style={{
              position: 'fixed',
              top: coords.top,
              left: coords.left,
              transform: side === 'top' ? 'translate(-50%, -100%)' : 'translateY(-50%)',
            }}
            className="pointer-events-none z-[100] whitespace-nowrap rounded-md bg-ink px-2 py-1 text-[11px] font-medium text-white"
          >
            {content}
          </span>,
          document.body,
        )}
    </>
  )
}
