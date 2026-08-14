import type { ReactNode } from 'react'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { cn } from '../../utils/cn.ts'
import { Card } from './Card.tsx'

type Props = {
  title: string
  value: string
  delta: string
  hint: string
  positive?: boolean
  icon: ReactNode
}

export function MetricCard({ title, value, delta, hint, positive = true, icon }: Props) {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] text-muted">{title}</p>
        <span className="flex size-8 items-center justify-center rounded-lg bg-canvas text-muted">{icon}</span>
      </div>
      <div>
        <p className="text-[28px] font-semibold leading-none tracking-[-0.04em] text-ink">{value}</p>
        <p className="mt-2 flex items-center gap-1.5 text-[12px]">
          <span className={cn('inline-flex items-center gap-0.5 font-medium', positive ? 'text-success' : 'text-danger')}>
            {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {delta}
          </span>
          <span className="text-muted">{hint}</span>
        </p>
      </div>
    </Card>
  )
}
