import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { BedDouble, CalendarCheck, Search, Users, Wrench } from 'lucide-react'
import { Modal } from '../ui/Modal.tsx'
import { useApp } from '../../context/AppContext.tsx'

type Props = { open: boolean; onClose: () => void }

export function GlobalSearch({ open, onClose }: Props) {
  const { hotelReservations, hotelGuests, hotelRooms, hotelMaintenance } = useApp()
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  const q = query.trim().toLowerCase()

  const groups = {
    reservations: hotelReservations
      .filter((r) => !q || `${r.guestName} ${r.roomNumber} ${r.id}`.toLowerCase().includes(q))
      .slice(0, q ? 5 : 3),
    guests: hotelGuests
      .filter((g) => !q || `${g.name} ${g.email}`.toLowerCase().includes(q))
      .slice(0, q ? 5 : 3),
    rooms: hotelRooms
      .filter((r) => !q || `${r.number} ${r.category}`.toLowerCase().includes(q))
      .slice(0, q ? 5 : 3),
    tickets: hotelMaintenance
      .filter((m) => !q || `${m.code} ${m.title} ${m.roomNumber}`.toLowerCase().includes(q))
      .slice(0, q ? 5 : 3),
  }

  function go(path: string) {
    navigate(path)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Buscar no hotel">
      <label className="relative mb-4 block">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Reservas, hóspedes, quartos, chamados"
          className="h-10 w-full rounded-lg border border-line bg-canvas pl-9 pr-3 text-[13px] focus:border-accent focus:outline-none"
        />
      </label>

      <ResultGroup icon={<CalendarCheck size={14} />} title="Reservas" empty="Nenhuma reserva encontrada.">
        {groups.reservations.map((item) => (
          <Row key={item.id} onClick={() => go('/reservations')} title={item.guestName} meta={`Quarto ${item.roomNumber}`} />
        ))}
      </ResultGroup>
      <ResultGroup icon={<Users size={14} />} title="Hóspedes" empty="Nenhum hóspede encontrado.">
        {groups.guests.map((item) => (
          <Row key={item.id} onClick={() => go(`/guests/${item.id}`)} title={item.name} meta={item.email} />
        ))}
      </ResultGroup>
      <ResultGroup icon={<BedDouble size={14} />} title="Quartos" empty="Nenhum quarto encontrado.">
        {groups.rooms.map((item) => (
          <Row key={item.id} onClick={() => go('/rooms')} title={`Quarto ${item.number}`} meta={item.category} />
        ))}
      </ResultGroup>
      <ResultGroup icon={<Wrench size={14} />} title="Chamados" empty="Nenhum chamado encontrado.">
        {groups.tickets.map((item) => (
          <Row key={item.id} onClick={() => go('/maintenance')} title={`#${item.code} ${item.title}`} meta={`Quarto ${item.roomNumber}`} />
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
