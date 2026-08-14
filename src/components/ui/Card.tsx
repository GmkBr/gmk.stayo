import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../utils/cn.ts'

type Props = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
  padding?: 'none' | 'sm' | 'md'
}

export function Card({ children, className, padding = 'md', ...props }: Props) {
  return (
    <div
      className={cn(
        'rounded-xl border border-line bg-surface shadow-soft',
        padding === 'md' && 'p-5',
        padding === 'sm' && 'p-4',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
