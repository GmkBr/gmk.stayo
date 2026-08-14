import { useApp } from '../../context/AppContext.tsx'
import { useToast } from '../../components/ui/Toast.tsx'
import { PageHeader } from '../../components/ui/PageHeader.tsx'
import { Card } from '../../components/ui/Card.tsx'
import { Button } from '../../components/ui/Button.tsx'
import { Badge } from '../../components/ui/Badge.tsx'
import { EmptyState } from '../../components/ui/EmptyState.tsx'
import type { HousekeepingPriority, HousekeepingReason, HousekeepingStatus } from '../../types/index.ts'

const REASON: Record<HousekeepingReason, string> = {
  checkout: 'Check-out',
  stayover: 'Stayover',
  deep: 'Limpeza pesada',
  blocked: 'Bloqueado',
}

const PRIORITY: Record<HousekeepingPriority, { label: string; tone: 'red' | 'amber' | 'neutral' }> = {
  high: { label: 'Alta', tone: 'red' },
  medium: { label: 'Média', tone: 'amber' },
  low: { label: 'Baixa', tone: 'neutral' },
}

const STATUS: Record<HousekeepingStatus, string> = {
  waiting: 'Aguardando',
  in_progress: 'Em limpeza',
  done: 'Concluída',
}

export function HousekeepingPage() {
  const { hotelHousekeeping, hotelRooms, updateHousekeepingStatus, updateRoomStatus, addActivity } = useApp()
  const { push } = useToast()

  const waiting = hotelHousekeeping.filter((t) => t.status === 'waiting').length
  const running = hotelHousekeeping.filter((t) => t.status === 'in_progress').length
  const done = hotelHousekeeping.filter((t) => t.status === 'done').length
  const blocked = hotelRooms.filter((r) => r.status === 'blocked').length

  return (
    <div className="mx-auto flex max-w-[900px] flex-col gap-6">
      <PageHeader title="Governança" subtitle="A fila do dia, na ordem em que a casa precisa ser entregue." />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Aguardando limpeza" value={waiting} />
        <Stat label="Em limpeza" value={running} />
        <Stat label="Limpos" value={done} />
        <Stat label="Bloqueados" value={blocked} />
      </div>

      <Card padding="none">
        {hotelHousekeeping.length === 0 ? (
          <EmptyState title="Você ainda não possui solicitações." description="Quando um check-out fechar, a tarefa aparece aqui." />
        ) : (
          <ul>
            {hotelHousekeeping.map((task) => (
              <li key={task.id} className="flex flex-col gap-3 border-b border-line px-4 py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold">Quarto {task.roomNumber}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-muted">
                    <span>{REASON[task.reason]}</span>
                    <Badge tone={PRIORITY[task.priority].tone}>{PRIORITY[task.priority].label}</Badge>
                    <span>Responsável: {task.assignee}</span>
                    <span>Status: {STATUS[task.status]}</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  {task.status === 'waiting' && (
                    <Button
                      size="sm"
                      onClick={() => {
                        updateHousekeepingStatus(task.id, 'in_progress')
                        updateRoomStatus(task.roomId, 'cleaning')
                        addActivity({ time: 'agora', title: 'Limpeza iniciada', detail: `Quarto ${task.roomNumber}`, kind: 'cleaning' })
                        push({ title: 'Limpeza iniciada', detail: `Quarto ${task.roomNumber}`, tone: 'success' })
                      }}
                    >
                      Iniciar limpeza
                    </Button>
                  )}
                  {task.status === 'in_progress' && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        updateHousekeepingStatus(task.id, 'done')
                        updateRoomStatus(task.roomId, 'clean')
                        addActivity({ time: 'agora', title: `Quarto ${task.roomNumber} marcado como limpo`, kind: 'cleaning' })
                        push({ title: 'Quarto pronto', detail: `Quarto ${task.roomNumber} limpo`, tone: 'success' })
                      }}
                    >
                      Concluir
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card className="py-4">
      <p className="text-[12px] text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-[-0.04em]">{value}</p>
    </Card>
  )
}
