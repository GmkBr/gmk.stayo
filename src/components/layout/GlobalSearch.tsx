import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarCheck, Search } from 'lucide-react'
import { Modal } from '../ui/Modal.tsx'
import { useApp } from '../../app/useApp.ts'

type Props = { open: boolean; onClose: () => void }

export function GlobalSearch({ open, onClose }: Props) {
  const { hotelReservations } = useApp()
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  const q = query.trim().toLowerCase()
  const reservations = hotelReservations
    .filter((r) => !q || `${r.guestName} ${r.roomNumber} ${r.id}`.toLowerCase().includes(q))
    .slice(0, q ? 8 : 5)

  function go(path: string) {
    navigate(path)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Buscar reservas">
      <label className="relative mb-4 block">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Hóspede, quarto ou código"
          className="h-10 w-full rounded-lg border border-line bg-canvas pl-9 pr-3 text-[13px] focus:border-accent focus:outline-none"
        />
      </label>

      <ResultGroup icon={<CalendarCheck size={14} />} title="Reservas" empty="Nenhuma reserva encontrada.">
        {reservations.map((item) => (
          <Row key={item.id} onClick={() => go('/reservas')} title={item.guestName} meta={`Quarto ${item.roomNumber}`} />
        ))}
      </ResultGroup>
    </Modal>
  )
}

function ResultGroup({
  title,
  icon,
  empty,
  children,
}: {
  title: string
  icon: ReactNode
  empty: string
  children: ReactNode
}) {
  const count = Array.isArray(children) ? children.length : children ? 1 : 0
  return (
    <section className="mb-4 last:mb-0">
      <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
        {icon}
        {title}
      </p>
      <div className="flex flex-col">
        {count > 0 ? children : <p className="px-1 py-2 text-[12px] text-muted">{empty}</p>}
      </div>
    </section>
  )
}

function Row({ title, meta, onClick }: { title: string; meta: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 text-left text-[13px] hover:bg-canvas"
    >
      <span className="font-medium">{title}</span>
      <span className="truncate text-muted">{meta}</span>
    </button>
  )
}
