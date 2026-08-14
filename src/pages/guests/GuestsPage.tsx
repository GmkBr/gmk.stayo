import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext.tsx'
import { usePageLoading } from '../../hooks/usePageLoading.ts'
import { formatShortDate } from '../../utils/format.ts'
import { PageHeader } from '../../components/ui/PageHeader.tsx'
import { Card } from '../../components/ui/Card.tsx'
import { SearchInput } from '../../components/ui/SearchInput.tsx'
import { DataTable } from '../../components/ui/DataTable.tsx'
import { Avatar } from '../../components/ui/Avatar.tsx'
import { Badge } from '../../components/ui/Badge.tsx'
import { TableSkeleton } from '../../components/ui/Skeleton.tsx'
import type { GuestStatus } from '../../types/index.ts'

const STATUS_TONE: Record<GuestStatus, { label: string; tone: 'green' | 'blue' | 'neutral' | 'amber' }> = {
  staying: { label: 'Hospedado', tone: 'green' },
  arriving: { label: 'Chegando', tone: 'blue' },
  departed: { label: 'Encerrado', tone: 'neutral' },
  vip: { label: 'VIP', tone: 'amber' },
}

export function GuestsPage() {
  const { hotelGuests } = useApp()
  const [query, setQuery] = useState('')
  const loading = usePageLoading(380)
  const navigate = useNavigate()

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return hotelGuests.filter((g) => !q || `${g.name} ${g.email} ${g.phone}`.toLowerCase().includes(q))
  }, [hotelGuests, query])

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-6">
      <PageHeader title="Hóspedes" subtitle="Histórico, preferências e contato de quem passa pela casa." />
      <Card padding="none">
        <div className="border-b border-line p-4 md:max-w-sm">
          <SearchInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nome, e-mail ou telefone" />
        </div>
        {loading ? (
          <TableSkeleton />
        ) : (
          <DataTable
            rows={rows}
            rowKey={(row) => row.id}
            onRowClick={(row) => navigate(`/guests/${row.id}`)}
            emptyTitle="Nenhum hóspede encontrado"
            emptyDescription="Tente outro nome ou documento."
            columns={[
              {
                key: 'name',
                header: 'Nome',
                render: (row) => (
                  <span className="flex items-center gap-2">
                    <Avatar name={row.name} size="sm" />
                    <span className="font-medium">
                      {row.name}
                      {row.vip && (
                        <Badge tone="amber" className="ml-2">
                          VIP
                        </Badge>
                      )}
                    </span>
                  </span>
                ),
              },
              { key: 'email', header: 'E-mail', render: (row) => row.email },
              { key: 'phone', header: 'Telefone', render: (row) => row.phone },
              { key: 'last', header: 'Última hospedagem', render: (row) => (row.lastStay ? formatShortDate(row.lastStay) : '—') },
              { key: 'stays', header: 'Reservas', render: (row) => String(row.stays) },
              {
                key: 'status',
                header: 'Status',
                render: (row) => {
                  const item = STATUS_TONE[row.status]
                  return <Badge tone={item.tone}>{item.label}</Badge>
                },
              },
            ]}
          />
        )}
      </Card>
    </div>
  )
}
