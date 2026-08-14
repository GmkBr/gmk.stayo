import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useApp } from '../../context/AppContext.tsx'
import { formatBRL, formatPercent } from '../../utils/format.ts'
import { PageHeader } from '../../components/ui/PageHeader.tsx'
import { Card } from '../../components/ui/Card.tsx'
import { SectionHeader } from '../../components/ui/SectionHeader.tsx'

const revenueWeek = [
  { label: 'Seg', value: 12400 },
  { label: 'Ter', value: 13820 },
  { label: 'Qua', value: 15110 },
  { label: 'Qui', value: 16240 },
  { label: 'Sex', value: 18420 },
  { label: 'Sáb', value: 22100 },
  { label: 'Dom', value: 19840 },
]

const servicesMix = [
  { label: 'Room service', value: 32 },
  { label: 'Spa', value: 18 },
  { label: 'Passeios', value: 22 },
  { label: 'Transfer', value: 14 },
  { label: 'Outros', value: 14 },
]

export function ReportsPage() {
  const { hotel } = useApp()
  const occupancy = hotel.occupancySeries['7d']

  return (
    <div className="mx-auto flex max-w-[1100px] flex-col gap-6">
      <PageHeader title="Relatórios" subtitle="Uma leitura da casa na última semana. Nada de planilha infinita." />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <Mini label="Receita (hoje)" value={formatBRL(hotel.revenue)} />
        <Mini label="Ocupação" value={formatPercent(hotel.occupancy, 0)} />
        <Mini label="Reservas ativas" value={String(hotel.checkInsToday + 18)} />
        <Mini label="Check-ins" value={String(hotel.checkInsToday)} />
        <Mini label="Check-outs" value={String(hotel.checkOutsToday)} />
        <Mini label="Serviços vendidos" value="41" />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <SectionHeader title="Receita da semana" />
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueWeek} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: '#F7F8FA' }}
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.[0]) return null
                    return (
                      <div className="rounded-lg border border-line bg-surface px-3 py-2 text-[12px] shadow-soft">
                        <p className="text-muted">{label}</p>
                        <p className="font-semibold">{formatBRL(Number(payload[0].value))}</p>
                      </div>
                    )
                  }}
                />
                <Bar dataKey="value" fill="#2563EB" radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <SectionHeader title="Ocupação" />
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={occupancy} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <YAxis domain={[50, 100]} axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.[0]) return null
                    return (
                      <div className="rounded-lg border border-line bg-surface px-3 py-2 text-[12px] shadow-soft">
                        <p className="text-muted">{label}</p>
                        <p className="font-semibold">{payload[0].value}%</p>
                      </div>
                    )
                  }}
                />
                <Line type="monotone" dataKey="value" stroke="#2563EB" strokeWidth={2} dot={{ r: 3, fill: '#2563EB', strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card>
        <SectionHeader title="Serviços" />
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={servicesMix} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
              <CartesianGrid horizontal={false} stroke="#E5E7EB" />
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="label" axisLine={false} tickLine={false} width={110} tick={{ fill: '#6B7280', fontSize: 12 }} />
              <Bar dataKey="value" fill="#93c5fd" radius={[0, 4, 4, 0]} maxBarSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <Card className="py-4">
      <p className="text-[12px] text-muted">{label}</p>
      <p className="mt-1 text-xl font-semibold tracking-[-0.03em]">{value}</p>
    </Card>
  )
}
