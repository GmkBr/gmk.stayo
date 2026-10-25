import type { ActivityKind } from '../../modules/activity/model.ts'
import { TimelineItem } from './Timeline.tsx'

const KIND_DOT: Record<ActivityKind, string> = {
  checkin: 'Check-in',
  checkout: 'Check-out',
  cleaning: 'Governança',
  request: 'Solicitação',
  reservation: 'Reserva',
  maintenance: 'Manutenção',
  order: 'Pedido',
  other: 'Atividade',
}

export function ActivityItem({
  time,
  title,
  detail,
  kind,
}: {
  time: string
  title: string
  detail?: string
  kind: ActivityKind
}) {
  return <TimelineItem time={time} title={title} detail={detail ?? KIND_DOT[kind]} />
}
