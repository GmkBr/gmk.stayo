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
import { Modal } from '../../components/ui/Modal.tsx'
import { Input } from '../../components/ui/Input.tsx'
import { DatePicker } from '../../components/ui/DatePicker.tsx'
import type { PaymentMethod, Reservation, ReservationStatus } from '../../types/index.ts'
import { ApiError } from '../../api/client.ts'

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

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export function ReservationsPage() {
  const {
    hotelReservations,
    hotelRooms,
    createReservation,
    updateReservationStatus,
    addActivity,
    refreshing,
  } = useApp()
  const { push } = useToast()
  const loading = usePageLoading(200) || refreshing
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [period, setPeriod] = useState('all')
  const [selected, setSelected] = useState<Reservation | null>(null)
  const [creating, setCreating] = useState(false)

  const rows = useMemo(() => {
    const today = todayIso()
    return hotelReservations.filter((item) => {
      const q = query.trim().toLowerCase()
      const matchQ = !q || `${item.guestName} ${item.roomNumber}`.toLowerCase().includes(q)
      const matchS = status === 'all' || item.status === status
      const matchP =
        period === 'all' ||
        (period === 'today' && item.checkIn === today) ||
        (period === 'upcoming' && item.checkIn > today) ||
        (period === 'staying' && item.status === 'checked_in')
      return matchQ && matchS && matchP
    })
  }, [hotelReservations, query, status, period])

  async function setStatusOf(id: string, next: ReservationStatus, toast: string) {
    try {
      await updateReservationStatus(id, next)
      setSelected((prev) => (prev && prev.id === id ? { ...prev, status: next } : prev))
      push({ title: toast, tone: next === 'cancelled' ? 'danger' : 'success' })
    } catch (err) {
      push({
        title: 'Não foi possível atualizar',
        detail: err instanceof ApiError ? err.message : 'Tente de novo',
        tone: 'danger',
      })
    }
  }

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-6">
      <PageHeader
        title="Reservas"
        subtitle="A lista que o totem de recepção consulta no check-in."
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus size={16} />
            Nova reserva
          </Button>
        }
      />

      <Card className="flex flex-col gap-4 p-4 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <SearchInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Nome ou quarto" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:w-[360px]">
          <Select options={STATUS_FILTER} value={status} onChange={(e) => setStatus(e.target.value)} />
          <Select options={PERIOD_FILTER} value={period} onChange={(e) => setPeriod(e.target.value)} />
        </div>
      </Card>

      {loading ? (
        <TableSkeleton rows={6} />
      ) : (
        <DataTable
          columns={[
            {
              key: 'guest',
              header: 'Hóspede',
              render: (row) => (
                <div className="flex items-center gap-2">
                  <Avatar name={row.guestName} size="sm" />
                  <div>
                    <p className="font-medium">{row.guestName}</p>
                    <p className="text-[12px] text-muted">{row.guestEmail}</p>
                  </div>
                </div>
              ),
            },
            { key: 'room', header: 'Quarto', render: (row) => row.roomNumber || '—' },
            {
              key: 'dates',
              header: 'Estadia',
              render: (row) => `${formatShortDate(row.checkIn)} – ${formatShortDate(row.checkOut)}`,
            },
            { key: 'total', header: 'Valor', render: (row) => formatBRL(row.total) },
            {
              key: 'status',
              header: 'Status',
              render: (row) => <ReservationStatusBadge status={row.status} />,
            },
          ]}
          rows={rows}
          rowKey={(row) => row.id}
          onRowClick={(row) => setSelected(row)}
        />
      )}

      <Drawer
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.guestName ?? 'Reserva'}
        subtitle={selected ? `Quarto ${selected.roomNumber}` : undefined}
        footer={
          selected && (
            <div className="flex gap-2">
              {selected.status === 'pending' && (
                <Button size="sm" onClick={() => void setStatusOf(selected.id, 'confirmed', 'Reserva confirmada')}>
                  Confirmar
                </Button>
              )}
              {selected.status !== 'cancelled' && selected.status !== 'checked_out' && (
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => void setStatusOf(selected.id, 'cancelled', 'Reserva cancelada')}
                >
                  Cancelar
                </Button>
              )}
            </div>
          )
        }
      >
        {selected && (
          <div className="flex flex-col gap-5 text-[13px]">
            <section className="grid grid-cols-2 gap-3">
              <Field label="Contato" value={selected.guestEmail} />
              <Field label="Telefone" value={selected.guestPhone} />
              <Field
                label="Datas"
                value={`${formatShortDate(selected.checkIn)} – ${formatShortDate(selected.checkOut)}`}
              />
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
                  <li key={`${item.at}-${item.text}`} className="rounded-lg bg-canvas px-3 py-2">
                    <p className="text-[12px] text-muted">{item.at}</p>
                    <p>{item.text}</p>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}
      </Drawer>

      <NewReservationModal
        open={creating}
        rooms={hotelRooms}
        onClose={() => setCreating(false)}
        onCreate={async (input) => {
          try {
            const reservation = await createReservation(input)
            addActivity({
              time: 'agora',
              title: 'Reserva criada',
              detail: reservation.guestName,
              kind: 'reservation',
            })
            push({
              title: 'Reserva criada',
              detail: `${reservation.guestName} · quarto ${reservation.roomNumber}`,
              tone: 'success',
            })
            setCreating(false)
          } catch (err) {
            push({
              title: 'Falha ao criar',
              detail: err instanceof ApiError ? err.message : 'Tente de novo',
              tone: 'danger',
            })
          }
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
}: {
  open: boolean
  onClose: () => void
  onCreate: (input: {
    guestName: string
    guestEmail?: string
    guestPhone?: string
    roomNumber?: string
    category?: string
    checkIn: string
    checkOut: string
    guests?: number
    total?: number
    paymentMethod?: PaymentMethod
    notes?: string
  }) => Promise<void>
  rooms: ReturnType<typeof useApp>['hotelRooms']
}) {
  const today = todayIso()
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [roomNumber, setRoomNumber] = useState(rooms[0]?.number ?? '')
  const [checkIn, setCheckInDate] = useState(today)
  const [checkOut, setCheckOutDate] = useState(today)
  const [count, setCount] = useState('2')
  const [total, setTotal] = useState('650')
  const [saving, setSaving] = useState(false)

  const room = rooms.find((r) => r.number === roomNumber)

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
            disabled={saving}
            onClick={() => {
              if (!guestName.trim()) return
              setSaving(true)
              void onCreate({
                guestName: guestName.trim(),
                guestEmail: guestEmail.trim() || undefined,
                guestPhone: guestPhone.trim() || undefined,
                roomNumber: roomNumber || undefined,
                category: room?.category,
                checkIn,
                checkOut,
                guests: Number(count) || 1,
                total: Number(total) || 0,
                paymentMethod: 'pix',
                notes: 'Criada no console',
              }).finally(() => setSaving(false))
            }}
          >
            {saving ? 'Salvando…' : 'Criar reserva'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <Input label="Nome do hóspede" value={guestName} onChange={(e) => setGuestName(e.target.value)} />
        <Input label="E-mail" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} />
        <Input label="Telefone" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} />
        {rooms.length > 0 ? (
          <Select
            label="Quarto"
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
            options={rooms.map((r) => ({ value: r.number, label: `${r.number} · ${r.category}` }))}
          />
        ) : (
          <Input label="Quarto" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} />
        )}
        <div className="grid grid-cols-2 gap-3">
          <DatePicker label="Check-in" value={checkIn} onChange={setCheckInDate} />
          <DatePicker label="Check-out" value={checkOut} onChange={setCheckOutDate} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Hóspedes" type="number" min={1} value={count} onChange={(e) => setCount(e.target.value)} />
          <Input label="Valor total" type="number" min={0} value={total} onChange={(e) => setTotal(e.target.value)} />
        </div>
      </div>
    </Modal>
  )
}
