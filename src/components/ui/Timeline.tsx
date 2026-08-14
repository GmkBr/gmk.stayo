import type { ReactNode } from 'react'

export function Timeline({ children }: { children: ReactNode }) {
  return <ol className="flex flex-col">{children}</ol>
}

export function TimelineItem({
  time,
  title,
  detail,
  icon,
}: {
  time: string
  title: string
  detail?: string
  icon?: ReactNode
}) {
  return (
    <li className="relative flex gap-3 pb-4 last:pb-0">
      <div className="flex w-12 shrink-0 flex-col items-end pt-0.5">
        <span className="text-[12px] tabular-nums text-muted">{time}</span>
      </div>
      <div className="relative flex flex-col items-center">
        <span className="mt-1.5 size-2 rounded-full bg-line" />
        <span className="w-px flex-1 bg-line" />
      </div>
      <div className="min-w-0 flex-1 pb-1">
        <p className="flex items-center gap-2 text-[13px] font-medium text-ink">
          {icon}
          {title}
        </p>
        {detail && <p className="mt-0.5 text-[12px] text-muted">{detail}</p>}
      </div>
    </li>
  )
}
