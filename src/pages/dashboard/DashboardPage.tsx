import type { ReactNode } from 'react'
import { BedDouble, CalendarArrowDown, CalendarArrowUp, Sparkles, Wrench } from 'lucide-react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext.tsx'
import { usePageLoading } from '../../hooks/usePageLoading.ts'
import { formatBRL, formatPercent, greetingForNow } from '../../utils/format.ts'
import { Card } from '../../components/ui/Card.tsx'
import { MetricCard } from '../../components/ui/MetricCard.tsx'
import { SectionHeader } from '../../components/ui/SectionHeader.tsx'
import { DashboardSkeleton } from '../../components/ui/Skeleton.tsx'
import { RoomStatusLegend, RoomStatusTile } from '../../components/ui/RoomStatus.tsx'
import { Timeline } from '../../components/ui/Timeline.tsx'
import { ActivityItem } from '../../components/ui/ActivityItem.tsx'
import { cn } from '../../utils/cn.ts'
import type { Period } from '../../types/index.ts'

const PERIODS: { id: Period; label: string }[] = [
  { id: 'today', label: 'Hoje' },
  { id: '7d', label: 'Últimos 7 dias' },
  { id: '30d', label: 'Últimos 30 dias' },
]

export function DashboardPage() {
  const { hotel, user, period, setPeriod, hotelRooms, hotelActivities } = useApp()
  const loading = usePageLoading()
  const navigate = useNavigate()
  const series = hotel.occupancySeries[period]
  const floors = [...new Set(hotelRooms.map((r) => r.floor))].sort()

  if (loading) return <DashboardSkeleton />

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-[28px] font-semibold leading-tight tracking-[-0.04em]">
            {greetingForNow()}, {user.name}.
          </h1>
          <p className="mt-1 text-[13px] text-muted">Acompanhe a operação do {hotel.name}.</p>
        </div>
        <div className="inline-flex self-start rounded-lg border border-line bg-surface p-0.5">
          {PERIODS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setPeriod(item.id)}
              className={cn(
                'rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors',
                period === item.id ? 'bg-canvas text-ink' : 'text-muted hover:text-ink',
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Ocupação"
          value={formatPercent(hotel.occupancy, 0)}
          delta={`${hotel.occupancyDelta > 0 ? '+' : ''}${hotel.occupancyDelta.toLocaleString('pt-BR')}%`}
          hint="vs. ontem"
          positive={hotel.occupancyDelta >= 0}
          icon={<BedDouble size={16} />}
        />
        <MetricCard
          title="Receita"
          value={formatBRL(hotel.revenue)}
          delta={`${hotel.revenueDelta > 0 ? '+' : ''}${hotel.revenueDelta.toLocaleString('pt-BR')}%`}
          hint="vs. ontem"
          positive={hotel.revenueDelta >= 0}
          icon={<CalendarArrowUp size={16} />}
        />
        <MetricCard
          title="Check-ins"
          value={String(hotel.checkInsToday)}
          delta={`${hotel.checkInsDelta > 0 ? '+' : ''}${hotel.checkInsDelta}`}
          hint="hoje"
          positive={hotel.checkInsDelta >= 0}
          icon={<CalendarArrowDown size={16} />}
        />
        <MetricCard
          title="Check-outs"
          value={String(hotel.checkOutsToday)}
          delta={`${hotel.checkOutsDelta > 0 ? '+' : ''}${hotel.checkOutsDelta}`}
          hint="hoje"
          positive={hotel.checkOutsDelta >= 0}
          icon={<CalendarArrowUp size={16} />}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <SectionHeader title="Taxa de ocupação" />
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <YAxis domain={[50, 100]} axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <RechartsTooltip
                  cursor={{ stroke: '#E5E7EB' }}
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.[0]) return null
                    return (
                      <div className="rounded-lg border border-line bg-surface px-3 py-2 text-[12px] shadow-soft">
                        <p className="text-muted">{label}</p>
                        <p className="font-semibold">{payload[0].value}% ocupado</p>
                      </div>
                    )
                  }}
                />
                <Line type="monotone" dataKey="value" stroke="#2563EB" strokeWidth={2} dot={{ r: 3, fill: '#2563EB', strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <SectionHeader title="Operação de hoje" />
          <ul className="flex flex-col">
            <OpRow icon={<CalendarArrowDown size={16} />} label="Check-ins" value={hotel.checkInsToday} />
            <OpRow icon={<CalendarArrowUp size={16} />} label="Check-outs" value={hotel.checkOutsToday} />
            <OpRow icon={<Sparkles size={16} />} label="Quartos para limpeza" value={hotel.roomsToClean} />
            <OpRow icon={<Wrench size={16} />} label="Em manutenção" value={hotel.inMaintenance} />
            <OpRow icon={<BedDouble size={16} />} label="Solicitações" value={hotel.requests} last />
          </ul>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <SectionHeader
            title="Status dos quartos"
            action={
              <button type="button" className="text-[12px] font-medium text-accent hover:underline" onClick={() => navigate('/rooms')}>
                Ver todos
              </button>
            }
          />
          <div className="flex flex-col gap-4">
            {floors.map((floor) => (
              <div key={floor}>
                <p className="mb-2 text-[12px] text-muted">Andar {floor}</p>
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
                  {hotelRooms
                    .filter((room) => room.floor === floor)
                    .map((room) => (
                      <RoomStatusTile key={room.id} number={room.number} status={room.status} onClick={() => navigate('/rooms')} />
                    ))}
                </div>
              </div>
            ))}
            <RoomStatusLegend />
          </div>
        </Card>

        <Card>
          <SectionHeader title="Atividade recente" />
          <Timeline>
            {hotelActivities.slice(0, 7).map((item) => (
              <ActivityItem key={item.id} time={item.time} title={item.title} detail={item.detail} kind={item.kind} />
            ))}
          </Timeline>
        </Card>
      </section>
    </div>
  )
}

function OpRow({
  icon,
  label,
  value,
  last,
}: {
  icon: ReactNode
  label: string
  value: number
  last?: boolean
}) {
  return (
    <li className={cn('flex items-center justify-between py-3', !last && 'border-b border-line')}>
      <span className="flex items-center gap-2 text-[13px] text-muted">
        <span className="text-ink/70">{icon}</span>
        {label}
      </span>
      <span className="text-base font-semibold tabular-nums tracking-[-0.03em]">{value}</span>
    </li>
  )
}
