import { useMemo, useState, type ReactNode } from 'react'
import { useApp } from '../../context/AppContext.tsx'
import { usePageLoading } from '../../hooks/usePageLoading.ts'
import { formatShortDate } from '../../utils/format.ts'
import { PageHeader } from '../../components/ui/PageHeader.tsx'
import { Card } from '../../components/ui/Card.tsx'
import { RoomStatusBadge } from '../../components/ui/StatusBadge.tsx'
import { Drawer } from '../../components/ui/Drawer.tsx'
import { GridSkeleton } from '../../components/ui/Skeleton.tsx'
import { EmptyState } from '../../components/ui/EmptyState.tsx'
import { cn } from '../../utils/cn.ts'
import type { Room, RoomStatus } from '../../types/index.ts'

const FILTERS: { id: 'all' | RoomStatus; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'available', label: 'Disponíveis' },
  { id: 'occupied', label: 'Ocupados' },
  { id: 'cleaning', label: 'Limpeza' },
  { id: 'dirty', label: 'Sujos' },
  { id: 'maintenance', label: 'Manutenção' },
]

export function RoomsPage() {
  const { hotelRooms } = useApp()
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['id']>('all')
  const [selected, setSelected] = useState<Room | null>(null)
  const loading = usePageLoading(360)

  const rooms = useMemo(() => {
    if (filter === 'all') return hotelRooms
    if (filter === 'cleaning') return hotelRooms.filter((r) => r.status === 'cleaning' || r.status === 'dirty')
    if (filter === 'available') return hotelRooms.filter((r) => r.status === 'available' || r.status === 'clean')
    return hotelRooms.filter((r) => r.status === filter)
  }, [hotelRooms, filter])

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-6">
      <PageHeader title="Quartos" subtitle="Uma leitura rápida do que está acontecendo em cada unidade." />

      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={cn(
              'rounded-lg px-3 py-1.5 text-[13px] font-medium',
              filter === item.id ? 'bg-ink text-white' : 'bg-surface text-muted border border-line hover:text-ink',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading ? (
        <GridSkeleton count={8} />
      ) : rooms.length === 0 ? (
        <Card>
          <EmptyState title="Nenhum quarto neste filtro" description="Escolha outro estado para ver o mapa da casa." />
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {rooms.map((room) => (
            <button
              key={room.id}
              type="button"
              onClick={() => setSelected(room)}
              className="rounded-xl border border-line bg-surface p-4 text-left shadow-soft transition-colors hover:bg-canvas"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[12px] text-muted">Quarto</p>
                  <p className="text-xl font-semibold tracking-[-0.04em]">{room.number}</p>
                </div>
                <RoomStatusBadge status={room.status} />
              </div>
              <p className="mt-3 text-[13px] font-medium">{room.category}</p>
              <p className="text-[12px] text-muted">{room.capacity} hóspedes</p>
              {room.guestName && <p className="mt-3 text-[13px]">{room.guestName}</p>}
              {room.checkOut && <p className="text-[12px] text-muted">Check-out: {formatShortDate(room.checkOut)}</p>}
            </button>
          ))}
        </div>
      )}

      <Drawer
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected ? `Quarto ${selected.number}` : ''}
        subtitle={selected?.category}
      >
        {selected && (
          <dl className="grid grid-cols-2 gap-3 text-[13px]">
            <Item label="Capacidade" value={`${selected.capacity} hóspedes`} />
            <Item label="Status" value={<RoomStatusBadge status={selected.status} />} />
            <Item label="Hóspede atual" value={selected.guestName ?? '—'} />
            <Item label="Check-in" value={selected.checkIn ? formatShortDate(selected.checkIn) : '—'} />
            <Item label="Check-out" value={selected.checkOut ? formatShortDate(selected.checkOut) : '—'} />
            <Item label="Última limpeza" value={selected.lastCleaned ? formatShortDate(selected.lastCleaned) : '—'} />
            <Item label="Próxima reserva" value={selected.nextReservation ? formatShortDate(selected.nextReservation) : '—'} />
            <Item label="Diária" value={`R$ ${selected.rate}`} />
          </dl>
        )}
      </Drawer>
    </div>
  )
}

function Item({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt className="text-[12px] text-muted">{label}</dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  )
}
