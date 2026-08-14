import { useMemo, useState, type ReactNode } from 'react'
import { Plus } from 'lucide-react'
import { useApp } from '../../context/AppContext.tsx'
import { useToast } from '../../components/ui/Toast.tsx'
import { usePageLoading } from '../../hooks/usePageLoading.ts'
import { formatBRL, formatShortDate } from '../../utils/format.ts'
import { PageHeader } from '../../components/ui/PageHeader.tsx'
import { Button } from '../../components/ui/Button.tsx'
import { Card } from '../../components/ui/Card.tsx'
import { SearchInput } from '../../components/ui/SearchInput.tsx'
import { Select } from '../../components/ui/Select.tsx'
import { DataTable } from '../../components/ui/DataTable.tsx'
import { Avatar } from '../../components/ui/Avatar.tsx'
import { ReservationStatusBadge } from '../../components/ui/StatusBadge.tsx'
import { Drawer } from '../../components/ui/Drawer.tsx'
import { TableSkeleton } from '../../components/ui/Skeleton.tsx'
import { CheckInModal } from '../../components/checkin/CheckInModal.tsx'
import { Modal } from '../../components/ui/Modal.tsx'
import { Input } from '../../components/ui/Input.tsx'
import { DatePicker } from '../../components/ui/DatePicker.tsx'
import type { Reservation, ReservationStatus } from '../../types/index.ts'

const STATUS_FILTER = [
  { value: 'all', label: 'Todos os status' },
  { value: 'arriving_today', label: 'Check-in hoje' },
  { value: 'confirmed', label: 'Confirmada' },
  { value: 'checked_in', label: 'Hospedado' },
  { value: 'pending', label: 'Pendente' },
  { value: 'checked_out', label: 'Check-out' },
  { value: 'cancelled', label: 'Cancelada' },
]

const PERIOD_FILTER = [
  { value: 'all', label: 'Qualquer período' },
  { value: 'today', label: 'Chegada hoje' },
  { value: 'upcoming', label: 'Próximas' },
  { value: 'staying', label: 'Em casa' },
]

export function ReservationsPage() {
  const { hotelReservations, hotelRooms, hotelGuests, hotel, addReservation, updateReservationStatus, addActivity } = useApp()
  const { push } = useToast()
  const loading = usePageLoading(400)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [period, setPeriod] = useState('all')
  const [selected, setSelected] = useState<Reservation | null>(null)
  const [checkIn, setCheckIn] = useState<Reservation | null>(null)
  const [creating, setCreating] = useState(false)

  const rows = useMemo(() => {
    return hotelReservations.filter((item) => {
      const q = query.trim().toLowerCase()
      const matchQ = !q || `${item.guestName} ${item.roomNumber}`.toLowerCase().includes(q)
      const matchS = status === 'all' || item.status === status
      const matchP =
        period === 'all' ||
        (period === 'today' && item.checkIn === '2026-08-14') ||
        (period === 'upcoming' && item.checkIn > '2026-08-14') ||
        (period === 'staying' && item.status === 'checked_in')
      return matchQ && matchS && matchP
    })
  }, [hotelReservations, query, status, period])

  function setStatusOf(id: string, next: ReservationStatus, toast: string) {
    updateReservationStatus(id, next)
    setSelected((prev) => (prev && prev.id === id ? { ...prev, status: next } : prev))
    push({ title: toast, tone: next === 'cancelled' ? 'danger' : 'success' })
  }

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-6">
      <PageHeader
        title="Reservas"
        subtitle="Gerencie as reservas e acompanhe a chegada dos hóspedes."
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus size={16} />
            Nova reserva
          </Button>
        }
      />

      <Card padding="none">
        <div className="flex flex-col gap-3 border-b border-line p-4 md:flex-row md:items-end">
          <div className="md:max-w-xs md:flex-1">
            <SearchInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar hóspede ou quarto" />
          </div>
          <div className="grid flex-1 grid-cols-2 gap-3 md:max-w-md">
            <Select options={STATUS_FILTER} value={status} onChange={(e) => setStatus(e.target.value)} />
            <Select options={PERIOD_FILTER} value={period} onChange={(e) => setPeriod(e.target.value)} />
          </div>
        </div>
        {loading ? (
          <TableSkeleton />
        ) : (
          <DataTable
            rows={rows}
            rowKey={(row) => row.id}
            onRowClick={setSelected}
            emptyTitle="Nenhuma reserva encontrada"
            emptyDescription="Ajuste a busca ou os filtros para ver outras reservas."
            columns={[
              {
                key: 'guest',
                header: 'Hóspede',
                render: (row) => (
                  <span className="flex items-center gap-2">
                    <Avatar name={row.guestName} size="sm" />
                    <span className="font-medium">{row.guestName}</span>
                  </span>
                ),
              },
              { key: 'room', header: 'Quarto', render: (row) => `Quarto ${row.roomNumber}` },
              { key: 'in', header: 'Check-in', render: (row) => formatShortDate(row.checkIn) },
              { key: 'out', header: 'Check-out', render: (row) => formatShortDate(row.checkOut) },
              {
                key: 'guests',
                header: 'Hóspedes',
                render: (row) => `${row.guests} ${row.guests === 1 ? 'hóspede' : 'hóspedes'}`,
              },
              { key: 'status', header: 'Status', render: (row) => <ReservationStatusBadge status={row.status} /> },
              { key: 'value', header: 'Valor', render: (row) => formatBRL(row.total) },
              {
                key: 'actions',
                header: 'Ações',
                render: (row) => (
                  <button
                    type="button"
                    className="text-[12px] font-medium text-accent"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelected(row)
                    }}
                  >
                    Ver
                  </button>
                ),
              },
            ]}
          />
        )}
      </Card>

      <Drawer
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.guestName ?? ''}
        subtitle={selected ? `Quarto ${selected.roomNumber} · ${selected.category}` : undefined}
        footer={
          selected && (
            <>
              {selected.status === 'pending' && (
                <Button size="sm" onClick={() => setStatusOf(selected.id, 'confirmed', 'Reserva confirmada')}>
                  Confirmar
                </Button>
              )}
              {(selected.status === 'confirmed' || selected.status === 'arriving_today') && (
                <Button size="sm" onClick={() => setCheckIn(selected)}>
                  Check-in
                </Button>
              )}
              <Button size="sm" variant="secondary" onClick={() => push({ title: 'Edição simulada', detail: 'Os campos permanecem locais neste protótipo.' })}>
                Editar
              </Button>
              {selected.status !== 'cancelled' && selected.status !== 'checked_out' && (
                <Button size="sm" variant="danger" onClick={() => setStatusOf(selected.id, 'cancelled', 'Reserva cancelada')}>
                  Cancelar
                </Button>
              )}
            </>
          )
        }
      >
        {selected && (
          <div className="flex flex-col gap-5 text-[13px]">
            <section className="grid grid-cols-2 gap-3">
              <Field label="Contato" value={selected.guestEmail} />
              <Field label="Telefone" value={selected.guestPhone} />
              <Field label="Datas" value={`${formatShortDate(selected.checkIn)} – ${formatShortDate(selected.checkOut)}`} />
              <Field label="Hóspedes" value={String(selected.guests)} />
              <Field label="Valor" value={formatBRL(selected.total)} />
              <Field label="Pagamento" value={selected.paymentMethod.toUpperCase()} />
              <Field label="Status" value={<ReservationStatusBadge status={selected.status} />} />
            </section>
            {selected.notes && (
              <section>
                <p className="mb-1 text-[12px] text-muted">Observações</p>
                <p>{selected.notes}</p>
              </section>
            )}
            <section>
              <p className="mb-2 text-[12px] text-muted">Histórico</p>
              <ul className="flex flex-col gap-2">
                {selected.history.map((item) => (
                  <li key={item.at} className="rounded-lg bg-canvas px-3 py-2">
                    <p className="text-[12px] text-muted">{item.at}</p>
                    <p>{item.text}</p>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}
      </Drawer>

      <CheckInModal
        open={Boolean(checkIn)}
        reservation={checkIn}
        onClose={() => setCheckIn(null)}
        onComplete={() => {
          if (!checkIn) return
          setStatusOf(checkIn.id, 'checked_in', 'Check-in concluído')
          addActivity({ time: 'agora', title: 'Check-in realizado', detail: `${checkIn.guestName} — Quarto ${checkIn.roomNumber}`, kind: 'checkin' })
        }}
      />

      <NewReservationModal
        open={creating}
        rooms={hotelRooms}
        guests={hotelGuests}
        hotelId={hotel.id}
        onClose={() => setCreating(false)}
        onCreate={(reservation) => {
          addReservation(reservation)
          addActivity({ time: 'agora', title: 'Reserva criada', detail: reservation.guestName, kind: 'reservation' })
          push({ title: 'Reserva criada', detail: `${reservation.guestName} · quarto ${reservation.roomNumber}`, tone: 'success' })
          setCreating(false)
        }}
      />
    </div>
  )
}

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-[12px] text-muted">{label}</p>
      <div className="mt-0.5 font-medium">{value}</div>
    </div>
  )
}

