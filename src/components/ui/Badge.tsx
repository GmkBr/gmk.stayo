import type { ReactNode } from 'react'
import { cn } from '../../utils/cn.ts'

type Props = {
  children: ReactNode
  tone?: 'neutral' | 'blue' | 'green' | 'amber' | 'red' | 'slate'
  className?: string
}

const tones: Record<NonNullable<Props['tone']>, string> = {
  neutral: 'bg-canvas text-muted',
  blue: 'bg-accent-soft text-accent',
  green: 'bg-success-soft text-success',
  amber: 'bg-warn-soft text-warn',
  red: 'bg-danger-soft text-danger',
  slate: 'bg-[#eef1f6] text-[#4a5a73]',
}

export function Badge({ children, tone = 'neutral', className }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-[12px] font-medium tracking-[-0.01em]',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
