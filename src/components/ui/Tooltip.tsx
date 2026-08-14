import type { ReactNode } from 'react'
import { cn } from '../../utils/cn.ts'

type Props = {
  content: string
  children: ReactNode
  side?: 'right' | 'top'
}

export function Tooltip({ content, children, side = 'right' }: Props) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span
        role="tooltip"
        className={cn(
          'pointer-events-none absolute z-50 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-[11px] font-medium text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100',
          side === 'right' && 'left-full top-1/2 ml-2 -translate-y-1/2',
          side === 'top' && 'bottom-full left-1/2 mb-2 -translate-x-1/2',
        )}
      >
        {content}
      </span>
    </span>
  )
}