function NewReservationModal({
  open,
  onClose,
  onCreate,
  rooms,
  guests,
  hotelId,
}: {
  open: boolean
  onClose: () => void
  onCreate: (reservation: Reservation) => void
  rooms: ReturnType<typeof useApp>['hotelRooms']
  guests: ReturnType<typeof useApp>['hotelGuests']
  hotelId: string
}) {
  const [guestId, setGuestId] = useState(guests[0]?.id ?? '')
  const [roomId, setRoomId] = useState(rooms.find((r) => r.status === 'available' || r.status === 'clean')?.id ?? rooms[0]?.id ?? '')
  const [checkIn, setCheckInDate] = useState('2026-08-16')
  const [checkOut, setCheckOutDate] = useState('2026-08-18')
  const [count, setCount] = useState('2')

  const guest = guests.find((g) => g.id === guestId)
  const room = rooms.find((r) => r.id === roomId)

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nova reserva"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              if (!guest || !room) return
              onCreate({
                id: `rs-${Date.now()}`,
                hotelId,
                guestId: guest.id,
                guestName: guest.name,
                guestEmail: guest.email,
                guestPhone: guest.phone,
                roomId: room.id,
                roomNumber: room.number,
                category: room.category,
                checkIn,
                checkOut,
                guests: Number(count) || 1,
                status: 'confirmed',
                total: room.rate * 2,
                paymentMethod: 'pix',
                notes: 'Criada no protótipo.',
                history: [{ at: 'agora', text: 'Reserva criada no painel' }],
              })
            }}
          >
            Criar reserva
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <Select label="Hóspede" value={guestId} onChange={(e) => setGuestId(e.target.value)} options={guests.map((g) => ({ value: g.id, label: g.name }))} />
        <Select label="Quarto" value={roomId} onChange={(e) => setRoomId(e.target.value)} options={rooms.map((r) => ({ value: r.id, label: `${r.number} · ${r.category}` }))} />
        <div className="grid grid-cols-2 gap-3">
          <DatePicker label="Check-in" value={checkIn} onChange={setCheckInDate} />
          <DatePicker label="Check-out" value={checkOut} onChange={setCheckOutDate} />
        </div>
        <Input label="Hóspedes" type="number" min={1} value={count} onChange={(e) => setCount(e.target.value)} />
      </div>
    </Modal>
  )
}
