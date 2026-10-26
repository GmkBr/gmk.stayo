import type { RoomStatus } from '../../modules/spaces/model.ts'
import { cn } from '../../utils/cn.ts'
import { ROOM_STATUS_LABEL } from './StatusBadge.tsx'

const TILE: Record<RoomStatus, string> = {
  available: 'bg-[#ecf4ee] text-[#3d6b4f] border-[#d7e6db]',
  occupied: 'bg-[#eef3fa] text-[#3b5b8a] border-[#d5e0ee]',
  dirty: 'bg-[#f8f1e7] text-[#8a5b2a] border-[#ead9c4]',
  cleaning: 'bg-[#eef1f6] text-[#4a5a73] border-[#d7dde6]',
  clean: 'bg-[#eaf6ee] text-[#2f6b45] border-[#cfe6d6]',
  maintenance: 'bg-[#f7ece8] text-[#8b4a3a] border-[#e6d2cb]',
  blocked: 'bg-[#f3f4f6] text-[#6b7280] border-[#e5e7eb]',
}

export function RoomStatusTile({
  number,
  status,
  onClick,
}: {
  number: string
  status: RoomStatus
  onClick?: () => void
}) {
  const label = ROOM_STATUS_LABEL[status].label
  const content = (
    <>
      <span className="text-sm font-semibold tracking-[-0.03em]">{number}</span>
      <span className="text-[11px] opacity-80">{label}</span>
    </>
  )

  const className = cn(
    'flex h-[72px] flex-col items-start justify-between rounded-lg border px-2.5 py-2 text-left transition-colors duration-150',
    TILE[status],
    onClick && 'hover:brightness-[0.98]',
  )

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {content}
      </button>
    )
  }

  return <div className={className}>{content}</div>
}

export function RoomStatusLegend() {
  const items: RoomStatus[] = ['available', 'occupied', 'dirty', 'cleaning', 'clean', 'maintenance', 'blocked']
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-[12px] text-muted">
      {items.map((status) => (
        <li key={status} className="inline-flex items-center gap-1.5">
          <span className={cn('size-2 rounded-full border', TILE[status])} />
          {ROOM_STATUS_LABEL[status].label}
        </li>
      ))}
    </ul>
  )
}
