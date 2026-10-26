import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../utils/cn.ts'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
type Size = 'sm' | 'md' | 'lg' | 'kiosk'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  children: ReactNode
}

const variants: Record<Variant, string> = {
  primary: 'bg-accent text-white hover:bg-accent-hover shadow-soft',
  secondary: 'bg-canvas text-ink hover:bg-line/80 border border-line',
  ghost: 'bg-transparent text-ink hover:bg-canvas',
  danger: 'bg-danger-soft text-danger hover:bg-[#fce7e6]',
  outline: 'bg-surface text-ink border border-line hover:border-ink/20 hover:bg-canvas',
}

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-[13px] gap-1.5',
  md: 'h-9 px-3.5 text-[13px] gap-2',
  lg: 'h-11 px-4 text-sm gap-2',
  kiosk: 'h-14 min-h-14 px-5 text-base gap-2 rounded-xl',
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  type = 'button',
  ...props
}: Props) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors duration-150 disabled:opacity-40 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
