import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useApp } from '../../context/AppContext.tsx'
import { useToast } from '../../components/ui/Toast.tsx'
import { PageHeader } from '../../components/ui/PageHeader.tsx'
import { Card } from '../../components/ui/Card.tsx'
import { Button } from '../../components/ui/Button.tsx'
import { Badge } from '../../components/ui/Badge.tsx'
import { Modal } from '../../components/ui/Modal.tsx'
import { Input } from '../../components/ui/Input.tsx'
import { Select } from '../../components/ui/Select.tsx'
import { EmptyState } from '../../components/ui/EmptyState.tsx'
import type { MaintenancePriority, MaintenanceStatus } from '../../types/index.ts'

const STATUS_META: Record<MaintenanceStatus, { label: string; tone: 'red' | 'amber' | 'green' }> = {
  open: { label: 'Aberto', tone: 'red' },
  in_progress: { label: 'Em atendimento', tone: 'amber' },
  resolved: { label: 'Resolvido', tone: 'green' },
}

const PRIORITY_META: Record<MaintenancePriority, { label: string; tone: 'red' | 'amber' | 'neutral' }> = {
  high: { label: 'Alta', tone: 'red' },
  medium: { label: 'Média', tone: 'amber' },
  low: { label: 'Baixa', tone: 'neutral' },
}

export function MaintenancePage() {
  const { hotel, hotelMaintenance, hotelRooms, updateMaintenanceStatus, addMaintenance, addActivity } = useApp()
  const { push } = useToast()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('Ar-condicionado')
  const [room, setRoom] = useState(hotelRooms[0]?.number ?? '')
  const [priority, setPriority] = useState<MaintenancePriority>('medium')

  return (
    <div className="mx-auto flex max-w-[900px] flex-col gap-6">
      <PageHeader
        title="Manutenção"
        subtitle="Chamados abertos pela recepção, governança e hóspedes."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus size={16} />
            Novo chamado
          </Button>
        }
      />

      <Card padding="none">
        {hotelMaintenance.length === 0 ? (
          <EmptyState
            title="Você ainda não possui solicitações."
            description="Abra um chamado quando um quarto precisar de reparo."
            action={{ label: 'Novo chamado', onClick: () => setOpen(true) }}
          />
        ) : (
          <ul>
            {hotelMaintenance.map((item) => (
              <li key={item.id} className="flex flex-col gap-3 border-b border-line px-4 py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold">
                    #{item.code} · {item.title}
                  </p>
                  <p className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-muted">
                    <span>Quarto {item.roomNumber}</span>
                    <Badge tone={PRIORITY_META[item.priority].tone}>{PRIORITY_META[item.priority].label}</Badge>
                    <Badge tone={STATUS_META[item.status].tone}>{STATUS_META[item.status].label}</Badge>
                  </p>
                  <p className="mt-1 text-[12px] text-muted">{item.notes}</p>
                </div>
                <div className="flex gap-2">
                  {item.status === 'open' && (
                    <Button size="sm" variant="secondary" onClick={() => {
                      updateMaintenanceStatus(item.id, 'in_progress')
                      push({ title: 'Em atendimento', detail: `#${item.code}` })
                    }}>
                      Atender
                    </Button>
                  )}
                  {item.status === 'in_progress' && (
                    <Button size="sm" onClick={() => {
                      updateMaintenanceStatus(item.id, 'resolved')
                      addActivity({ time: 'agora', title: 'Chamado resolvido', detail: `${item.title} — Quarto ${item.roomNumber}`, kind: 'maintenance' })
                      push({ title: 'Chamado resolvido', detail: `#${item.code}`, tone: 'success' })
                    }}>
                      Resolver
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Novo chamado"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button
              onClick={() => {
                const code = String(1800 + hotelMaintenance.length + 8)
                addMaintenance({
                  id: `mt-${Date.now()}`,
                  hotelId: hotel.id,
                  code,
                  title,
                  roomNumber: room,
                  priority,
                  status: 'open',
                  openedAt: 'agora',
                  notes: 'Aberto pelo painel.',
                })
                addActivity({ time: 'agora', title: 'Chamado aberto', detail: `${title} — Quarto ${room}`, kind: 'maintenance' })
                push({ title: 'Chamado criado', detail: `#${code}`, tone: 'success' })
                setOpen(false)
              }}
            >
              Abrir chamado
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <Input label="Problema" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Select label="Quarto" value={room} onChange={(e) => setRoom(e.target.value)} options={hotelRooms.map((r) => ({ value: r.number, label: `Quarto ${r.number}` }))} />
          <Select
            label="Prioridade"
            value={priority}
            onChange={(e) => setPriority(e.target.value as MaintenancePriority)}
            options={[
              { value: 'high', label: 'Alta' },
              { value: 'medium', label: 'Média' },
              { value: 'low', label: 'Baixa' },
            ]}
          />
        </div>
      </Modal>
    </div>
  )
}
