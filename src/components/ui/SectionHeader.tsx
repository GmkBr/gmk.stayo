import type { ReactNode } from 'react'

type Props = {
  title: string
  action?: ReactNode
}

export function SectionHeader({ title, action }: Props) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="text-sm font-semibold tracking-[-0.02em] text-ink">{title}</h2>
      {action}
    </div>
  )
}
