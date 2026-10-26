import { useId, type TextareaHTMLAttributes } from 'react'
import { cn } from '../../utils/cn.ts'

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string
  hint?: string
  error?: string
}

export function Textarea({ label, hint, error, className, id, rows = 5, ...props }: Props) {
  const autoId = useId()
  const inputId = id ?? autoId
  const hintId = hint ? `${inputId}-hint` : undefined
  const errorId = error ? `${inputId}-error` : undefined
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined

  return (
    <label className="flex w-full flex-col gap-1.5" htmlFor={inputId}>
      {label && (
        <span className={cn('text-[13px] font-medium', error ? 'text-danger' : 'text-ink')}>{label}</span>
      )}
      <textarea
        id={inputId}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          'w-full resize-y rounded-lg border bg-surface px-3 py-2.5 text-[13px] leading-relaxed text-ink placeholder:text-muted/80 transition-colors hover:border-ink/20 focus:border-accent focus:outline-none focus-visible:outline-none',
          error ? 'border-danger' : 'border-line',
          className,
        )}
        {...props}
      />
      {error && (
        <span id={errorId} className="text-[12px] text-danger">
          {error}
        </span>
      )}
      {hint && !error && (
        <span id={hintId} className="text-[12px] text-muted">
          {hint}
        </span>
      )}
    </label>
  )
}
