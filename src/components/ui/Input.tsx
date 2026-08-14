import { useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '../../utils/cn.ts'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  hint?: string
  icon?: ReactNode
}

export function Input({ label, hint, icon, className, id, ...props }: Props) {
  const autoId = useId()
  const inputId = id ?? autoId

  return (
    <label className="flex w-full flex-col gap-1.5" htmlFor={inputId}>
      {label && <span className="text-[13px] font-medium text-ink">{label}</span>}
      <span className="relative">
        {icon && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">{icon}</span>}
        <input
          id={inputId}
          className={cn(
            'h-9 w-full rounded-lg border border-line bg-surface px-3 text-[13px] text-ink placeholder:text-muted/80 transition-colors hover:border-ink/20 focus:border-accent focus:outline-none focus-visible:outline-none',
            icon ? 'pl-9' : undefined,
            className,
          )}
          {...props}
        />
      </span>
      {hint && <span className="text-[12px] text-muted">{hint}</span>}
    </label>
  )
}
