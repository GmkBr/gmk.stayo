import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../utils/cn.ts'

type Option = { value: string; label: string }

type Props = {
  label?: string
  value: string
  options: Option[]
  onChange: (value: string) => void
  align?: 'left' | 'right'
  className?: string
}

export function Dropdown({ label, value, options, onChange, align = 'left', className }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const menuId = useId()
  const current = options.find((o) => o.value === value)?.label ?? label ?? 'Selecionar'

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-surface px-3 text-[13px] font-medium text-ink transition-colors hover:bg-canvas"
      >
        {current}
        <ChevronDown size={14} className="text-muted" />
      </button>
      {open && (
        <ul
          id={menuId}
          role="listbox"
          className={cn(
            'absolute z-40 mt-1 min-w-full overflow-hidden rounded-lg border border-line bg-surface py-1 shadow-soft',
            align === 'right' ? 'right-0' : 'left-0',
          )}
        >
          {options.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                role="option"
                aria-selected={option.value === value}
                className={cn(
                  'flex w-full px-3 py-2 text-left text-[13px] hover:bg-canvas',
                  option.value === value ? 'font-medium text-ink' : 'text-muted',
                )}
                onClick={() => {
                  onChange(option.value)
                  setOpen(false)
                }}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

type MenuProps = {
  trigger: ReactNode
  children: ReactNode
  align?: 'left' | 'right'
  width?: string
}

export function DropdownMenu({ trigger, children, align = 'right', width = 'w-80' }: MenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  return (
    <div ref={ref} className="relative">
      <div onClick={() => setOpen((v) => !v)}>{trigger}</div>
      {open && (
        <div
          className={cn(
            'absolute z-50 mt-2 overflow-hidden rounded-xl border border-line bg-surface shadow-soft',
            width,
            align === 'right' ? 'right-0' : 'left-0',
          )}
        >
          {children}
        </div>
      )}
    </div>
  )
}
