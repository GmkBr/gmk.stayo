import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../utils/cn.ts'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string
  children: ReactNode
  size?: 'sm' | 'md'
}

export function IconButton({ label, children, size = 'md', className, type = 'button', ...props }: Props) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex items-center justify-center rounded-lg text-ink transition-colors duration-150 hover:bg-canvas border border-transparent hover:border-line',
        size === 'sm' ? 'size-8' : 'size-9',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
