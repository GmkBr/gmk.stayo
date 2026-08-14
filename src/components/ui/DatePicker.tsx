import { useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { cn } from '../../utils/cn.ts'
import { formatShortDate } from '../../utils/format.ts'

type Props = {
  label?: string
  value: string
  onChange: (iso: string) => void
}

const WEEK = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

function toISO(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function DatePicker({ label, value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const current = value ? new Date(`${value}T12:00:00`) : new Date()
  const year = current.getFullYear()
  const month = current.getMonth()
  const first = new Date(year, month, 1)
  const startPad = first.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = Array.from({ length: startPad + daysInMonth }, (_, i) => {
    if (i < startPad) return null
    return i - startPad + 1
  })

  return (
    <div className="relative w-full">
      {label && <p className="mb-1.5 text-[13px] font-medium text-ink">{label}</p>}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-full items-center justify-between rounded-lg border border-line bg-surface px-3 text-left text-[13px] hover:border-ink/20"
      >
        <span>{value ? formatShortDate(value) : 'Selecionar data'}</span>
        <CalendarDays size={15} className="text-muted" />
      </button>
      {open && (
        <div className="absolute z-40 mt-1 w-72 rounded-xl border border-line bg-surface p-3 shadow-soft">
          <p className="mb-2 text-center text-[13px] font-medium capitalize">
            {current.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </p>
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-muted">
            {WEEK.map((d, i) => (
              <span key={`${d}-${i}`}>{d}</span>
            ))}
            {cells.map((day, i) =>
              day ? (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    onChange(toISO(new Date(year, month, day)))
                    setOpen(false)
                  }}
                  className={cn(
                    'flex size-8 items-center justify-center rounded-md text-[12px] hover:bg-canvas',
                    value === toISO(new Date(year, month, day)) && 'bg-accent text-white hover:bg-accent',
                  )}
                >
                  {day}
                </button>
              ) : (
                <span key={i} />
              ),
            )}
          </div>
        </div>
      )}
    </div>
  )
}
